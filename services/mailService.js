/**
 * mailService.js
 *
 * CORRECT API: privatix-temp-mail-v1.p.rapidapi.com
 *
 * Endpoints:
 *   GET /request/domains/        → list of available domains
 *   GET /request/mail/id/{md5}   → list emails for address (md5 of full email)
 *   GET /request/one_mail/id/{mail_id} → single email body
 *   GET /request/delete/id/{mail_id}   → delete email
 *
 * Address generation: pick random username + domain locally,
 * then md5(username@domain) to query the inbox.
 */

const fetch  = require('node-fetch');
const crypto = require('crypto');

const API_HOST = 'privatix-temp-mail-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}`;
const API_KEY  = process.env.RAPIDAPI_KEY;

const HEADERS = {
  'x-rapidapi-key':  API_KEY,
  'x-rapidapi-host': API_HOST,
  'Content-Type':    'application/json'
};

// ── MD5 helper (this is how the API identifies mailboxes)
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// ── Raw GET with logging
async function apiGet(path) {
  const url = `${BASE_URL}${path}`;
  console.log(`\n[API] GET ${url}`);
  const res  = await fetch(url, { method: 'GET', headers: HEADERS });
  const text = await res.text();
  console.log(`[API] ${res.status} → ${text.slice(0, 300)}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${text.slice(0, 150)}`);
  return JSON.parse(text);
}

// ─────────────────────────────────────────────
// GET DOMAINS from the real API
// ─────────────────────────────────────────────
async function getDomains() {
  try {
    const data = await apiGet('/request/domains/');
    // Returns array like ["@domain1.com", "@domain2.com"]
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.domains)) return data.domains;
  } catch (e) {
    console.error('[getDomains] failed:', e.message);
  }
  // Fallback known domains
  return ['@yopmail.com', '@guerrillamailblock.com', '@sharklasers.com'];
}

// ─────────────────────────────────────────────
// GENERATE — pick random username + fetch real domain from API
// ─────────────────────────────────────────────
async function generateEmail() {
  const domains = await getDomains();
  // Domains come as "@domain.com" — strip the @
  const domainRaw = domains[Math.floor(Math.random() * domains.length)];
  const domain    = domainRaw.startsWith('@') ? domainRaw.slice(1) : domainRaw;
  const username  = crypto.randomBytes(5).toString('hex'); // e.g. "a3f9c1b7e2"
  const email     = `${username}@${domain}`;
  const hash      = md5(email);
  console.log(`[generate] ${email}  →  md5: ${hash}`);
  return { email, username, domain, hash };
}

// ─────────────────────────────────────────────
// PREVIEW MAILS — GET /request/mail/id/{md5}
// ─────────────────────────────────────────────
async function previewMails(email, hash) {
  const h    = hash || md5(email);
  const data = await apiGet(`/request/mail/id/${h}/`);

  // API returns array of mail objects, or object with error if empty
  if (!Array.isArray(data)) {
    // e.g. { "error": "There are no emails yet" }
    console.log('[previewMails] No emails or unexpected response:', data);
    return [];
  }

  return data.map((m, i) => ({
    id:           m.mail_id || m.id || `mail_${i}`,
    from:         m.mail_from || m.from || 'unknown@sender.com',
    to:           m.mail_recipient || email,
    subject:      m.mail_subject || m.subject || '(No Subject)',
    preview:      (m.mail_preview || m.mail_text_only || m.mail_text || '').slice(0, 160) || 'No preview.',
    date:         m.mail_timestamp
                    ? new Date(m.mail_timestamp * 1000).toISOString()
                    : (m.date || new Date().toISOString()),
    hasAttachment: !!(m.mail_attachments_count > 0),
    raw: m
  }));
}

// ─────────────────────────────────────────────
// GET SINGLE MAIL — GET /request/one_mail/id/{mail_id}
// ─────────────────────────────────────────────
async function getMail(mailId) {
  const data = await apiGet(`/request/one_mail/id/${mailId}/`);
  return {
    id:          data.mail_id || mailId,
    from:        data.mail_from || 'unknown@sender.com',
    to:          data.mail_recipient || '',
    subject:     data.mail_subject || '(No Subject)',
    bodyHtml:    data.mail_html || data.mail_body || null,
    bodyText:    data.mail_text_only || data.mail_text || data.mail_body || 'No content.',
    date:        data.mail_timestamp
                   ? new Date(data.mail_timestamp * 1000).toISOString()
                   : new Date().toISOString(),
    attachments: data.mail_attachments || [],
    raw: data
  };
}

// ─────────────────────────────────────────────
// DELETE MAIL — GET /request/delete/id/{mail_id}
// ─────────────────────────────────────────────
async function deleteMail(mailId) {
  try {
    const data = await apiGet(`/request/delete/id/${mailId}/`);
    return data;
  } catch (e) {
    console.error('[deleteMail] failed (non-fatal):', e.message);
    return { ok: true };
  }
}

module.exports = { generateEmail, previewMails, getMail, deleteMail, getDomains, md5 };
