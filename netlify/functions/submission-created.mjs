// Mirrors every form submission into Netlify Blobs as it arrives.
//
// Netlify fires this automatically on each new submission - the filename is the
// event name, so there is no route and nothing to call. The point is that the
// dashboard can then read submissions from our own storage instead of asking
// Netlify's API for them, which needs a personal access token. A Netlify token
// is account-wide: it can read every site, change DNS, delete projects. That is
// a large key to leave lying in an environment variable so that /admin can list
// job applications, and this removes the need for it.
//
// Blobs needs no credentials here. The Functions runtime supplies them, the same
// way openings.mjs stores job postings.
import { getStore } from '@netlify/blobs';
import { createLead } from './_monday.mjs';

const store = () => getStore('bvt-forms');

// Netlify retries a failing event function, and a retry after the lead was
// already created would put the same customer on the board twice - on a board
// with thousands of leads nobody would spot it. Remember what has been pushed.
const sentStore = () => getStore('bvt-monday');

async function alreadySent(id) {
  try { return Boolean(await sentStore().get(id)); } catch { return false; }
}
async function markSent(id, mondayId) {
  try { await sentStore().setJSON(id, { at: new Date().toISOString(), mondayId }); } catch { /* best effort */ }
}

// One blob per submission rather than one array per form. Two submissions
// arriving together would otherwise read the same array, each append its own
// row, and the second write would drop the first.
const keyFor = (formName, createdAt, id) => `${formName}/${createdAt}-${id}`;

export default async (req) => {
  let payload;
  try {
    ({ payload } = await req.json());
  } catch {
    return new Response('Bad payload', { status: 400 });
  }
  if (!payload) return new Response('No payload', { status: 400 });

  const formName = String(payload.form_name || 'unknown').slice(0, 80);
  const id = String(payload.id || Date.now().toString(36)).slice(0, 80);
  const createdAt = payload.created_at || new Date().toISOString();

  const record = {
    id,
    form_name: formName,
    created_at: createdAt,
    data: payload.data || {},
  };

  try {
    await store().setJSON(keyFor(formName, createdAt, id), record);
  } catch (err) {
    // Never fail the submission itself over a mirroring problem - the lead is
    // already safe in Netlify's own Forms tab either way.
    console.error('Could not mirror submission to blobs:', err);
  }

  // A quote is a sales lead, so it also goes on the Shawn Lead List board. Same
  // rule as the mirror above: this must not be able to fail the submission, and
  // the lead is in the dashboard and in Netlify Forms regardless.
  if (formName === 'quote') {
    try {
      if (await alreadySent(id)) {
        console.log('Quote', id, 'was already sent to monday.com; skipping.');
      } else {
        const out = await createLead(record.data, createdAt);
        if (out.skipped) console.warn('Not sent to monday.com:', out.skipped);
        else { await markSent(id, out.id); console.log('Created monday.com lead', out.id, 'for', id); }
      }
    } catch (err) {
      console.error('Could not create the monday.com lead:', err);
    }
  }

  return new Response('', { status: 200 });
};
