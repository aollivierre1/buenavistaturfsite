// Admin API — reads form submissions from Netlify on the server side.
//
// The Netlify token never reaches the browser. It lives only in this function's
// environment, so the dashboard page itself stays a plain static file with no
// secrets in it.
//
// Required environment variables (set these in Netlify, not in the repo):
//   ADMIN_PASSWORD      the password for the dashboard
//   NETLIFY_API_TOKEN   a Netlify personal access token with read access
// Provided automatically by Netlify:
//   SITE_ID
import crypto from 'node:crypto';

const SESSION_HOURS = 12;
const API = 'https://api.netlify.com/api/v1';

const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
});

// Timing-safe compare so the password cannot be guessed a character at a time.
function sameSecret(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

const key = () => process.env.ADMIN_PASSWORD || '';

function sign(expiry) {
  return crypto.createHmac('sha256', key()).update(String(expiry)).digest('hex');
}

function makeToken() {
  const expiry = Date.now() + SESSION_HOURS * 3600_000;
  return `${expiry}.${sign(expiry)}`;
}

function validToken(token) {
  if (!token || !key()) return false;
  const [expiry, mac] = String(token).split('.');
  if (!expiry || !mac) return false;
  if (Number(expiry) < Date.now()) return false;
  return sameSecret(mac, sign(expiry));
}

const readCookie = (req, name) => {
  const raw = req.headers.get('cookie') || '';
  const hit = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
};

async function netlify(path) {
  const res = await fetch(API + path, {
    headers: { Authorization: `Bearer ${process.env.NETLIFY_API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Netlify API ${res.status} on ${path}`);
  return res.json();
}

export default async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (!key()) {
    return json(500, { error: 'ADMIN_PASSWORD is not set on this site. Add it in Netlify → Environment variables.' });
  }

  if (action === 'login') {
    let password = '';
    try { ({ password } = await req.json()); } catch { /* empty body */ }
    if (!sameSecret(password, key())) {
      // Deliberately vague, and slowed slightly, to discourage guessing.
      await new Promise((r) => setTimeout(r, 600));
      return json(401, { error: 'Incorrect password.' });
    }
    return json(200, { ok: true }, {
      'set-cookie': `bvt_admin=${makeToken()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`,
    });
  }

  if (action === 'logout') {
    return json(200, { ok: true }, { 'set-cookie': 'bvt_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
  }

  if (!validToken(readCookie(req, 'bvt_admin'))) return json(401, { error: 'Not signed in.' });

  if (action === 'data') {
    if (!process.env.NETLIFY_API_TOKEN) {
      return json(500, { error: 'NETLIFY_API_TOKEN is not set. Add it in Netlify → Environment variables.' });
    }
    try {
      const forms = await netlify(`/sites/${process.env.SITE_ID}/forms`);
      const out = [];
      for (const form of forms) {
        const subs = await netlify(`/forms/${form.id}/submissions?per_page=200`);
        out.push({
          name: form.name,
          id: form.id,
          submissions: subs.map((s) => ({
            id: s.id,
            created_at: s.created_at,
            data: s.data || {},
          })),
        });
      }
      return json(200, { forms: out, fetched_at: new Date().toISOString() });
    } catch (err) {
      return json(502, { error: String(err.message || err) });
    }
  }

  return json(400, { error: 'Unknown action.' });
};

export const config = { path: '/api/admin' };
