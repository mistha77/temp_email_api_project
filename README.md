# 👻 GhostMail — Disposable Email App

A complete Node.js + Express + EJS web app for generating disposable email addresses and reading mail via the **temp-email14** RapidAPI.

---

## 🚀 Quick Start

```bash
# 1. Clone / unzip the project
cd ghostmail

# 2. Install dependencies
npm install

# 3. Create .env (already included with your key)
# Edit .env if you need to update your API key

# 4. Run the app
npm start

# OR for dev with auto-reload:
npm run dev   # requires: npm install -g nodemon
```

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
ghostmail/
├── server.js               ← Express app entry point
├── package.json
├── .env                    ← API keys & config
│
├── routes/
│   ├── index.js            ← EJS page routes (GET/POST)
│   └── api.js              ← JSON API routes (/api/*)
│
├── services/
│   └── mailService.js      ← RapidAPI wrapper functions
│
├── views/
│   ├── index.ejs           ← Home / Generate page
│   ├── inbox.ejs           ← Inbox list
│   ├── mail.ejs            ← Single email view
│   ├── settings.ejs        ← Settings page
│   ├── error.ejs           ← 404 / 500 page
│   └── partials/
│       ├── header.ejs      ← Navbar
│       ├── footer.ejs      ← Footer + toast + JS
│       └── flash.ejs       ← Flash messages
│
└── public/
    ├── css/style.css       ← All styles
    └── js/app.js           ← Frontend JS (copy, toast, AJAX)
```

---

## 🌐 Routes

### Page Routes (EJS rendered)
| Method | Path           | Description                  |
|--------|---------------|------------------------------|
| GET    | `/`           | Home / generate page         |
| POST   | `/generate`   | Generate new email address   |
| GET    | `/inbox`      | View inbox (supports ?filter=all/unread/read, ?q=search) |
| GET    | `/mail/:id`   | Read single email            |
| POST   | `/mail/:id/delete` | Delete email            |
| POST   | `/reset`      | Clear session                |
| GET    | `/settings`   | Settings page                |

### JSON API Routes
| Method | Path              | Description               |
|--------|-------------------|---------------------------|
| GET    | `/api/generate`   | Generate email (JSON)     |
| GET    | `/api/inbox`      | Get inbox (JSON)          |
| GET    | `/api/mail/:id`   | Get single mail (JSON)    |
| DELETE | `/api/mail/:id`   | Delete mail (JSON)        |
| GET    | `/api/domains`    | List available domains    |
| GET    | `/api/session`    | Session info (JSON)       |
| POST   | `/api/reset`      | Reset session (JSON)      |

---

## ⌨️ Keyboard Shortcuts

| Key | Action        |
|-----|--------------|
| `G` | Go to Generate |
| `I` | Go to Inbox    |
| `S` | Go to Settings |

---

## 🔑 Environment Variables (.env)

```
PORT=3000
RAPIDAPI_KEY=your_key_here
RAPIDAPI_HOST=temp-email14.p.rapidapi.com
SESSION_SECRET=any_random_string
```

---

## 📦 Dependencies

- **express** — Web framework
- **ejs** — Templating engine
- **node-fetch** — HTTP client for RapidAPI
- **express-session** — Session management
- **dotenv** — Environment variables
- **nodemon** (dev) — Auto-reload

---

## 🧩 Features

### Live
- ⚡ Generate random disposable email via API
- 📥 View full inbox with unread/read states
- 📧 Read individual emails (HTML + plain text)
- 🗑️ Delete emails
- 🔍 Search inbox
- 📊 Inbox stats (total, unread, today)
- 🔗 Full JSON API for each endpoint
- 💾 Session-based email persistence

### Coming Soon (UI ready, API pending)
- ✏️ Custom username prefix
- 🌐 Domain selection
- ➡️ Email forwarding
- ⏱️ Auto-expiry
- 🎭 Alias manager
- ⬇️ Download .eml
- ↩️ Reply
- 🛡️ Tracking pixel blocker
- 🔄 Auto-refresh inbox

---
### Live Demo
👉 https://temp-email-api-project.onrender.com
Built with ❤️ using Node.js + Express + EJS + RapidAPI temp-email14
