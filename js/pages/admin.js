/* =============================================================
   DramaStream — Admin Panel
   Login + Full CRUD Dashboard (Dramas & Episodes)
============================================================= */

/* ── Admin State ─────────────────────────────────────────────── */
const Admin = {
  authed:          false,
  activeTab:       'dramas',
  activeDramaId:   null   // for episode tab
};

/* ── Entry Point ─────────────────────────────────────────────── */
function renderAdmin() {
  const main = document.getElementById('main-content');
  Admin.authed ? renderDashboard(main) : renderLogin(main);
}

/* ============================================================
   LOGIN
============================================================ */
function renderLogin(main) {
  main.innerHTML = `
    <div class="login-container page-enter">
      <div class="login-card">
        <div class="login-icon">🔐</div>
        <h1 class="login-title">Admin Panel</h1>
        <p class="login-subtitle">Enter your admin password to manage content</p>

        <form id="admin-login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="admin-pwd">Password</label>
            <input
              class="form-input"
              type="password"
              id="admin-pwd"
              placeholder="Enter password"
              autocomplete="current-password"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:4px;">
            Unlock Dashboard →
          </button>

        </form>
      </div>
    </div>`;

  document.getElementById('admin-login-form').addEventListener('submit', e => {
    e.preventDefault();
    const pwd    = document.getElementById('admin-pwd').value;
    const input  = document.getElementById('admin-pwd');

    if (DB.checkAdmin(pwd)) {
      Admin.authed = true;
      showToast('Welcome back, Admin! 👋', 'success');
      renderDashboard(document.getElementById('main-content'));
    } else {
      showToast('Incorrect password. Try again.', 'error');
      input.classList.add('shake');
      input.value = '';
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  });
}

/* ============================================================
   DASHBOARD SHELL
============================================================ */
function renderDashboard(main) {
  const dramas   = DB.getDramas();
  const totalEps = dramas.reduce((s, d) => s + (d.episodes?.length || 0), 0);
  const trending = dramas.filter(d => d.trending).length;
  const cats     = DB.getCategories().length;

  /* Default drama for episode tab */
  if (!Admin.activeDramaId && dramas.length) {
    Admin.activeDramaId = dramas[0].id;
  }

  main.innerHTML = `
    <div class="admin-layout page-enter">

      <!-- Header -->
      <div class="admin-header">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 class="admin-title">Admin Dashboard</h1>
            <p class="admin-subtitle">Manage DramaStream content — dramas, episodes &amp; categories</p>
          </div>
          <button class="btn btn-ghost btn-sm" id="btn-logout">← Logout</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="admin-stats">
        <div class="stat-card">
          <div class="stat-value">${dramas.length}</div>
          <div class="stat-label">Total Dramas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalEps}</div>
          <div class="stat-label">Total Episodes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${trending}</div>
          <div class="stat-label">Trending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${cats}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs" role="tablist">
        <button class="admin-tab${Admin.activeTab === 'dramas' ? ' active' : ''}"   data-tab="dramas"   role="tab">🎬 Dramas</button>
        <button class="admin-tab${Admin.activeTab === 'episodes' ? ' active' : ''}" data-tab="episodes" role="tab">▶ Episodes</button>
      </div>

      <!-- Tab Content -->
      <div id="admin-tab-body"></div>

    </div>`;

  /* Logout */
  document.getElementById('btn-logout').addEventListener('click', () => {
    Admin.authed = false;
    showToast('Logged out.', 'info');
    renderAdmin();
  });

  /* Tab switching */
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      Admin.activeTab = tab.dataset.tab;
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTabBody();
    });
  });

  renderTabBody();
}

/* ── Render current tab body ─────────────────────────────────── */
function renderTabBody() {
  const body = document.getElementById('admin-tab-body');
  if (!body) return;
  if (Admin.activeTab === 'dramas') {
    body.innerHTML = buildDramasTab();
    bindDramaTabEvents();
  } else {
    body.innerHTML = buildEpisodesTab();
    bindEpisodeTabEvents();
  }
}

/* ============================================================
   DRAMAS TAB
============================================================ */
function buildDramasTab() {
  const dramas = DB.getDramas();
  return `
    <div class="admin-toolbar">
      <input class="search-input" type="search" id="drama-search" placeholder="🔍 Search dramas…" value="">
      <button class="btn btn-primary" id="btn-add-drama">+ Add Drama</button>
    </div>
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Poster</th>
            <th>Title</th>
            <th>Genre</th>
            <th>Episodes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="dramas-tbody">${buildDramaRows(dramas)}</tbody>
      </table>
    </div>`;
}

function buildDramaRows(dramas) {
  if (!dramas.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:52px;color:var(--text-2);">
      No dramas yet. Click <strong>+ Add Drama</strong> to create one.
    </td></tr>`;
  }
  return dramas.map(d => `
    <tr data-drama-id="${d.id}">
      <td>
        <img class="table-poster" src="${d.poster}" alt="${escHtml(d.title)}"
          onerror="this.style.background='var(--bg-3)';this.removeAttribute('src')">
      </td>
      <td style="font-weight:600;max-width:220px;word-break:break-word;">${escHtml(d.title)}</td>
      <td><span class="genre-badge">${escHtml(d.genre)}</span></td>
      <td style="color:var(--text-2);">${(d.episodes || []).length}</td>
      <td>${d.trending
          ? '<span class="trending-badge">🔥 Trending</span>'
          : '<span style="color:var(--text-3);font-size:0.78rem;">—</span>'}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm btn-icon edit-drama-btn"   data-id="${d.id}" title="Edit">✏️</button>
          <button class="btn btn-ghost btn-sm btn-icon delete-drama-btn" data-id="${d.id}" title="Delete" style="color:var(--red);">🗑️</button>
          <a href="#/watch/${d.id}" class="btn btn-ghost btn-sm btn-icon" title="View on site" tabindex="0">👁️</a>
        </div>
      </td>
    </tr>`).join('');
}

function bindDramaTabEvents() {
  /* Add */
  document.getElementById('btn-add-drama')?.addEventListener('click', () => showDramaModal(null));

  /* Live search */
  document.getElementById('drama-search')?.addEventListener('input', e => {
    const q       = e.target.value.toLowerCase().trim();
    const filtered = DB.getDramas().filter(d => d.title.toLowerCase().includes(q) || d.genre.toLowerCase().includes(q));
    const tbody    = document.getElementById('dramas-tbody');
    if (tbody) { tbody.innerHTML = buildDramaRows(filtered); bindDramaRowEvents(); }
  });

  bindDramaRowEvents();
}

function bindDramaRowEvents() {
  document.querySelectorAll('.edit-drama-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const drama = DB.getDrama(btn.dataset.id);
      if (drama) showDramaModal(drama);
    });
  });

  document.querySelectorAll('.delete-drama-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const drama = DB.getDrama(btn.dataset.id);
      if (!drama) return;
      showConfirm(
        'Delete Drama',
        `Are you sure you want to permanently delete "<strong>${escHtml(drama.title)}</strong>" and all its episodes? This cannot be undone.`,
        () => {
          DB.deleteDrama(btn.dataset.id);
          showToast('Drama deleted.', 'success');
          renderDashboard(document.getElementById('main-content'));
        }
      );
    });
  });
}

/* ── Drama CRUD Modal ────────────────────────────────────────── */
function showDramaModal(drama) {
  const isEdit = !!drama;
  const cats   = DB.getCategories();

  openModal(`
    <div class="modal-box modal-lg">
      <div class="modal-header">
        <h3>${isEdit ? '✏️ Edit Drama' : '+ New Drama'}</h3>
        <button class="modal-close" id="mc-close">✕</button>
      </div>
      <form id="drama-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="f-title">Title *</label>
          <input class="form-input" type="text" id="f-title"
            value="${isEdit ? escHtml(drama.title) : ''}"
            placeholder="Drama title" required maxlength="120">
        </div>
        <div class="form-group">
          <label class="form-label" for="f-desc">Description *</label>
          <textarea class="form-textarea" id="f-desc" placeholder="Short synopsis…" required maxlength="600">${isEdit ? escHtml(drama.description) : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="f-poster">Poster Image URL</label>
          <input class="form-input" type="url" id="f-poster"
            value="${isEdit ? escHtml(drama.poster) : ''}"
            placeholder="https://…">
          <small style="color:var(--text-3);font-size:0.75rem;margin-top:4px;display:block;">
            Leave blank to use a random placeholder.
          </small>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label" for="f-genre">Genre</label>
            <select class="form-select" id="f-genre">
              ${cats.map(c => `<option value="${c}"${isEdit && drama.genre === c ? ' selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:20px;">
            <label class="form-check">
              <input type="checkbox" id="f-trending"${isEdit && drama.trending ? ' checked' : ''}>
              <span>Mark as Trending</span>
            </label>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" id="mc-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Drama'}</button>
        </div>
      </form>
    </div>`);

  const close = closeModal;
  document.getElementById('mc-close').addEventListener('click', close);
  document.getElementById('mc-cancel').addEventListener('click', close);

  document.getElementById('drama-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('f-title').value.trim();
    const desc  = document.getElementById('f-desc').value.trim();
    if (!title || !desc) { showToast('Title and description are required.', 'error'); return; }

    const payload = {
      title,
      description: desc,
      poster: document.getElementById('f-poster').value.trim()
               || `https://picsum.photos/seed/${title.replace(/\s+/g, '')}/300/450`,
      genre:    document.getElementById('f-genre').value,
      trending: document.getElementById('f-trending').checked
    };

    if (isEdit) {
      DB.updateDrama(drama.id, payload);
      showToast('Drama updated! ✅', 'success');
    } else {
      DB.addDrama(payload);
      showToast('Drama created! 🎬', 'success');
    }
    close();
    renderDashboard(document.getElementById('main-content'));
  });
}

/* ============================================================
   EPISODES TAB
============================================================ */
function buildEpisodesTab() {
  const dramas = DB.getDramas();
  if (!dramas.length) {
    return `<div style="padding:48px;text-align:center;color:var(--text-2);">
      No dramas found. <a href="#" id="go-dramas" style="color:var(--accent-lt);">Add a drama first →</a>
    </div>`;
  }

  const selId  = Admin.activeDramaId || dramas[0].id;
  const drama  = DB.getDrama(selId) || dramas[0];
  Admin.activeDramaId = drama.id;

  return `
    <div class="admin-toolbar">
      <select class="search-input" id="drama-selector" style="width:auto;max-width:320px;">
        ${dramas.map(d => `<option value="${d.id}"${d.id === drama.id ? ' selected' : ''}>${escHtml(d.title)}</option>`).join('')}
      </select>
      <button class="btn btn-primary" id="btn-add-ep">+ Add Episode</button>
    </div>
    ${buildEpisodeTable(drama)}`;
}

function buildEpisodeTable(drama) {
  const eps = drama.episodes || [];
  return `
    <div class="admin-table-wrapper" id="ep-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Video URL</th>
            <th>Platform</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="episodes-tbody">
          ${eps.length
            ? eps.map((ep, i) => `
              <tr data-ep-id="${ep.id}">
                <td style="color:var(--text-2);font-weight:600;">${i + 1}</td>
                <td style="font-weight:500;">${escHtml(ep.title)}</td>
                <td style="max-width:200px;">
                  <span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.78rem;color:var(--text-2);" title="${escHtml(ep.videoUrl || '')}">
                    ${ep.videoUrl ? escHtml(ep.videoUrl) : '<em style="color:var(--text-3)">None</em>'}
                  </span>
                </td>
                <td>
                  <span style="font-size:0.72rem;padding:2px 9px;background:var(--bg-3);border-radius:100px;color:var(--text-2);">
                    ${Embed.getType(ep.videoUrl)}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm btn-icon edit-ep-btn"   data-id="${ep.id}" title="Edit">✏️</button>
                    <button class="btn btn-ghost btn-sm btn-icon delete-ep-btn" data-id="${ep.id}" title="Delete" style="color:var(--red);">🗑️</button>
                  </div>
                </td>
              </tr>`).join('')
            : `<tr><td colspan="5" style="text-align:center;padding:48px;color:var(--text-2);">
                No episodes yet. Click <strong>+ Add Episode</strong> to get started.
               </td></tr>`}
        </tbody>
      </table>
    </div>`;
}

function bindEpisodeTabEvents() {
  /* Go to dramas shortcut (no-dramas state) */
  document.getElementById('go-dramas')?.addEventListener('click', e => {
    e.preventDefault();
    Admin.activeTab = 'dramas';
    document.querySelectorAll('.admin-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === 'dramas');
    });
    renderTabBody();
  });

  /* Drama selector */
  document.getElementById('drama-selector')?.addEventListener('change', e => {
    Admin.activeDramaId = e.target.value;
    const drama = DB.getDrama(e.target.value);
    const wrapper = document.getElementById('ep-table-wrapper');
    if (wrapper && drama) { wrapper.outerHTML = buildEpisodeTable(drama); }
    bindEpisodeRowEvents();
  });

  /* Add episode */
  document.getElementById('btn-add-ep')?.addEventListener('click', () => {
    const drama = DB.getDrama(Admin.activeDramaId);
    if (!drama) { showToast('Select a drama first.', 'error'); return; }
    showEpisodeModal(drama, null);
  });

  bindEpisodeRowEvents();
}

function bindEpisodeRowEvents() {
  const drama = DB.getDrama(Admin.activeDramaId);

  document.querySelectorAll('.edit-ep-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ep = (drama?.episodes || []).find(e => e.id === btn.dataset.id);
      if (ep && drama) showEpisodeModal(drama, ep);
    });
  });

  document.querySelectorAll('.delete-ep-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ep = (drama?.episodes || []).find(e => e.id === btn.dataset.id);
      if (!ep) return;
      showConfirm(
        'Delete Episode',
        `Delete "<strong>${escHtml(ep.title)}</strong>" permanently?`,
        () => {
          DB.deleteEpisode(Admin.activeDramaId, btn.dataset.id);
          showToast('Episode deleted.', 'success');
          /* Refresh episode table only */
          const updatedDrama = DB.getDrama(Admin.activeDramaId);
          const wrapper      = document.getElementById('ep-table-wrapper');
          if (wrapper && updatedDrama) { wrapper.outerHTML = buildEpisodeTable(updatedDrama); }
          bindEpisodeRowEvents();
        }
      );
    });
  });
}

/* ── Episode CRUD Modal ──────────────────────────────────────── */
function showEpisodeModal(drama, ep) {
  const isEdit = !!ep;

  openModal(`
    <div class="modal-box">
      <div class="modal-header">
        <h3>${isEdit ? '✏️ Edit Episode' : '+ Add Episode'}</h3>
        <button class="modal-close" id="mc-close">✕</button>
      </div>
      <p style="color:var(--text-2);font-size:0.82rem;margin-bottom:20px;">
        Drama: <strong style="color:var(--text);">${escHtml(drama.title)}</strong>
      </p>
      <form id="episode-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="ep-title">Episode Title *</label>
          <input class="form-input" type="text" id="ep-title"
            value="${isEdit ? escHtml(ep.title) : ''}"
            placeholder="e.g. Episode 1 — The Beginning" required maxlength="120">
        </div>
        <div class="form-group">
          <label class="form-label" for="ep-url">Video URL</label>
          <input class="form-input" type="url" id="ep-url"
            value="${isEdit ? escHtml(ep.videoUrl || '') : ''}"
            placeholder="YouTube, Facebook, TikTok, or Vimeo URL">
          <small style="color:var(--text-3);font-size:0.75rem;margin-top:6px;display:block;">
            Supported: youtube.com · youtu.be · facebook.com · fb.watch · tiktok.com · vimeo.com
          </small>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" id="mc-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Episode'}</button>
        </div>
      </form>
    </div>`);

  const close = closeModal;
  document.getElementById('mc-close').addEventListener('click', close);
  document.getElementById('mc-cancel').addEventListener('click', close);

  document.getElementById('episode-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('ep-title').value.trim();
    if (!title) { showToast('Episode title is required.', 'error'); return; }

    const payload = {
      title,
      videoUrl: document.getElementById('ep-url').value.trim()
    };

    if (isEdit) {
      DB.updateEpisode(drama.id, ep.id, payload);
      showToast('Episode updated! ✅', 'success');
    } else {
      DB.addEpisode(drama.id, payload);
      showToast('Episode added! ▶', 'success');
    }
    close();
    /* Refresh episode table */
    const updatedDrama = DB.getDrama(drama.id);
    const wrapper      = document.getElementById('ep-table-wrapper');
    if (wrapper && updatedDrama) { wrapper.outerHTML = buildEpisodeTable(updatedDrama); }
    else { renderDashboard(document.getElementById('main-content')); }
    bindEpisodeRowEvents();
  });
}

/* ── Modal Helpers ───────────────────────────────────────────── */
function openModal(html) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = html;
  overlay.classList.remove('hidden');
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  /* Trap focus to first input */
  setTimeout(() => { overlay.querySelector('input, textarea, select, button')?.focus(); }, 50);
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}
