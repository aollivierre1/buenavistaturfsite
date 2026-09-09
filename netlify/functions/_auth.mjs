// Shared admin session handling for the dashboard functions.
//
// The session is an HMAC of its own expiry, keyed by ADMIN_PASSWORD. Changing
// the password therefore invalidates every outstanding session, which is the
// behaviour you want if it ever leaks.
import crypto from 'node:crypto';

export const SESSION_HOURS = 12;
export const COOKIE = 'bvt_admin';

export const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
});

// Timing-safe so the password cannot be guessed a character at a time.
export function sameSecret(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

export const adminKey = () => process.env.ADMIN_PASSWORD || '';

const sign = (expiry) => crypto.createHmac('sha256', adminKey()).update(String(expiry)).digest('hex');

export function makeToken() {
  const expiry = Date.now() + SESSION_HOURS * 3600_000;
  return `${expiry}.${sign(expiry)}`;
}

export function validToken(token) {
  if (!token || !adminKey()) return false;
  const [expiry, mac] = String(token).split('.');
  if (!expiry || !mac) return false;
  if (Number(expiry) < Date.now()) return false;
  return sameSecret(mac, sign(expiry));
}

export function readCookie(req, name = COOKIE) {
  const raw = req.headers.get('cookie') || '';
  const hit = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export const isAdmin = (req) => validToken(readCookie(req));

export const sessionCookie = (token) =>
  `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`;

export const clearedCookie = () =>
  `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
