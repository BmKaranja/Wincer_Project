import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Get auth token (adjust based on your auth mechanism)
  const token = __ENV.AUTH_TOKEN || 'your-jwt-token-here';

  const stkPayload = JSON.stringify({
    phone: '0712345678',
    amount: 1,
    reference: `K6-TEST-${__VU}-${__ITER}`,
    description: 'Load test payment simulation',
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // ADD THIS
  };

  // Log first request for debugging
  if (__ITER === 0 && __VU === 1) {
    console.log(`Testing endpoint: ${BASE_URL}/api/mpesa/stkpush`);
    console.log(`Payload: ${stkPayload}`);
  }

  const stkPushRes = http.post(`${BASE_URL}/api/mpesa/stkpush`, stkPayload, { headers });

  // Enhanced logging on failure
  if (stkPushRes.status !== 200 && __ITER < 3) {
    console.log(`STK Push failed with status ${stkPushRes.status}`);
    console.log(`Response: ${stkPushRes.body}`);
  }

  check(stkPushRes, {
    'stk push has valid status (200, 429, or 503)': (r) =>
      [200, 429, 503].includes(r.status),
    'is not 500 internal error': (r) => r.status !== 500,
    'response has success framework wrapper': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('success');
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);

  const sampleRequestId = 'ws_CO_20052026135455';
  const statusRes = http.get(`${BASE_URL}/api/mpesa/status/${sampleRequestId}`, { headers });

  if (statusRes.status !== 200 && __ITER < 3) {
    console.log(`Status poll failed with status ${statusRes.status}`);
    console.log(`Response: ${statusRes.body}`);
  }

  check(statusRes, {
    'status poll is 200': (r) => r.status === 200,
    'status payload matches standard states': (r) => {
      try {
        const body = JSON.parse(r.body);
        return ['pending', 'success', 'failed'].includes(body.status);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(2);
}