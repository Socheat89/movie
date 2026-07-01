import React, { useState, useEffect } from 'react';
import { API } from '../api';

export default function Home({ onNavigate }) {
  const [dramas, setDramas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dramasRes, categoriesRes] = await Promise.all([
          API.getDramas(),
          API.getCategories()
        ]);
        setDramas(dramasRes);
        setCategories(categoriesRes);
        setError(false);
      } catch (err) {
        console.error('[Home] Failed to load data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const trending = dramas.filter(d => d.trending);
  const filteredDramas = selectedGenre === 'All'
    ? dramas
    : dramas.filter(d => d.genre === selectedGenre);

  // Auto-scroll slider
  useEffect(() => {
    if (!trending.length || loading) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.min(trending.length, 6));
    }, 5200);
    return () => clearInterval(interval);
  }, [trending.length, loading]);

  // View formatting helper
  const formatViews = (count) => {
    if (!count) return '0 views';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M views';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K views';
    return count + ' views';
  };

  if (loading) {
    return (
      <div className="page-enter">
        <div className="skeleton sk-hero"></div>
        <div className="content-section">
          <div className="genre-filters" style={{ marginBottom: '36px' }}>
            {Array(7).fill(0).map((_, i) => (
              <span key={i} className="skeleton sk-pill" style={{ margin: '4px' }}></span>
            ))}
          </div>
          <div className="dramas-grid">
            {Array(10).fill(0).map((_, i) => (
              <div key={i}>
                <div className="skeleton sk-poster"></div>
                <div className="skeleton sk-text"></div>
                <div className="skeleton sk-text-s"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>Cannot connect to server</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Make sure the Laravel backend is running.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>↺ Retry</button>
      </div>
    );
  }

  const sliderItems = trending.slice(0, 6);

  return (
    <div className="page-enter">
      {/* Hero Section / Slider */}
      <section className="hero-section">
        {sliderItems.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
            No trending dramas yet.
          </div>
        ) : (
          sliderItems.map((d, i) => (
            <div
              key={d.id}
              className={`hero-slide ${i === currentSlide ? 'active' : ''}`}
              style={{ pointerEvents: i === currentSlide ? 'auto' : 'none' }}
            >
              <div className="hero-bg" style={{ backgroundImage: `url('${d.poster}')` }}></div>
              <div className="hero-gradient"></div>
              <div className="hero-content">
                <div className="hero-badge">🔥 Trending</div>
                <h1 className="hero-title">{d.title}</h1>
                <p className="hero-desc">{d.description || 'No description available.'}</p>
                <div className="hero-actions">
                  <button className="btn btn-primary" onClick={() => onNavigate(`/watch/${d.id}`)}>
                    ▶ Watch Now
                  </button>
                  <div className="hero-meta" style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.88rem' }}>
                    <span className="genre-badge">{d.genre}</span>
                    <span>{d.year || '2025'}</span>
                    <span style={{ color: '#ffb800', fontWeight: 'bold' }}>★ {d.rating || '8.0'}</span>
                    <span style={{ color: 'var(--text-3)' }}>{formatViews(d.views)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {sliderItems.length > 1 && (
          <>
            <button
              className="hero-arrow prev"
              onClick={() => setCurrentSlide(prev => (prev - 1 + sliderItems.length) % sliderItems.length)}
            >
              ‹
            </button>
            <button
              className="hero-arrow next"
              onClick={() => setCurrentSlide(prev => (prev + 1) % sliderItems.length)}
            >
              ›
            </button>
            <div className="hero-dots">
              {sliderItems.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                ></button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Main Content Section */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">All <span>Dramas</span></h2>
          <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{filteredDramas.length} titles</span>
        </div>

        {/* Genre Filters */}
        <div className="genre-filters" role="group" aria-label="Filter by genre">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              className={`genre-pill ${selectedGenre === cat ? 'active' : ''}`}
              onClick={() => setSelectedGenre(cat)}
              aria-selected={selectedGenre === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dramas Grid */}
        <div className="dramas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
          {filteredDramas.length === 0 ? (
            <div className="no-results" style={{ gridColumn: '1/-1', padding: '40px' }}>
              <div className="no-results-icon" style={{ fontSize: '3rem', textAlign: 'center' }}>🎬</div>
              <p style={{ textAlign: 'center', color: 'var(--text-2)' }}>No dramas found in this category.</p>
            </div>
          ) : (
            filteredDramas.map((d) => (
              <article
                key={d.id}
                className="drama-card"
                onClick={() => onNavigate(`/watch/${d.id}`)}
                role="button"
                tabIndex="0"
                aria-label={`Watch ${d.title}`}
                style={{ cursor: 'pointer', background: 'transparent', transition: 'all 0.3s ease' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate(`/watch/${d.id}`);
                  }
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', aspectRatio: '2/3', marginBottom: '12px', border: '1px solid var(--border)' }}>
                  <img
                    className="drama-card-poster loaded"
                    src={d.poster}
                    alt={d.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${d.id}/300/450`;
                    }}
                  />
                  <div className="drama-card-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.3s ease' }}>
                    <button
                      className="overlay-watch-btn"
                      style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '100px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`/watch/${d.id}`);
                      }}
                    >
                      ▶ Play
                    </button>
                  </div>
                </div>
                <div className="drama-card-info" style={{ padding: '0 4px' }}>
                  <h3 className="drama-card-title" style={{ fontSize: '0.96rem', fontWeight: 600, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                    {d.title}
                  </h3>
                  <div className="drama-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                    <span>{d.year || '2025'}</span>
                    <span>·</span>
                    <span style={{ color: '#ffb800', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      ★ {d.rating || '8.0'}
                    </span>
                    <span>·</span>
                    <span style={{ color: 'var(--text-3)' }}>{d.episodeCount || 0} EPs</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
