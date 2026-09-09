// Job openings — read publicly by the Careers page, edited from /admin.
//
// Stored in Netlify Blobs so the team can post and close roles without a code
// change or a redeploy. No external service and no database to run.
import { getStore } from '@netlify/blobs';
import { isAdmin, json } from './_auth.mjs';

const KEY = 'openings';
const store = () => getStore('bvt-content');

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

async function readAll() {
  try {
    const raw = await store().get(KEY, { type: 'json' });
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
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
  };
}

export default async (req) => {
  if (req.method === 'GET') {
    const all = await readAll();
    // Admins see drafts too; the public only sees what is switched on.
    const visible = isAdmin(req) ? all : all.filter((o) => o.active);
    return json(200, { openings: visible });
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
