/* GhostMail — Frontend JS */

// ── Toast notification
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Copy to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 Copied to clipboard!'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('📋 Copied!');
  } catch {
    showToast('❌ Copy failed.');
  }
  document.body.removeChild(ta);
}

// ── Auto-copy email address on load (if present in nav)
document.addEventListener('DOMContentLoaded', () => {
  // Keyboard shortcut: Ctrl+C on email in nav
  const navEmail = document.querySelector('.nav-email code');
  if (navEmail) {
    navEmail.style.cursor = 'pointer';
    navEmail.title = 'Click to copy';
    navEmail.addEventListener('click', () => copyToClipboard(navEmail.textContent.trim()));
  }

  // Auto-refresh inbox every 60s if on inbox page
  if (window.location.pathname === '/inbox') {
    let countdown = 60;
    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(interval);
        // Soft refresh — just reload the page to re-fetch
        window.location.reload();
      }
    }, 1000);
  }

  // Keyboard shortcut: G to generate, I for inbox
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'g' || e.key === 'G') window.location.href = '/';
    if (e.key === 'i' || e.key === 'I') window.location.href = '/inbox';
    if (e.key === 's' || e.key === 'S') window.location.href = '/settings';
  });
});

// ── AJAX: Generate email without page reload (optional enhancement)
async function ajaxGenerate() {
  const btn = document.getElementById('ajax-gen-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Generating...';
  }
  try {
    const res = await fetch('/api/generate');
    const data = await res.json();
    if (data.success) {
      const display = document.getElementById('email-addr');
      if (display) {
        display.textContent = data.email;
        showToast('📬 New ghost address created!');
      } else {
        window.location.reload();
      }
    } else {
      showToast('❌ ' + (data.error || 'Generation failed.'));
    }
  } catch (err) {
    showToast('❌ Network error.');
  }
  if (btn) { btn.disabled = false; btn.textContent = '⚡ Generate'; }
}

// ── AJAX: Refresh inbox count in nav badge
async function updateBadge() {
  try {
    const res = await fetch('/api/inbox');
    const data = await res.json();
    if (data.success) {
      const unread = data.mails.filter(m => !m.read).length;
      const badge = document.querySelector('.nav-badge');
      if (unread > 0) {
        if (badge) { badge.textContent = unread; badge.style.display = 'inline'; }
      } else {
        if (badge) badge.style.display = 'none';
      }
    }
  } catch { /* silent */ }
}

// ── DELETE mail via AJAX (for mail detail page)
async function deleteMail(id) {
  if (!confirm('Delete this email permanently?')) return;
  try {
    const res = await fetch(`/api/mail/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('🗑️ Email deleted.');
      setTimeout(() => window.location.href = '/inbox', 900);
    } else {
      showToast('❌ Delete failed: ' + data.error);
    }
  } catch {
    showToast('❌ Network error.');
  }
}
