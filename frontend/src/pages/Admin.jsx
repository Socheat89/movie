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

  // Categories management state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategories, setSavingCategories] = useState(false);

  // Profile management state (change password)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

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

  // ── Scrape / Import logic ──────────────────────────────────────
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

  // ── Categories CRUD Actions ───────────────────────────────────
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.includes(name)) {
      showToast('Category already exists!', 'error');
      return;
    }
    setCategories([...categories, name]);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catName) => {
    const ok = window.confirm(`Delete category "${catName}"? (Dramas of this genre will remain intact but the filter will be removed)`);
    if (ok) {
      setCategories(categories.filter(c => c !== catName));
    }
  };

  const handleSaveCategories = async () => {
    setSavingCategories(true);
    try {
      await API.saveCategories(categories);
      showToast('Categories list saved successfully! 🏷️', 'success');
    } catch (err) {
      showToast('Failed to save categories: ' + (err.message || 'error'), 'error');
    } finally {
      setSavingCategories(false);
    }
  };

  // ── Profile / Password Update Actions ────────────────────────
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('All fields are required.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      await API.changePassword(oldPassword, newPassword);
      showToast('Password updated successfully! 🔑', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast('Failed to update password: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setUpdatingPassword(false);
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
      <div className="admin-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
          <div>
            <h1 className="admin-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Admin Dashboard</h1>
            <p className="admin-subtitle">Manage DramaStream content — dramas, episodes, categories &amp; admin profile</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ borderRadius: 'var(--r-sm)' }}>← Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{dramas.length}</div>
          <div className="stat-label" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Total Dramas</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{totalEpisodesCount}</div>
          <div className="stat-label" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Total Episodes</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{trendingCount}</div>
          <div className="stat-label" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Trending</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{categories.length}</div>
          <div className="stat-label" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Categories</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" role="tablist" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '1px', marginBottom: '28px' }}>
        <button className={`admin-tab ${activeTab === 'dramas' ? 'active' : ''}`} onClick={() => setActiveTab('dramas')}>
          🎬 Dramas
        </button>
        <button className={`admin-tab ${activeTab === 'episodes' ? 'active' : ''}`} onClick={() => setActiveTab('episodes')}>
          ▶ Episodes
        </button>
        <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          🏷️ Categories
        </button>
        <button className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          👤 Profile
        </button>
      </div>

      {/* Tab Body */}
      {activeTab === 'dramas' && (
        <div id="admin-tab-body" className="page-enter">
          <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%', marginBottom: '20px' }}>
            <input
              className="search-input"
              type="search"
              placeholder="🔍 Search dramas by title or genre…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />

            {/* Import from URL Form */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 2, minWidth: '300px' }}>
              <input
                className="form-input"
                type="url"
                placeholder="Paste KhmerKomsan movie URL..."
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

          <div className="admin-table-wrapper" style={{ background: 'var(--bg-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
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
                      No dramas yet. Click <strong>+ Add Drama</strong> or use the Link Scraper tool above.
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
      )}

      {activeTab === 'episodes' && (
        <div id="admin-tab-body" className="page-enter">
          {dramas.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-2)' }}>
              No dramas found.{' '}
              <button className="btn btn-link" onClick={() => setActiveTab('dramas')} style={{ color: 'var(--accent-lt)', textDecoration: 'underline' }}>
                Add a drama first →
              </button>
            </div>
          ) : (
            <>
              <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
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
                <div className="admin-table-wrapper" style={{ background: 'var(--bg-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
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

      {activeTab === 'categories' && (
        <div id="admin-tab-body" className="page-enter">
          <div style={{ maxWidth: '750px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Manage Movie Categories</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Add, remove, and sort categories. Make sure to click <strong>Save Categories</strong> to apply changes to the website filters.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <input
                className="form-input"
                type="text"
                placeholder="Enter new category name (e.g. Action, Horror)"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
                style={{ margin: 0 }}
              />
              <button className="btn btn-primary" onClick={handleAddCategory}>Add</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '80px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: 'var(--r)', marginBottom: '32px' }}>
              {categories.length === 0 ? (
                <div style={{ color: 'var(--text-3)', fontSize: '0.9rem', width: '100%', textAlign: 'center', alignSelf: 'center' }}>No categories added.</div>
              ) : (
                categories.map(cat => (
                  <span
                    key={cat}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-3)',
                      color: 'var(--text)',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      border: '1px solid var(--border)'
                    }}
                  >
                    {cat}
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      style={{ color: 'var(--red)', fontSize: '1rem', fontWeight: 'bold', padding: '0 2px' }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>

            <button className="btn btn-primary" onClick={handleSaveCategories} disabled={savingCategories} style={{ gap: '8px' }}>
              {savingCategories ? 'Saving…' : '💾 Save Categories'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div id="admin-tab-body" className="page-enter">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', maxWidth: '950px' }}>
            
            {/* Admin Profile Overview */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--accent)', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyItems: 'center', color: '#fff', fontWeight: 'bold', justifyContent: 'center', boxShadow: '0 8px 30px var(--accent-glow)', marginBottom: '20px' }}>
                A
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>Administrator</h2>
              <span style={{ color: 'var(--accent-lt)', fontSize: '0.85rem', fontWeight: 600, background: 'var(--accent-glow)', padding: '4px 14px', borderRadius: '100px', marginBottom: '24px' }}>
                Super Admin
              </span>
              
              <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>Username:</span>
                  <strong style={{ color: 'var(--text)' }}>admin</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>Role permissions:</span>
                  <strong style={{ color: 'var(--green)' }}>Full Access</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>Database backend:</span>
                  <strong style={{ color: 'var(--text)' }}>cPanel MySQL</strong>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px' }}>Update Admin Password</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '20px' }}>
                Change your dashboard entry password. Make sure to choose a secure password.
              </p>

              <form onSubmit={handleUpdatePassword} novalidate>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Current Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Re-type new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={updatingPassword} style={{ width: '100%', justifyContent: 'center' }}>
                  {updatingPassword ? 'Updating Password…' : '🔑 Change Password'}
                </button>
              </form>
            </div>

          </div>
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
