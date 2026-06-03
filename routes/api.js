const express    = require('express');
const router     = express.Router();
const mailService = require('../services/mailService');

// GET /api/generate
router.get('/generate', async (req, res) => {
  try {
    const result = await mailService.generateEmail();
    req.session.email     = result.email;
    req.session.emailHash = result.hash;
    req.session.username  = result.username;
    req.session.domain    = result.domain;
    req.session.readMails = [];
    res.json({ success: true, email: result.email, hash: result.hash, domain: result.domain });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inbox
router.get('/inbox', async (req, res) => {
  const { email, emailHash } = req.session;
  if (!email) return res.status(401).json({ success: false, error: 'No active session.' });
  try {
    const mails    = await mailService.previewMails(email, emailHash);
    const readSet  = new Set(req.session.readMails || []);
    const enriched = mails.map(m => ({ ...m, read: readSet.has(m.id) }));
    res.json({ success: true, email, count: enriched.length, mails: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/mail/:id
router.get('/mail/:id', async (req, res) => {
  if (!req.session.email) return res.status(401).json({ success: false, error: 'No active session.' });
  try {
    const mail = await mailService.getMail(req.params.id);
    req.session.readMails = req.session.readMails || [];
    if (!req.session.readMails.includes(req.params.id)) req.session.readMails.push(req.params.id);
    res.json({ success: true, mail });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/mail/:id
router.delete('/mail/:id', async (req, res) => {
  if (!req.session.email) return res.status(401).json({ success: false, error: 'No active session.' });
  try {
    await mailService.deleteMail(req.params.id);
    req.session.readMails = (req.session.readMails || []).filter(r => r !== req.params.id);
    res.json({ success: true, deleted: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/domains
router.get('/domains', async (req, res) => {
  try {
    const domains = await mailService.getDomains();
    res.json({ success: true, domains });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/session
router.get('/session', (req, res) => {
  res.json({
    success:   true,
    email:     req.session.email || null,
    hash:      req.session.emailHash || null,
    readCount: (req.session.readMails || []).length
  });
});

// POST /api/reset
router.post('/reset', (req, res) => {
  req.session.email     = null;
  req.session.emailHash = null;
  req.session.readMails = [];
  res.json({ success: true, message: 'Session cleared.' });
});

module.exports = router;
