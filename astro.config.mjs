import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const NOINDEX = ['/thanks', '/404', '/admin'];

export default defineConfig({
  site: 'https://buenavistaturf.com', // apex is canonical; Netlify redirects www -> apex
  integrations: [
    sitemap({
      // /thanks is a post-submission page and /404 is an error page.
      // Neither belongs in search results.
      filter: (page) => {
        const p = new URL(page).pathname.replace(/\/$/, '');
        // The /apply/ packets carry noindex; listing them here would send
        // Google a page it is told not to index.
        return !NOINDEX.includes(p) && !p.startsWith('/apply');
      },
    }),
  ],
  build: { format: 'directory' },
});
