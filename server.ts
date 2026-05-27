import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { rateLimit } from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { Agent, setGlobalDispatcher } from 'undici';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Let's load the applet config if it exists
let firebaseAppletConfig: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseAppletConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.warn("Could not read firebase-applet-config.json:", e);
}

// Initialize Firebase Admin SDK using Application Default Credentials (ADC) or env fallback
const apps = admin.apps || [];
if (!apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
      });
    } catch (e) {
      console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT JSON, falling back to Application Default Credentials:", e);
      admin.initializeApp({
        projectId: firebaseAppletConfig?.projectId || process.env.FIREBASE_PROJECT_ID
      });
    }
  } else {
    // Highly preferred in Cloud Run/Applet environment: uses built-in default container credentials
    admin.initializeApp({
      projectId: firebaseAppletConfig?.projectId || process.env.FIREBASE_PROJECT_ID
    });
  }
}

// Initialize Firestore using the specific databaseId from the applet config
const databaseId = firebaseAppletConfig?.firestoreDatabaseId;
const db = databaseId ? getFirestore(databaseId) : getFirestore();

// Setup FieldValue
const { FieldValue } = admin.firestore;

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
// server.ts - Update the STK push handler
app.post('/api/mpesa/stkpush', 
  [/* validation */],
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

      console.log('Starting STK Push for phone:', phoneNumber);

      const token = await getMpesaAccessToken();
      console.log('Got access token');

      const timestamp = getTimestamp();
      const password = generatePassword(shortcode, passkey, timestamp);
      const callbackBaseUrl = req.get('origin') || `https://${req.get('host')}`;
      const callbackUrl = `${callbackBaseUrl}/api/mpesa/callback?reference=${encodeURIComponent(reference || 'order')}`;

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

      console.log('STK Push Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('STK Push Response Status:', response.status);
      console.log('STK Push Response Headers:', {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length')
      });

      const responseText = await response.text();
      console.log('STK Push Raw Response Body:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        return res.status(502).json({
          success: false,
          error: 'Invalid response from M-Pesa (not JSON)',
          rawResponse: responseText.substring(0, 500)
        });
      }

      if (!response.ok) {
        console.error("STK Push error:", data);
        return res.status(response.status).json({ 
          success: false, 
          error: data.errorMessage || data.message || 'M-Pesa request failed'
        });
      }

      const checkoutRequestID = data.CheckoutRequestID;
      console.log('CheckoutRequestID:', checkoutRequestID);

      if (!checkoutRequestID) {
        console.error('No CheckoutRequestID in response:', data);
        return res.status(400).json({ 
          success: false, 
          error: 'M-Pesa did not return a CheckoutRequestID'
        });
      }

      await setDoc(
        doc(db, 'mpesa_requests', checkoutRequestID),
        {
          reference,
          phone: phoneNumber,
          amount,
          checkoutRequestID,
          status: 'pending',
          createdAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + 2 * 60 * 1000)
        }
      );

      res.json({ success: true, data });
    } catch (error: any) {
      console.error('STK Push Exception:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      next(error);
    }
  }
);  // We'll expose an endpoint so the frontend can check the status.
  const paymentCallbacks = new Map<string, any>();

app.post('/api/mpesa/callback', async (req, res, next) => {
  try {
    console.log('Received Mpesa Callback:', JSON.stringify(req.body, null, 2));
    const reference = req.query.reference as string;
    const callbackData = req.body?.Body?.stkCallback;

    if (callbackData) {
      const checkoutRequestID = callbackData.CheckoutRequestID;
      const resultCode = callbackData.ResultCode;
      
      // Store callback result in Firestore
      await db.collection('mpesa_requests').doc(checkoutRequestID).set({
        resultCode,
        resultDesc: callbackData.ResultDesc,
        metadata: callbackData.CallbackMetadata?.Item || [],
        callbackReceivedAt: FieldValue.serverTimestamp(),
        reference
      }, { merge: true });

      // Acknowledge to Safaricom immediately
      res.json({ message: 'Success' });
      return;
    } else {
      res.status(400).json({ success: false, error: 'Invalid callback payload' });
      return;
    }
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
    body('code').trim().toUpperCase().matches(/^[A-Z][A-Z0-9]{9}$/)
  ],
  validate,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { phone, amount, reference, code } = req.body;

      // Query Firestore for ANY request matching this code pattern
      // In a real scenario, you'd call Daraja's query API here
      // For now, we accept it if the user has an active pending request
      const q = db.collection('mpesa_requests')
        .where('reference', '==', reference)
        .where('status', '==', 'pending');
      
      const snapshot = await q.get();
      
      if (snapshot.empty) {
        return res.status(400).json({
          success: false,
          error: 'No matching pending payment request found. Please try again.'
        });
      }

      const pendingRequest = snapshot.docs[0];
      const requestData = pendingRequest.data();

      // Update the request with manual code
      await pendingRequest.ref.update({
        manualCode: code,
        manualVerifiedAt: FieldValue.serverTimestamp(),
        status: 'manually_verified'
      });

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

app.get('/api/mpesa/status/:requestId', 
  [param('requestId').trim().notEmpty().escape()],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const requestSnap = await db.collection('mpesa_requests').doc(req.params.requestId).get();

      if (!requestSnap.exists) {
        return res.json({ status: 'pending' });
      }

      const data = requestSnap.data() || {};

      // Check callback result
      if (data.resultCode === 0) {
        return res.json({ status: 'success' });
      }

      // Check manual code verification
      if (data.status === 'manually_verified') {
        return res.json({ status: 'success', manual: true });
      }

      // Still pending
      if (data.status === 'pending') {
        // Check if expired (2 min timeout)
        const now = Date.now();
        const created = data.createdAt ? (data.createdAt.toMillis ? data.createdAt.toMillis() : (data.createdAt.toDate ? data.createdAt.toDate().getTime() : 0)) : 0;
        if (now - created > 2 * 60 * 1000) {
          return res.json({ status: 'expired' });
        }
        return res.json({ status: 'pending' });
      }

      // Failed
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
