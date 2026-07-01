import React, { useState, useEffect } from 'react';
import { API } from '../api';
import { Embed } from '../embed';

export default function Admin({ onNavigate }) {
  const [authed, setAuthed] = useState(API.isAuthed());
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);

  const [activeTab, setActiveTab] = useState('dramas');
  const [dramas, setDramas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeDramaId, setActiveDramaId] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Scraper State
  const [importUrl, setImportUrl] = useState('');
  const [scraping, setScraping] = useState(false);

  // Drama Modal State
  const [dramaModalOpen, setDramaModalOpen] = useState(false);
  const [editingDrama, setEditingDrama] = useState(null);
  const [dramaForm, setDramaForm] = useState({
    title: '',
    description: '',
    poster: '',
    genre: 'Action',
    trending: false,
  });

  // Episode Modal State
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [episodeForm, setEpisodeForm] = useState({
    title: '',
    videoUrl: '',
  });

  // Search Drama
  const [searchQuery, setSearchQuery] = useState('');

  // Notification helper
  const [toast, setToast] = useState({ message: '', type: 'info', show: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const [dramasRes, categoriesRes] = await Promise.all([
        API.getDramas(),
        API.getCategories()
      ]);
      setDramas(dramasRes);
      setCategories(categoriesRes);
      if (dramasRes.length > 0 && !activeDramaId) {
        setActiveDramaId(dramasRes[0].id);
      }
    } catch (err) {
      console.error('[Admin] Load dashboard failed:', err);
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (authed) {
      loadDashboardData();
    }
  }, [authed]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      showToast('Password is required.', 'error');
      return;
    }
    setChecking(true);
    const ok = await API.checkAdmin(password);
    setChecking(false);
    if (ok) {
      showToast('Welcome back, Admin! 👋', 'success');
      setAuthed(true);
    } else {
      showToast('Incorrect password. Try again.', 'error');
      setPassword('');
    }
  };

  const handleLogout = () => {
    API.logout();
    setAuthed(false);
    setDramas([]);
    setActiveDramaId(null);
    showToast('Logged out.', 'info');
  };

  const handleScrape = async () => {
    if (!importUrl.trim()) {
      showToast('Please paste a valid website URL first.', 'error');
      return;
    }
    setScraping(true);
    showToast('Fetching and importing drama details... Please wait.', 'info');

    try {
      const res = await API.scrapeUrl(importUrl);
      showToast(`Imported "${res.title}" (${res.episodeCount} episodes)! 🎉`, 'success');
      setImportUrl('');
      loadDashboardData();
    } catch (err) {
      console.error(err);
      showToast('Failed to scrape: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setScraping(false);
    }
  };

  // ── JSON Upload ──────────────────────────────────────────────
  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const drama = JSON.parse(evt.target.result);
        if (!drama.title) {
          showToast('Invalid JSON: missing title.', 'error');
          return;
        }
        await API.addDrama(drama);
        showToast(`Imported "${drama.title}"! 🎉`, 'success');
        loadDashboardData();
      } catch (err) {
        showToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Drama CRUD Actions ────────────────────────────────────────
  const openDramaModal = (drama = null) => {
    setEditingDrama(drama);
    if (drama) {
      setDramaForm({
        title: drama.title,
        description: drama.description || '',
        poster: drama.poster || '',
        genre: drama.genre || 'Action',
        trending: !!drama.trending,
      });
    } else {
      setDramaForm({
        title: '',
        description: '',
        poster: '',
        genre: 'Action',
        trending: false,
      });
    }
    setDramaModalOpen(true);
  };

  const saveDrama = async (e) => {
    e.preventDefault();
    if (!dramaForm.title.trim() || !dramaForm.description.trim()) {
      showToast('Title and description are required.', 'error');
      return;
    }

    const payload = {
      ...dramaForm,
      poster: dramaForm.poster.trim() || `https://picsum.photos/seed/${dramaForm.title.replace(/\s+/g, '')}/300/450`
    };

    try {
      if (editingDrama) {
        await API.updateDrama(editingDrama.id, payload);
        showToast('Drama updated! ✅', 'success');
      } else {
        await API.addDrama(payload);
        showToast('Drama created! 🎬', 'success');
      }
      setDramaModalOpen(false);
      loadDashboardData();
    } catch (err) {
      showToast('Error saving drama: ' + (err.message || 'unknown'), 'error');
    }
  };

  const deleteDrama = (id, title) => {
    const ok = window.confirm(`Are you sure you want to permanently delete "${title}" and all its episodes?`);
    if (ok) {
      API.deleteDrama(id).then(() => {
        showToast('Drama deleted.', 'success');
        if (activeDramaId === id) {
          setActiveDramaId(null);
        }
        loadDashboardData();
      });
    }
  };

  // ── Episode CRUD Actions ──────────────────────────────────────
  const [activeDramaDetails, setActiveDramaDetails] = useState(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const loadActiveDramaDetails = async () => {
    if (!activeDramaId) {
      setActiveDramaDetails(null);
      return;
    }
    setLoadingEpisodes(true);
    try {
      const data = await API.getDrama(activeDramaId);
      setActiveDramaDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  useEffect(() => {
    if (authed && activeTab === 'episodes') {
      loadActiveDramaDetails();
    }
  }, [activeDramaId, activeTab, authed]);

  const openEpisodeModal = (ep = null) => {
    setEditingEpisode(ep);
    if (ep) {
      setEpisodeForm({
        title: ep.title,
        videoUrl: ep.videoUrl || '',
      });
    } else {
      setEpisodeForm({
        title: '',
        videoUrl: '',
      });
    }
    setEpisodeModalOpen(true);
  };

  const saveEpisode = async (e) => {
    e.preventDefault();
    if (!episodeForm.title.trim()) {
      showToast('Episode title is required.', 'error');
      return;
    }

    try {
      if (editingEpisode) {
        await API.updateEpisode(activeDramaId, editingEpisode.id, episodeForm);
        showToast('Episode updated! ✅', 'success');
      } else {
        await API.addEpisode(activeDramaId, episodeForm);
        showToast('Episode added! ▶', 'success');
      }
      setEpisodeModalOpen(false);
      loadActiveDramaDetails();
    } catch (err) {
      showToast('Error saving episode: ' + (err.message || 'unknown'), 'error');
    }
  };

  const deleteEpisode = (epId, title) => {
    const ok = window.confirm(`Delete "${title}" permanently?`);
    if (ok) {
      API.deleteEpisode(activeDramaId, epId).then(() => {
        showToast('Episode deleted.', 'success');
        loadActiveDramaDetails();
      });
    }
  };

  // Filter dramas by search
  const filteredDramas = dramas.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDramaName = dramas.find(d => d.id === activeDramaId)?.title || 'Select a Drama';

  if (!authed) {
    return (
      <div className="login-container page-enter">
        {toast.show && <div className={`toast ${toast.type} show`}>{toast.message}</div>}
        <div className="login-card">
          <div className="login-icon">🔐</div>
          <h1 className="login-title">Admin Panel</h1>
          <p className="login-subtitle">Enter your admin password to manage content</p>

          <form onSubmit={handleLogin} novalidate>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-pwd">Password</label>
              <input
                className="form-input"
                type="password"
                id="admin-pwd"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} disabled={checking}>
              {checking ? 'Checking…' : 'Unlock Dashboard →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalEpisodesCount = dramas.reduce((acc, curr) => acc + (curr.episodeCount || 0), 0);
  const trendingCount = dramas.filter(d => d.trending).length;

  return (
    <div className="admin-layout page-enter" style={{ padding: '24px 64px' }}>
      {toast.show && <div className={`toast ${toast.type} show`}>{toast.message}</div>}

      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage DramaStream content — dramas, episodes &amp; categories</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>← Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{dramas.length}</div>
          <div className="stat-label">Total Dramas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalEpisodesCount}</div>
          <div className="stat-label">Total Episodes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{trendingCount}</div>
          <div className="stat-label">Trending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{categories.length}</div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" role="tablist">
        <button className={`admin-tab ${activeTab === 'dramas' ? 'active' : ''}`} onClick={() => setActiveTab('dramas')}>
          🎬 Dramas
        </button>
        <button className={`admin-tab ${activeTab === 'episodes' ? 'active' : ''}`} onClick={() => setActiveTab('episodes')}>
          ▶ Episodes
        </button>
      </div>

      {/* Tab Body */}
      {activeTab === 'dramas' ? (
        <div id="admin-tab-body">
          <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            <input
              className="search-input"
              type="search"
              placeholder="🔍 Search dramas…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />

            {/* Import from URL Form */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 2, minWidth: '300px' }}>
              <input
                className="form-input"
                type="url"
                placeholder="Paste KhmerKomsan URL..."
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                style={{ margin: 0, flex: 1 }}
              />
              <button className="btn btn-ghost" onClick={handleScrape} disabled={scraping}>
                {scraping ? '⚡ Fetching…' : '⚡ Fetch & Import'}
              </button>
            </div>

            <button className="btn btn-ghost" onClick={() => document.getElementById('json-upload').click()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              📂 Upload JSON
            </button>
            <input type="file" id="json-upload" accept=".json" onChange={handleJsonUpload} style={{ display: 'none' }} />
            <button className="btn btn-primary" onClick={() => openDramaModal(null)}>+ Add Drama</button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
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
              <tbody>
                {filteredDramas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '52px', color: 'var(--text-2)' }}>
                      No dramas yet. Click <strong>+ Add Drama</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  filteredDramas.map(d => (
                    <tr key={d.id}>
                      <td>
                        <img className="table-poster" src={d.poster} alt={d.title} onError={(e) => { e.target.style.background = 'var(--bg-3)'; e.target.removeAttribute('src'); }} />
                      </td>
                      <td style={{ fontWeight: 600, maxWidth: '220px', wordBreak: 'break-word' }}>{d.title}</td>
                      <td><span className="genre-badge">{d.genre}</span></td>
                      <td style={{ color: 'var(--text-2)' }}>{d.episodeCount || 0}</td>
                      <td>{d.trending ? <span className="trending-badge">🔥 Trending</span> : <span style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>—</span>}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openDramaModal(d)} title="Edit">✏️</button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteDrama(d.id, d.title)} title="Delete" style={{ color: 'var(--red)' }}>🗑️</button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onNavigate(`/watch/${d.id}`)} title="View on site">👁️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div id="admin-tab-body">
          {dramas.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-2)' }}>
              No dramas found.{' '}
              <button className="btn btn-link" onClick={() => setActiveTab('dramas')} style={{ color: 'var(--accent-lt)', textDecoration: 'underline' }}>
                Add a drama first →
              </button>
            </div>
          ) : (
            <>
              <div className="admin-toolbar">
                <select
                  className="search-input"
                  value={activeDramaId || ''}
                  onChange={e => setActiveDramaId(e.target.value)}
                  style={{ width: 'auto', maxWidth: '320px' }}
                >
                  {dramas.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={() => openEpisodeModal(null)}>+ Add Episode</button>
              </div>

              {loadingEpisodes ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)' }}>Loading episodes…</div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Video URL</th>
                        <th>Platform</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!activeDramaDetails || !activeDramaDetails.episodes || activeDramaDetails.episodes.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-2)' }}>
                            No episodes yet. Click <strong>+ Add Episode</strong> to get started.
                          </td>
                        </tr>
                      ) : (
                        activeDramaDetails.episodes.map((ep, i) => (
                          <tr key={ep.id}>
                            <td style={{ color: 'var(--text-2)', fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ fontWeight: 500 }}>{ep.title}</td>
                            <td style={{ maxWidth: '200px' }}>
                              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-2)' }} title={ep.videoUrl}>
                                {ep.videoUrl || <em style={{ color: 'var(--text-3)' }}>None</em>}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.72rem', padding: '2px 9px', background: 'var(--bg-3)', borderRadius: '100px', color: 'var(--text-2)' }}>
                                {Embed.getType(ep.videoUrl)}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEpisodeModal(ep)} title="Edit">✏️</button>
                                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteEpisode(ep.id, ep.title)} title="Delete" style={{ color: 'var(--red)' }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Drama Modal */}
      {dramaModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3>{editingDrama ? '✏️ Edit Drama' : '+ New Drama'}</h3>
              <button className="modal-close" onClick={() => setDramaModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={saveDrama} novalidate>
              <div className="form-group">
                <label className="form-label" htmlFor="f-title">Title *</label>
                <input
                  className="form-input"
                  type="text"
                  id="f-title"
                  value={dramaForm.title}
                  onChange={e => setDramaForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Drama title"
                  required
                  maxLength="120"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="f-desc">Description *</label>
                <textarea
                  className="form-textarea"
                  id="f-desc"
                  value={dramaForm.description}
                  onChange={e => setDramaForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Short synopsis…"
                  required
                  maxLength="600"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="f-poster">Poster Image URL</label>
                <input
                  className="form-input"
                  type="url"
                  id="f-poster"
                  value={dramaForm.poster}
                  onChange={e => setDramaForm(prev => ({ ...prev, poster: e.target.value }))}
                  placeholder="https://…"
                />
                <small style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Leave blank to use a random placeholder.
                </small>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="f-genre">Genre</label>
                  <select
                    className="form-select"
                    id="f-genre"
                    value={dramaForm.genre}
                    onChange={e => setDramaForm(prev => ({ ...prev, genre: e.target.value }))}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '20px' }}>
                  <label className="form-check">
                    <input
                      type="checkbox"
                      id="f-trending"
                      checked={dramaForm.trending}
                      onChange={e => setDramaForm(prev => ({ ...prev, trending: e.target.checked }))}
                    />
                    <span>Mark as Trending</span>
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setDramaModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingDrama ? 'Save Changes' : 'Create Drama'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episode Modal */}
      {episodeModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingEpisode ? '✏️ Edit Episode' : '+ Add Episode'}</h3>
              <button className="modal-close" onClick={() => setEpisodeModalOpen(false)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '20px' }}>
              Drama: <strong style={{ color: 'var(--text)' }}>{activeDramaName}</strong>
            </p>
            <form onSubmit={saveEpisode} novalidate>
              <div className="form-group">
                <label className="form-label" htmlFor="ep-title">Episode Title *</label>
                <input
                  className="form-input"
                  type="text"
                  id="ep-title"
                  value={episodeForm.title}
                  onChange={e => setEpisodeForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Episode 1 — The Beginning"
                  required
                  maxLength="120"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ep-url">Video URL</label>
                <input
                  className="form-input"
                  type="url"
                  id="ep-url"
                  value={episodeForm.videoUrl}
                  onChange={e => setEpisodeForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="YouTube, Facebook, TikTok, or Vimeo URL"
                />
                <small style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                  Supported: youtube.com · youtu.be · facebook.com · fb.watch · tiktok.com · vimeo.com
                </small>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEpisodeModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingEpisode ? 'Save Changes' : 'Add Episode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
