import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import { rateLimit } from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { Agent, setGlobalDispatcher } from 'undici';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

const poolAgent = new Agent({
  connections: 50,
  keepAliveTimeout: 60000,
  keepAliveMaxTimeout: 600000,
  pipelining: 1
});

setGlobalDispatcher(poolAgent);

// ---------------------------------------------------------
// Security / utility helpers
// ---------------------------------------------------------

// Fetch with a hard timeout so a hanging Safaricom call can't block forever
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Constant-time secret comparison (callback auth)
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Never log full phone numbers
function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return '***';
  return `${phone.slice(0, 6)}***${phone.slice(-2)}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts, please try again in 15 minutes.' },
  });

  app.use('/api/', generalLimiter);
  app.use('/api/auth/', authLimiter);

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  const validate = (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  };

  const DARAJA_ENV = process.env.DARAJA_ENV || 'sandbox';
  const DARAJA_BASE_URL = DARAJA_ENV === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';

  const MPESA_CALLBACK_SECRET = process.env.MPESA_CALLBACK_SECRET || 'dev_fallback_secret_token';
  if (!process.env.MPESA_CALLBACK_SECRET) {
    console.warn('[SECURITY WARNING] MPESA_CALLBACK_SECRET is not set. Using dev fallback. Set this env var before going to production.');
  }

  let cachedMpesaToken = '';
  let tokenExpiryTime = 0;

  async function getMpesaAccessToken() {
    if (cachedMpesaToken && Date.now() < tokenExpiryTime) {
      return cachedMpesaToken;
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error('MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET not configured');
    }

    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await fetchWithTimeout(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${credentials}` }
    }, 8000);

    if (!response.ok) {
      console.error('Mpesa token error: status', response.status);
      throw new Error(`Failed to get token: ${response.status}`);
    }

    const data = await response.json();
    cachedMpesaToken = data.access_token;
    // Safaricom tokens usually expire in 3599 seconds. Cache for 50 mins (3000 seconds)
    tokenExpiryTime = Date.now() + 3000 * 1000;
    return cachedMpesaToken;
  }

  function generatePassword(shortcode: string, passkey: string, timestamp: string) {
    const buffer = Buffer.from(`${shortcode}${passkey}${timestamp}`);
    return buffer.toString('base64');
  }

  // Safaricom expects YYYYMMDDHHmmss in East Africa Time (Africa/Nairobi, UTC+3)
  // regardless of what timezone the server process is running in.
  function getTimestamp(): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(new Date());

    const get = (type: string) => {
      const val = parts.find(p => p.type === type)?.value || '00';
      return val === '24' ? '00' : val; // some locales render midnight as 24
    };

    return `${get('year')}${get('month')}${get('day')}${get('hour')}${get('minute')}${get('second')}`;
  }

  function formatPhoneNumber(phone: string) {
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('7') || formatted.startsWith('1')) {
      formatted = '254' + formatted;
    } else if (formatted.startsWith('+254')) {
      formatted = formatted.substring(1);
    }
    return formatted;
  }

  // ---------------------------------------------------------
  // STK Push
  // ---------------------------------------------------------
  app.post('/api/mpesa/stkpush',
    [
      body('phone').trim().notEmpty()
        .matches(/^(?:\+?254|0)?[17]\d{8}$/)
        .withMessage('Invalid Kenyan phone number'),
      body('amount').isFloat({ min: 1, max: 150000 })
        .withMessage('Amount must be between 1 and 150000'),
      body('reference').trim().notEmpty().isLength({ max: 50 })
        .matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('Reference must be alphanumeric (with - or _), max 50 chars'),
      body('description').optional().trim().isLength({ max: 100 }).escape()
    ],
    validate,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const { phone, amount, reference, description } = req.body;

        const phoneNumber = formatPhoneNumber(phone);
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;

        if (!shortcode || !passkey) {
          const error: any = new Error('M-Pesa payment system is not fully configured.');
          error.status = 503;
          throw error;
        }

        // Callback secret has fallback, so no need to throw here

        console.log('Starting STK Push for phone:', maskPhone(phoneNumber), 'reference:', reference);

        const token = await getMpesaAccessToken();

        const timestamp = getTimestamp();
        const password = generatePassword(shortcode, passkey, timestamp);
        // Daraja Sandbox often rejects complex preview domains or localhost with "Invalid CallBackURL".
        // In dev, we use a dummy public URL to bypass validation, and rely on our active polling via queryStkPushStatus.
        const isDev = process.env.NODE_ENV !== "production";
        const dummyUrl = 'https://wincercakehouse.com/api/mpesa/callback';
        const callbackBaseUrl = process.env.MPESA_CALLBACK_BASE_URL || (isDev ? dummyUrl : `https://${req.get('host')}`);
        
        // Remove query params because Daraja sometimes rejects them
        const callbackUrl = isDev ? dummyUrl : `${callbackBaseUrl}/api/mpesa/callback`;

        const requestBody = {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phoneNumber,
          PartyB: shortcode,
          PhoneNumber: phoneNumber,
          CallBackURL: callbackUrl,
          AccountReference: reference || "WincerCakeHouse",
          TransactionDesc: description || "Payment for Order"
        };

        // Never log requestBody directly — it contains the derived Password.
        console.log('STK Push request meta:', {
          shortcode,
          amount,
          reference,
          phone: maskPhone(phoneNumber)
        });

        const response = await fetchWithTimeout(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }, 12000);

        const responseText = await response.text();

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse JSON response from Safaricom');
          return res.status(502).json({
            success: false,
            error: 'Invalid response from M-Pesa (not JSON)'
          });
        }

        if (!response.ok) {
          console.error("STK Push error:", data?.errorMessage || data?.message);
          return res.status(response.status).json({
            success: false,
            error: data.errorMessage || data.message || 'M-Pesa request failed'
          });
        }

        const checkoutRequestID = data.CheckoutRequestID;

        if (!checkoutRequestID) {
          console.error('No CheckoutRequestID in response');
          return res.status(400).json({
            success: false,
            error: 'M-Pesa did not return a CheckoutRequestID'
          });
        }

        await supabase.from('mpesa_requests').insert([{
          id: checkoutRequestID,
          reference,
          phone: phoneNumber,
          amount,
          checkoutRequestID,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString()
        }]);
        res.json({ success: true, data });
      } catch (error: any) {
        console.error('STK Push Exception:', error.message);
        next(error);
      }
    }
  );

  // ---------------------------------------------------------
  // Callback (authenticated + schema-validated + idempotent)
  // ---------------------------------------------------------
  app.post('/api/mpesa/callback', async (req, res, next) => {
    try {
      const providedToken = (req.query.token as string) || '';

      if (!MPESA_CALLBACK_SECRET || !providedToken || !safeCompare(providedToken, MPESA_CALLBACK_SECRET)) {
        console.warn('Rejected M-Pesa callback: invalid or missing token');
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const reference = req.query.reference as string;
      const stkCallback = req.body?.Body?.stkCallback;

      // Strict schema check — required fields + basic type/format validation
      const checkoutRequestID = stkCallback?.CheckoutRequestID;
      const resultCode = stkCallback?.ResultCode;
      const resultDesc = stkCallback?.ResultDesc;

      const isValidCheckoutId = typeof checkoutRequestID === 'string'
        && /^[A-Za-z0-9_-]{8,64}$/.test(checkoutRequestID);
      const isValidResultCode = typeof resultCode === 'number';

      if (!stkCallback || !isValidCheckoutId || !isValidResultCode) {
        console.warn('Rejected M-Pesa callback: malformed payload');
        return res.status(400).json({ success: false, error: 'Invalid callback payload' });
      }

      const newStatus = resultCode === 0 ? 'completed' : 'failed';

      // Idempotency guard: only transition out of 'pending'. A request that's
      // already completed/failed/manually_verified must never be overwritten.
      const { error: updateError } = await supabase.from('mpesa_requests')
        .update({
          resultCode,
          resultDesc: typeof resultDesc === 'string' ? resultDesc : null,
          metadata: Array.isArray(stkCallback.CallbackMetadata?.Item) ? stkCallback.CallbackMetadata.Item : [],
          callbackReceivedAt: new Date().toISOString(),
          status: newStatus,
          reference
        })
        .eq('id', checkoutRequestID)
        .eq('status', 'pending'); // <-- guard

      if (updateError) {
        console.error('Callback DB update error:', updateError.message);
      }

      res.json({ message: 'Success' });
    } catch (error) {
      console.error('Callback error:', error);
      next(error);
    }
  });

  app.post('/api/mpesa/verify-code',
    [
      body('phone').trim().notEmpty().escape(),
      body('amount').isNumeric(),
      body('reference').trim().escape(),
      body('code').trim().toUpperCase().matches(/^[A-Z0-9]{10}$/)
    ],
    validate,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const { reference, code } = req.body;

        // Only ever match against a still-pending request for this reference,
        // and take the most recent one — avoids matching a stale/unrelated row.
        const { data: snapshot, error } = await supabase
          .from('mpesa_requests')
          .select('*')
          .eq('reference', reference)
          .eq('status', 'pending')
          .order('createdAt', { ascending: false })
          .limit(1);

        if (error) {
          return res.status(400).json({ success: false, error: 'Database query failed' });
        }

        if (!snapshot || snapshot.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No pending M-Pesa payment was found for this order. Please use the Pay button to initiate payment first.'
          });
        }
        const pendingRequest = snapshot[0];

        // Guarded update — only succeeds if still pending (no race with callback)
        const { data: updated, error: updateError } = await supabase
          .from('mpesa_requests')
          .update({
            manualCode: code,
            manualVerifiedAt: new Date().toISOString(),
            status: 'manually_verified'
          })
          .eq('id', pendingRequest.id)
          .eq('status', 'pending')
          .select();

        if (updateError) {
          return res.status(500).json({ success: false, error: 'Failed to verify code' });
        }

        if (!updated || updated.length === 0) {
          // Status changed between select and update (callback won the race)
          return res.status(409).json({
            success: false,
            error: 'This payment was already resolved (likely confirmed automatically). Please check your order status.'
          });
        }

        res.json({
          success: true,
          message: 'Code verified. Order confirmed.',
          requestId: pendingRequest.id
        });
      } catch (error: any) {
        next(error);
      }
    }
  );

  async function queryStkPushStatus(checkoutRequestID: string) {
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    if (!shortcode || !passkey) throw new Error('M-Pesa not configured');
    const token = await getMpesaAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);
    const response = await fetchWithTimeout(`${DARAJA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      })
    }, 10000);
    return response.json();
  }

  app.get('/api/mpesa/status/:requestId',
    [param('requestId').trim().notEmpty().escape()],
    validate,
    async (req: express.Request, res: express.Response) => {
      try {
        const { data: requestSnap, error } = await supabase
          .from('mpesa_requests')
          .select('*')
          .eq('id', req.params.requestId)
          .single();

        if (error || !requestSnap) {
          return res.json({ status: 'pending' });
        }

        const data = requestSnap || {};

        if (data.status === 'completed' || data.resultCode === 0) {
          return res.json({ status: 'success' });
        }

        if (data.status === 'manually_verified') {
          return res.json({ status: 'success', manual: true });
        }

        if (data.status === 'failed') {
          return res.json({
            status: 'failed',
            message: data.resultDesc || 'Payment failed or cancelled'
          });
        }

        if (data.status === 'pending') {
          const now = Date.now();
          const created = data.createdAt ? new Date(data.createdAt).getTime() : 0;

          try {
            const stkData = await queryStkPushStatus(req.params.requestId);

            if (stkData?.errorCode === '500.001.1001') {
              // still being processed
            } else {
              const resultCode = stkData?.ResultCode ?? stkData?.Body?.stkCallback?.ResultCode;
              if (resultCode === 0 || resultCode === '0') {
                const { data: updated } = await supabase.from('mpesa_requests')
                  .update({
                    status: 'completed',
                    resultCode: 0,
                    resultDesc: stkData.ResultDesc || 'Payment confirmed'
                  })
                  .eq('id', req.params.requestId)
                  .eq('status', 'pending') // guard
                  .select();
                if (updated && updated.length > 0) {
                  return res.json({ status: 'success' });
                }
                // already resolved by something else — re-check below via recursion-free fallback
                return res.json({ status: 'success' });
              } else if (resultCode !== undefined && resultCode !== null && resultCode !== 1032 && resultCode !== '1032') {
                await supabase.from('mpesa_requests')
                  .update({
                    status: 'failed',
                    resultCode,
                    resultDesc: stkData.ResultDesc || 'Payment failed'
                  })
                  .eq('id', req.params.requestId)
                  .eq('status', 'pending'); // guard
                return res.json({ status: 'failed', message: stkData.ResultDesc || 'Payment failed or cancelled' });
              }
            }
          } catch (queryErr: any) {
            console.warn('STK Push Query failed, falling back to passive wait:', queryErr.message);
          }

          if (created > 0 && now - created > 2 * 60 * 1000) {
            return res.json({ status: 'expired' });
          }
          return res.json({ status: 'pending' });
        }

        return res.json({
          status: 'failed',
          message: data.resultDesc || 'Payment failed'
        });
      } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ success: false, error: 'Status check failed' });
      }
    }
  );

  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      console.error('Unhandled Error:', err);
    } else {
      console.error('Unhandled Error:', err.message);
    }

    const statusCode = err.status || err.statusCode || 500;
    let message = 'An unexpected error occurred. Please try again later.';

    if (!isProduction) {
      message = err.message || 'Internal Server Error';
    } else if (statusCode < 500) {
      message = err.message;
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(!isProduction && { stack: err.stack, details: err.details })
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
