# Plans Redirector (Next.js + Vercel)

A tiny redirector that serves clean, branded short links like:

- https://plans.reliancegroupusa.com/r/ABC123
- https://plans.eandssolutions.com/r/ABC123

Each short code maps to a long Digitol plan URL stored in a CSV file.

---

## How it works
- API route: `/r/:code` → looks up `code` in `data/mappings.csv`
- If found: 301 redirect to the `long_url`
- If missing: redirect to `/plan-not-found` (customizable)

---

## Add or update links
1. Edit `data/mappings.csv` and append a row:
