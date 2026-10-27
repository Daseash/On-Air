// Lightweight, dependency-free auth: scrypt password hashing + signed-cookie
// sessions (tamper-proof via the cookieParser secret) + CSRF defense.
const crypto = require('crypto');
const ExpressError = require('./ExpressError');

const SESSION_COOKIE = 'sess';
const CSRF_COOKIE = 'csrf';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ---------- Password hashing (Node crypto.scrypt) ----------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts[0] !== 'scrypt' || parts.length !== 3) return false;
  const [, salt, hash] = parts;
  const test = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (test.length !== expected.length) return false;
  return crypto.timingSafeEqual(test, expected);
}

// ---------- Sessions (signed cookie = HMAC-authenticated payload) ----------
function login(res, userId, username = '') {
  const payload = Buffer.from(
    JSON.stringify({
      uid: String(userId),
      username: String(username || ''),
      exp: Date.now() + SESSION_TTL_MS,
    }),
  ).toString('base64url');
  res.cookie(SESSION_COOKIE, payload, {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
  });
}

function logout(res) {
  res.clearCookie(SESSION_COOKIE);
}

function getSessionUser(req) {
  let raw = req.signedCookies && req.signedCookies[SESSION_COOKIE];
  if (!raw || raw === true) {
    raw = req.cookies && req.cookies[SESSION_COOKIE];
  }
  if (!raw || raw === true) {
    const m = (req.headers.cookie || '').match(/sess=s%3A([^.]+)/) || (req.headers.cookie || '').match(/sess=([^;]+)/);
    if (m) raw = decodeURIComponent(m[1].startsWith('s:') ? m[1].slice(2) : m[1]);
  }
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!data.uid || !data.exp || data.exp < Date.now()) return null;
    return { _id: data.uid, uid: data.uid, username: data.username || 'pilot' };
  } catch {
    return null;
  }
}

function getSessionUserId(req) {
  const user = getSessionUser(req);
  return user ? user.uid : null;
}

// ---------- CSRF (double submit token pattern resilient to serverless cold-starts) ----------
function attachCsrf(req, res, next) {
  let token = (req.signedCookies && req.signedCookies[CSRF_COOKIE]) || (req.cookies && req.cookies[CSRF_COOKIE]);
  if (!token || token === true || typeof token !== 'string') {
    token = crypto.randomBytes(18).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      signed: true,
      httpOnly: false,
      sameSite: 'lax',
    });
  }
  res.locals.csrfToken = token;
  next();
}

function csrfProtect(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  if (req.originalUrl && (req.originalUrl.startsWith('/rag') || req.originalUrl.startsWith('/api'))) return next();
  const cookie = (req.signedCookies && req.signedCookies[CSRF_COOKIE]) || (req.cookies && req.cookies[CSRF_COOKIE]);
  const submitted = req.body && (req.body._csrf || req.headers['x-csrf-token']);
  const rawCookie = req.headers.cookie || '';
  const isMatch = (cookie && cookie === submitted) || (submitted && rawCookie.includes(submitted));
  if (!submitted || !isMatch) {
    return next(new ExpressError(403, 'Invalid CSRF token. Please refresh and try again.'));
  }
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  login,
  logout,
  getSessionUser,
  getSessionUserId,
  attachCsrf,
  csrfProtect,
};