import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages that carry <meta name="robots" content="noindex">. They must be
// excluded here too: a URL that is in the sitemap AND noindex is reported by
// Google Search Console as "Submitted URL marked noindex" - an error, not a
// warning. Add a page to BOTH places or neither.
const NOINDEX = ['/thanks', '/404', '/admin', '/apply/driver', '/apply/general'];

export default defineConfig({
  site: 'https://buenavistaturf.com', // apex is canonical; Netlify redirects www -> apex
  integrations: [
    sitemap({
      // /thanks is a post-submission page and /404 is an error page.
      // Neither belongs in search results.
      filter: (page) => {
        const p = new URL(page).pathname.replace(/\/$/, '');
        return !NOINDEX.includes(p);
      },
    }),
  ],
  build: { format: 'directory' },
});
