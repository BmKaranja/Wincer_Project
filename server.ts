import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Wait for the environment variables to be populated in Production
  // In development, they might be in .env, no extra action explicitly required now,
  // but if needed we can import dotenv. 
  
  // MPESA API ROUTES

  // Note: Daraja sandbox endpoints
  const DARAJA_ENV = 'sandbox'; // sandbox or production
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
  app.post('/api/mpesa/stkpush', async (req, res) => {
    try {
      const { phone, amount, reference, description } = req.body;
      const callbackBaseUrl = req.get('origin') || `https://${req.get('host')}`;

      if (!phone || !amount) {
         res.status(400).json({ success: false, error: 'Phone and amount are required' });
         return;
      }

      const phoneNumber = formatPhoneNumber(phone);
      const shortcode = process.env.MPESA_SHORTCODE;
      const passkey = process.env.MPESA_PASSKEY;

      if (!shortcode || !passkey) {
        throw new Error('MPESA_SHORTCODE or MPESA_PASSKEY not configured');
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
        res.status(response.status).json({ success: false, error: data.errorMessage || 'STK Push failed', details: data });
        return;
      }

      res.json({ success: true, data });
    } catch (error: any) {
      console.error('STK push error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Keep track of pending payments in memory (for development/example)
  // In a real app, you'd store this in Firestore when initiating STK and update on callback.
  // We'll expose an endpoint so the frontend can check the status.
  const paymentCallbacks = new Map<string, any>();

  app.post('/api/mpesa/callback', async (req, res) => {
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
         res.status(400).json({ error: 'Invalid payload' });
         return;
      }
    } catch (error) {
      console.error('Callback error:', error);
       res.status(500).json({ error: 'Server handling callback failed' });
       return;
    }
  });

  // Polling endpoint for frontend to check if payment succeeded
  app.get('/api/mpesa/status/:requestId', (req, res) => {
    const status = paymentCallbacks.get(req.params.requestId);
    if (!status) {
       res.json({ status: 'pending' });
       return;
    }
    
    if (status.resultCode === 0) {
       res.json({ status: 'success', data: status });
       return;
    } else {
       res.json({ status: 'failed', data: status });
       return;
    }
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
