import 'dotenv/config';
import express from "express";
import { createServer as createHttpServer } from "http";
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// We need an admin client for M-Pesa callbacks since they come from outside
// and we need to bypass RLS to insert/update the mpesa_requests table.
const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

const poolAgent = new Agent({
  connections: 50,
  keepAliveTimeout: 60000,
  keepAliveMaxTimeout: 600000,
  pipelining: 1
});

setGlobalDispatcher(poolAgent);

// ---------------------------------------------------------
// Logging and error utilities
// ---------------------------------------------------------

function getRequestContext(req?: express.Request) {
  if (!req) {
    return {
      service: 'wincer-backend',
      method: 'unknown',
      path: 'unknown',
      ip: 'unknown',
      userAgent: undefined,
      query: undefined,
      params: undefined,
    };
  }

  return {
    service: 'wincer-backend',
    method: req.method,
    path: req.path,
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    userAgent: typeof req.headers['user-agent'] === 'string'
      ? req.headers['user-agent'].slice(0, 200)
      : undefined,
    query: req.query,
    params: req.params,
  };
}

function logServerError(req: express.Request | undefined, error: any, extra: Record<string, any> = {}) {
  const payload = {
    level: 'error',
    timestamp: new Date().toISOString(),
    message: error?.message || 'Unknown server error',
    stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    ...getRequestContext(req),
    ...extra,
  };
  console.error(JSON.stringify(payload));
}

function sendServerError(res: express.Response, message = 'An internal error occurred. Please try again later.') {
  return res.status(500).json({ success: false, error: message });
}

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
  const server = createHttpServer(app);

  app.set('trust proxy', 1);

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts, please try again in 15 minutes.' },
  });

  const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many admin requests, please try again later.' },
  });

  const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests to sensitive endpoints. Please wait and try again.' },
  });

  const heavyQueryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many data fetch requests. Please slow down.' },
  });

  app.use('/api/', (req, res, next) => {
    if (req.path === '/mpesa/callback' || req.path.startsWith('/auth') || req.path.startsWith('/admin')) {
      return next();
    }
    generalLimiter(req, res, next);
  });
  app.use('/api/auth', authLimiter);
  app.use('/api/admin', adminLimiter);
  app.use('/api/mpesa/stkpush', sensitiveLimiter);
  app.use('/api/mpesa/verify-code', sensitiveLimiter);
  app.use('/api/mpesa/status', heavyQueryLimiter);

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

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    console.warn('[SECURITY WARNING] CORS_ORIGIN is not configured. Set this to your production frontend domain.');
  }

  app.use((req, res, next) => {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    if (origin) {
      if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ success: false, error: 'Origin not allowed' });
      }
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Admin HTTP secret protects internal admin endpoints. Set ADMIN_HTTP_SECRET in production.
  const ADMIN_HTTP_SECRET = process.env.ADMIN_HTTP_SECRET || '';

  function requireAdmin(req: any, res: any, next: any) {
    // Prefer a short-lived Supabase JWT in Authorization header in future; for now require server-side secret header.
    const provided = (req.headers['x-admin-secret'] || req.headers['x-admin-token'] || '').toString();
    if (!ADMIN_HTTP_SECRET) {
      console.warn('[SECURITY] ADMIN_HTTP_SECRET is not set — admin endpoints are unprotected on this server instance.');
      return res.status(503).json({ success: false, error: 'Server not configured for admin access' });
    }
    if (!provided || provided !== ADMIN_HTTP_SECRET) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    return next();
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
      logServerError(undefined, new Error(`Mpesa token request failed with status ${response.status}`), { operation: 'mpesa-token' });
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
        const isDev = process.env.NODE_ENV !== "production";
        const dummyUrl = 'https://wincercakehouse.com/api/mpesa/callback';
        const callbackBaseUrl = process.env.MPESA_CALLBACK_BASE_URL || (isDev ? dummyUrl : `https://${req.get('host')}`);

        // Callback URL MUST include the auth token, since /api/mpesa/callback requires it.
        // Daraja accepts query strings on a valid public HTTPS URL — it does not reject them.
        const callbackUrl = isDev
          ? dummyUrl
          : `${callbackBaseUrl}/api/mpesa/callback?token=${encodeURIComponent(MPESA_CALLBACK_SECRET)}&reference=${encodeURIComponent(reference)}`;

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
          logServerError(req, parseError, { operation: 'stkpush-parse-response' });
          return res.status(502).json({
            success: false,
            error: 'Invalid response from M-Pesa. Please try again later.'
          });
        }

        if (!response.ok) {
          logServerError(req, new Error(data?.errorMessage || data?.message || 'M-Pesa request failed'), { operation: 'stkpush-response', status: response.status });
          return res.status(response.status).json({
            success: false,
            error: data.errorMessage || data.message || 'Payment provider returned an error. Please try again.'
          });
        }

        const checkoutRequestID = data.CheckoutRequestID;

        if (!checkoutRequestID) {
          logServerError(req, new Error('No CheckoutRequestID returned by M-Pesa'), { operation: 'stkpush-missing-id' });
          return res.status(400).json({
            success: false,
            error: 'Payment gateway did not return an expected identifier. Please try again.'
          });
        }

        const { error: insertErr } = await supabaseAdmin.from('mpesa_requests').insert([{
          id: checkoutRequestID,
          reference,
          phone: phoneNumber,
          amount,
          checkoutRequestID,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString()
        }]);

        if (insertErr) {
          logServerError(req, insertErr, { operation: 'stkpush-save-transaction' });
          return res.status(500).json({
            success: false,
            error: 'Failed to record payment request. Please try again later.'
          });
        }

        res.json({ success: true, data });
      } catch (error: any) {
        logServerError(req, error, { operation: 'stkpush' });
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

      const stkCallback = req.body?.Body?.stkCallback;
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

      // NOTE: removed `reference` from this update — it's immutable after insert
      // and must never be derived from an untrusted query param.
      const { error: updateError } = await supabaseAdmin.from('mpesa_requests')
        .update({
          resultCode,
          resultDesc: typeof resultDesc === 'string' ? resultDesc : null,
          metadata: Array.isArray(stkCallback.CallbackMetadata?.Item) ? stkCallback.CallbackMetadata.Item : [],
          callbackReceivedAt: new Date().toISOString(),
          status: newStatus
        })
        .eq('id', checkoutRequestID)
        .eq('status', 'pending'); // idempotency guard

      if (updateError) {
        logServerError(req, updateError, { operation: 'mpesa-callback-db-update' });
      }

      res.json({ message: 'Success' });
    } catch (error) {
      logServerError(req, error, { operation: 'mpesa-callback' });
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
        const { data: snapshot, error } = await supabaseAdmin
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
        const { data: updated, error: updateError } = await supabaseAdmin
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
        const { data: requestSnap, error } = await supabaseAdmin
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

            const isProcessing = stkData?.errorCode === '500.001.1001' ||
              (typeof stkData?.errorMessage === 'string' && stkData.errorMessage.toLowerCase().includes('processing')) ||
              (typeof stkData?.ResultDesc === 'string' && stkData.ResultDesc.toLowerCase().includes('processing'));

            if (isProcessing) {
              // still being processed
            } else {
              const resultCode = stkData?.ResultCode ?? stkData?.Body?.stkCallback?.ResultCode;
              if (resultCode === 0 || resultCode === '0') {
                const { data: updated } = await supabaseAdmin.from('mpesa_requests')
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
              } else if (resultCode !== undefined && resultCode !== null) {
                await supabaseAdmin.from('mpesa_requests')
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
        logServerError(req, error, { operation: 'mpesa-status-check' });
        res.status(500).json({ success: false, error: 'Unable to verify payment status at this time. Please try again later.' });
      }
    }
  );

  const ALLOWED_USER_ROLES = ['user', 'admin'];
  const ORDER_STATUSES = ['Pending', 'Pending Verification', 'Confirmed (Pending Balance)', 'Preparing', 'Ready', 'Fully Paid', 'Delivered', 'Cancelled'];
  const INQUIRY_STATUSES = ['Pending', 'Needs Reply', 'Resolved', 'Closed'];

  // Admin Users API routes to bypass RLS type mismatch issues on users table
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('users').select('*');
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      logServerError(req, err, { operation: 'admin-fetch-users' });
      res.status(500).json({ success: false, error: 'Failed to load users. Please try again later.' });
    }
  });

  app.post('/api/admin/users', requireAdmin,
    [
      body('id').optional().trim().notEmpty().isLength({ max: 64 }).matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('User id must be alphanumeric and may include - or _ (max 64 chars)'),
      body('uid').optional().trim().notEmpty().isLength({ max: 64 }).matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('User uid must be alphanumeric and may include - or _ (max 64 chars)'),
      body('email').optional().trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
      body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be under 100 characters'),
      body('role').optional().isIn(ALLOWED_USER_ROLES).withMessage(`Role must be one of: ${ALLOWED_USER_ROLES.join(', ')}`),
      body('joined_at').optional().isISO8601().withMessage('joined_at must be a valid date'),
      body('orders_count').optional().isInt({ min: 0 }).withMessage('orders_count must be a non-negative integer').toInt()
    ],
    validate,
    async (req: express.Request, res: express.Response) => {
      try {
        // Whitelist allowed user fields to prevent unexpected data injection
        const allowed = ['id', 'uid', 'email', 'name', 'role', 'joined_at', 'orders_count'];
        const payload: any = {};
        for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
        if (Object.keys(payload).length === 0) return res.status(400).json({ success: false, error: 'No valid fields provided' });
        const { data, error } = await supabaseAdmin.from('users').insert([payload]).select();
        if (error) throw error;
        res.json(data?.[0] || { success: true });
      } catch (err: any) {
        logServerError(req, err, { operation: 'admin-add-user' });
        res.status(500).json({ success: false, error: 'Unable to add user. Please try again later.' });
      }
    }
  );

  app.delete('/api/admin/users/:id', requireAdmin,
    [
      param('id').trim().notEmpty().isLength({ max: 64 }).matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('Invalid user id')
    ],
    validate,
    async (req: express.Request, res: express.Response) => {
      try {
        const { error } = await supabaseAdmin.from('users').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
      } catch (err: any) {
        logServerError(req, err, { operation: 'admin-delete-user' });
        res.status(500).json({ success: false, error: 'Unable to delete user. Please try again later.' });
      }
    }
  );

  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      logServerError(req, err, { operation: 'admin-fetch-orders' });
      res.status(500).json({ success: false, error: 'Failed to load orders. Please try again later.' });
    }
  });

  app.patch('/api/admin/orders/:id', requireAdmin,
    [
      param('id').trim().notEmpty().isLength({ max: 64 }).matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('Invalid order id'),
      body('status').optional().trim().isIn(ORDER_STATUSES).withMessage('Invalid order status'),
      body('delivery_date').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Delivery date must be a valid ISO date'),
      body('delivery_window').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('Delivery window is too long'),
      body('delivery_zone').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('Delivery zone is too long'),
      body('shipping_address').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('Shipping address is too long'),
      body('city').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('City is too long'),
      body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a non-negative number').toFloat(),
      body('paid_amount').optional().isFloat({ min: 0 }).withMessage('Paid amount must be a non-negative number').toFloat(),
      body('payment_method').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('Payment method is too long'),
      body('customer').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Customer name is too long'),
      body('cake_title').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Cake title is too long'),
      body('cake_details').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Cake details are too long'),
      body('design_sketch').optional({ nullable: true, checkFalsy: true }).isURL({ require_protocol: true, require_tld: false }).withMessage('Design sketch must be a valid URL'),
      body('gauge').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('Gauge is too long'),
      body('notes').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Notes are too long')
    ],
    validate,
    async (req: express.Request, res: express.Response) => {
      try {
        const allowed = ['status','delivery_date','delivery_window','delivery_zone','shipping_address','city','amount','paid_amount','payment_method','customer','cake_title','cake_details','design_sketch','gauge','notes'];
        const payload: any = {};
        for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
        if (Object.keys(payload).length === 0) return res.status(400).json({ success: false, error: 'No valid fields provided' });
        const { data, error } = await supabaseAdmin.from('orders').update(payload).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data?.[0] || { success: true });
      } catch (err: any) {
        logServerError(req, err, { operation: 'admin-update-order' });
        res.status(500).json({ success: false, error: 'Unable to update order at the moment. Please try again later.' });
      }
    }
  );

  app.delete('/api/admin/orders/:id', requireAdmin,
    [
      param('id').trim().notEmpty().isLength({ max: 64 }).matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('Invalid order id')
    ],
    validate,
    async (req: express.Request, res: express.Response) => {
      try {
        const { error } = await supabaseAdmin.from('orders').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
      } catch (err: any) {
        logServerError(req, err, { operation: 'admin-delete-order' });
        res.status(500).json({ success: false, error: 'Unable to delete order. Please try again later.' });
      }
    }
  );

  app.get('/api/admin/inquiries', requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      logServerError(req, err, { operation: 'admin-fetch-inquiries' });
      res.status(500).json({ success: false, error: 'Failed to load inquiries. Please try again later.' });
    }
  });

  app.patch('/api/admin/inquiries/:id', requireAdmin,
    [
      param('id').trim().notEmpty().isLength({ max: 64 }).matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('Invalid inquiry id'),
      body('status').optional().trim().isIn(INQUIRY_STATUSES).withMessage('Invalid inquiry status'),
      body('name').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
      body('phone').optional({ nullable: true, checkFalsy: true }).trim().matches(/^(?:\+?254|0)?[17]\d{8}$/).withMessage('Phone must be a valid Kenyan number'),
      body('event_date').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Event date must be a valid ISO date'),
      body('occasion_type').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Occasion type is too long'),
      body('cake_details').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Cake details are too long'),
      body('vision').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Vision is too long'),
      body('sketch_url').optional({ nullable: true, checkFalsy: true }).isURL({ require_protocol: true, require_tld: false }).withMessage('Sketch URL must be a valid URL')
    ],
    validate,
    async (req: express.Request, res: express.Response) => {
      try {
        const allowed = ['status','name','phone','event_date','occasion_type','cake_details','vision','sketch_url'];
        const payload: any = {};
        for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
        if (Object.keys(payload).length === 0) return res.status(400).json({ success: false, error: 'No valid fields provided' });
        const { data, error } = await supabaseAdmin.from('inquiries').update(payload).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data?.[0] || { success: true });
      } catch (err: any) {
        logServerError(req, err, { operation: 'admin-update-inquiry' });
        res.status(500).json({ success: false, error: 'Unable to update inquiry at the moment. Please try again later.' });
      }
    }
  );

  app.delete('/api/admin/inquiries/:id', requireAdmin,
    [
      param('id').trim().notEmpty().isLength({ max: 64 }).matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('Invalid inquiry id')
    ],
    validate,
    async (req: express.Request, res: express.Response) => {
      try {
        const { error } = await supabaseAdmin.from('inquiries').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
      } catch (err: any) {
        logServerError(req, err, { operation: 'admin-delete-inquiry' });
        res.status(500).json({ success: false, error: 'Unable to delete inquiry. Please try again later.' });
      }
    }
  );

  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const statusCode = err.status || err.statusCode || 500;

    logServerError(req, err, { stage: 'global-error-handler', statusCode });

    let message = 'An unexpected error occurred. Please try again later.';
    if (!isProduction) {
      message = err.message || 'Internal Server Error';
    } else if (statusCode < 500 && err.message) {
      message = err.message;
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(!isProduction && { stack: err.stack, details: err.details }),
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
          host: 'localhost',
          port: PORT,
          protocol: 'ws',
        },
      },
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
