require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// ── View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'ghostmail_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

// ── Routes
app.use('/', indexRouter);
app.use('/api', apiRouter);

// ── 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 — Not Found',
    code: 404,
    message: 'This ghost page does not exist.'
  });
});

// ── Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: '500 — Server Error',
    code: 500,
    message: err.message || 'Something went wrong on our end.'
  });
});

app.listen(PORT, () => {
  console.log(`\n👻 GhostMail running → http://localhost:${PORT}\n`);
});

module.exports = app;
