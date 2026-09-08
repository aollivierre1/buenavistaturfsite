// Builds .deploy-trim/ — the subset of dist/ that the pages actually reference.
//
// dist/ carries ~17MB of full-resolution originals that nothing links to any
// more (the grids serve generated derivatives), and the Netlify upload path
// caps at 10MB. This copies only what is referenced.
//
// HTML entities are decoded BEFORE scanning: the homepage hero is set through
// an inline style as url(&quot;/images/...&quot;), and an entity-blind regex
// silently skipped it — which shipped a live site with no hero image.
const fs = require('fs'), path = require('path');
const SRC = 'dist', OUT = '.deploy-trim';
fs.rmSync(OUT, { recursive: true, force: true });

const decode = (s) => s
  .replace(/&quot;/g, '"').replace(/&#34;/g, '"')
  .replace(/&#39;/g, "'").replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&');

const keep = new Set(['_headers', '_redirects', 'robots.txt', 'sitemap-index.xml', 'sitemap-0.xml']);
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(p);
  }
})(SRC);

for (const f of pages) keep.add(f.split(path.sep).join('/').replace(/^dist\//, ''));

for (const f of pages) {
  const h = decode(fs.readFileSync(f, 'utf8'));
  for (const m of h.matchAll(/(?:src|href|content)="(\/[^"]+\.(?:webp|jpe?g|png|gif|svg|css|js|xml|txt|ico))"/g)) keep.add(m[1].slice(1));
  for (const m of h.matchAll(/srcset="([^"]+)"/g))
    m[1].split(',').forEach(c => { const u = c.trim().split(/\s+/)[0]; if (u.startsWith('/')) keep.add(u.slice(1)); });
  for (const m of h.matchAll(/url\(\s*["']?(\/[^)"']+)/g)) keep.add(m[1].slice(1));
}

let n = 0, bytes = 0, missing = [];
for (const rel of keep) {
  const s = path.join(SRC, rel);
  if (!fs.existsSync(s)) { missing.push(rel); continue; }
  const d = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(d), { recursive: true });
  fs.copyFileSync(s, d);
  n++; bytes += fs.statSync(s).size;
}

// Fail loudly rather than ship a site with holes in it.
const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
const heroRef = decode(html).match(/url\(\s*["']?(\/images\/[^)"']+)/);
if (!heroRef) throw new Error('homepage hero background not found — check the selector');
if (!fs.existsSync(path.join(OUT, heroRef[1].slice(1)))) throw new Error('hero image missing from deploy: ' + heroRef[1]);

console.log('files:', n, ' size:', (bytes / 1048576).toFixed(2) + 'MB');
console.log('hero present:', heroRef[1]);
if (missing.length) console.log('referenced but absent from dist:', missing.join(', '));
