
---

## (Optional) `middleware.js`
Only if you want brand-specific fallbacks/logic per domain later. Safe to omit.

```js
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const host = req.headers.get('host') || '';
  // You can branch on host if needed, or just pass it down as a header.
  const res = NextResponse.next();
  res.headers.set('x-brand-host', host);
  return res;
}
