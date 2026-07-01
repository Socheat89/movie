import React, { useState, useEffect, useRef } from 'react';
import { API } from '../api';
import { Embed } from '../embed';

/* ─── local star-rating & comment store ─── */
const getStoredRating = (id) => {
  try { return parseInt(localStorage.getItem(`rating_${id}`)) || 0; } catch { return 0; }
};
const setStoredRating = (id, v) => {
  try { localStorage.setItem(`rating_${id}`, v); } catch {}
};
const getComments = (id) => {
  try { return JSON.parse(localStorage.getItem(`comments_${id}`)) || []; } catch { return []; }
};
const addComment = (id, comment) => {
  try {
    const all = getComments(id);
    const updated = [comment, ...all].slice(0, 50);
    localStorage.setItem(`comments_${id}`, JSON.stringify(updated));
    return updated;
  } catch { return []; }
};

export default function Watch({ dramaId, onNavigate }) {
  const [drama, setDrama]           = useState(null);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [sponsorQrUrl, setSponsorQrUrl]   = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Favorites
  const [isFavorite, setIsFavorite] = useState(false);

  // Rating
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');

  // Share toast
  const [shareToast, setShareToast] = useState(false);

  // Sidebar tab: 'episodes' | 'qr'
  const [sideTab, setSideTab] = useState('episodes');

  /* ── load favorites ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('favorites');
      const favs  = saved ? JSON.parse(saved) : [];
      setIsFavorite(favs.includes(dramaId));
    } catch {}
    setUserRating(getStoredRating(dramaId));
    setComments(getComments(dramaId));
  }, [dramaId]);

  const toggleFavorite = () => {
    try {
      const saved = localStorage.getItem('favorites');
      let favs = saved ? JSON.parse(saved) : [];
      if (favs.includes(dramaId)) {
        favs = favs.filter(id => id !== dramaId);
        setIsFavorite(false);
      } else {
        favs.push(dramaId);
        setIsFavorite(true);
      }
      localStorage.setItem('favorites', JSON.stringify(favs));
    } catch {}
  };

  /* ── load drama ── */
  useEffect(() => {
    async function loadDrama() {
      if (!dramaId) return;
      try {
        setLoading(true);
        const data = await API.getDrama(dramaId);
        if (data) {
          setDrama(data);
          setActiveEpisode(data.episodes?.length > 0 ? data.episodes[0] : null);
          setError(false);
        } else setError(true);
      } catch { setError(true); }
      finally { setLoading(false); }
    }
    loadDrama();
  }, [dramaId]);

  useEffect(() => {
    API.getSponsorQr().then(res => {
      if (res?.qr_url) setSponsorQrUrl(res.qr_url);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!dramaId) return;
    API.getDramas().then(all => {
      const filtered = all.filter(d => d.id !== dramaId);
      setRecommendations(filtered.sort(() => .5 - Math.random()).slice(0, 6));
    }).catch(() => {});
  }, [dramaId]);

  /* ── helpers ── */
  const formatViews = (count) => {
    if (!count) return '0 views';
    if (count >= 1e6) return (count / 1e6).toFixed(1) + 'M views';
    if (count >= 1e3) return (count / 1e3).toFixed(1) + 'K views';
    return count + ' views';
  };

  const getQrImageUrl = (url) => {
    if (!url) return '';
    if (/\.(jpg|jpeg|png|webp|gif|svg)/i.test(url) || url.includes('picsum.photos')) return url;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const submitRating = (star) => {
    setUserRating(star);
    setStoredRating(dramaId, star);
    setRatingSubmitted(true);
    setTimeout(() => setRatingSubmitted(false), 2000);
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      name: commentName.trim() || 'Anonymous',
      text: commentText.trim(),
      time: new Date().toLocaleString('km-KH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
    };
    const updated = addComment(dramaId, newComment);
    setComments(updated);
    setCommentText('');
  };

  const renderPlayer = (url) => {
    if (!url) return (
      <div className="player-no-video">
        <div className="nvid-icon">▶</div>
        <p>No video selected</p>
        <small>Select an episode to start watching.</small>
      </div>
    );

    const type = Embed.getType(url);

    if (type === 'direct') {
      const cleanUrl = url.replace(/^httpS:\/\//i, 'https://');
      return (
        <video key={url} controls autoPlay preload="auto" controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
          <source src={cleanUrl} type="video/mp4" />
        </video>
      );
    }

    if (type === 'facebook') {
      return (
        <div className="player-no-video" style={{ gap: '18px' }}>
          <div style={{ fontSize: '3rem' }}>📘</div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Facebook Video</p>
          <small style={{ color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.7, maxWidth: 320 }}>
            Facebook videos cannot be embedded directly.<br />Click below to watch on Facebook.
          </small>
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary"
            style={{ marginTop: 4, fontSize: '0.95rem', padding: '13px 28px' }}>
            ▶ Watch on Facebook
          </a>
        </div>
      );
    }

    const embedUrl = Embed.getEmbedUrl(url);
    return (
      <iframe key={url} src={embedUrl} frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen loading="lazy" title="Episode Player"
        style={{ width: '100%', height: '100%' }} />
    );
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 28px 96px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28 }}>
        <div>
          <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 'var(--r-lg)' }}></div>
          <div style={{ paddingTop: 24 }}>
            <div className="skeleton sk-text" style={{ height: 28, width: '55%' }}></div>
            <div className="skeleton sk-text" style={{ width: '90%' }}></div>
          </div>
        </div>
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--r-lg)' }}></div>
      </div>
    </div>
  );

  if (error || !drama) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: '4rem', opacity: 0.25, marginBottom: 20 }}>🎬</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Drama Not Found</h2>
      <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: 28 }}>This drama doesn't exist or may have been removed.</p>
      <button className="btn btn-primary" onClick={() => onNavigate('/')}>← Back to Home</button>
    </div>
  );

  const episodes = drama.episodes || [];

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 28px 96px' }}>

      {/* ── Main 2-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 28, alignItems: 'start' }}>

        {/* ══ LEFT: Video + Info ══ */}
        <div>
          {/* Video Player */}
          <div className="player-wrapper" id="player-wrapper">
            {renderPlayer(activeEpisode?.videoUrl)}
          </div>

          {/* Title + Action bar */}
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 className="drama-info-title" style={{ margin: '0 0 8px' }}>{drama.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <span className="genre-badge">{drama.genre}</span>
                <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{drama.year || '2025'}</span>
                <span style={{ color: '#ffb800', fontWeight: 700, fontSize: '0.85rem' }}>★ {drama.rating || '8.0'}</span>
                <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>{formatViews(drama.views)}</span>
                {drama.trending && <span className="trending-badge">🔥 Trending</span>}
                {activeEpisode && <span style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>▶ {activeEpisode.title}</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={toggleFavorite} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: isFavorite ? 'rgba(255,75,75,0.12)' : 'var(--bg-card)',
                border: `1px solid ${isFavorite ? 'rgba(255,75,75,0.5)' : 'var(--border)'}`,
                borderRadius: 100, padding: '8px 16px', fontSize: '0.82rem',
                color: isFavorite ? '#ff4b4b' : 'var(--text-2)', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                {isFavorite ? '❤️ Saved' : '🤍 Save'}
              </button>

              <div style={{ position: 'relative' }}>
                <button onClick={handleShare} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 100, padding: '8px 16px', fontSize: '0.82rem',
                  color: 'var(--text-2)', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  🔗 Share
                </button>
                {shareToast && (
                  <span style={{
                    position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)', color: '#fff', fontSize: '0.78rem', fontWeight: 600,
                    padding: '5px 12px', borderRadius: 100, whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px var(--accent-glow)', animation: 'fadeIn 0.2s ease'
                  }}>
                    ✓ Link copied!
                  </span>
                )}
              </div>

              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('/')}>← Home</button>
            </div>
          </div>

          {/* Description */}
          <p className="drama-info-desc" style={{ marginTop: 14, lineHeight: 1.75 }}>
            {drama.description || 'No description available.'}
          </p>

          {/* ─── User Rating ─── */}
          <div style={{
            marginTop: 28, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', padding: '20px 24px'
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700 }}>⭐ Rate this Drama</h3>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => submitRating(star)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                    fontSize: '1.7rem', lineHeight: 1,
                    color: (hoverRating || userRating) >= star ? '#ffb800' : 'var(--bg-3)',
                    transition: 'color 0.15s ease, transform 0.1s ease',
                    transform: (hoverRating || userRating) >= star ? 'scale(1.2)' : 'scale(1)'
                  }}>
                  ★
                </button>
              ))}
              <span style={{ marginLeft: 10, fontSize: '0.85rem', color: 'var(--text-2)' }}>
                {userRating ? `You rated ${userRating}/5` : 'Tap to rate'}
              </span>
            </div>
            {ratingSubmitted && (
              <div style={{
                marginTop: 10, fontSize: '0.83rem', color: 'var(--accent-lt)', fontWeight: 600,
                animation: 'fadeIn 0.3s ease'
              }}>
                ✓ Thanks for your rating! 🎉
              </div>
            )}
          </div>

          {/* ─── Comments Section ─── */}
          <div style={{
            marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', padding: '20px 24px'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>
              💬 Comments <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '0.85rem' }}>({comments.length})</span>
            </h3>

            {/* Comment form */}
            <form onSubmit={submitComment} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                maxLength={40}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
                  padding: '10px 14px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none'
                }}
              />
              <textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
                maxLength={500}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
                  padding: '10px 14px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-sm"
                  style={{ padding: '9px 22px', fontSize: '0.85rem' }}>
                  Post Comment
                </button>
              </div>
            </form>

            {/* Comment list */}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', padding: '20px 0' }}>
                No comments yet. Be the first! 🙌
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {comments.map((c, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-2)', borderRadius: 'var(--r)', padding: '12px 16px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-lt)' }}>
                        👤 {c.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{c.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT: Sidebar ══ */}
        <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 16px)', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Sidebar Tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', overflow: 'hidden'
          }}>
            {['episodes', 'qr'].map(tab => (
              <button key={tab}
                onClick={() => setSideTab(tab)}
                style={{
                  flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer', fontWeight: 600,
                  fontSize: '0.82rem', transition: 'all 0.2s ease',
                  background: sideTab === tab ? 'var(--accent)' : 'transparent',
                  color: sideTab === tab ? '#fff' : 'var(--text-2)'
                }}>
                {tab === 'episodes' ? `🎬 Episodes (${episodes.length})` : '☕ Sponsor QR'}
              </button>
            ))}
          </div>

          {/* Episodes Tab */}
          {sideTab === 'episodes' && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '16px'
            }}>
              {episodes.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', padding: '20px 0' }}>
                  No episodes available yet.
                </p>
              ) : (
                <>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-2)' }}>
                    Now Playing: {activeEpisode?.title}
                  </label>
                  <select
                    value={activeEpisode?.id || ''}
                    onChange={(e) => {
                      const ep = episodes.find(x => x.id === e.target.value);
                      if (ep) setActiveEpisode(ep);
                    }}
                    style={{
                      width: '100%', padding: '11px 14px', fontSize: '0.88rem',
                      background: 'var(--bg-2)', color: 'var(--text)',
                      border: '1px solid var(--border)', borderRadius: 'var(--r)',
                      outline: 'none', cursor: 'pointer', marginBottom: 14
                    }}>
                    {episodes.map((ep, i) => (
                      <option key={ep.id} value={ep.id}>EP {i + 1} — {ep.title}</option>
                    ))}
                  </select>

                  {/* Prev / Next buttons */}
                  {episodes.length > 1 && (() => {
                    const idx = episodes.findIndex(ep => ep.id === activeEpisode?.id);
                    return (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          disabled={idx <= 0}
                          onClick={() => idx > 0 && setActiveEpisode(episodes[idx - 1])}
                          style={{
                            flex: 1, padding: '9px', fontSize: '0.82rem', fontWeight: 600,
                            background: 'var(--bg-2)', color: idx <= 0 ? 'var(--text-3)' : 'var(--text)',
                            border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: idx <= 0 ? 'not-allowed' : 'pointer'
                          }}>
                          ← Prev
                        </button>
                        <button
                          disabled={idx >= episodes.length - 1}
                          onClick={() => idx < episodes.length - 1 && setActiveEpisode(episodes[idx + 1])}
                          style={{
                            flex: 1, padding: '9px', fontSize: '0.82rem', fontWeight: 600,
                            background: idx >= episodes.length - 1 ? 'var(--bg-2)' : 'var(--accent)',
                            color: idx >= episodes.length - 1 ? 'var(--text-3)' : '#fff',
                            border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: idx >= episodes.length - 1 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                          }}>
                          Next →
                        </button>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {/* QR Tab */}
          {sideTab === 'qr' && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '24px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              {sponsorQrUrl ? (
                <>
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>☕</div>
                  <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '1rem' }}>Support Us</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: 18, maxWidth: 230 }}>
                    Enjoying the stream? Help us pay for server costs by scanning the QR code below.
                  </p>
                  <div style={{
                    background: '#fff', padding: 12, borderRadius: 14,
                    width: 160, height: 160, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: 14, overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}>
                    <img src={getQrImageUrl(sponsorQrUrl)} alt="Sponsor QR"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-lt)', fontWeight: 600 }}>
                    Thank you for your support! ❤️
                  </span>
                </>
              ) : (
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', padding: '20px 0' }}>
                  No sponsor QR configured yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Recommended Section ── */}
      {recommendations.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border)', paddingTop: 40, marginTop: 48 }}>
          <div className="section-header" style={{ marginBottom: 24 }}>
            <h2 className="section-title">Recommended <span>Dramas</span></h2>
          </div>
          <div className="dramas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
            {recommendations.map((d) => (
              <article key={d.id} className="drama-card"
                onClick={() => onNavigate(`/watch/${d.id}`)}
                style={{ cursor: 'pointer', background: 'transparent' }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, aspectRatio: '2/3', marginBottom: 10, border: '1px solid var(--border)' }}>
                  <img className="drama-card-poster loaded" src={d.poster} alt={d.title} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${d.id}/300/450`; }} />
                </div>
                <div style={{ padding: '0 4px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                    {d.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 5, fontSize: '0.75rem', color: 'var(--text-2)' }}>
                    <span>{d.year || '2025'}</span>
                    <span>·</span>
                    <span style={{ color: '#ffb800', fontWeight: 700 }}>★ {d.rating || '8.0'}</span>
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
