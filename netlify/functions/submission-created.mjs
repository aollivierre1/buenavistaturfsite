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

const store = () => getStore('bvt-forms');

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

  return new Response('', { status: 200 });
};
