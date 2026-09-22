// Admin API — reads form submissions from Netlify on the server side.
//
// The Netlify token never reaches the browser. It lives only in this function's
// environment, so the dashboard page stays a plain static file with no secrets
// in it.
//
// Required environment variables (set these in Netlify, not in the repo):
//   ADMIN_PASSWORD      the password for the dashboard
//   NETLIFY_API_TOKEN   a Netlify personal access token with read access
// Provided automatically by Netlify:
//   SITE_ID
import {
  adminKey, sameSecret, makeToken, isAdmin, json, sessionCookie, clearedCookie,
} from './_auth.mjs';

const API = 'https://api.netlify.com/api/v1';

async function netlify(path) {
  const res = await fetch(API + path, {
    headers: { Authorization: `Bearer ${process.env.NETLIFY_API_TOKEN}` },
  });
  if (!res.ok) {
    const hint = res.status === 401 || res.status === 403
      ? ' - the NETLIFY_API_TOKEN is wrong, expired, or lacks access to this site'
      : res.status === 404 ? ' - no such site or form for this token' : '';
    throw new Error(`Netlify API ${res.status} on ${path}${hint}`);
  }
  return res.json();
}

// Netlify does not reliably put SITE_ID in the Functions runtime the way it does
// in the build, and an undefined id silently becomes /sites/undefined/forms - a
// 404 that reads like the API is broken. Functions v2 hands us the site on the
// context object, so prefer that and fall back to the environment.
const siteIdFrom = (context) =>
  context?.site?.id || process.env.SITE_ID || process.env.NETLIFY_SITE_ID || '';

// Names that differ from what we want only by case, spacing or punctuation.
// A variable typed as "Admin_Password" or with a trailing space looks right in
// the Netlify UI and is invisible to process.env.ADMIN_PASSWORD, so say so
// rather than leaving someone to stare at a list that appears correct.
const normalise = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const nearMisses = (want) => {
  const target = normalise(want);
  return Object.keys(process.env).filter((k) => k !== want && normalise(k) === target);
};

export default async (req, context) => {
  const action = new URL(req.url).searchParams.get('action');

  // Unauthenticated on purpose: it reports whether the two variables exist, never
  // their values, and the password is the very thing missing when you need it.
  if (action === 'diagnose') {
    return json(200, {
      ADMIN_PASSWORD: { set: Boolean(process.env.ADMIN_PASSWORD), nearMisses: nearMisses('ADMIN_PASSWORD') },
      NETLIFY_API_TOKEN: { set: Boolean(process.env.NETLIFY_API_TOKEN), nearMisses: nearMisses('NETLIFY_API_TOKEN') },
      siteIdResolved: Boolean(siteIdFrom(context)),
      deployContext: process.env.CONTEXT || '(unknown)',
      branch: process.env.BRANCH || '(unknown)',
      envKeyCount: Object.keys(process.env).length,
    });
  }

  if (!adminKey()) {
    // Reaching here means the function itself deployed fine - only the value is
    // missing. The usual cause is not a missing variable but a scoped one:
    // Netlify lets a variable apply to Builds only, and Functions then cannot
    // read it.
    return json(500, { error: 'ADMIN_PASSWORD is not reaching this function. In Netlify → Environment variables, check the key is exactly ADMIN_PASSWORD and its scope includes Functions, then redeploy.' });
  }

  if (action === 'login') {
    let password = '';
    try { ({ password } = await req.json()); } catch { /* empty body */ }
    if (!sameSecret(password, adminKey())) {
      // Deliberately vague, and slowed a little, to discourage guessing.
      await new Promise((r) => setTimeout(r, 600));
      return json(401, { error: 'Incorrect password.' });
    }
    return json(200, { ok: true }, { 'set-cookie': sessionCookie(makeToken()) });
  }

  if (action === 'logout') {
    return json(200, { ok: true }, { 'set-cookie': clearedCookie() });
  }

  if (!isAdmin(req)) return json(401, { error: 'Not signed in.' });

  if (action === 'data') {
    if (!process.env.NETLIFY_API_TOKEN) {
      return json(500, { error: 'NETLIFY_API_TOKEN is not set. Add it in Netlify → Environment variables.' });
    }
    const siteId = siteIdFrom(context);
    if (!siteId) {
      return json(500, { error: 'Could not work out which Netlify site to read. Set SITE_ID in Netlify → Environment variables.' });
    }
    try {
      const forms = await netlify(`/sites/${siteId}/forms`);
      const out = [];
      for (const form of forms) {
        const subs = await netlify(`/forms/${form.id}/submissions?per_page=200`);
        out.push({
          name: form.name,
          id: form.id,
          submissions: subs.map((s) => ({ id: s.id, created_at: s.created_at, data: s.data || {} })),
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
