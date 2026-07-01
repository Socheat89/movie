/* =============================================================
   DramaStream — App Bootstrap v3
   Hash Router · Global Utilities · API-driven
============================================================= */

/* ── Global: navigate ────────────────────────────────────────── */
function navigate(path) {
  window.location.hash = '#' + path;
}

/* ── Global: showToast ───────────────────────────────────────── */
function showToast(msg, type) {
  type = type || 'info';
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className   = 'toast ' + type + ' show';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ── Global: showConfirm ─────────────────────────────────────── */
function showConfirm(title, bodyHtml, onConfirm) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = `
    <div class="modal-box">
      <h3 class="modal-confirm-title">${title}</h3>
      <p class="modal-confirm-body">${bodyHtml}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="mc-cancel-confirm">Cancel</button>
        <button class="btn btn-danger" id="mc-do-confirm">Delete</button>
      </div>
    </div>`;
  overlay.classList.remove('hidden');
  const close = () => { overlay.classList.add('hidden'); overlay.innerHTML = ''; };
  document.getElementById('mc-cancel-confirm').addEventListener('click', close);
  document.getElementById('mc-do-confirm').addEventListener('click', () => { close(); onConfirm(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

/* ── Global: updateActiveLink ────────────────────────────────── */
function updateActiveLink() {
  const hash = window.location.hash.replace('#', '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const route   = link.dataset.route;
    const isHome  = route === '/' && (hash === '/' || hash === '' || hash.startsWith('/home'));
    const isAdmin = route === '/admin' && hash.startsWith('/admin');
    link.classList.toggle('active', isHome || isAdmin);
  });
}

/* ── Hash Router ─────────────────────────────────────────────── */
function router() {
  const hash  = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);
  const page  = parts[0] || '';

  window.scrollTo({ top: 0, behavior: 'instant' });
  updateActiveLink();

  switch (page) {
    case '':
    case 'home':
      renderHome();
      break;
    case 'watch':
      renderWatch(parts[1]);
      break;
    case 'admin':
      renderAdmin();
      break;
    default:
      renderHome();
  }
}

/* ── Mobile Nav Toggle ───────────────────────────────────────── */
function initNavToggle() {
  const btn   = document.getElementById('menuToggle');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── PWA: unregister old service workers ─────────────────────── */
function cleanupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const reg of registrations) { reg.unregister(); }
  });
  if ('caches' in window) {
    caches.keys().then(names => { for (const n of names) caches.delete(n); });
  }
}

/* ── Init ────────────────────────────────────────────────────── */
window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  cleanupServiceWorker();
  router();
});
