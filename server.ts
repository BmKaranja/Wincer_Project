import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { rateLimit } from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { Agent, setGlobalDispatcher } from 'undici';

// Initialize HTTP/HTTPS connection pooling via undici.
// This configures robust socket reuse (Keep-Alive) on all outbound fetch requests.
// This significantly reduces network overhead and latency when connecting to Safaricom Daraja API.
const poolAgent = new Agent({
  connections: 50,              // Maintain up to 50 active socket connections per origin
  keepAliveTimeout: 60000,      // Keep idle sockets open for 60 seconds
  keepAliveMaxTimeout: 600000,  // Max limit to recycle sockets (10 minutes)
  pipelining: 1                 // Disable HTTP pipelining issues by setting to 1
});

setGlobalDispatcher(poolAgent);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for rate limiting behind load balancers/proxies
  app.set('trust proxy', 1);

  // Rate limiters
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // set `RateLimit` and `RateLimit-Policy` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: { success: false, error: 'Too many requests, please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts, please try again in 15 minutes.' },
  });

  // Apply general limiter to all API routes
  app.use('/api/', generalLimiter);

  // Apply stricter limiter to authentication routes (matching /api/auth/*)
  app.use('/api/auth/', authLimiter);

  // Middleware to parse JSON bodies with a strict limit
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Input validation middleware
  const validate = (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  };

  // MPESA API ROUTES

  // Note: Daraja sandbox endpoints
  const DARAJA_ENV = process.env.DARAJA_ENV || 'sandbox'; // sandbox or production
  const DARAJA_BASE_URL = DARAJA_ENV === 'sandbox' 
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';

  // Helper to get access token
  async function getMpesaAccessToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      throw new Error('MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET not configured');
    }

    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    const response = await fetch(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${credentials}`
      }
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Mpesa token error:", err);
      throw new Error(`Failed to get token: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  // Generate password for STK push
  function generatePassword(shortcode: string, passkey: string, timestamp: string) {
    const buffer = Buffer.from(`${shortcode}${passkey}${timestamp}`);
    return buffer.toString('base64');
  }

  // Safaricom timestamps format: YYYYMMDDHHmmss
  function getTimestamp() {
    const date = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  // Format phone number to 254...
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

  // Endpoint to initiate STK Push
  app.post('/api/mpesa/stkpush', 
    [
      body('phone').trim().notEmpty().withMessage('Phone is required').escape(),
      body('amount').isNumeric().withMessage('Amount must be a number'),
      body('reference').trim().escape(),
      body('description').trim().escape(),
    ],
    validate,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { phone, amount, reference, description } = req.body;
      const callbackBaseUrl = req.get('origin') || `https://${req.get('host')}`;

      const phoneNumber = formatPhoneNumber(phone);
      const shortcode = process.env.MPESA_SHORTCODE;
      const passkey = process.env.MPESA_PASSKEY;

      if (!shortcode || !passkey) {
        const error: any = new Error('M-Pesa payment system is not fully configured.');
        error.status = 503;
        throw error;
      }

      const token = await getMpesaAccessToken();
      const timestamp = getTimestamp();
      const password = generatePassword(shortcode, passkey, timestamp);

      // The callback URL where Safaricom will send the success/failure result
      // Passing the reference so we know which order this callback relates to
      const callbackUrl = `${callbackBaseUrl}/api/mpesa/callback?reference=${encodeURIComponent(reference || 'order')}`;

      console.log(`Initiating STK Push for ${phoneNumber}, amount ${amount}`);

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

      const response = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("STK Push error response:", data);
        res.status(response.status).json({ 
          success: false, 
          error: data.errorMessage || 'The payment request could not be processed at this time.' 
        });
        return;
      }

      res.json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  });

  // Keep track of pending payments in memory (for development/example)
  // In a real app, you'd store this in Firestore when initiating STK and update on callback.
  // We'll expose an endpoint so the frontend can check the status.
  const paymentCallbacks = new Map<string, any>();

  app.post('/api/mpesa/callback', async (req, res, next) => {
    try {
      console.log('Received Mpesa Callback:', JSON.stringify(req.body, null, 2));
      const reference = req.query.reference as string;
      const callbackData = req.body?.Body?.stkCallback;

      if (callbackData) {
        const checkoutRequestID = callbackData.CheckoutRequestID;
        
        // Store the result
        paymentCallbacks.set(checkoutRequestID, {
          reference,
          resultCode: callbackData.ResultCode,
          resultDesc: callbackData.ResultDesc,
          metadata: callbackData.CallbackMetadata?.Item || []
        });

        // Since it's a webhook, acknowledge receipt to Safaricom
         res.json({ message: 'Success' });
         return;
      } else {
         res.status(400).json({ success: false, error: 'Invalid callback payload' });
         return;
      }
    } catch (error) {
      next(error);
    }
  });

  // Polling endpoint for frontend to check if payment succeeded
  app.get('/api/mpesa/status/:requestId', 
    [
      param('requestId').trim().notEmpty().escape()
    ],
    validate,
    (req: express.Request, res: express.Response) => {
    const status = paymentCallbacks.get(req.params.requestId);
    if (!status) {
       res.json({ status: 'pending' });
       return;
    }
    
    if (status.resultCode === 0) {
       res.json({ status: 'success' });
       return;
    } else {
       res.json({ status: 'failed', message: status.resultDesc });
       return;
    }
  });


  // ---------------------------------------------------------
  // Error handling and 404
  // ---------------------------------------------------------

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      console.error('Unhandled Error:', err);
    }

    const statusCode = err.status || err.statusCode || 500;
    
    // In production, we don't leak internal error messages or stack traces
    let message = 'An unexpected error occurred. Please try again later.';
    
    if (!isProduction) {
      message = err.message || 'Internal Server Error';
    } else if (statusCode < 500) {
      // For 4xx errors, we can be slightly more descriptive if it's a known error type
      message = err.message;
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      ...( !isProduction && { stack: err.stack, details: err.details })
    });
  });


  // ---------------------------------------------------------
  // Vite integration
  // ---------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    // Development middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production file serving
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
