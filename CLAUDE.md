# Working on this repo

Astro static site for Buena Vista Turf Farm, hosted on Netlify at
buenavistaturf.com. `master` is the branch that matters.

## How this site reaches the internet

**Pushing to `master` does not necessarily publish anything.** Check which of
these is true before telling anyone the site is updated:

| Setup | Does a push publish? | Do Netlify Functions ship? |
|---|---|---|
| Repo linked in Netlify | yes, automatically | yes |
| `npm run deploy` from a machine that can reach Netlify | yes, that run | yes |
| Zip of `dist/` dragged into the Netlify UI | yes, that upload | **no** |

The zip route is the trap. `netlify/functions/` is not inside `dist/`, so a zip
deploy updates every page and leaves `/admin` and `/api/openings` returning 404.
"The site updated but the dashboard is broken" is always this.

## From a cloud session (claude.ai/code), Netlify is unreachable

The sandbox's egress proxy answers 403 to every Netlify host and to
buenavistaturf.com itself. So from a cloud session you **cannot**:

- deploy, or trigger a deploy
- read or change anything in the Netlify dashboard
- fetch the live site to check whether a change is live

Don't claim the site is live from a cloud session. You can verify the build, the
markup and the behaviour locally; whether it is *published* is a separate fact
that needs Netlify. Ask for a screenshot instead of guessing.

The desktop app and Claude in Chrome have browser access and can do these.

## Verifying work without the live site

```bash
npm ci && npm run build          # what Netlify runs
npx astro preview --port 4321    # then crawl it with Playwright
```

Chromium is at `/opt/pw-browsers/chromium`. Crawling every page for HTTP status,
broken images and JS errors catches essentially everything a deploy would.

## Things that bite

- **`src/data/derivatives.json` dirties on every build.** `gen-thumbs.mjs`
  rewrites it with different key order and identical content. Revert it rather
  than committing churn.
- **Secrets never go in the repo.** `ADMIN_PASSWORD` and `NETLIFY_API_TOKEN`
  live in Netlify → Environment variables. `/admin` cannot work without both.
- **Form notification emails are a Netlify UI setting**, one per form
  (`quote`, `contact`, `application`), and they are not retroactive.
- **No apex → www redirect in `netlify.toml`.** Netlify already redirects
  www → apex; a rule the other way created a redirect loop that took the site
  down during cutover.

## Where things live

| What | File |
|---|---|
| Open roles, job descriptions | `src/data/openings.js` |
| Job pages at /careers/<slug>/ | `src/pages/careers/[slug].astro` |
| Phone, nav, analytics | `src/data/site.js` |
| Farm locations | `src/data/locations.js` |
| Pallet size, waste %, zones | `src/data/pricing.js` |
| Admin dashboard | `src/pages/admin.astro` + `netlify/functions/` |

README.md has the deploy commands, the environment variables, and the DNS
history in full.
