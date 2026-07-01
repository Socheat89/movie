/* =============================================================
   DramaStream — Home Page (API-driven)
   Hero Slider + Genre Filters + Drama Grid
============================================================= */

async function renderHome() {
  const main = document.getElementById('main-content');

  /* Skeleton while loading */
  main.innerHTML = `
    <div class="skeleton sk-hero"></div>
    <div class="content-section">
      <div class="genre-filters" style="margin-bottom:36px;">
        ${Array(7).fill('<span class="skeleton sk-pill" style="margin:4px;"></span>').join('')}
      </div>
      <div class="dramas-grid">
        ${Array(10).fill(`
          <div>
            <div class="skeleton sk-poster"></div>
            <div class="skeleton sk-text"></div>
            <div class="skeleton sk-text-s"></div>
          </div>`).join('')}
      </div>
    </div>`;

  try {
    const [dramas, categories] = await Promise.all([
      API.getDramas(),
      API.getCategories()
    ]);

    const trending = dramas.filter(d => d.trending);
    const allCats  = ['All', ...categories];

    main.innerHTML = `
      <section class="hero-section" id="hero-section">
        ${buildHeroSlider(trending)}
      </section>

      <section class="content-section page-enter">
        <div class="section-header">
          <h2 class="section-title">All <span>Dramas</span></h2>
          <span style="color:var(--text-2);font-size:0.85rem;">${dramas.length} titles</span>
        </div>

        <div class="genre-filters" role="group" aria-label="Filter by genre">
          ${allCats.map((cat, i) => `
            <button
              class="genre-pill${i === 0 ? ' active' : ''}"
              data-genre="${cat}"
              role="tab"
              aria-selected="${i === 0}"
            >${cat}</button>`).join('')}
        </div>

        <div class="dramas-grid" id="dramas-grid">
          ${buildDramaCards(dramas)}
        </div>
      </section>`;

    initHeroSlider();
    initGenreFilters(dramas);
    initLazyLoad();

  } catch (err) {
    console.error('[Home] Failed to load dramas:', err);
    main.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px;">
        <div style="font-size:3rem;opacity:0.3;margin-bottom:16px;">⚠️</div>
        <h2 style="font-weight:700;margin-bottom:8px;">Cannot connect to server</h2>
        <p style="color:var(--text-2);font-size:0.9rem;margin-bottom:24px;">
          Make sure the backend is running at <code>${API_BASE_URL}</code>
        </p>
        <button class="btn btn-primary" onclick="renderHome()">↺ Retry</button>
      </div>`;
  }
}

/* ── Hero Slider ─────────────────────────────────────────────── */
function buildHeroSlider(dramas) {
  if (!dramas.length) {
    return `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-2);">
      No trending dramas yet.
    </div>`;
  }

  const items = dramas.slice(0, 6);

  const slides = items.map((d, i) => `
    <div class="hero-slide${i === 0 ? ' active' : ''}" data-slide="${i}" id="hs-${i}">
      <div class="hero-bg" style="background-image:url('${d.poster}');"></div>
      <div class="hero-gradient"></div>
      <div class="hero-content">
        <div class="hero-badge">🔥 Trending</div>
        <h1 class="hero-title">${escHtml(d.title)}</h1>
        <p class="hero-desc">${escHtml(d.description || '')}</p>
        <div class="hero-actions">
          <a href="#/watch/${d.id}" class="btn btn-primary" id="hero-watch-${i}">▶ Watch Now</a>
          <div class="hero-meta">
            <span class="genre-badge">${escHtml(d.genre)}</span>
            <span>${d.episodeCount || 0} episodes</span>
          </div>
        </div>
      </div>
    </div>`).join('');

  const dots = items.map((_, i) => `
    <button class="hero-dot${i === 0 ? ' active' : ''}" data-dot="${i}" aria-label="Slide ${i + 1}"></button>`
  ).join('');

  return `
    ${slides}
    <button class="hero-arrow prev" id="hero-prev" aria-label="Previous">‹</button>
    <button class="hero-arrow next" id="hero-next" aria-label="Next">›</button>
    <div class="hero-dots" role="tablist">${dots}</div>`;
}

/* ── Drama Cards ─────────────────────────────────────────────── */
function buildDramaCards(dramas) {
  if (!dramas.length) {
    return `<div class="no-results">
      <div class="no-results-icon">🎬</div>
      <p>No dramas found in this category.</p>
    </div>`;
  }

  return dramas.map(d => `
    <article
      class="drama-card"
      onclick="navigate('/watch/${d.id}')"
      role="button"
      tabindex="0"
      aria-label="Watch ${escHtml(d.title)}"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();navigate('/watch/${d.id}');}"
    >
      <img
        class="drama-card-poster lazy-img"
        data-src="${d.poster}"
        src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        alt="${escHtml(d.title)}"
        loading="lazy"
      />
      <div class="drama-card-overlay">
        <button
          class="overlay-watch-btn"
          onclick="event.stopPropagation();navigate('/watch/${d.id}');"
          tabindex="-1"
        >▶ Watch Now</button>
      </div>
      <div class="drama-card-info">
        <h3 class="drama-card-title">${escHtml(d.title)}</h3>
        <div class="drama-card-meta">
          <span class="genre-badge">${escHtml(d.genre)}</span>
          <span class="episode-count">${d.episodeCount || 0} eps</span>
          ${d.trending ? '<span style="font-size:0.7rem;">🔥</span>' : ''}
        </div>
      </div>
    </article>`).join('');
}

/* ── Slider Logic ────────────────────────────────────────────── */
function initHeroSlider() {
  const slides  = document.querySelectorAll('.hero-slide');
  const dots    = document.querySelectorAll('.hero-dot');
  const section = document.getElementById('hero-section');
  if (!slides.length) return;

  let current = 0;
  let timer   = null;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = ((idx % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() { timer = setInterval(() => goTo(current + 1), 5200); }
  function stopAuto()  { clearInterval(timer); }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
  });

  document.getElementById('hero-prev')?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  document.getElementById('hero-next')?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  section?.addEventListener('mouseenter', stopAuto);
  section?.addEventListener('mouseleave', startAuto);

  let touchStartX = 0;
  section?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  section?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });

  startAuto();
}

/* ── Genre Filters ───────────────────────────────────────────── */
function initGenreFilters(allDramas) {
  const pills = document.querySelectorAll('.genre-pill');
  const grid  = document.getElementById('dramas-grid');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => { p.classList.remove('active'); p.setAttribute('aria-selected', 'false'); });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const genre    = pill.dataset.genre;
      const filtered = genre === 'All' ? allDramas : allDramas.filter(d => d.genre === genre);

      grid.style.cssText = 'opacity:0;transform:translateY(10px);';
      setTimeout(() => {
        grid.innerHTML    = buildDramaCards(filtered);
        grid.style.cssText = 'opacity:1;transform:translateY(0);transition:opacity 0.3s ease,transform 0.3s ease;';
        initLazyLoad();
      }, 180);
    });
  });
}

/* ── Lazy Load ───────────────────────────────────────────────── */
function initLazyLoad() {
  const imgs = document.querySelectorAll('img.lazy-img[data-src]');
  if (!imgs.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.dataset.src;
        if (!src) return;
        img.src    = src;
        img.onload  = () => img.classList.add('loaded');
        img.onerror = () => {
          img.src = `https://picsum.photos/seed/${Math.floor(Math.random() * 9999)}/300/450`;
          img.classList.add('loaded');
        };
        observer.unobserve(img);
      });
    }, { rootMargin: '160px 0px' });
    imgs.forEach(img => observer.observe(img));
  } else {
    imgs.forEach(img => { img.src = img.dataset.src; img.classList.add('loaded'); });
  }
}

/* ── Utility: HTML escape ────────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
