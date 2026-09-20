// Emails a submission the moment it arrives.
//
// Netlify calls this automatically on every verified form submission - the name
// `submission-created` is what wires it up, so do not rename the file.
//
// Netlify's own form notifications can do something similar, but the subject
// line is fixed. This one says "New application" or "New quote" so the inbox is
// readable at a glance, and puts the fields in the body in a sensible order.
//
// Required environment variables (Netlify → Environment variables):
//   RESEND_API_KEY   an API key from resend.com
// Optional:
//   NOTIFY_EMAIL     where to send (defaults to the address below)
//   NOTIFY_FROM      the sender (defaults to Resend's shared test sender, which
//                    only delivers to the Resend account owner's own address -
//                    set this to something @buenavistaturf.com once the domain
//                    is verified in Resend)

const TO = process.env.NOTIFY_EMAIL || 'alfredo@buenavistaturf.com';
const FROM = process.env.NOTIFY_FROM || 'Buena Vista Turf <onboarding@resend.dev>';

// What each form should say in the subject, and which field names the sender.
const FORMS = {
  application: { label: 'New application', who: ['name'] },
  quote: { label: 'New quote', who: ['name'] },
  contact: { label: 'New contact message', who: ['name'] },
};

const HIDE = new Set(['bot-field', 'form-name', 'ip', 'user_agent', 'referrer']);

// Field order that reads well in an email, whatever order the form posts them.
const ORDER = [
  'name', 'phone', 'email', 'location', 'role', 'grass', 'delivery', 'when',
  'length', 'width', 'sqft', 'calculated_pallets', 'calculated_sqft_with_waste',
  'city', 'experience', 'message', 'notes', 'resume',
];

const pretty = (k) => k.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function buildEmail(formName, data = {}, createdAt) {
  const form = FORMS[formName] || { label: `New ${formName} submission`, who: ['name'] };
  const who = form.who.map((k) => data[k]).find(Boolean);
  const subject = who ? `${form.label} — ${who}` : form.label;

  const keys = Object.keys(data)
    .filter((k) => !HIDE.has(k) && data[k] !== '' && data[k] != null)
    .sort((a, b) => {
      const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

  const rows = keys.map((k) => {
    const v = String(data[k]);
    const cell = /^https?:\/\//.test(v)
      ? `<a href="${esc(v)}">${k === 'resume' ? 'Download resume' : esc(v)}</a>`
      : esc(v).replace(/\n/g, '<br>');
    return `<tr><td style="padding:6px 14px 6px 0;color:#667;white-space:nowrap;vertical-align:top">${esc(pretty(k))}</td>`
      + `<td style="padding:6px 0">${cell}</td></tr>`;
  }).join('');

  const when = createdAt ? new Date(createdAt).toLocaleString('en-US', { timeZone: 'America/Chicago' }) : '';

  const html = `<div style="font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111">
<h2 style="margin:0 0 4px">${esc(form.label)}</h2>
${when ? `<p style="margin:0 0 16px;color:#667;font-size:13px">${esc(when)} (Central)</p>` : ''}
<table style="border-collapse:collapse">${rows}</table>
<p style="margin:22px 0 0;font-size:13px;color:#667">Also in the dashboard at
<a href="https://buenavistaturf.com/admin">buenavistaturf.com/admin</a>.</p>
</div>`;

  const text = keys.map((k) => `${pretty(k)}: ${data[k]}`).join('\n');

  return { subject, html, text };
}

export default async (req) => {
  // Never fail the submission because the email did not go out - the record is
  // already safe in Netlify either way.
  try {
    const body = await req.json();
    const p = body?.payload || {};
    const { subject, html, text } = buildEmail(p.form_name, p.data, p.created_at);

    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY is not set - skipping email for:', subject);
      return new Response('no mailer configured', { status: 200 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [TO], subject, html, text,
        reply_to: p.data?.email || undefined }),
    });

    if (!res.ok) console.log('Resend error', res.status, await res.text());
    else console.log('emailed:', subject);
  } catch (err) {
    console.log('submission-created failed:', String(err?.message || err));
  }
  return new Response('ok', { status: 200 });
};
