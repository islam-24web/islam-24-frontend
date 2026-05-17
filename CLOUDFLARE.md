# Cloudflare configuration notes

This site sits behind Cloudflare DNS in front of a Vercel origin. A few CF
features interact badly with Vercel-served paths and have caused indexed
broken URLs in the past.

## Email Address Obfuscation must stay OFF for /apps/*

Cloudflare's Scrape Shield → Email Address Obfuscation rewrites plain-text
emails into `<a href="/cdn-cgi/l/email-protection#...">` links and injects
`/cdn-cgi/scripts/.../email-decode.min.js`. Those `/cdn-cgi/*` paths are
served by Cloudflare's edge — they don't exist on the Vercel origin, so any
HTML that's been transformed by CF and then **saved back to the repo** ends
up shipping permanent broken links.

This is exactly what happened to `public/apps/sibaq/index.html`: it was
opened through a CF-proxied URL, the browser saved the rewritten HTML, and
the saved copy was committed. Ahrefs then flagged:
  - `https://www.islam-24.com/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js` → 404
  - `https://www.islam-24.com/cdn-cgi/l/email-protection` → 404
  - `/apps/sibaq` → "Page has broken JavaScript / links to broken page"

Code fix (2026-05-17) replaced the CF-injected markup with plain
`mailto:` links using HTML-entity-encoded `@` and `.` so neither human
inspectors nor CF re-encoders mangle them on subsequent passes.

### Dashboard action required (one-time)

Cloudflare dashboard → islam-24.com zone → **Scrape Shield** →
**Email Address Obfuscation** → **Off** (or, if some marketing pages need
it, scope it via a Page Rule that excludes `/apps/*`).

### How to verify after the dashboard change

```bash
# Should NOT contain "/cdn-cgi/" or "__cf_email__"
curl -s https://islam-24.com/apps/sibaq | grep -cE 'cdn-cgi|__cf_email__'
# expected: 0
```

### Why HTML entities for the mailto?

`<a href="mailto:user&#64;example&#46;com">user&#64;example&#46;com</a>`
- still works in every browser (entities are decoded by the HTML parser)
- doesn't match CF's plain-text email regex, so Scrape Shield leaves it alone
- still obfuscates against the dumbest scrapers
