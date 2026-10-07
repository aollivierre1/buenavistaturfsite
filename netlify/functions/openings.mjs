// Job openings — read publicly by the Careers page, edited from /admin.
//
// Stored in Netlify Blobs so the team can post and close roles without a code
// change or a redeploy. No external service and no database to run.
import { getStore } from '@netlify/blobs';
import { isAdmin, json } from './_auth.mjs';
import { openings as builtIn } from '../../src/data/openings.js';

const KEY = 'openings';
const store = () => getStore('bvt-content');

// The standing roles live in src/data/openings.js and are what the Careers page
// is built with. Until someone saves from /admin there is nothing in the store,
// which left the job editor showing "no roles yet" while four were live on the
// site - so there was no way to take one down without a code change. Seed the
// editor from the same list instead, flattening the parts it edits and carrying
// the parts it does not (the slug its detail page is built at, the option its
// location adds to the application form) straight through.
const seed = () => builtIn.map((o) => ({
  id: o.slug || o.title,
  title: o.title,
  location: Array.isArray(o.locations) ? o.locations.join(', ') : (o.location || ''),
  type: o.type || '',
  summary: o.summary || '',
  active: true,
  slug: o.slug || '',
  locationOption: o.locationOption || '',
}));

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// null means nobody has ever saved; an empty array means somebody saved an
// empty list. Collapsing the two would make "take every role down" re-seed the
// built-in ones on the next request.
async function readAll() {
  try {
    const raw = await store().get(KEY, { type: 'json' });
    return Array.isArray(raw) ? raw : null;
  } catch {
    return null;
  }
}

// Only keep fields we understand, and cap lengths, so a bad payload cannot
// bloat the blob or inject odd values into the page.
function clean(o) {
  const str = (v, max) => String(v ?? '').trim().slice(0, max);
  const title = str(o.title, 120);
  if (!title) return null;
  return {
    id: str(o.id, 80) || `${slug(title)}-${Date.now().toString(36)}`,
    title,
    location: str(o.location, 80),
    type: str(o.type, 40),
    summary: str(o.summary, 900),
    active: o.active !== false,
    posted: str(o.posted, 40) || new Date().toISOString(),
    // Not editable in the dashboard, but losing them would break the role's
    // detail page link and its option on the application form.
    slug: str(o.slug, 80),
    locationOption: str(o.locationOption, 80),
  };
}

export default async (req) => {
  if (req.method === 'GET') {
    const saved = await readAll();
    const all = saved === null ? seed() : saved;
    // Admins see everything, including roles switched off, so they can switch
    // one back on. The public only sees what is live.
    const visible = isAdmin(req) ? all : all.filter((o) => o.active);
    return json(200, { openings: visible, seeded: saved === null });
  }

  if (req.method === 'PUT') {
    if (!isAdmin(req)) return json(401, { error: 'Not signed in.' });
    let body;
    try { body = await req.json(); } catch { return json(400, { error: 'Expected JSON.' }); }
    if (!Array.isArray(body.openings)) return json(400, { error: 'Expected an openings array.' });
    if (body.openings.length > 100) return json(400, { error: 'Too many openings.' });

    const cleaned = body.openings.map(clean).filter(Boolean);
    await store().setJSON(KEY, cleaned);
    return json(200, { ok: true, openings: cleaned });
  }

  return json(405, { error: 'Method not allowed.' });
};

export const config = { path: '/api/openings' };
