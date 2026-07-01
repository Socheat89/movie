/* =============================================================
   DramaStream — Watch Page (API-driven)
   Video Player + Episode Sidebar + Drama Info
============================================================= */

async function renderWatch(dramaId) {
  const main = document.getElementById('main-content');

  /* ── Skeleton ──────────────────────────────────────────────── */
  main.innerHTML = `
    <div class="watch-layout">
      <div class="video-column">
        <div class="skeleton" style="aspect-ratio:16/9;width:100%;border-radius:var(--r-lg);"></div>
        <div style="padding-top:24px;">
          <div class="skeleton sk-text" style="height:28px;width:55%;"></div>
          <div class="skeleton sk-text" style="width:90%;"></div>
          <div class="skeleton sk-text" style="width:90%;"></div>
          <div class="skeleton sk-text-s" style="width:70%;"></div>
        </div>
      </div>
      <div class="episode-column">
        <div class="skeleton" style="height:500px;border-radius:var(--r-lg);"></div>
      </div>
    </div>`;

  if (!dramaId) { showNotFound(main); return; }

  try {
    const drama = await API.getDrama(dramaId);
    if (!drama) { showNotFound(main); return; }

    const episodes = drama.episodes || [];
    const firstEp  = episodes[0] || null;
    const activeId = firstEp?.id || null;

    main.innerHTML = buildWatchLayout(drama, firstEp, activeId);
    bindEpisodeClicks(drama);
    updateActiveLink();
  } catch (err) {
    console.error('[Watch] Failed to load drama:', err);
    showNotFound(main);
  }
}

/* ── Not Found State ─────────────────────────────────────────── */
function showNotFound(main) {
  main.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px;">
      <div style="font-size:4rem;opacity:0.25;margin-bottom:20px;">🎬</div>
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:8px;">Drama Not Found</h2>
      <p style="color:var(--text-2);font-size:0.9rem;margin-bottom:28px;">
        This drama doesn't exist or may have been removed.
      </p>
      <a href="#/" class="btn btn-primary">← Back to Home</a>
    </div>`;
}

/* ── Full Watch Layout ───────────────────────────────────────── */
function buildWatchLayout(drama, activeEp, activeEpId) {
  const episodes = drama.episodes || [];

  return `
    <div class="watch-layout page-enter">

      <!-- Video Column -->
      <div class="video-column">
        <div class="player-wrapper" id="player-wrapper">
          ${Embed.renderPlayer(activeEp?.videoUrl)}
        </div>

        <div class="drama-info">
          <h1 class="drama-info-title">${escHtml(drama.title)}</h1>
          <div class="drama-info-meta">
            <span class="genre-badge">${escHtml(drama.genre)}</span>
            <span style="color:var(--text-2);font-size:0.85rem;">${episodes.length} Episodes</span>
            ${drama.trending ? '<span class="trending-badge">🔥 Trending</span>' : ''}
            ${activeEp ? `<span style="color:var(--text-2);font-size:0.82rem;">Now: ${escHtml(activeEp.title)}</span>` : ''}
          </div>
          <p class="drama-info-desc">${escHtml(drama.description || '')}</p>

          <div style="margin-top:24px;display:flex;gap:10px;flex-wrap:wrap;">
            <a href="#/" class="btn btn-ghost btn-sm">← All Dramas</a>
          </div>
        </div>
      </div>

      <!-- Episode Sidebar -->
      <div class="episode-column">
        <div class="episode-list-box">
          <div class="episode-list-header">
            <span>Episodes</span>
            <span style="color:var(--text-2);font-size:0.82rem;font-weight:400;">${episodes.length} total</span>
          </div>
          <div class="episode-list-scroll" id="episode-list" role="list">
            ${buildEpisodeList(episodes, activeEpId)}
          </div>
        </div>
      </div>

    </div>`;
}

/* ── Episode List HTML ───────────────────────────────────────── */
function buildEpisodeList(episodes, activeEpId) {
  if (!episodes.length) {
    return `<div style="padding:48px 22px;text-align:center;color:var(--text-2);font-size:0.875rem;">
      No episodes available yet.<br>
      <small style="color:var(--text-3);">Check back later or add via Admin Panel.</small>
    </div>`;
  }

  return episodes.map((ep, i) => `
    <div
      class="episode-item${ep.id === activeEpId ? ' active' : ''}"
      data-ep-id="${ep.id}"
      role="listitem"
      tabindex="0"
      aria-label="Play ${escHtml(ep.title)}"
      id="ep-item-${ep.id}"
    >
      <div class="ep-num">${i + 1}</div>
      <span class="ep-title">${escHtml(ep.title)}</span>
      ${ep.id === activeEpId ? '<span class="ep-now-playing">▶ Playing</span>' : ''}
    </div>`).join('');
}

/* ── Bind Episode Click Events ───────────────────────────────── */
function bindEpisodeClicks(drama) {
  const episodes = drama.episodes || [];
  const listEl   = document.getElementById('episode-list');
  if (!listEl) return;

  listEl.addEventListener('click', e => {
    const item = e.target.closest('.episode-item');
    if (!item) return;
    const ep = episodes.find(e => e.id === item.dataset.epId);
    if (ep) switchEpisode(ep, ep.id);
  });

  listEl.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const item = e.target.closest('.episode-item');
    if (!item) return;
    e.preventDefault();
    item.click();
  });
}

/* ── Switch Episode ──────────────────────────────────────────── */
function switchEpisode(ep, epId) {
  const playerEl = document.getElementById('player-wrapper');
  if (playerEl) {
    playerEl.style.cssText = 'opacity:0;transition:opacity 0.25s ease;';
    setTimeout(() => {
      playerEl.innerHTML    = Embed.renderPlayer(ep.videoUrl);
      playerEl.style.cssText = 'opacity:1;transition:opacity 0.35s ease;';
    }, 250);
  }

  document.querySelectorAll('.episode-item').forEach(item => {
    item.classList.remove('active');
    const nowPlaying = item.querySelector('.ep-now-playing');
    if (nowPlaying) nowPlaying.remove();
  });

  const activeItem = document.getElementById(`ep-item-${epId}`);
  if (activeItem) {
    activeItem.classList.add('active');
    activeItem.insertAdjacentHTML('beforeend', '<span class="ep-now-playing">▶ Playing</span>');
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
