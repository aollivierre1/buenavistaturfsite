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
| Logo, About headers, misc | `public/images/` |

To add a photo: drop the file in `public/images/` and add an entry to
`src/data/gallery.js`. It appears on Managers Pictures automatically.

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
