// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  // optional: forward host to routes if you want brand-aware logic later
  const host = req.headers.get('host') || '';
  const res = NextResponse.next();
  res.headers.set('x-brand-host', host);
  return res;
}

// optional: limit to just our redirect + root (or remove this for site-wide)
export const config = {
  matcher: ['/', '/r', '/r/:path*'],
};
