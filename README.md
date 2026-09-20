# Buena Vista Turf Farm — website

Rebuilt as editable source. Astro static site, deploys to Netlify.

## Why this exists

The previous site was a compiled React bundle hosted on Manus with no editable
source remaining. This repo is a ground-up rebuild: real source files, server-rendered
HTML (so Google can actually read the content), and forms that email leads directly.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Where to change things

| What | File |
|---|---|
| Phone, service area, nav links | `src/data/site.js` |
| Grass varieties and their copy | `src/data/grasses.js` |
| Farm locations | `src/data/locations.js` |
| **Pallet size, waste %, delivery zones** | `src/data/pricing.js` |
| Global colors and type | `src/styles/global.css` |
| Blog posts | `src/pages/blog/*.md` — add a file, it appears automatically |

## Forms

Three Netlify forms are wired: `quote`, `contact`, `application` (with resume upload).

**After the first deploy**, turn on email notifications — this is a Netlify
setting, not something the repo can carry:

Netlify → Site configuration → Forms → Form notifications → Add notification →
**Email notification**, then for each of the three forms:

| Field | Value |
|---|---|
| Event to listen for | New form submission |
| Form | `quote`, then `contact`, then `application` |
| Email to notify | `alfredo@buenavistaturf.com` |

Add it three times, once per form — a notification is bound to a single form, so
one entry does not cover the other two.

Resumes arrive as a download link in the email rather than an attachment; the
file itself stays in Netlify.

Submissions are also stored in the Netlify dashboard, and readable from /admin,
so a missed email never means a lost lead.

## Deploy

From your own machine, one command:

```bash
npm run deploy
```

It builds and publishes, **including `netlify/functions/`** — which is what the
/admin dashboard and /api/openings run on. The first run opens a browser to log
in to Netlify and asks which site to link; after that it just deploys.
`npm run deploy:preview` publishes to a preview URL instead of the live site.

Dragging a zip of `dist/` into the Netlify UI also works, but it publishes only
static files. Functions are not in `dist/`, so the dashboard stays dead and
`/api/openings` 404s — that is the usual cause of "the site updated but /admin
does not work".

Better still, connect the repo in Netlify (Site configuration → Build & deploy →
Link repository, branch `master`). `netlify.toml` already sets the build command,
publish directory and functions directory, so every push then deploys itself.

### Environment variables

Set these in Netlify → Site configuration → Environment variables. They are not
in the repo, and the dashboard cannot work without them:

| Key | What it is |
|---|---|
| `ADMIN_PASSWORD` | the passcode for /admin |
| `NETLIFY_API_TOKEN` | a Netlify personal access token with read access, used server-side to read form submissions |

## Headers

`public/_headers` sets caching and security headers. Fingerprinted `/_astro/`
assets are immutable for a year; photos cache for 30 days; HTML always
revalidates so a deploy reaches people already on the site.

## DNS cutover — DONE (2026-09-08)

buenavistaturf.com now serves from Netlify. Manus is out of the picture.

| Record | Value |
|---|---|
| apex `A` | `75.2.60.5` (Netlify) |
| `www` CNAME | `astonishing-lokum-3cf767.netlify.app` |

MX, SPF, both DKIM selectors and DMARC were verified intact after the change.

**The apex is canonical, not www.** Netlify refuses to make www the primary
domain — adding "www.buenavistaturf.com" is silently rewritten to the apex, and
"Set as primary domain" on www is accepted in the dialog then discarded. So the
site config was aligned to the apex instead: `src/data/site.js`,
`astro.config.mjs` and `public/robots.txt` all use the bare domain.

**Do not add an apex -> www redirect to netlify.toml.** Netlify already
redirects www -> apex. A rule pointing the other way creates a redirect loop.
That exact loop took the site down during cutover.

## Image library

96 files in `public/images/`, recovered from the Manus host before cutover.
They were served there from expiring signed CloudFront URLs, so this repo is
now the only durable copy — do not delete it.

| What | Where |
|---|---|
| Management team (9 people, names/titles/bios) | `src/data/team.js` |
| Weekly field photos (74, with categories + captions) | `src/data/gallery.js` |
| Farm operation photos (7) + About header + hero | `src/data/farm.js` |
| Logo, About headers, misc | `public/images/` |

To add a photo: drop the file in `public/images/` and add an entry to
`src/data/gallery.js`. It appears on Managers Pictures automatically.

### Responsive images

The library is full-resolution (up to 1800px) but the grids render at ~290px.
Serving the originals meant a 15.9MB Managers page. `scripts/gen-thumbs.mjs`
generates 400/800/1200px webp derivatives into `public/images/w*/` and records
what it made in `src/data/derivatives.json`; `src/data/img.js` turns that into
`srcset`. Mobile payload for that page is now **1.6MB**.

It runs automatically — `predev` before `npm run dev`, `prebuild` before
`npm run build`, so Netlify regenerates on every deploy. Run it by hand with
`npm run thumbs`. Existing files are skipped, so reruns are cheap, and images
are never upscaled (a source narrower than 400px keeps its original).

**Adding a photo needs no extra step** — drop it in `public/images/`, add the
gallery entry, and the next build generates its derivatives.

### Migration audit

Every image reference across the old site — `index.html`, both JS bundles,
the CSS, and the PWA manifest — was swept and reconciled: **100 distinct
references, 96 migrated, 0 missing, 0 orphaned.** The two absolute CloudFront
URLs in the bundle were confirmed byte-identical (SHA-256) to files already
migrated, so they were duplicates, not extra assets.

Two things were deliberately *not* migrated, because they were Manus’s and not
Buena Vista’s:

- **favicon** — Manus shipped a generic stock gallery icon. Replaced with
  `public/favicon.png`, generated from the star in the logo lockup.
- **og:image** — was a Manus auto-screenshot on `manuscdn.com`. Replaced with
  self-hosted `public/og.jpg` (field hero + wordmark, 1200×630).

Regenerate either with sharp from `buena-vista-horiz-clean-color_9e635de2.webp`
and `buena-vista-gallery-hero.webp`.

Two recovered files are intentionally left unwired:

- `buena-vista-paper-grain.webp` — a texture overlay the old site layered over
  sections. Available if you want it; it is a look, not information.
- `sod-pallet-cursor-64_9c50a0c6.png` — the old site replaced the mouse cursor
  with a sod-pallet graphic. Not restored: custom cursors hurt usability and
  accessibility for very little gain. Kept in case you disagree.

## Launch readiness

Audited before cutover and fixed:

- **404 page** — there was none, so a bad link fell through to Netlify default.
  `src/pages/404.astro` now catches it with real navigation.
- **`/thanks` was in the sitemap** — Google would have indexed the
  post-submission page. Both it and /404 now carry `noindex` and are filtered
  out of the sitemap (17 indexed of 19 built).
- **Heading order** — 7 pages jumped h1 to h3, which breaks screen-reader
  navigation. Card headings that sit directly under the page h1 are h2 now,
  with a `.card h2` rule so they look identical to before. Footer moved to
  h2/h3. Zero violations across all 19 pages.

Titles and meta descriptions are unique per page; every page has a canonical.

## Still to do

- ~~Migrate image library~~ ✅ done — 96 files recovered and wired in
- ~~Restore original marketing copy for the grass pages~~ ✅ done — all six varieties carry the verbatim original copy
- ~~Confirm pallet coverage~~ ✅ done — 450 sq ft/pallet, confirmed against the original calculator
- **Confirm pricing before switching it on.** `src/data/pricing.js` has the
  old published per-sq-ft rates under `recoveredPricing` for reference only;
  nothing reads it and the site shows no prices. Verify the numbers are still
  current, then copy them into `pricing.perPallet`.
- Push this repo to a remote (GitHub) so Netlify can build from it
- Deploy, test a real quote submission, then cut DNS over
