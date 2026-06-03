const express    = require('express');
const router     = express.Router();
const mailService = require('../services/mailService');

// ── Home page
router.get('/', (req, res) => {
  res.render('index', {
    title:        'GhostMail — Disposable Email',
    currentEmail: req.session.email || null,
    flash:        req.session.flash || null
  });
  req.session.flash = null;
});

// ── POST /generate
router.post('/generate', async (req, res) => {
  try {
    const result = await mailService.generateEmail();
    req.session.email     = result.email;
    req.session.emailHash = result.hash;
    req.session.username  = result.username;
    req.session.domain    = result.domain;
    req.session.readMails = [];
    req.session.flash     = { type: 'success', msg: `✅ Ghost address ready: ${result.email}` };
  } catch (err) {
    console.error('Generate error:', err.message);
    req.session.flash = { type: 'error', msg: `Failed to generate: ${err.message}` };
  }
  res.redirect('/');
});

// ── GET /inbox
router.get('/inbox', async (req, res) => {
  if (!req.session.email) return res.redirect('/');

  let mails = [], flashMsg = null;
  try {
    mails = await mailService.previewMails(req.session.email, req.session.emailHash);
  } catch (err) {
    console.error('Inbox error:', err.message);
    flashMsg = { type: 'error', msg: `Inbox fetch error: ${err.message}` };
  }

  const readSet     = new Set(req.session.readMails || []);
  const enriched    = mails.map(m => ({ ...m, read: readSet.has(m.id) }));
  const unreadCount = enriched.filter(m => !m.read).length;

  res.render('inbox', {
    title:        'Inbox — GhostMail',
    currentEmail: req.session.email,
    mails:        enriched,
    unreadCount,
    filter:       req.query.filter || 'all',
    search:       req.query.q || '',
    flash:        flashMsg || req.session.flash || null
  });
  req.session.flash = null;
});

// ── GET /mail/:id
router.get('/mail/:id', async (req, res) => {
  if (!req.session.email) return res.redirect('/');
  const { id } = req.params;
  try {
    const mail = await mailService.getMail(id);
    req.session.readMails = req.session.readMails || [];
    if (!req.session.readMails.includes(id)) req.session.readMails.push(id);
    res.render('mail', {
      title:        `${mail.subject} — GhostMail`,
      currentEmail: req.session.email,
      mail,
      flash:        null
    });
  } catch (err) {
    req.session.flash = { type: 'error', msg: `Could not load email: ${err.message}` };
    res.redirect('/inbox');
  }
});

// ── POST /mail/:id/delete
router.post('/mail/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    await mailService.deleteMail(id);
    req.session.readMails = (req.session.readMails || []).filter(r => r !== id);
    req.session.flash = { type: 'success', msg: 'Email deleted.' };
  } catch (err) {
    req.session.flash = { type: 'error', msg: `Delete failed: ${err.message}` };
  }
  res.redirect('/inbox');
});

// ── POST /reset
router.post('/reset', (req, res) => {
  req.session.email     = null;
  req.session.emailHash = null;
  req.session.username  = null;
  req.session.domain    = null;
  req.session.readMails = [];
  req.session.flash     = { type: 'info', msg: 'Session cleared. Generate a new address.' };
  res.redirect('/');
});

// ── GET /settings
router.get('/settings', (req, res) => {
  res.render('settings', {
    title:        'Settings — GhostMail',
    currentEmail: req.session.email || null,
    flash:        req.session.flash || null
  });
  req.session.flash = null;
});

module.exports = router;
