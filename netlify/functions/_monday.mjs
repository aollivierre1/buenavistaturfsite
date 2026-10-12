// Pushes a website quote into the Shawn Lead List board on monday.com.
//
// Board and group ids are the live ones, overridable by environment variable so
// the board can be re-pointed without a deploy. The column ids below are not
// guessable - they were read off the board itself, and renaming a column in
// monday does not change them, so they keep working when somebody retitles
// "Type of SOD".
const API = 'https://api.monday.com/v2';

export const BOARD_ID = process.env.MONDAY_BOARD_ID || '6550831664';   // Shawn Lead List
export const GROUP_ID = process.env.MONDAY_GROUP_ID || 'group_mm0wrgz'; // Website Leads

const COL = {
  email: 'lead_email',
  phone: 'lead_phone',
  address: 'text_11__1',       // Full Address
  sqft: 'long_text__1',        // How Many Square Feet
  comments: 'long_text',       // Comments
  message: 'text_mm0wb798',    // Message
  status: 'lead_status',       // Status
  sod: 'single_select__1',     // Type of SOD
  source: 'text_mm36hmqp',     // Source
  form: 'text_mm3crrmc',       // Form
  created: 'date_mm424brz',    // Lead Created
};

// The board spells some of these differently from the website, and a status
// value that is not already a label on the board makes monday reject the whole
// item rather than just that field. Anything unmapped is left blank on purpose.
const SOD_LABELS = {
  'bermuda 419': 'Bermuda 419',
  'tahoma 31': 'Tahoma 31',
  'ironcutter': 'Iron Cutter',
  'zeon zoysia': 'Zoysia',
};

const clip = (v, n) => String(v ?? '').trim().slice(0, n);

export function buildItem(data, createdAt) {
  const name = clip(data.name, 120) || clip(data.email, 120) || 'Website quote';

  // Everything the form asks that has no column of its own, kept together so
  // none of it is lost.
  const comments = [
    data.timeline && `Timeline: ${data.timeline}`,
    data.delivery && `Delivery: ${data.delivery}`,
    data.nearest_farm && `Nearest farm: ${data.nearest_farm}`,
    data.calculated_pallets && `Pallets (calculator): ${data.calculated_pallets}`,
    data.calculated_sqft_with_waste && `Sq ft incl. waste: ${data.calculated_sqft_with_waste}`,
    data.grass_type && `Grass asked for: ${data.grass_type}`,
  ].filter(Boolean).join('\n');

  const sqft = [data.square_feet, data.calculated_sqft_with_waste
    && `(${data.calculated_sqft_with_waste} with waste)`].filter(Boolean).join(' ');

  const values = {
    [COL.email]: { email: clip(data.email, 160), text: clip(data.email, 160) },
    [COL.phone]: { phone: clip(data.phone, 40), countryShortName: 'US' },
    [COL.address]: clip(data.job_site, 255),
    [COL.sqft]: clip(sqft, 1500),
    [COL.comments]: clip([comments, data.notes && `Notes: ${data.notes}`].filter(Boolean).join('\n\n'), 1500),
    [COL.message]: clip(data.notes, 255),
    [COL.status]: { label: 'New Lead' },
    [COL.source]: 'Website — quote form',
    [COL.form]: 'quote',
    [COL.created]: { date: String(createdAt || new Date().toISOString()).slice(0, 10) },
  };

  const sod = SOD_LABELS[String(data.grass_type || '').trim().toLowerCase()];
  if (sod) values[COL.sod] = { label: sod };

  // An empty email or phone object is rejected; drop what the applicant left blank.
  if (!values[COL.email].email) delete values[COL.email];
  if (!values[COL.phone].phone) delete values[COL.phone];
  for (const k of Object.keys(values)) if (values[k] === '') delete values[k];

  return { name, values };
}

export async function createLead(data, createdAt, fetchImpl = fetch) {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) return { skipped: 'MONDAY_API_TOKEN is not set' };

  const { name, values } = buildItem(data, createdAt);
  const query = `mutation ($board: ID!, $group: String!, $name: String!, $cols: JSON!) {
    create_item (board_id: $board, group_id: $group, item_name: $name,
                 column_values: $cols, create_labels_if_missing: false) { id }
  }`;

  const res = await fetchImpl(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: token, 'API-Version': '2024-10' },
    body: JSON.stringify({
      query,
      variables: { board: BOARD_ID, group: GROUP_ID, name, cols: JSON.stringify(values) },
    }),
  });

  const body = await res.json().catch(() => ({}));
  // monday answers 200 with an errors array rather than an HTTP error, so a
  // status check alone would call a rejected mutation a success.
  if (!res.ok || body.errors) {
    throw new Error('monday.com rejected the lead: '
      + (body.errors ? JSON.stringify(body.errors).slice(0, 400) : res.status));
  }
  return { id: body?.data?.create_item?.id };
}
