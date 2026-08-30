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

**After the first deploy**, turn on email notifications:
Netlify → Site configuration → Forms → Form notifications → Add notification →
Email notification → send to the Microsoft 365 inbox. Do this once per form.

Submissions are also stored in the Netlify dashboard as a backup.

## Deploy

Connect the repo in Netlify. `netlify.toml` already sets build command, publish
directory, and the apex → www redirect. No manual config needed.

## DNS cutover (do this LAST)

Registrar and DNS stay at GoDaddy. Nameservers do **not** change.

| Record | Current | Change to |
|---|---|---|
| `www` CNAME | `cname.manus.space` | the CNAME Netlify shows in Domain settings |
| `@` A records | `15.197.225.128`, `3.33.251.168` | Netlify's apex value |

**Do not touch** MX, SPF, DKIM, or DMARC records — those run Microsoft 365 email.
Breaking them takes down company mail.

Test the Netlify preview URL fully — especially a real quote submission — before
changing a single DNS record. Rollback is putting the old values back.

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
