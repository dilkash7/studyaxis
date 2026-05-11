import { NextRequest, NextResponse } from 'next/server';

const requestCache = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per window

export function rateLimiter(req: NextRequest, maxRequests: number = MAX_REQUESTS) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  if (ip === 'unknown') return null; // Can't reliably rate limit unknown IPs

  const record = requestCache.get(ip);
  if (!record) {
    requestCache.set(ip, { count: 1, timestamp: now });
    return null;
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    // Reset window
    requestCache.set(ip, { count: 1, timestamp: now });
    return null;
  }

  record.count += 1;
  requestCache.set(ip, record);

  if (record.count > maxRequests) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  return null;
}

// Memory cleanup every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  requestCache.forEach((value, key) => {
    if (now - value.timestamp > RATE_LIMIT_WINDOW) {
      requestCache.delete(key);
    }
  });
}, 10 * 60 * 1000);
