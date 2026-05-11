/**
 * @jest-environment node
 */
import { rateLimiter } from '../lib/rateLimit';
import { NextRequest } from 'next/server';

describe('Rate Limiter Utility', () => {
  const mockIp = '192.168.1.1';

  // Helper to create a mock NextRequest
  const createMockReq = (ip: string) => {
    return {
      headers: {
        get: (key: string) => (key === 'x-forwarded-for' ? ip : null),
      },
    } as unknown as NextRequest;
  };

  it('should allow requests under the limit', () => {
    let response = null;
    for (let i = 0; i < 3; i++) {
      response = rateLimiter(createMockReq(mockIp), 5);
      expect(response).toBeNull(); // null means allowed
    }
  });

  it('should block requests that exceed the limit', () => {
    const spamIp = '10.0.0.1';
    let response = null;
    
    // Send 5 allowed requests
    for (let i = 0; i < 5; i++) {
      response = rateLimiter(createMockReq(spamIp), 5);
    }
    
    // The 6th request should return a 429 NextResponse
    response = rateLimiter(createMockReq(spamIp), 5);
    expect(response).not.toBeNull();
    if (response) {
      expect(response.status).toBe(429);
    }
  });
});
