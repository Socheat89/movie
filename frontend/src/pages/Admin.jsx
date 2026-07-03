import React, { useState, useEffect } from 'react';
import { API } from '../api';
import { Embed } from '../embed';
import { BackIcon, CloseIcon, AdminIcon, CheckIcon, InfoIcon, ErrorIcon, LogoIcon, PlayIcon, EditIcon, TrashIcon, PlusIcon, TagIcon, ShareIcon } from '../components/AnimatedIcons';

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
  const [scrapeProgress, setScrapeProgress] = useState(0);

  // Table action dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedDramaIds, setSelectedDramaIds] = useState([]);

  // Drama Modal State
  const [dramaModalOpen, setDramaModalOpen] = useState(false);
  const [editingDrama, setEditingDrama] = useState(null);
  const [dramaForm, setDramaForm] = useState({
    title: '',
    description: '',
    poster: '',
    genre: 'Action',
    trending: false,
    year: '2025',
    rating: '8.5',
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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  // Sponsor QR Code Settings
  const [sponsorQrFormUrl, setSponsorQrFormUrl] = useState('');
  const [savingSponsorQr, setSavingSponsorQr] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

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
      const [dramasRes, categoriesRes, qrRes] = await Promise.all([
        API.getDramas(),
        API.getCategories(),
        API.getSponsorQr()
      ]);
      setDramas(dramasRes);
      setCategories(categoriesRes);
      if (qrRes && qrRes.qr_url) {
        setSponsorQrFormUrl(qrRes.qr_url);
      }
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
    setScrapeProgress(10);

    const interval = setInterval(() => {
      setScrapeProgress(prev => {
        if (prev >= 92) {
          clearInterval(interval);
          return 92;
        }
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 350);

    try {
      const res = await API.scrapeUrl(importUrl);
      clearInterval(interval);
      setScrapeProgress(100);
      if (res.isBulk) {
        showToast(`Bulk imported ${res.importedCount} dramas! 🎉`, 'success');
      } else {
        showToast(`Imported "${res.title}" (${res.episodeCount} episodes)! 🎉`, 'success');
      }
      setImportUrl('');
      loadDashboardData();
    } catch (err) {
      clearInterval(interval);
      setScrapeProgress(0);
      console.error(err);
      showToast('Failed to scrape: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setScraping(false);
      setTimeout(() => setScrapeProgress(0), 1000);
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
        year: drama.year || '2025',
        rating: drama.rating || '8.5',
      });
    } else {
      setDramaForm({
        title: '',
        description: '',
        poster: '',
        genre: 'Action',
        trending: false,
        year: '2025',
        rating: '8.5',
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDramaIds(paginatedDramas.map(d => d.id));
    } else {
      setSelectedDramaIds([]);
    }
  };

  const handleSelectDrama = (id) => {
    setSelectedDramaIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const count = selectedDramaIds.length;
    if (count === 0) return;
    const ok = window.confirm(`Are you sure you want to permanently delete these ${count} selected dramas and all their episodes?`);
    if (ok) {
      showToast('Deleting selected dramas...', 'info');
      try {
        await Promise.all(selectedDramaIds.map(id => API.deleteDrama(id)));
        showToast(`Successfully deleted ${count} dramas.`, 'success');
        setSelectedDramaIds([]);
        loadDashboardData();
      } catch (err) {
        showToast('Error during bulk deletion: ' + (err.message || 'unknown'), 'error');
        loadDashboardData();
      }
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

  // ── Sponsor QR Code Actions ──────────────────────────────────
  const handleSaveSponsorQr = async (e) => {
    e.preventDefault();
    setSavingSponsorQr(true);
    try {
      await API.saveSponsorQr(sponsorQrFormUrl);
      showToast('Sponsor QR code saved successfully! 💳', 'success');
    } catch (err) {
      showToast('Failed to save QR code: ' + (err.message || 'error'), 'error');
    } finally {
      setSavingSponsorQr(false);
    }
  };

  const handleQrFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingQr(true);
    showToast('Uploading QR image file...', 'info');
    try {
      const res = await API.uploadSponsorQr(file);
      setSponsorQrFormUrl(res.qr_url);
      showToast('QR Code image uploaded successfully! 📁', 'success');
    } catch (err) {
      console.error(err);
      showToast('Upload failed: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setUploadingQr(false);
    }
  };

  const getQrImageUrl = (url) => {
    if (!url) return '';
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)/i.test(url) || url.includes('picsum.photos');
    if (isImage) {
      return url;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
  };

  // Filter dramas by search
  const filteredDramas = dramas.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = (currentPage - 1) * 20;
  const paginatedDramas = filteredDramas.slice(startIndex, startIndex + 20);

  const activeDramaName = dramas.find(d => d.id === activeDramaId)?.title || 'Select a Drama';

  if (!authed) {
    return (
      <div className="login-container page-enter">
        {toast.show && (
          <div className={`toast ${toast.type} show`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {toast.type === 'success' && <CheckIcon size={20} />}
            {toast.type === 'info' && <InfoIcon size={20} />}
            {toast.type === 'error' && <ErrorIcon size={20} />}
            <span>{toast.message}</span>
          </div>
        )}
        <div className="login-card">
          <div className="login-icon"><AdminIcon size={48} active={checking} /></div>
          <h1 className="login-title" style={{ marginTop: '12px' }}>Admin Panel</h1>
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
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} disabled={checking}>
              {checking ? 'Checking…' : 'Unlock Dashboard'} {!checking && <BackIcon size={16} style={{ transform: 'rotate(180deg)', display: 'inline-block' }} />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalEpisodesCount = dramas.reduce((acc, curr) => acc + (curr.episodeCount || 0), 0);
  const totalViewsCount = dramas.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const trendingCount = dramas.filter(d => d.trending).length;

  return (
    <>
      <div className="admin-layout page-enter" style={{ padding: '24px 64px' }}>
        {toast.show && (
          <div className={`toast ${toast.type} show`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {toast.type === 'success' && <CheckIcon size={20} />}
            {toast.type === 'info' && <InfoIcon size={20} />}
            {toast.type === 'error' && <ErrorIcon size={20} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="admin-header" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
            <div>
              <h1 className="admin-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Admin Dashboard</h1>
              <p className="admin-subtitle">Manage DramaStream content — dramas, episodes, categories, and payment settings</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <BackIcon size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{dramas.length}</div>
            <div className="stat-label" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Total Dramas</div>
          </div>
          <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{totalEpisodesCount}</div>
            <div className="stat-label" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Total Episodes</div>
          </div>
          <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{totalViewsCount >= 1000 ? (totalViewsCount / 1000).toFixed(1) + 'K' : totalViewsCount}</div>
            <div className="stat-label" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Total Views</div>
          </div>
          <div className="stat-card" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
            <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{categories.length}</div>
            <div className="stat-label" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Categories</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs" role="tablist" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '1px', marginBottom: '28px' }}>
          <button className={`admin-tab ${activeTab === 'dramas' ? 'active' : ''}`} onClick={() => setActiveTab('dramas')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><LogoIcon size={14} /> Dramas</span>
          </button>
          <button className={`admin-tab ${activeTab === 'episodes' ? 'active' : ''}`} onClick={() => setActiveTab('episodes')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><PlayIcon size={14} /> Episodes</span>
          </button>
          <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><TagIcon size={14} /> Categories</span>
          </button>
          <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><AdminIcon active={activeTab === 'settings'} size={14} /> Settings</span>
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
                <button className="btn btn-ghost" onClick={handleScrape} disabled={scraping} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <AdminIcon active={scraping} size={14} />
                  {scraping ? 'Fetching…' : 'Fetch & Import'}
                </button>
              </div>

              <button className="btn btn-ghost" onClick={() => document.getElementById('json-upload').click()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShareIcon size={14} style={{ transform: 'rotate(90deg)' }} /> Upload JSON
              </button>
              <input type="file" id="json-upload" accept=".json" onChange={handleJsonUpload} style={{ display: 'none' }} />
              
              {selectedDramaIds.length > 0 && (
                <button 
                  className="btn" 
                  onClick={handleBulkDelete}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    background: '#ff4b4b', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: 'var(--r-sm)', 
                    cursor: 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 0 10px rgba(255, 75, 75, 0.2)'
                  }}
                >
                  <TrashIcon size={14} /> Delete Selected ({selectedDramaIds.length})
                </button>
              )}

              <button className="btn btn-primary" onClick={() => openDramaModal(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <PlusIcon size={14} /> Add Drama
              </button>
            </div>

            {/* Fetch & Import Progress Bar */}
            {scrapeProgress > 0 && (
              <div style={{ width: '100%', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', padding: '16px 20px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-2)' }}>
                  <span>Importing Drama metadata &amp; episodes...</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-lt)' }}>{scrapeProgress}%</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${scrapeProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(to right, var(--accent-lt), var(--accent))',
                      transition: 'width 0.3s ease',
                      boxShadow: '0 0 12px var(--accent-glow)'
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="admin-table-wrapper" style={{ background: 'var(--bg-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
               <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center', paddingLeft: '16px' }}>
                      <input
                        type="checkbox"
                        checked={paginatedDramas.length > 0 && paginatedDramas.every(d => selectedDramaIds.includes(d.id))}
                        onChange={handleSelectAll}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                        title="Select/Deselect All"
                      />
                    </th>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Year</th>
                    <th>Rating</th>
                    <th>Views</th>
                    <th style={{ textAlign: 'right', paddingRight: '28px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDramas.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '52px', color: 'var(--text-2)' }}>
                        No dramas yet. Click <strong>+ Add Drama</strong> or use the Link Scraper tool above.
                      </td>
                    </tr>
                  ) : (
                    paginatedDramas.map(d => (
                      <tr key={d.id}>
                        <td style={{ textAlign: 'center', paddingLeft: '16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedDramaIds.includes(d.id)}
                            onChange={() => handleSelectDrama(d.id)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                          />
                        </td>
                        <td>
                          <img className="table-poster" src={d.poster} alt={d.title} onError={(e) => { e.target.style.background = 'var(--bg-3)'; e.target.removeAttribute('src'); }} />
                        </td>
                        <td style={{ fontWeight: 600, maxWidth: '220px', wordBreak: 'break-word' }}>{d.title}</td>
                        <td><span className="genre-badge">{d.genre}</span></td>
                        <td style={{ color: 'var(--text-2)' }}>{d.year || '2025'}</td>
                        <td style={{ color: '#ffb800', fontWeight: 'bold' }}>★ {d.rating || '8.0'}</td>
                        <td style={{ color: 'var(--text-3)' }}>{d.views || 0}</td>
                        <td style={{ textAlign: 'right', paddingRight: '24px', position: 'relative' }}>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === d.id ? null : d.id);
                            }}
                            style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '36px', height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Actions menu"
                          >
                            ⋮
                          </button>
                          {activeDropdownId === d.id && (
                            <>
                              {/* Overlay for clicking outside */}
                              <div
                                onClick={() => setActiveDropdownId(null)}
                                style={{ position: 'fixed', inset: 0, zIndex: 10, cursor: 'default' }}
                              ></div>
                              
                              {/* Actions Dropdown Content */}
                              <div
                                style={{
                                  position: 'absolute',
                                  right: '24px',
                                  top: '40px',
                                  background: 'var(--bg-2)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--r-sm)',
                                  boxShadow: 'var(--shadow-lg)',
                                  zIndex: 11,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  minWidth: '150px',
                                  overflow: 'hidden',
                                  textAlign: 'left'
                                }}
                              >
                                <button
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    fontSize: '0.85rem',
                                    width: '100%',
                                    color: 'var(--text)',
                                    background: 'transparent',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    openDramaModal(d);
                                  }}
                                  className="dropdown-action-btn"
                                >
                                  <EditIcon size={14} /> Edit Drama
                                </button>
                                <button
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    fontSize: '0.85rem',
                                    width: '100%',
                                    color: 'var(--text)',
                                    background: 'transparent',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    onNavigate(`/watch/${d.id}`);
                                  }}
                                  className="dropdown-action-btn"
                                >
                                  <PlayIcon size={14} /> View on Site
                                </button>
                                <button
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    fontSize: '0.85rem',
                                    width: '100%',
                                    color: 'var(--red)',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    borderTop: '1px solid var(--border)'
                                  }}
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    deleteDrama(d.id, d.title);
                                  }}
                                  className="dropdown-action-btn"
                                >
                                  <TrashIcon size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredDramas.length > 20 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 8px', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                  Showing {startIndex + 1} to {Math.min(startIndex + 20, filteredDramas.length)} of {filteredDramas.length} dramas
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    style={{ padding: '6px 12px' }}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(filteredDramas.length / 20) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setCurrentPage(page)}
                      style={{ minWidth: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0', borderRadius: 'var(--r-sm)' }}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="btn btn-ghost btn-sm" 
                    disabled={currentPage === Math.ceil(filteredDramas.length / 20)}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDramas.length / 20)))}
                    style={{ padding: '6px 12px' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
                  <button className="btn btn-primary" onClick={() => openEpisodeModal(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <PlusIcon size={14} /> Add Episode
                  </button>
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
                                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEpisodeModal(ep)} title="Edit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <EditIcon size={14} />
                                  </button>
                                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteEpisode(ep.id, ep.title)} title="Delete" style={{ color: 'var(--red)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrashIcon size={14} />
                                  </button>
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
                <button className="btn btn-primary" onClick={handleAddCategory} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <PlusIcon size={14} /> Add
                </button>
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
                        style={{ color: 'var(--red)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '2px', cursor: 'pointer' }}
                        title="Remove"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <button className="btn btn-primary" onClick={handleSaveCategories} disabled={savingCategories} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon size={14} />
                {savingCategories ? 'Saving…' : 'Save Categories'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div id="admin-tab-body" className="page-enter">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', maxWidth: '950px' }}>
              
              {/* Sponsor QR Settings */}
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px' }}>☕ Sponsor QR Code</h2>
                <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '20px' }}>
                  Paste the URL of your payment QR code (e.g. ABA Pay, ACLEDA, or any public image URL) to show on the watch page.
                </p>

                <form onSubmit={handleSaveSponsorQr} novalidate>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Sponsor QR Code Image URL</label>
                    <input
                      className="form-input"
                      type="url"
                      placeholder="e.g. https://domain.com/aba_qr.jpg"
                      value={sponsorQrFormUrl}
                      onChange={e => setSponsorQrFormUrl(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Or Upload QR Image File</label>
                    <input
                      className="form-input"
                      type="file"
                      accept="image/*"
                      onChange={handleQrFileUpload}
                      style={{ border: 'none', padding: '6px 0', background: 'transparent' }}
                    />
                    {uploadingQr && <small style={{ color: 'var(--accent-lt)', display: 'block', marginTop: '4px' }}>Uploading file...</small>}
                  </div>
                  
                  {sponsorQrFormUrl && (
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <small style={{ color: 'var(--text-3)', marginBottom: '8px' }}>QR Preview:</small>
                      <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={getQrImageUrl(sponsorQrFormUrl)} alt="QR Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={savingSponsorQr} style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <CheckIcon size={14} />
                    {savingSponsorQr ? 'Saving…' : 'Save QR Code'}
                  </button>
                </form>
              </div>

              {/* Change Password Form */}
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px' }}>🔑 Update Password</h2>
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
                  <button type="submit" className="btn btn-primary" disabled={updatingPassword} style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <CheckIcon size={14} />
                    {updatingPassword ? 'Updating Password…' : 'Change Password'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Drama Modal - Positioned outside container for fixed positioning to work in transformed layouts */}
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
                  placeholder="e.g. My Secret Love"
                  required
                  maxLength="100"
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
              
              <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
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

                <div className="form-group">
                  <label className="form-label" htmlFor="f-year">Release Year</label>
                  <input
                    className="form-input"
                    type="text"
                    id="f-year"
                    value={dramaForm.year}
                    onChange={e => setDramaForm(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g. 2025"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f-rating">Rating (Stars)</label>
                  <input
                    className="form-input"
                    type="text"
                    id="f-rating"
                    value={dramaForm.rating}
                    onChange={e => setDramaForm(prev => ({ ...prev, rating: e.target.value }))}
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '10px', marginBottom: '20px' }}>
                <label className="form-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="f-trending"
                    checked={dramaForm.trending}
                    onChange={e => setDramaForm(prev => ({ ...prev, trending: e.target.checked }))}
                  />
                  <span>Mark as Trending</span>
                </label>
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

      {/* Episode Modal - Positioned outside container for fixed positioning to work in transformed layouts */}
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
    </>
  );
}
