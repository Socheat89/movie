import React, { useState, useEffect } from 'react';
import { API } from '../api';
import { Embed } from '../embed';

export default function Watch({ dramaId, onNavigate }) {
  const [drama, setDrama] = useState(null);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sponsorQrUrl, setSponsorQrUrl] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadDrama() {
      if (!dramaId) return;
      try {
        setLoading(true);
        const data = await API.getDrama(dramaId);
        if (data) {
          setDrama(data);
          setActiveEpisode(data.episodes && data.episodes.length > 0 ? data.episodes[0] : null);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('[Watch] Failed to load drama:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadDrama();
  }, [dramaId]);

  useEffect(() => {
    API.getSponsorQr().then(res => {
      if (res && res.qr_url) {
        setSponsorQrUrl(res.qr_url);
      }
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!dramaId) return;
    API.getDramas().then(allDramas => {
      const filtered = allDramas.filter(d => d.id !== dramaId);
      const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);
      setRecommendations(shuffled);
    }).catch(err => console.error(err));
  }, [dramaId]);

  if (loading) {
    return (
      <div className="watch-layout page-enter" style={{ padding: '24px 64px' }}>
        <div className="video-column">
          <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%', borderRadius: 'var(--r-lg)' }}></div>
          <div style={{ paddingTop: '24px' }}>
            <div className="skeleton sk-text" style={{ height: '28px', width: '55%' }}></div>
            <div className="skeleton sk-text" style={{ width: '90%' }}></div>
            <div className="skeleton sk-text" style={{ width: '90%' }}></div>
            <div className="skeleton sk-text-s" style={{ width: '70%' }}></div>
          </div>
        </div>
        <div className="episode-column">
          <div className="skeleton" style={{ height: '500px', borderRadius: 'var(--r-lg)' }}></div>
        </div>
      </div>
    );
  }

  if (error || !drama) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '4rem', opacity: 0.25, marginBottom: '20px' }}>🎬</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Drama Not Found</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '28px' }}>
          This drama doesn't exist or may have been removed.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('/')}>← Back to Home</button>
      </div>
    );
  }

  const episodes = drama.episodes || [];

  const handleEpisodeChange = (ep) => {
    setActiveEpisode(ep);
  };

  const renderPlayer = (url) => {
    if (!url) {
      return (
        <div className="player-no-video">
          <div className="nvid-icon">▶</div>
          <p>No video selected</p>
          <small>Select an episode from the list to start watching.</small>
        </div>
      );
    }

    const type = Embed.getType(url);

    if (type === 'direct') {
      const cleanUrl = url.replace(/^httpS:\/\//i, 'https://');
      return (
        <video
          key={url}
          controls
          autoPlay
          preload="auto"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: '100%', height: '100%', borderRadius: 'var(--r-lg)', objectFit: 'contain' }}
        >
          <source src={cleanUrl} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      );
    }

    if (type === 'facebook') {
      return (
        <div className="player-no-video" style={{ gap: '18px' }}>
          <div style={{ fontSize: '3rem' }}>📘</div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Facebook Video</p>
          <small style={{ color: 'var(--text-2)', textAlign: 'center', lineHeight: '1.7', maxWidth: '320px' }}>
            Facebook videos cannot be embedded directly.<br />
            Click below to watch it on Facebook.
          </small>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '4px', gap: '10px', fontSize: '0.95rem', padding: '13px 28px' }}
          >
            <span style={{ fontSize: '1.1rem' }}>▶</span> Watch on Facebook
          </a>
        </div>
      );
    }

    const embedUrl = Embed.getEmbedUrl(url);
    return (
      <iframe
        key={url}
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        title="Episode Player"
        style={{ width: '100%', height: '100%', borderRadius: 'var(--r-lg)' }}
      ></iframe>
    );
  };

  const formatViewsCount = (count) => {
    if (!count) return '0 views';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M views';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K views';
    return count + ' views';
  };

  const getQrImageUrl = (url) => {
    if (!url) return '';
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)/i.test(url) || url.includes('picsum.photos');
    if (isImage) {
      return url;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
  };

  return (
    <div className="watch-layout page-enter" style={{ padding: '24px 64px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
      
      {/* Top Media Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '28px', width: '100%', alignItems: 'start' }} className="watch-main-grid">
        {/* Video Column */}
        <div className="video-column">
          <div className="player-wrapper" id="player-wrapper">
            {renderPlayer(activeEpisode?.videoUrl)}
          </div>

          <div className="drama-info">
            <h1 className="drama-info-title">{drama.title}</h1>
            <div className="drama-info-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <span className="genre-badge">{drama.genre}</span>
              <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{drama.year || '2025'}</span>
              <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '0.85rem' }}>★ {drama.rating || '8.0'}</span>
              <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>{formatViewsCount(drama.views)}</span>
              {drama.trending && <span className="trending-badge">🔥 Trending</span>}
              {activeEpisode && (
                <span style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>Now Playing: {activeEpisode.title}</span>
              )}
            </div>
            <p className="drama-info-desc" style={{ marginTop: '16px', lineHeight: '1.7', color: 'var(--text-2)' }}>
              {drama.description || 'No description available.'}
            </p>

            <div style={{ marginTop: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('/')}>
                ← Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Episode Sidebar & Sponsor QR */}
        <div className="episode-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="episode-list-box">
            <div className="episode-list-header">
              <span>Episodes</span>
              <span style={{ color: 'var(--text-2)', fontSize: '0.82rem', fontWeight: 400 }}>{episodes.length} total</span>
            </div>
            <div className="episode-list-scroll" role="list">
              {episodes.length === 0 ? (
                <div style={{ padding: '48px 22px', textAlign: 'center', color: 'var(--text-2)', fontSize: '0.875rem' }}>
                  No episodes available yet.<br />
                  <small style={{ color: 'var(--text-3)' }}>Check back later or add via Admin Panel.</small>
                </div>
              ) : (
                episodes.map((ep, i) => (
                  <div
                    key={ep.id}
                    className={`episode-item ${activeEpisode?.id === ep.id ? 'active' : ''}`}
                    onClick={() => handleEpisodeChange(ep)}
                    role="listitem"
                    tabIndex="0"
                    aria-label={`Play ${ep.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEpisodeChange(ep);
                      }
                    }}
                  >
                    <div className="ep-num">{i + 1}</div>
                    <span className="ep-title">{ep.title}</span>
                    {activeEpisode?.id === ep.id && <span className="ep-now-playing">▶ Playing</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sponsor QR Section */}
          {sponsorQrUrl && (
            <div className="sponsor-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>☕ Sponsor Server</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.78rem', lineHeight: '1.5', marginBottom: '16px', maxWidth: '240px' }}>
                Enjoying the stream? Help us pay for server and hosting costs by scanning the QR code below.
              </p>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', marginBottom: '14px', overflow: 'hidden' }}>
                <img src={getQrImageUrl(sponsorQrUrl)} alt="Sponsor QR Code" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-lt)', fontWeight: 600 }}>Thank you for your support! ❤️</span>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Section */}
      {recommendations.length > 0 && (
        <section className="content-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', width: '100%' }}>
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <h2 className="section-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Recommended <span>Dramas</span></h2>
          </div>
          
          <div className="dramas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
            {recommendations.map((d) => (
              <article
                key={d.id}
                className="drama-card"
                onClick={() => onNavigate(`/watch/${d.id}`)}
                role="button"
                tabIndex="0"
                style={{ cursor: 'pointer', background: 'transparent' }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', aspectRatio: '2/3', marginBottom: '12px', border: '1px solid var(--border)' }}>
                  <img
                    className="drama-card-poster loaded"
                    src={d.poster}
                    alt={d.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${d.id}/300/450`;
                    }}
                  />
                </div>
                <div className="drama-card-info" style={{ padding: '0 4px' }}>
                  <h3 className="drama-card-title" style={{ fontSize: '0.96rem', fontWeight: 600, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                    {d.title}
                  </h3>
                  <div className="drama-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                    <span>{d.year || '2025'}</span>
                    <span>·</span>
                    <span style={{ color: '#ffb800', fontWeight: 'bold' }}>★ {d.rating || '8.0'}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--text-3)' }}>{d.episodeCount || 0} EPs</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
