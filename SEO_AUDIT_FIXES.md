# SEO Audit Fixes — 2026-05-17

Branch: `seo-audit-fixes-2026-05-17` · `next build` ✅ (109 pages, middleware
92.9 kB) · 5 commits, one per root cause.

All fixes are in code; **two manual steps** (Vercel preview env + Cloudflare
dashboard) are listed at the bottom.

## Root Cause 1: Domain canonicalization

The site was serving with `www.islam-24.com` as the primary domain — apex
`islam-24.com/*` was 307-redirecting to www, while every article emitted a
`<link rel="canonical">` pointing at apex `/<slug>` (no `/article/` prefix)
because Strapi rows had `seo.canonical_url` set to that broken target.
`/blog`, `/blog?page=1` and `/blog?category=*` all returned 200 with no
canonical at all.

**Files changed (commit `49df26a`):**
- `lib/seo/site.ts`, `lib/jobs/api.ts` — apex now the env-less fallback
- `next.config.js` — `308` redirect on Host=`www.islam-24.com`, `/blog?page=1` collapse,
  legacy `/articles/:slug`+`/categories/:slug` → singular routes
- `app/article/[slug]/page.tsx`, `app/[slug]/page.tsx` — canonical always
  built from `SITE_URL` + route prefix; `seo.canonical_url` override dropped
- `app/blog/page.tsx` — `generateMetadata` emits per-variant canonical
- `app/sitemap.ts`, `app/robots.ts` — share `getSiteUrl()`, sitemap drops
  reserved placeholder slugs
- Vercel env `NEXT_PUBLIC_SITE_URL` updated to `https://islam-24.com` for
  Production and Development (Preview pending — see manual steps)

**Verification (after deploy):**
```bash
# www should permanently redirect to apex
curl -sI https://www.islam-24.com/article/dua-istikhara-complete-guide | grep -iE 'HTTP|location'
# expected: HTTP/2 308   location: https://islam-24.com/article/dua-istikhara-complete-guide

# canonical should be apex with /article/ prefix, NOT a 307 target
curl -s https://islam-24.com/article/dua-istikhara-complete-guide | grep -oE '<link rel="canonical"[^>]+>'
# expected: <link rel="canonical" href="https://islam-24.com/article/dua-istikhara-complete-guide"/>

# /blog should have a canonical tag
curl -s https://islam-24.com/blog | grep -oE '<link rel="canonical"[^>]+>'
# expected: <link rel="canonical" href="https://islam-24.com/blog"/>

# /blog?page=1 should 301 to /blog
curl -sI 'https://islam-24.com/blog?page=1' | grep -iE 'HTTP|location'
# expected: HTTP/2 308 (or 301)  location: /blog
```
**Status:** ✅ Fixed in code · ⚠️ needs Vercel deploy + Preview env

---

## Root Cause 2: `/jobs` hreflang + HTML lang mismatch

Hreflang `alternates.languages` was already correct in `generateMetadata` —
the bug was that the root layout hardcoded `<html lang="ar">` for every
route. English `/jobs` and `/jobs/<slug>` pages declared lang="ar" while
their hreflang map listed ar/en/x-default, so Ahrefs flagged 195 URLs for
HTML/hreflang mismatch and 388 URLs for "missing reciprocal hreflang".

**Files changed (commit `ab19afc`):**
- `middleware.ts` (new) — forwards `x-pathname` + `x-search` as request
  headers; matcher skips `_next`, `api`, `monitoring`, `apps`, static assets
- `app/layout.tsx` — root layout reads those headers via `next/headers` and
  computes `<html lang>`/`dir`: Arabic everywhere except `/jobs`, where
  `?lang=ar` → ar and anything else → en

**Verification (after deploy):**
```bash
curl -s https://islam-24.com/jobs | grep -oE '<html lang="[^"]+"'
# expected: <html lang="en"

curl -s 'https://islam-24.com/jobs?lang=ar' | grep -oE '<html lang="[^"]+"'
# expected: <html lang="ar"

curl -s https://islam-24.com/jobs | grep -oE '<link rel="alternate" hrefLang="[^"]+"[^>]+>' | sort
# expected: 3 lines (ar/en/x-default), all anchored on apex islam-24.com
```
**Status:** ✅ Fixed

---

## Root Cause 3: Cloudflare email obfuscation in `/apps/sibaq`

`public/apps/sibaq/index.html` was previously saved through a CF-proxied
URL, baking in three `<a href="/cdn-cgi/l/email-protection#...">` links with
`__cf_email__` spans and two `/cdn-cgi/scripts/.../email-decode.min.js`
script tags. Those paths are CF-edge-only — they 404 on the Vercel origin,
which is exactly what Ahrefs flagged (`broken JS`, `4XX page`,
`links to broken page`).

**Files changed (commit `f7563c9`):**
- `public/apps/sibaq/index.html` — three CF-mangled anchors replaced with
  `mailto:islamcreative&#64;icloud&#46;com` using HTML-entity encoding so
  Scrape Shield can't re-mangle them; both `email-decode.min.js` script
  tags removed
- `CLOUDFLARE.md` (new) — documents the dashboard-side fix (turn Email
  Address Obfuscation off, or scope it away from `/apps/*`) so future
  contributors don't reintroduce the problem

**Verification (after deploy):**
```bash
curl -s https://islam-24.com/apps/sibaq | grep -cE 'cdn-cgi|__cf_email__|email-decode'
# expected: 0
```
**Status:** ✅ Fixed in code · ⚠️ Cloudflare dashboard step recommended

---

## Root Cause 4: Legacy 404 links from the homepage

Three homepage daily-tiles items pointed at `/articles/<slug>` and
`/categories/<slug>` — singular `/article/` and `/category/` are the real
routes. The 301 redirects from RC1 catch these for end users, but Ahrefs
treats "homepage links to a redirected URL" as a separate downgrade.

**Files changed (commit `ee63c53`):**
- `components/blocks/DailyTiles.tsx`, `components/blocks/AppsFeature.tsx` —
  small `normalizeHref()` rewrites `/articles/<slug>` → `/article/<slug>`
  and `/categories/<X>` → `/category/<X>` at render time, so the emitted
  HTML uses the canonical singular form directly
- `next.config.js` redirects (shipped in RC1) keep external backlinks alive

**Verification (after deploy):**
```bash
curl -s https://islam-24.com/ | grep -oE 'href="/(articles|categories)/[^"]+"'
# expected: (empty — zero matches)

# Old backlinks still work via 301
curl -sI https://islam-24.com/articles/dua-istikhara-complete-guide | grep -iE 'HTTP|location'
# expected: 308   location: /article/dua-istikhara-complete-guide
```
**Status:** ✅ Fixed · the underlying Strapi `daily-tiles` items can also be
PATCH'd to the canonical paths whenever the editor next opens the homepage
singleton (see manual steps).

---

## Root Cause 5: Preview content + empty `/jobs?lang=ar`

`/article/article` is a real Strapi row (id 638, title "test") whose body
field contains an entire HTML document wrapped in a markdown code fence —
including `<title>Preview: أذكار المساء — islam-24.com</title>`. Rendered
via `dangerouslySetInnerHTML`, that gave the page two `<title>` tags.

`/jobs?lang=ar` returns an empty result (Arabic translations are still
rolling in) and the empty-state was a bare `<div>` — zero outgoing internal
links, which Ahrefs flagged.

**Files changed across RC1 (`49df26a`) and RC5 (`0f33e9a`):**
- `app/article/[slug]/page.tsx` — `RESERVED_SLUGS` set (`article`, `preview`,
  `test`, `undefined`, `null`) returns `notFound()` in both metadata and
  page handlers; excluded from `generateStaticParams` too
- `lib/article/sanitize.ts` (new) — strips markdown fences, `<!doctype>`,
  `<html>`, entire `<head>` blocks, `<body>` tags, and orphan
  `<title>/<meta>/<link>/<base>` from article body content before it hits
  `dangerouslySetInnerHTML`. Pure string transform, runs before
  `addHeadingAnchors` so anchor IDs stay stable.
- `app/jobs/page.tsx` — header breadcrumb (Home + locale switcher) and a
  pair of follow-up links in the empty state; `hrefLang` attributes match
  the alternates already declared by `generateMetadata`

**Verification (after deploy):**
```bash
# placeholder slug returns 404
curl -sI https://islam-24.com/article/article | head -1
# expected: HTTP/2 404

# /jobs?lang=ar has internal links even when empty
curl -s 'https://islam-24.com/jobs?lang=ar' | grep -oE 'href="(/jobs|/)([^"]*)"' | sort -u | head
# expected: at least href="/jobs" and href="/"

# no duplicate <title> tags anywhere
curl -s https://islam-24.com/article/article | grep -c '<title'
# expected: 0  (because page is now 404 — the not-found page emits a single <title>)
```
**Status:** ✅ Fixed in code · the original Strapi row can be unpublished
or deleted to remove the source content (see manual steps).

---

## Pending manual steps (things outside code)

- [ ] **Vercel — finish env update for Preview environment**
  Production + Development now have `NEXT_PUBLIC_SITE_URL=https://islam-24.com`.
  The Preview-environment update was rejected by the CLI's interactive
  prompt (`vercel env add … preview --value … --yes` returned an
  unresolved-arg hint in CLI v54.1.0). Set it via the dashboard:
  *Project → Settings → Environment Variables → Preview*.

- [ ] **Vercel — promote a deploy of `seo-audit-fixes-2026-05-17`**
  Either merge the PR to `main` (Vercel auto-deploys to production) or
  `vercel deploy --prod` from the branch checkout for a one-shot promote.

- [ ] **Cloudflare dashboard — disable Email Address Obfuscation**
  islam-24.com zone → Scrape Shield → Email Address Obfuscation → Off.
  If marketing pages elsewhere depend on it, scope it via a Page Rule
  that excludes `/apps/*`. Details in `CLOUDFLARE.md`.

- [ ] **Strapi admin — clean up two CMS data issues**
  (Code-side defences already block both from causing SEO damage, but
  fixing them at the source means the production database stays clean.)
    1. Article id 638 / slug `article` / title `test` — delete or
       unpublish. The body field contains a full HTML preview document
       that should never have shipped.
    2. Homepage singleton → `daily-tiles` block → items 25/26/27 — rewrite
       the `href` field from `/articles/...` and `/categories/...` to
       `/article/...` and `/category/...`.

- [ ] **Re-run the Ahrefs Site Audit** ~24 hours after the deploy so the
  crawler can pick up the new redirects, canonicals, and hreflang map.
