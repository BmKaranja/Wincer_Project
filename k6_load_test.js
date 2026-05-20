import http from 'k6/http';
import { check, sleep } from 'k6';

// -------------------------------------------------------------------------------------------------
// k6 Load Test Configuration
// For more info, see: https://grafana.com/docs/k6/latest/
// -------------------------------------------------------------------------------------------------
export const options = {
  // Test scenarios or stages for ramping up virtual users
  stages: [
    { duration: '30s', target: 10 }, // Ramp-up: 0 to 10 users in 30 seconds
    { duration: '1m', target: 10 },  // Plateau: hold 10 users for 1 minute
    { duration: '15s', target: 0 },  // Ramp-down: 10 to 0 users in 15 seconds
  ],
  // Performance threshold parameters
  thresholds: {
    http_req_failed: ['rate<0.05'], // Fail test if over 5% of requests return error status codes
    http_req_duration: ['p(95)<1500'], // 95% of requests must complete under 1500ms
  },
};

// Base URL of the deployed or local server
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Prepare JSON Payload for STK Push initiation
  const stkPayload = JSON.stringify({
    phone: '0712345678',
    amount: 1,
    reference: `K6-TEST-${__VU}-${__ITER}`,
    description: 'Load test payment simulation',
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  // 2. Query target Endpoint: STK Push API
  const stkPushRes = http.post(`${BASE_URL}/api/mpesa/stkpush`, stkPayload, { headers });

  // 3. Perform Response assertions
  // The global rate limiter is configured with /api/ general limit rules (100 req per 15 minutes),
  // so some virtual requests might encounter a 429 Too Many Requests response code if rate-limited.
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
    }
  });

  // Small delay to simulate user waiting for push notification screen
  sleep(1);

  // 4. Simulate status polling behavior
  // Check mock response for status tracking mapping
  const sampleRequestId = 'ws_CO_20052026135455'; 
  const statusRes = http.get(`${BASE_URL}/api/mpesa/status/${sampleRequestId}`);

  check(statusRes, {
    'status poll is 200': (r) => r.status === 200,
    'status payload matches standard states': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'pending' || body.status === 'success' || body.status === 'failed';
      } catch (e) {
        return false;
      }
    }
  });

  // Sleep before next loop iteration to emulate organic human pacing
  sleep(2);
}
