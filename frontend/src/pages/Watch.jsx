import React, { useState, useEffect } from 'react';
import { API } from '../api';
import { Embed } from '../embed';
import { updateSeo } from '../seo';
import { 
  MovieCard, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  EpisodeCard, 
  ReviewCard, 
  CastCard,
  Button, 
  IconButton,
  SegmentedControl,
  Select,
  Textarea,
  Input 
} from '../components/ui';
import { 
  ChevronLeftIcon, 
  HeartIcon, 
  ShareIcon, 
  StarIcon, 
  PlayIcon, 
  BackIcon,
  CloseIcon,
  ChevronRightIcon 
} from '../components/AnimatedIcons';

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
  const [drama, setDrama] = useState(null);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sponsorQrUrl, setSponsorQrUrl] = useState('');
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

  /* ── load favorites ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('favorites');
      const favs = saved ? JSON.parse(saved) : [];
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

  useEffect(() => {
    if (!drama) return;
    updateSeo({
      title: `Watch ${drama.title} (${drama.year || '2025'}) Online Free - Mekong Movie`,
      description: `Stream ${drama.title} (${drama.year || '2025'}) on Mekong Movie. ${drama.description ? drama.description.substring(0, 150) : 'Watch full episodes online free.'}...`,
      keywords: `${drama.title}, watch ${drama.title}, ${drama.genre}, K-drama, Korean drama, stream free`,
      image: drama.poster,
      url: window.location.origin + `/#/watch/${drama.id}`,
      schema: {
        "@context": "https://schema.org",
        "@type": "TVSeries",
        "name": drama.title,
        "image": drama.poster,
        "genre": drama.genre,
        "dateCreated": drama.year,
        "description": drama.description,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": drama.rating || "8.0",
          "bestRating": "10",
          "worstRating": "1",
          "ratingCount": "150"
        }
      }
    });
  }, [drama]);

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
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-tertiary)', gap: 'var(--space-3)',
        textAlign: 'center', padding: 'var(--space-8)'
      }}>
        <PlayIcon size={44} style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
        <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)' }}>No video selected</p>
        <small style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Select an episode to start watching.</small>
      </div>
    );

    const type = Embed.getType(url);

    if (type === 'direct') {
      const cleanUrl = url.replace(/^httpS:\/\//i, 'https://');
      return (
        <video key={url} controls autoPlay preload="auto" controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
          <source src={cleanUrl} type="video/mp4" referrerPolicy="no-referrer" />
        </video>
      );
    }

    if (type === 'facebook') {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', gap: 'var(--space-4)',
          textAlign: 'center', padding: 'var(--space-8)'
        }}>
          <div style={{ fontSize: '2.5rem' }}>📘</div>
          <p style={{ fontSize: '17px', fontWeight: 700 }}>Facebook Video</p>
          <small style={{ textAlign: 'center', lineHeight: 1.7, maxWidth: 300, fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Facebook videos cannot be embedded directly.<br />Click below to watch on Facebook.
          </small>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ 
              marginTop: 'var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--brand-primary)', color: '#fff', padding: '10px 20px',
              borderRadius: 'var(--radius-xl)', fontSize: '15px', fontWeight: 600,
              textDecoration: 'none',
            }}>
            <PlayIcon size={18} /> Watch on Facebook
          </a>
        </div>
      );
    }

    if (type === 'khdiamond') {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <iframe
            key={url}
            src={url}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            loading="lazy"
            title="KhDiaMonD Episode Player"
            style={{ width: '100%', flex: 1, minHeight: 0, border: 'none' }}
          />
          <div style={{
            padding: '8px 12px', background: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', gap: 10, fontSize: '13px', color: 'var(--text-secondary)'
          }}>
            <span>💡 បើវីដេអូមិនចាក់ — </span>
            <a href={url} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
              បើក KhDiaMonD ដោយផ្ទាល់ ↗
            </a>
          </div>
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
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'var(--space-5) var(--space-5) var(--space-16)' }}>
      <div className="watch-layout">
        <div>
          <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-2xl)' }}></div>
          <div style={{ paddingTop: 'var(--space-5)' }}>
            <div className="skeleton" style={{ height: 24, width: '50%' }}></div>
            <div className="skeleton" style={{ width: '85%', marginTop: 'var(--space-3)' }}></div>
          </div>
        </div>
        <div className="skeleton" style={{ height: 450, borderRadius: 'var(--radius-2xl)' }}></div>
      </div>
    </div>
  );

  if (error || !drama) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-10)' }}>
      <div style={{ fontSize: '3.5rem', opacity: 0.15, marginBottom: 'var(--space-5)' }}>🎬</div>
      <h2 style={{ font: 'var(--style-title-2)', fontWeight: 700, marginBottom: 'var(--space-2)', letterSpacing: 'var(--tracking-tight)' }}>Movie Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: 'var(--space-7)' }}>This movie doesn't exist or may have been removed.</p>
      <Button variant="primary" onClick={() => onNavigate('/')} leftIcon={<BackIcon size={16} />}>
        Back to Home
      </Button>
    </div>
  );

  const episodes = drama.episodes || [];
  const posterUrl = drama.poster || `https://picsum.photos/seed/${drama.id}/500/750`;

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto', padding: 'var(--space-4) var(--space-5) var(--space-16)' }}>
      
      {/* Back Navigation */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ChevronLeftIcon size={16} />}
        onClick={() => onNavigate('/')}
        style={{ marginBottom: 'var(--space-4)', color: 'var(--color-system-blue)' }}
      >
        Browse
      </Button>

      <div className="watch-layout">

        {/* ══ LEFT: Video + Info ══ */}
        <div>
          {/* Video Player */}
          <div className="player-wrapper" id="player-wrapper">
            {renderPlayer(activeEpisode?.videoUrl)}
          </div>

          {/* Title + Meta */}
          <div style={{ marginTop: 'var(--space-5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ font: 'var(--style-title-1)', margin: '0 0 var(--space-2)', letterSpacing: 'var(--tracking-tight)' }}>
                {drama.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '3px 10px',
                  backgroundColor: 'rgba(229, 9, 20, 0.12)',
                  color: 'var(--brand-primary)',
                  fontSize: '12px', fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                }}>
                  {drama.genre}
                </span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>{drama.year || '2025'}</span>
                <span style={{ color: 'var(--rating-gold)', fontSize: '13px', fontWeight: 600 }}>★ {drama.rating || '8.0'}</span>
                <span style={{ color: 'var(--text-quaternary)', fontSize: '13px' }}>{formatViews(drama.views)}</span>
                {drama.trending && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    fontSize: '11px', fontWeight: 600,
                    padding: '3px 8px',
                    backgroundColor: 'rgba(255, 159, 10, 0.12)',
                    color: 'var(--color-system-orange)',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    🔥 Trending
                  </span>
                )}
                {activeEpisode && (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>▶ {activeEpisode.title}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action, Episodes & Support Panel */}
          <div style={{
            marginTop: 'var(--space-4)',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'row',
            gap: 'var(--space-6)',
            flexWrap: 'wrap',
          }}>
            {/* Left Column: Actions & Episodes */}
            <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              {/* Save & Share actions */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Actions
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    variant={isFavorite ? 'secondary' : 'ghost'}
                    size="sm"
                    leftIcon={<HeartIcon active={isFavorite} size={15} />}
                    onClick={toggleFavorite}
                    style={{ borderRadius: 'var(--radius-lg)' }}
                  >
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ShareIcon copied={shareToast} size={15} />}
                    onClick={handleShare}
                    style={{ borderRadius: 'var(--radius-lg)' }}
                  >
                    {shareToast ? 'Copied!' : 'Share'}
                  </Button>
                </div>
              </div>

              {/* Episodes Selector Grid */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Episodes ({episodes.length})
                </h4>
                {episodes.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-tertiary)' }}>No episodes available yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {episodes.map((ep, i) => (
                      <button
                        key={ep.id}
                        onClick={() => setActiveEpisode(ep)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: activeEpisode?.id === ep.id ? 'var(--brand-primary)' : 'var(--color-system-gray5)',
                          color: activeEpisode?.id === ep.id ? 'var(--text-on-brand)' : 'var(--text-primary)',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          border: 'none',
                        }}
                      >
                        EP {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sponsor QR */}
            {sponsorQrUrl && (
              <div style={{
                width: '100%',
                maxWidth: '240px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '0.5px solid rgba(255, 255, 255, 0.05)',
                margin: '0 auto',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>☕</div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 var(--space-1)', color: 'var(--text-primary)' }}>Support Us</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', lineHeight: 1.4, marginBottom: 'var(--space-3)' }}>
                  Scan to support server costs.
                </p>
                <div style={{
                  background: '#fff', padding: '8px', borderRadius: 'var(--radius-md)',
                  width: 130, height: 130, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 'var(--space-3)',
                  boxShadow: 'var(--shadow-sm)', overflow: 'hidden'
                }}>
                  <img src={getQrImageUrl(sponsorQrUrl)} alt="Sponsor QR"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-primary)' }}>
                  Thank you! ❤️
                </span>
              </div>
            )}
          </div>

          {/* Description / Overview */}
          <div style={{ 
            marginTop: 'var(--space-4)', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-xl)', 
            padding: 'var(--space-5)' 
          }}>
            <h3 style={{ font: 'var(--style-headline)', marginBottom: 'var(--space-3)', letterSpacing: 'var(--tracking-tight)' }}>Overview</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {drama.description || 'No description available.'}
            </p>
          </div>

          {/* ─── User Rating ─── */}
          <div style={{ 
            marginTop: 'var(--space-4)', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-xl)', 
            padding: 'var(--space-5)' 
          }}>
            <h3 style={{ font: 'var(--style-headline)', marginBottom: 'var(--space-3)', letterSpacing: 'var(--tracking-tight)' }}>Rate this Movie</h3>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => submitRating(star)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    transition: 'transform 0.15s var(--ease-spring)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {hoverRating >= star ? (
                    <StarIcon active={true} size={30} style={{ color: 'var(--rating-gold)', filter: 'drop-shadow(0 2px 4px rgba(255,193,7,0.3))' }} />
                  ) : userRating >= star ? (
                    <StarIcon active={true} size={30} style={{ color: 'var(--rating-gold)' }} />
                  ) : (
                    <StarIcon size={30} style={{ color: 'var(--color-system-gray3)' }} />
                  )}
                </button>
              ))}
              <span style={{ marginLeft: 'var(--space-3)', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                {userRating ? `You rated ${userRating}/5` : 'Tap to rate'}
              </span>
            </div>
            {ratingSubmitted && (
              <div style={{
                marginTop: 'var(--space-3)', fontSize: '13px',
                color: 'var(--success)', fontWeight: 600,
                animation: 'fadeIn 0.3s ease'
              }}>
                ✓ Thanks for your rating! 🎉
              </div>
            )}
          </div>

          {/* ─── Comments Section ─── */}
          <div style={{ 
            marginTop: 'var(--space-4)', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-xl)', 
            padding: 'var(--space-5)' 
          }}>
            <h3 style={{ font: 'var(--style-headline)', marginBottom: 'var(--space-3)', letterSpacing: 'var(--tracking-tight)' }}>
              Comments <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '15px' }}>({comments.length})</span>
            </h3>

            {/* Comment form */}
            <form onSubmit={submitComment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              <Input
                placeholder="Your name (optional)"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                maxLength={40}
                style={{ maxWidth: 280 }}
              />
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" size="sm" type="submit">
                  Post Comment
                </Button>
              </div>
            </form>

            {/* Comment list */}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '15px', padding: 'var(--space-6) 0' }}>
                No comments yet. Be the first! 🙌
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {comments.map((c, i) => (
                  <div key={i} style={{ 
                    padding: 'var(--space-4) 0', 
                    borderTop: i > 0 ? '0.5px solid var(--border-primary)' : 'none' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand-primary)' }}>
                        {c.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{c.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cast & Crew */}
          {drama.cast && drama.cast.length > 0 && (
            <div style={{ 
              marginTop: 'var(--space-4)', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-xl)', 
              padding: 'var(--space-5)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ font: 'var(--style-headline)', letterSpacing: 'var(--tracking-tight)', margin: 0 }}>Cast & Crew</h3>
                <span style={{ color: 'var(--color-system-blue)', fontSize: '15px', cursor: 'pointer' }}>See All</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
                {drama.cast.slice(0, 10).map((person, index) => (
                  <CastCard key={person.id || index} cast={person} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ══ RIGHT: Sidebar ══ */}
        <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + var(--space-4))', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>



          {/* Recommended Movies */}
          {recommendations.length > 0 && (
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: 'var(--radius-xl)', 
              border: '0.5px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>Recommended</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>For You</p>
                </div>
                <span style={{ color: 'var(--color-system-blue)', fontSize: '15px', cursor: 'pointer' }}>See All</span>
              </div>
              <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                  {recommendations.map((d) => (
                    <MovieCard
                      key={d.id}
                      movie={d}
                      variant="poster"
                      onClick={() => onNavigate(`/watch/${d.id}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}