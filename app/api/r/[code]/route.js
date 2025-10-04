// app/api/r/[code]/route.js
import { NextResponse } from 'next/server';

function stripOuterQuotes(s = '') {
  s = s.trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1);
  }
  return s;
}

// Robust CSV parser for your quoted rows + BOM
function parseCSV(csv) {
  if (csv && csv.charCodeAt(0) === 0xFEFF) csv = csv.slice(1); // strip BOM
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return [];
  const rawHeader = stripOuterQuotes(lines[0]);
  const headers = rawHeader.split(',').map(h => stripOuterQuotes(h).trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = stripOuterQuotes(lines[i]);
    const cols = rawLine.split(',').map(c => stripOuterQuotes(c).trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

let mappingCache = null;

async function getMapping() {
  if (mappingCache) return mappingCache;
  const csv = (await import('../../../../data/mappings.csv?raw')).default;
  const rows = parseCSV(csv);
  const map = {};
  for (const r of rows) {
    const code = (r.code || '').trim().toUpperCase();
    const url  = (r.long_url || '').trim();
    if (!code || !url) continue;
    map[code] = { msp_name: (r.msp_name || '').trim(), long_url: url };
  }
  mappingCache = map;
  return mappingCache;
}

// app/api/r/[code]/route.js
import { NextResponse, unstable_after as after } from 'next/server';

export async function GET(_req, { params }) {
  const code = (params?.code || '').trim().toUpperCase();

  const mapping = await getMapping();
  const record = mapping[code];
  const mspName = record?.msp_name || '';

  // Schedule logging to run *after* the response is sent.
  if (process.env.LOG_WEBHOOK_URL) {
    after(async () => {
      try {
        await fetch(process.env.LOG_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // secret: process.env.LOG_SECRET,
            code,
            msp_name: mspName,
            host: _req.headers.get('host') || '',
            ref: _req.headers.get('referer') || '',
            ua: _req.headers.get('user-agent') || '',
            ts: Date.now()
          })
        });
      } catch (e) {
        // Optional: you can’t console.log here reliably post-response, so we ignore errors
      }
    });
  }

  if (!record) {
    const fallback = process.env.FALLBACK_URL || 'https://plans.reliancegroupusa.com/plan-not-found';
    return NextResponse.redirect(fallback, { status: 302 });
  }
  return NextResponse.redirect(record.long_url, { status: 301 });
}
