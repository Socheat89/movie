import React, { useState, useEffect } from 'react';
import { API } from '../api';
import { Embed } from '../embed';

export default function Watch({ dramaId, onNavigate }) {
  const [drama, setDrama] = useState(null);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return (
    <div className="watch-layout page-enter" style={{ padding: '24px 64px' }}>
      {/* Video Column */}
      <div className="video-column">
        <div className="player-wrapper" id="player-wrapper">
          {renderPlayer(activeEpisode?.videoUrl)}
        </div>

        <div className="drama-info">
          <h1 className="drama-info-title">{drama.title}</h1>
          <div className="drama-info-meta">
            <span className="genre-badge">{drama.genre}</span>
            <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{episodes.length} Episodes</span>
            {drama.trending && <span className="trending-badge">🔥 Trending</span>}
            {activeEpisode && (
              <span style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>Now: {activeEpisode.title}</span>
            )}
          </div>
          <p className="drama-info-desc">{drama.description || 'No description available.'}</p>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('/')}>
              ← All Dramas
            </button>
          </div>
        </div>
      </div>

      {/* Episode Sidebar */}
      <div className="episode-column">
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
      </div>
    </div>
  );
}
