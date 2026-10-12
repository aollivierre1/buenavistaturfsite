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
import { createLead } from './_monday.mjs';
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

// Per-submission flags: which have been reviewed, and which have been removed
// from the list. Their own store, so listing submissions does not have to step
// over them, and server-side rather than in the browser so that marking someone
// off on a phone in the field shows up on the office computer too.
//
// Removing is a flag, not a delete. These are job applicants; a mis-tapped
// button on a phone should not destroy somebody's application, so removed ones
// move to a Removed tab and can be put back.
const FLAGS = { reviewed: 'reviewed', removed: 'removed' };
const flagStore = () => getStore('bvt-review');

async function readFlag(key) {
  try {
    const raw = await flagStore().get(key, { type: 'json' });
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  } catch {
    return {};
  }
}

async function writeFlag(key, id, on) {
  const map = await readFlag(key);
  if (on) map[id] = { at: new Date().toISOString() };
  else delete map[id];
  await flagStore().setJSON(key, map);
  return map;
}

// Which submissions have already been pushed to monday.com. Written per key by
// submission-created.mjs and by the button below, so two pushes cannot race each
// other the way a single read-modify-write map would.
const mondayStore = () => getStore('bvt-monday');

async function readPushed() {
  try {
    const store = mondayStore();
    const { blobs } = await store.list();
    const out = {};
    await Promise.all(blobs.map(async (b) => {
      const v = await store.get(b.key, { type: 'json' }).catch(() => null);
      if (v) out[b.key] = v;
    }));
    return out;
  } catch {
    return {};
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
    const [reviewed, removed, pushed] = await Promise.all([
      readFlag(FLAGS.reviewed), readFlag(FLAGS.removed), readPushed(),
    ]);
    const body = { forms, reviewed, removed, pushed, fetched_at: new Date().toISOString() };

    if (apiError) body.warning = apiError;
    if (!forms.length && !process.env.NETLIFY_API_TOKEN) {
      body.notice = 'No submissions stored yet. Everything submitted from now on appears here automatically. '
        + 'Anything submitted before today is still in Netlify → Forms; to pull that history in here too, '
        + 'add NETLIFY_API_TOKEN in Netlify → Environment variables.';
    }
    return json(200, body);
  }

  // Mark one submission reviewed, or remove it from the list. Both are flags
  // keyed by submission id, so they survive a reload and reach every device.
  if (action === 'flag') {
    let body;
    try { body = await req.json(); } catch { return json(400, { error: 'Expected JSON.' }); }
    const id = String(body.id || '').slice(0, 160);
    const name = FLAGS[body.flag];
    if (!id) return json(400, { error: 'Which submission?' });
    if (!name) return json(400, { error: 'Unknown flag.' });
    const map = await writeFlag(name, id, Boolean(body.on));
    return json(200, { ok: true, flag: name, map });
  }

  // Send one submission to the Shawn Lead List board by hand. The automatic push
  // only fires on new submissions, so anything that arrived before it existed
  // needs a button - and a quote that failed to push is worth retrying rather
  // than retyping.
  if (action === 'push-monday') {
    let body;
    try { body = await req.json(); } catch { return json(400, { error: 'Expected JSON.' }); }
    const id = String(body.id || '').slice(0, 160);
    if (!id) return json(400, { error: 'Which submission?' });

    const already = await mondayStore().get(id, { type: 'json' }).catch(() => null);
    if (already) return json(200, { ok: true, already: true, ...already });

    // Find it rather than trusting the browser's copy of the data.
    const blobbed = await fromBlobs();
    let record = blobbed.find((r) => r.id === id);
    if (!record && process.env.NETLIFY_API_TOKEN) {
      const siteId = siteIdFrom(context);
      if (siteId) {
        try { record = (await fromApi(siteId)).find((r) => r.id === id); } catch { /* fall through */ }
      }
    }
    if (!record) return json(404, { error: 'That submission is no longer stored here.' });

    try {
      const out = await createLead(record.data, record.created_at);
      if (out.skipped) {
        return json(500, { error: 'MONDAY_API_TOKEN is not set on this site, so nothing was sent. '
          + 'Add it in Netlify \u2192 Environment variables, then redeploy.' });
      }
      const entry = { at: new Date().toISOString(), mondayId: out.id };
      await mondayStore().setJSON(id, entry);
      return json(200, { ok: true, ...entry });
    } catch (err) {
      return json(502, { error: String(err.message || err).slice(0, 400) });
    }
  }

  // Really delete, from the Removed tab. Only works for submissions this site
  // mirrored itself; older ones live in Netlify's own Forms tab and have to be
  // deleted there, so say that rather than pretending it worked.
  if (action === 'destroy') {
    const id = String(new URL(req.url).searchParams.get('id') || '').slice(0, 160);
    if (!id) return json(400, { error: 'Which submission?' });
    try {
      const store = getStore('bvt-forms');
      const { blobs } = await store.list();
      const hit = blobs.find((b) => b.key.endsWith('-' + id));
      if (!hit) {
        return json(409, {
          error: 'This one came from Netlify Forms rather than from this site’s own storage, '
            + 'so it can only be deleted in Netlify → Forms. It stays in the Removed tab here.',
        });
      }
      await store.delete(hit.key);
      await writeFlag(FLAGS.removed, id, false);
      await writeFlag(FLAGS.reviewed, id, false);
      return json(200, { ok: true });
    } catch (err) {
      return json(502, { error: String(err.message || err) });
    }
  }

  return json(400, { error: 'Unknown action.' });
};

export const config = { path: '/api/admin' };
