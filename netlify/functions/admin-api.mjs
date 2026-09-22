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
import { getStore } from '@netlify/blobs';
import {
  adminKey, sameSecret, makeToken, isAdmin, json, sessionCookie, clearedCookie,
} from './_auth.mjs';

const API = 'https://api.netlify.com/api/v1';

// Submissions mirrored by submission-created.mjs. Blobs needs no credentials
// inside a function, which is the whole point: the dashboard works without a
// Netlify API token.
async function fromBlobs() {
  try {
    const store = getStore('bvt-forms');
    const { blobs } = await store.list();
    const records = await Promise.all(
      blobs.map((b) => store.get(b.key, { type: 'json' }).catch(() => null)),
    );
    return records.filter(Boolean);
  } catch {
    return [];
  }
}

// Only for submissions that arrived before the mirror existed.
async function fromApi(siteId) {
  const forms = await netlify(`/sites/${siteId}/forms`);
  const out = [];
  for (const form of forms) {
    const subs = await netlify(`/forms/${form.id}/submissions?per_page=200`);
    for (const s of subs) {
      out.push({
        id: String(s.id),
        form_name: form.name,
        created_at: s.created_at,
        data: s.data || {},
      });
    }
  }
  return out;
}

// The same submission can arrive from both sources, so key by id and let the
// first one win - they carry the same fields either way.
function groupByForm(records) {
  const seen = new Set();
  const byForm = new Map();
  for (const r of records) {
    if (!r || seen.has(r.id)) continue;
    seen.add(r.id);
    const name = r.form_name || 'unknown';
    if (!byForm.has(name)) byForm.set(name, []);
    byForm.get(name).push({ id: r.id, created_at: r.created_at, data: r.data || {} });
  }
  return [...byForm.entries()]
    .map(([name, submissions]) => ({
      name,
      id: name,
      submissions: submissions.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))),
    }))
    .sort((a, b) => b.submissions.length - a.submissions.length);
}

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
    const blobbed = await fromBlobs();
    let apiRecords = [];
    let apiError = null;

    // The token is optional now. It is only worth a call for submissions that
    // predate the mirror, so a missing or broken token costs history, not the
    // dashboard.
    if (process.env.NETLIFY_API_TOKEN) {
      const siteId = siteIdFrom(context);
      if (!siteId) {
        apiError = 'Could not work out which Netlify site to read, so older submissions were skipped.';
      } else {
        try {
          apiRecords = await fromApi(siteId);
        } catch (err) {
          apiError = String(err.message || err);
        }
      }
    }

    const forms = groupByForm([...blobbed, ...apiRecords]);
    const body = { forms, fetched_at: new Date().toISOString() };

    if (apiError) body.warning = apiError;
    if (!forms.length && !process.env.NETLIFY_API_TOKEN) {
      body.notice = 'No submissions stored yet. Everything submitted from now on appears here automatically. '
        + 'Anything submitted before today is still in Netlify → Forms; to pull that history in here too, '
        + 'add NETLIFY_API_TOKEN in Netlify → Environment variables.';
    }
    return json(200, body);
  }

  return json(400, { error: 'Unknown action.' });
};

export const config = { path: '/api/admin' };
