/* =============================================================
   DramaStream — Admin Panel (API-driven)
   Login + Full CRUD Dashboard (Dramas & Episodes)
============================================================= */

/* ── Admin State ─────────────────────────────────────────────── */
const Admin = {
  activeTab:     'dramas',
  activeDramaId: null,
  // cached data to avoid redundant API calls within a session
  _dramas:       null,
  _categories:   null,
};

/* ── Entry Point ─────────────────────────────────────────────── */
function renderAdmin() {
  const main = document.getElementById('main-content');
  API.isAuthed() ? renderDashboard(main) : renderLogin(main);
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
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:4px;" id="login-submit-btn">
            Unlock Dashboard →
          </button>
        </form>
      </div>
    </div>`;

  document.getElementById('admin-login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const pwd   = document.getElementById('admin-pwd').value;
    const input = document.getElementById('admin-pwd');
    const btn   = document.getElementById('login-submit-btn');
    btn.disabled    = true;
    btn.textContent = 'Checking…';

    const ok = await API.checkAdmin(pwd);
    if (ok) {
      showToast('Welcome back, Admin! 👋', 'success');
      await renderDashboard(document.getElementById('main-content'));
    } else {
      showToast('Incorrect password. Try again.', 'error');
      input.classList.add('shake');
      input.value       = '';
      btn.disabled      = false;
      btn.textContent   = 'Unlock Dashboard →';
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  });
}

/* ============================================================
   DASHBOARD SHELL
============================================================ */
async function renderDashboard(main) {
  /* Show loading state */
  main.innerHTML = `<div class="admin-layout page-enter">
    <div style="padding:60px;text-align:center;color:var(--text-2);">Loading dashboard…</div>
  </div>`;

  try {
    const [dramas, categories] = await Promise.all([
      API.getDramas(),
      API.getCategories()
    ]);

    Admin._dramas     = dramas;
    Admin._categories = categories;

    if (!Admin.activeDramaId && dramas.length) {
      Admin.activeDramaId = dramas[0].id;
    }

    const totalEps = dramas.reduce((s, d) => s + (d.episodeCount || 0), 0);
    const trending = dramas.filter(d => d.trending).length;
    const cats     = categories.length;

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
      API.logout();
      Admin._dramas = null;
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
  } catch (err) {
    console.error('[Admin] Dashboard load failed:', err);
    main.innerHTML = `<div style="padding:60px;text-align:center;">
      <p style="color:var(--text-2);">Failed to load dashboard. Is the backend running?</p>
      <button class="btn btn-primary" style="margin-top:16px;" onclick="renderDashboard(document.getElementById('main-content'))">↺ Retry</button>
    </div>`;
  }
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
  const dramas = Admin._dramas || [];
  return `
    <div class="admin-toolbar" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;width:100%;">
      <input class="search-input" type="search" id="drama-search" placeholder="🔍 Search dramas…" value="" style="flex:1;min-width:200px;">

      <!-- Import from URL Form -->
      <div style="display:flex;gap:6px;align-items:center;flex:2;min-width:300px;">
        <input class="form-input" type="url" id="import-url-input" placeholder="Paste KhmerKomsan URL (e.g. watch.php?vid=...)" style="margin:0;flex:1;">
        <button class="btn btn-ghost" id="btn-import-url">⚡ Fetch &amp; Import</button>
      </div>

      <button class="btn btn-ghost" id="btn-upload-json" style="display:flex;align-items:center;gap:6px;">📂 Upload JSON</button>
      <input type="file" id="json-file-input" accept=".json" style="display:none;">
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
      <td style="color:var(--text-2);">${d.episodeCount || 0}</td>
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

  /* Import from URL (fetch + parse website) */
  document.getElementById('btn-import-url')?.addEventListener('click', async () => {
    const urlInput = document.getElementById('import-url-input');
    const url = urlInput?.value.trim();
    if (!url) { showToast('Please paste a valid website URL first.', 'error'); return; }

    showToast('Fetching movie details... Please wait.', 'info');

    let html = '';
    let success = false;
    const proxyBuilders = [
      u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      u => `https://yacdn.org/proxy/${u}`
    ];

    for (const buildProxyUrl of proxyBuilders) {
      try {
        const res = await fetch(buildProxyUrl(url));
        if (res.ok) { html = await res.text(); if (html.trim().length > 0) { success = true; break; } }
      } catch (e) { /* try next */ }
    }

    if (!success) { showToast('CORS proxy servers are unreachable. Please try again later.', 'error'); return; }

    try {
      const parser = new DOMParser();
      const doc    = parser.parseFromString(html, 'text/html');

      let title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
                  || doc.querySelector('h3.fst-italic')?.textContent || 'Scraped Drama';
      title = title.replace(/\[\d+\.END\]/gi, '').replace(/\[\d+\.EP\]/gi, '').trim();

      const description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || 'No description.';
      const poster      = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || 'https://picsum.photos/300/450';

      let episodes = [];
      for (const s of doc.querySelectorAll('script')) {
        if (s.textContent.includes('const videos =')) {
          const match = s.textContent.match(/const\s+videos\s*=\s*(\[[\s\S]*?\])/);
          if (match) {
            try {
              const videos = (new Function(`return ${match[1]};`))();
              if (Array.isArray(videos)) {
                episodes = videos.map((v, i) => ({
                  id: 'ep_' + Date.now() + '_' + i,
                  episode: i + 1,
                  title: v.title || `Episode ${i + 1}`,
                  videoUrl: v.file || v.videoUrl || ''
                }));
              }
            } catch (e) { /* skip */ }
          }
          break;
        }
      }

      if (!episodes.length) { showToast('Could not find any episode videos on this page.', 'error'); return; }

      const drama = await API.addDrama({
        title, description, poster,
        genre: 'Action',
        trending: true,
        episodes
      });

      showToast(`Imported "${drama.title}" (${episodes.length} episodes)! 🎉`, 'success');
      if (urlInput) urlInput.value = '';
      Admin._dramas = null;
      await renderDashboard(document.getElementById('main-content'));
    } catch (err) {
      console.error(err);
      showToast('Failed to parse the website data.', 'error');
    }
  });

  /* Upload JSON */
  const fileInput = document.getElementById('json-file-input');
  document.getElementById('btn-upload-json')?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(evt) {
      try {
        const drama = JSON.parse(evt.target.result);
        if (!drama.title) { showToast('Invalid JSON: missing title.', 'error'); return; }
        await API.addDrama(drama);
        showToast(`Imported "${drama.title}"! 🎉`, 'success');
        Admin._dramas = null;
        await renderDashboard(document.getElementById('main-content'));
      } catch (err) { showToast('Failed to parse JSON file.', 'error'); }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  /* Live search */
  document.getElementById('drama-search')?.addEventListener('input', e => {
    const q        = e.target.value.toLowerCase().trim();
    const filtered = (Admin._dramas || []).filter(d =>
      d.title.toLowerCase().includes(q) || d.genre.toLowerCase().includes(q)
    );
    const tbody = document.getElementById('dramas-tbody');
    if (tbody) { tbody.innerHTML = buildDramaRows(filtered); bindDramaRowEvents(); }
  });

  bindDramaRowEvents();
}

function bindDramaRowEvents() {
  document.querySelectorAll('.edit-drama-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const drama = (Admin._dramas || []).find(d => d.id === btn.dataset.id);
      if (drama) showDramaModal(drama);
    });
  });

  document.querySelectorAll('.delete-drama-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const drama = (Admin._dramas || []).find(d => d.id === btn.dataset.id);
      if (!drama) return;
      showConfirm(
        'Delete Drama',
        `Are you sure you want to permanently delete "<strong>${escHtml(drama.title)}</strong>" and all its episodes?`,
        async () => {
          await API.deleteDrama(btn.dataset.id);
          showToast('Drama deleted.', 'success');
          Admin._dramas = null;
          await renderDashboard(document.getElementById('main-content'));
        }
      );
    });
  });
}

/* ── Drama CRUD Modal ────────────────────────────────────────── */
function showDramaModal(drama) {
  const isEdit = !!drama;
  const cats   = Admin._categories || [];

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
          <textarea class="form-textarea" id="f-desc" placeholder="Short synopsis…" required maxlength="600">${isEdit ? escHtml(drama.description || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="f-poster">Poster Image URL</label>
          <input class="form-input" type="url" id="f-poster"
            value="${isEdit ? escHtml(drama.poster || '') : ''}"
            placeholder="https://…">
          <small style="color:var(--text-3);font-size:0.75rem;margin-top:4px;display:block;">Leave blank to use a random placeholder.</small>
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
          <button type="submit" class="btn btn-primary" id="drama-submit-btn">${isEdit ? 'Save Changes' : 'Create Drama'}</button>
        </div>
      </form>
    </div>`);

  const close = closeModal;
  document.getElementById('mc-close').addEventListener('click', close);
  document.getElementById('mc-cancel').addEventListener('click', close);

  document.getElementById('drama-form').addEventListener('submit', async e => {
    e.preventDefault();
    const title = document.getElementById('f-title').value.trim();
    const desc  = document.getElementById('f-desc').value.trim();
    if (!title || !desc) { showToast('Title and description are required.', 'error'); return; }

    const btn = document.getElementById('drama-submit-btn');
    btn.disabled = true;

    const payload = {
      title,
      description: desc,
      poster:   document.getElementById('f-poster').value.trim()
                || `https://picsum.photos/seed/${title.replace(/\s+/g, '')}/300/450`,
      genre:    document.getElementById('f-genre').value,
      trending: document.getElementById('f-trending').checked
    };

    try {
      if (isEdit) {
        await API.updateDrama(drama.id, payload);
        showToast('Drama updated! ✅', 'success');
      } else {
        await API.addDrama(payload);
        showToast('Drama created! 🎬', 'success');
      }
      close();
      Admin._dramas = null;
      await renderDashboard(document.getElementById('main-content'));
    } catch (err) {
      showToast('Error saving drama: ' + (err.message || 'unknown'), 'error');
      btn.disabled = false;
    }
  });
}

/* ============================================================
   EPISODES TAB
============================================================ */
function buildEpisodesTab() {
  const dramas = Admin._dramas || [];
  if (!dramas.length) {
    return `<div style="padding:48px;text-align:center;color:var(--text-2);">
      No dramas found. <a href="#" id="go-dramas" style="color:var(--accent-lt);">Add a drama first →</a>
    </div>`;
  }

  const selId  = Admin.activeDramaId || dramas[0].id;
  const drama  = dramas.find(d => d.id === selId) || dramas[0];
  Admin.activeDramaId = drama.id;

  return `
    <div class="admin-toolbar">
      <select class="search-input" id="drama-selector" style="width:auto;max-width:320px;">
        ${dramas.map(d => `<option value="${d.id}"${d.id === drama.id ? ' selected' : ''}>${escHtml(d.title)}</option>`).join('')}
      </select>
      <button class="btn btn-primary" id="btn-add-ep">+ Add Episode</button>
    </div>
    <div id="ep-table-wrapper">
      <div style="padding:40px;text-align:center;color:var(--text-2);">Loading episodes…</div>
    </div>`;
}

async function loadEpisodeTable() {
  const wrapper = document.getElementById('ep-table-wrapper');
  if (!wrapper) return;
  try {
    const drama = await API.getDrama(Admin.activeDramaId);
    if (drama) {
      wrapper.outerHTML = buildEpisodeTable(drama);
      bindEpisodeRowEvents(drama);
    }
  } catch (e) {
    const w = document.getElementById('ep-table-wrapper');
    if (w) w.innerHTML = `<p style="color:var(--text-2);padding:24px;">Failed to load episodes.</p>`;
  }
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
  document.getElementById('go-dramas')?.addEventListener('click', e => {
    e.preventDefault();
    Admin.activeTab = 'dramas';
    document.querySelectorAll('.admin-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === 'dramas');
    });
    renderTabBody();
  });

  document.getElementById('drama-selector')?.addEventListener('change', async e => {
    Admin.activeDramaId = e.target.value;
    await loadEpisodeTable();
  });

  document.getElementById('btn-add-ep')?.addEventListener('click', async () => {
    const drama = await API.getDrama(Admin.activeDramaId).catch(() => null);
    if (!drama) { showToast('Select a drama first.', 'error'); return; }
    showEpisodeModal(drama, null);
  });

  loadEpisodeTable();
}

function bindEpisodeRowEvents(drama) {
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
        async () => {
          await API.deleteEpisode(Admin.activeDramaId, btn.dataset.id);
          showToast('Episode deleted.', 'success');
          await loadEpisodeTable();
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
          <button type="submit" class="btn btn-primary" id="ep-submit-btn">${isEdit ? 'Save Changes' : 'Add Episode'}</button>
        </div>
      </form>
    </div>`);

  const close = closeModal;
  document.getElementById('mc-close').addEventListener('click', close);
  document.getElementById('mc-cancel').addEventListener('click', close);

  document.getElementById('episode-form').addEventListener('submit', async e => {
    e.preventDefault();
    const title = document.getElementById('ep-title').value.trim();
    if (!title) { showToast('Episode title is required.', 'error'); return; }

    const btn = document.getElementById('ep-submit-btn');
    btn.disabled = true;

    const payload = {
      title,
      videoUrl: document.getElementById('ep-url').value.trim()
    };

    try {
      if (isEdit) {
        await API.updateEpisode(drama.id, ep.id, payload);
        showToast('Episode updated! ✅', 'success');
      } else {
        await API.addEpisode(drama.id, payload);
        showToast('Episode added! ▶', 'success');
      }
      close();
      await loadEpisodeTable();
    } catch (err) {
      showToast('Error saving episode: ' + (err.message || 'unknown'), 'error');
      btn.disabled = false;
    }
  });
}

/* ── Modal Helpers ───────────────────────────────────────────── */
function openModal(html) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = html;
  overlay.classList.remove('hidden');
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  setTimeout(() => { overlay.querySelector('input, textarea, select, button')?.focus(); }, 50);
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}
