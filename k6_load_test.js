import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'your-jwt-token-here';
const ADMIN_SECRET = __ENV.ADMIN_SECRET || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`,
};

const adminHeaders = ADMIN_SECRET ? {
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET,
  'Authorization': `Bearer ${AUTH_TOKEN}`,
} : headers;

export default function () {
  // 1. STK Push endpoint (M-Pesa payment initiation)
  const stkPayload = JSON.stringify({
    phone: '0712345678',
    amount: 1,
    reference: `K6-TEST-${__VU}-${__ITER}`,
    description: 'Load test payment simulation',
  });

  if (__ITER === 0 && __VU === 1) {
    console.log(`Testing STK Push endpoint: ${BASE_URL}/api/mpesa/stkpush`);
  }

  const stkPushRes = http.post(`${BASE_URL}/api/mpesa/stkpush`, stkPayload, { headers });

  if (stkPushRes.status !== 200 && __ITER < 3) {
    console.log(`STK Push failed with status ${stkPushRes.status}`);
    console.log(`Response: ${stkPushRes.body}`);
  }

  check(stkPushRes, {
    'STK Push has valid status (200, 429, or 503)': (r) =>
      [200, 429, 503].includes(r.status),
    'STK Push is not 500 internal error': (r) => r.status !== 500,
    'STK Push response has success wrapper': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('success');
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);

  // 2. Payment status endpoint
  const sampleRequestId = 'ws_CO_20052026135455';
  const statusRes = http.get(`${BASE_URL}/api/mpesa/status/${sampleRequestId}`, { headers });

  if (statusRes.status !== 200 && __ITER < 3) {
    console.log(`Status poll failed with status ${statusRes.status}`);
    console.log(`Response: ${statusRes.body}`);
  }

  check(statusRes, {
    'Status poll returns 200': (r) => r.status === 200,
    'Status payload has valid state': (r) => {
      try {
        const body = JSON.parse(r.body);
        return ['pending', 'success', 'failed', 'expired'].includes(body.status);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);

  // 3. Admin users endpoint (GET)
  const usersRes = http.get(`${BASE_URL}/api/admin/users`, adminHeaders);

  check(usersRes, {
    'Admin users returns 200 or 401/503': (r) => [200, 401, 503].includes(r.status),
    'Admin users response is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.5);

  // 4. Admin orders endpoint (GET)
  const ordersRes = http.get(`${BASE_URL}/api/admin/orders`, adminHeaders);

  check(ordersRes, {
    'Admin orders returns 200 or 401/503': (r) => [200, 401, 503].includes(r.status),
    'Admin orders response is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.5);

  // 5. Admin inquiries endpoint (GET)
  const inquiriesRes = http.get(`${BASE_URL}/api/admin/inquiries`, adminHeaders);

  check(inquiriesRes, {
    'Admin inquiries returns 200 or 401/503': (r) => [200, 401, 503].includes(r.status),
    'Admin inquiries response is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);
}