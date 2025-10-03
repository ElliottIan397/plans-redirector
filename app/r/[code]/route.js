// app/api/r/[code]/route.js
import { NextResponse } from 'next/server';

// --- Tiny CSV parser (safe for simple CSV without embedded commas) ---
function parseCSV(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = cols[i] || ''));
    return row;
  });
}

// Cache mapping across invocations within the same runtime
let mappingCache = null;

async function getMapping() {
  if (mappingCache) return mappingCache;

  // Import CSV as raw string (handled by next.config.js rule)
  const csv = (await import('../../../..//data/mappings.csv?raw')).default;
  const rows = parseCSV(csv);

  const map = {};
  for (const r of rows) {
    if (!r.code || !r.long_url) continue;
    map[r.code] = { msp_name: r.msp_name || '', long_url: r.long_url };
  }
  mappingCache = map;
  return mappingCache;
}

export async function GET(_req, { params }) {
  const code = params?.code || '';
  const mapping = await getMapping();
  const record = mapping[code];

  if (!record) {
    // Fallback destination if code not found
    const fallback =
      process.env.FALLBACK_URL ||
      'https://plans.reliancegroupusa.com/plan-not-found';
    return NextResponse.redirect(fallback, { status: 302 });
  }

  // Optionally append basic UTM tags (kept minimal to avoid "spammy" look)
  // const url = new URL(record.long_url);
  // url.searchParams.set('utm_source', 'email');
  // url.searchParams.set('utm_medium', 'outreach');
  // url.searchParams.set('utm_campaign', '2yr_plan');

  // Permanent redirect (use 302 if you want to freely change targets later)
  return NextResponse.redirect(record.long_url, { status: 301 });
}
