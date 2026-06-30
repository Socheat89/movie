/* =============================================================
   DramaStream — App Bootstrap
   Hash Router · Global Utilities · PWA Registration
============================================================= */

/* ── Global: navigate (used by inline onclick handlers) ──────── */
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
  const hash   = window.location.hash.replace('#', '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const route = link.dataset.route;
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

  /* Scroll to top on every navigation */
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

  /* Close menu when any nav link is clicked */
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── PWA: Service Worker registration ───────────────────────── */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('./sw.js')
    .then(reg => {
      console.log('[DramaStream] Service Worker registered. Scope:', reg.scope);
    })
    .catch(err => {
      console.warn('[DramaStream] Service Worker registration failed:', err);
    });
}

/* ── Init ────────────────────────────────────────────────────── */
window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', () => {
  DB.patchBuiltins();   // inject built-in dramas (Sdach Sva 2023, etc.)
  initNavToggle();
  router();
  registerServiceWorker();
});
