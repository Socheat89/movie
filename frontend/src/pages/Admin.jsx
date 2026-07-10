import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../api';
import { Embed } from '../embed';
import { CloseIcon, AdminIcon, CheckIcon, InfoIcon, ErrorIcon } from '../components/AnimatedIcons';
import { Modal } from '../components/ui';

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

  // Bulk Scraper Preview Modal States
  const [previewMovies, setPreviewMovies] = useState([]);
  const [selectedPreviewUrls, setSelectedPreviewUrls] = useState([]);
  const [selectedScrapeCategory, setSelectedScrapeCategory] = useState('');
  const [showScrapePreviewModal, setShowScrapePreviewModal] = useState(false);

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
  const [selectedCategoryForAssign, setSelectedCategoryForAssign] = useState('');
  const [assignedDramaIds, setAssignedDramaIds] = useState([]);
  const [categoryDramaSearchQuery, setCategoryDramaSearchQuery] = useState('');
  const [savingAssignments, setSavingAssignments] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryForAssign) {
      setSelectedCategoryForAssign(categories[0]);
    }
  }, [categories, selectedCategoryForAssign]);

  useEffect(() => {
    if (selectedCategoryForAssign) {
      const matchIds = dramas.filter(d => d.genre === selectedCategoryForAssign).map(d => d.id);
      setAssignedDramaIds(matchIds);
    } else {
      setAssignedDramaIds([]);
    }
  }, [selectedCategoryForAssign, dramas]);

  const handleToggleAssignedDrama = (dramaId) => {
    setAssignedDramaIds(prev => 
      prev.includes(dramaId) ? prev.filter(id => id !== dramaId) : [...prev, dramaId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedCategoryForAssign) return;
    setSavingAssignments(true);
    try {
      await API.bulkUpdateGenre(selectedCategoryForAssign, assignedDramaIds);
      showToast(`Successfully assigned dramas to "${selectedCategoryForAssign}"!`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to save assignments: ' + (err.message || 'error'), 'error');
    } finally {
      setSavingAssignments(false);
    }
  };

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

  const loadDashboardData = useCallback(async () => {
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
  }, [activeDramaId]);

  useEffect(() => {
    if (authed) {
      loadDashboardData();
    }
  }, [authed, loadDashboardData]);

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
      showToast('Welcome back, Admin.', 'success');
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

    const isBulkScrape = importUrl.includes('freemovies2u.live') || importUrl.includes('khdiamond.net');

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
      if (isBulkScrape) {
        // Bulk Scrape Preview flow
        const res = await API.scrapePreview(importUrl);
        clearInterval(interval);
        setScrapeProgress(100);
        
        if (!res.movies || res.movies.length === 0) {
          showToast('No movies found on this page.', 'error');
          return;
        }

        setPreviewMovies(res.movies);
        // Initially select all movies
        setSelectedPreviewUrls(res.movies.map(m => m.url));
        // Pre-select detected category if valid, fallback to first category
        const matchedCategory = categories.find(c => c.toLowerCase() === res.detectedCategory.toLowerCase());
        setSelectedScrapeCategory(matchedCategory || categories[0] || 'Action');
        
        setShowScrapePreviewModal(true);
      } else {
        // Original single URL import flow
        const res = await API.scrapeUrl(importUrl);
        clearInterval(interval);
        setScrapeProgress(100);
        if (res.isBulk) {
          showToast(`Bulk imported ${res.importedCount} dramas.`, 'success');
        } else {
          showToast(`Imported "${res.title}" (${res.episodeCount} episodes).`, 'success');
        }
        setImportUrl('');
        loadDashboardData();
      }
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

  const handleImportSelected = async () => {
    if (selectedPreviewUrls.length === 0) {
      showToast('Please select at least one movie to import.', 'error');
      return;
    }

    const selectedMovies = previewMovies.filter(m => selectedPreviewUrls.includes(m.url));
    setScraping(true);
    setScrapeProgress(5);
    setShowScrapePreviewModal(false);

    // Progress bar simulator
    const interval = setInterval(() => {
      setScrapeProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 3;
      });
    }, 400);

    try {
      const res = await API.scrapeImport(selectedMovies, selectedScrapeCategory);
      clearInterval(interval);
      setScrapeProgress(100);
      showToast(`Imported ${res.importedCount} movies into "${selectedScrapeCategory}" category.`, 'success');
      setImportUrl('');
      loadDashboardData();
    } catch (err) {
      clearInterval(interval);
      setScrapeProgress(0);
      console.error(err);
      showToast('Failed to import: ' + (err.message || 'unknown error'), 'error');
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
        showToast(`Imported "${drama.title}".`, 'success');
        loadDashboardData();
      } catch {
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
        showToast('Drama updated.', 'success');
      } else {
        await API.addDrama(payload);
        showToast('Drama created.', 'success');
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

  const loadActiveDramaDetails = useCallback(async () => {
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
  }, [activeDramaId]);

  useEffect(() => {
    if (authed && activeTab === 'episodes') {
      loadActiveDramaDetails();
    }
  }, [activeTab, authed, loadActiveDramaDetails]);

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
        showToast('Episode updated.', 'success');
      } else {
        await API.addEpisode(activeDramaId, episodeForm);
        showToast('Episode added.', 'success');
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
      showToast('Categories list saved successfully.', 'success');
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
      showToast('Password updated successfully.', 'success');
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
      showToast('Sponsor QR code saved successfully.', 'success');
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
      showToast('QR Code image uploaded successfully.', 'success');
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
  const filteredDramas = dramas.filter(d => {
    const query = searchQuery.toLowerCase();
    return (d.title || '').toLowerCase().includes(query) ||
      (d.genre || '').toLowerCase().includes(query);
  });

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

          <form onSubmit={handleLogin} noValidate>
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
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }} disabled={checking}>
              {checking ? 'Checking…' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalEpisodesCount = dramas.reduce((acc, curr) => acc + parseInt(curr.episodeCount || 0, 10), 0);
  const totalViewsCount = dramas.reduce((acc, curr) => acc + parseInt(curr.views || 0, 10), 0);
  return (
    <>
      <div className="admin-layout page-enter">
        {toast.show && (
          <div className={`toast ${toast.type} show`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {toast.type === 'success' && <CheckIcon size={20} />}
            {toast.type === 'info' && <InfoIcon size={20} />}
            {toast.type === 'error' && <ErrorIcon size={20} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
            <div>
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">
                Manage Mekong Movie content — dramas, episodes, categories, and payment settings
                {loadingDashboard && <span style={{ display: 'block', marginTop: '4px', color: 'var(--text-tertiary)' }}>Refreshing data...</span>}
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
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
            <div className="stat-value">{totalViewsCount >= 1000 ? (totalViewsCount / 1000).toFixed(1) + 'K' : totalViewsCount}</div>
            <div className="stat-label">Total Views</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs" role="tablist">
          <button className={`admin-tab ${activeTab === 'dramas' ? 'active' : ''}`} onClick={() => setActiveTab('dramas')}>
            Dramas
          </button>
          <button className={`admin-tab ${activeTab === 'episodes' ? 'active' : ''}`} onClick={() => setActiveTab('episodes')}>
            Episodes
          </button>
          <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            Categories
          </button>
          <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            Settings
          </button>
        </div>

        {/* Tab Body */}
        {activeTab === 'dramas' && (
          <div id="admin-tab-body" className="page-enter">
            <div className="admin-toolbar">
              <input
                className="search-input"
                type="search"
                placeholder="Search dramas by title or genre…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
              />

              {/* Import from URL Form */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 2, minWidth: '300px' }}>
                <input
                  className="form-input"
                  type="url"
                  placeholder="Paste URL (KhmerKomsan, KhDiaMonD, or TMDB)..."
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  style={{ margin: 0, flex: 1 }}
                />
                <button className="btn btn-ghost" onClick={handleScrape} disabled={scraping}>
                  {scraping ? 'Fetching…' : 'Fetch & Import'}
                </button>
              </div>

              <button className="btn btn-ghost" onClick={() => document.getElementById('json-upload').click()}>
                Upload JSON
              </button>
              <input type="file" id="json-upload" accept=".json" onChange={handleJsonUpload} style={{ display: 'none' }} />
              
              {selectedDramaIds.length > 0 && (
                <button 
                  className="btn btn-danger" 
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedDramaIds.length})
                </button>
              )}

              <button className="btn btn-primary" onClick={() => openDramaModal(null)}>
                Add Drama
              </button>
            </div>

            {/* Fetch & Import Progress Bar */}
            {scrapeProgress > 0 && (
              <div className="admin-progress">
                <div className="admin-progress-meta">
                  <span>Importing Drama metadata &amp; episodes...</span>
                  <span>{scrapeProgress}%</span>
                </div>
                <div className="admin-progress-track">
                  <div
                    className="admin-progress-fill"
                    style={{
                      width: `${scrapeProgress}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="admin-table-wrapper">
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
                      <td colSpan="8" className="admin-empty">
                        No dramas yet. Click <strong>Add Drama</strong> or use the Link Scraper tool above.
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
                        <td style={{ color: 'var(--rating-gold)', fontWeight: 'bold' }}>{d.rating || '8.0'}</td>
                        <td style={{ color: 'var(--text-3)' }}>{d.views || 0}</td>
                        <td style={{ textAlign: 'right', paddingRight: '24px', position: 'relative' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === d.id ? null : d.id);
                            }}
                            title="Actions menu"
                          >
                            More
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
                                className="admin-action-menu"
                              >
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    openDramaModal(d);
                                  }}
                                  className="dropdown-action-btn"
                                >
                                  Edit Drama
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    onNavigate(`/watch/${d.id}`);
                                  }}
                                  className="dropdown-action-btn"
                                >
                                  View on Site
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    deleteDrama(d.id, d.title);
                                  }}
                                  className="dropdown-action-btn danger"
                                >
                                  Delete
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
              <div className="admin-pagination">
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
                      style={{ minWidth: '32px', padding: '0' }}
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
              <div className="admin-empty">
                No dramas found.{' '}
                <button className="btn btn-link" onClick={() => setActiveTab('dramas')} style={{ color: 'var(--accent-lt)', textDecoration: 'underline' }}>
                  Add a drama first
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
                  <button className="btn btn-primary" onClick={() => openEpisodeModal(null)}>
                    Add Episode
                  </button>
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
                              No episodes yet. Click <strong>Add Episode</strong> to get started.
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
                                <span className="status-badge">
                                  {Embed.getType(ep.videoUrl)}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button className="btn btn-ghost btn-sm" onClick={() => openEpisodeModal(ep)}>
                                    Edit
                                  </button>
                                  <button className="btn btn-danger btn-sm" onClick={() => deleteEpisode(ep.id, ep.title)}>
                                    Delete
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
          <div id="admin-tab-body" className="page-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px', maxWidth: '1200px' }}>
            {/* Column 1: Manage Categories List */}
            <div className="admin-panel">
              <h2 className="admin-panel-title">Manage Movie Categories</h2>
              <p className="admin-panel-copy">
                Add, remove, and sort categories. Make sure to click <strong>Save Categories</strong> to apply changes to the website filters.
              </p>

              {/* Quick Add from existing drama genres */}
              {(() => {
                const allGenres = [...new Set(dramas.map(d => d.genre).filter(Boolean))];
                const suggestedGenres = allGenres.filter(g => !categories.includes(g));
                if (suggestedGenres.length === 0 && allGenres.length === 0) return null;
                return (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 600 }}>
                        Quick Add from Dramas ({suggestedGenres.length} available)
                      </span>
                      {suggestedGenres.length > 1 && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setCategories([...categories, ...suggestedGenres]);
                            showToast(`Added ${suggestedGenres.length} genres! Don't forget to Save.`, 'success');
                          }}
                          style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                        >
                          Add All ({suggestedGenres.length})
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {suggestedGenres.length === 0 ? (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontStyle: 'italic' }}>All drama genres are already added.</span>
                      ) : (
                        suggestedGenres.map(genre => (
                          <button
                            key={genre}
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setCategories([...categories, genre]);
                              showToast(`Added "${genre}"`, 'success');
                            }}
                            style={{
                              padding: '5px 14px',
                              fontSize: '0.82rem',
                              borderRadius: '100px',
                              border: '1px dashed var(--accent)',
                              color: 'var(--accent-lt)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {genre}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

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
                <button className="btn btn-primary" onClick={handleAddCategory}>
                  Add
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

              <button className="btn btn-primary" onClick={handleSaveCategories} disabled={savingCategories}>
                {savingCategories ? 'Saving…' : 'Save Categories'}
              </button>
            </div>

            {/* Column 2: Bulk Assign Dramas to Categories */}
            <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="admin-panel-title">Assign Dramas to Category</h2>
              <p className="admin-panel-copy">
                Select a category and easily assign or remove multiple dramas by checking their boxes.
              </p>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="assign-category-select">Select Target Category</label>
                <select
                  id="assign-category-select"
                  className="form-input"
                  value={selectedCategoryForAssign}
                  onChange={e => setSelectedCategoryForAssign(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search dramas to assign..."
                  value={categoryDramaSearchQuery}
                  onChange={e => setCategoryDramaSearchQuery(e.target.value)}
                  style={{ width: '100%', margin: 0 }}
                />
              </div>

              <div style={{ 
                flex: 1, 
                minHeight: '260px', 
                maxHeight: '380px', 
                overflowY: 'auto', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r-sm)', 
                background: 'rgba(0,0,0,0.15)',
                padding: '10px',
                marginBottom: '24px'
              }}>
                {(() => {
                  const filtered = dramas.filter(d =>
                    (d.title || '').toLowerCase().includes(categoryDramaSearchQuery.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return <div style={{ color: 'var(--text-3)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>No dramas found.</div>;
                  }
                  return filtered.map(d => {
                    const isAssigned = assignedDramaIds.includes(d.id);
                    return (
                      <div 
                        key={d.id} 
                        onClick={() => handleToggleAssignedDrama(d.id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '8px 10px', 
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isAssigned ? 'rgba(255,255,255,0.03)' : 'transparent',
                          borderBottom: '1px solid rgba(255,255,255,0.02)',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {}} // handled by parent onClick
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                        />
                        <img 
                          src={d.poster} 
                          alt="" 
                          style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: '4px', background: 'var(--bg-3)' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: isAssigned ? 'var(--text)' : 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {d.title}
                          {d.genre && d.genre !== selectedCategoryForAssign && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: '8px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                              current: {d.genre}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleSaveAssignments} 
                disabled={savingAssignments || !selectedCategoryForAssign}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {savingAssignments ? 'Saving Assignments...' : 'Save Assignments'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div id="admin-tab-body" className="page-enter">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', maxWidth: '950px' }}>
              
              {/* Sponsor QR Settings */}
              <div className="admin-panel">
                <h2 className="admin-panel-title">Sponsor QR Code</h2>
                <p className="admin-panel-copy">
                  Paste the URL of your payment QR code (e.g. ABA Pay, ACLEDA, or any public image URL) to show on the watch page.
                </p>

                <form onSubmit={handleSaveSponsorQr} noValidate>
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

                  <button type="submit" className="btn btn-primary" disabled={savingSponsorQr} style={{ width: '100%' }}>
                    {savingSponsorQr ? 'Saving…' : 'Save QR Code'}
                  </button>
                </form>
              </div>

              {/* Change Password Form */}
              <div className="admin-panel">
                <h2 className="admin-panel-title">Update Password</h2>
                <p className="admin-panel-copy">
                  Change your dashboard entry password. Make sure to choose a secure password.
                </p>

                <form onSubmit={handleUpdatePassword} noValidate>
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
                  <button type="submit" className="btn btn-primary" disabled={updatingPassword} style={{ width: '100%' }}>
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
              <h3>{editingDrama ? 'Edit Drama' : 'New Drama'}</h3>
              <button className="modal-close" onClick={() => setDramaModalOpen(false)}>x</button>
            </div>
            <form onSubmit={saveDrama} noValidate>
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
              <h3>{editingEpisode ? 'Edit Episode' : 'Add Episode'}</h3>
              <button className="modal-close" onClick={() => setEpisodeModalOpen(false)}>x</button>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '20px' }}>
              Drama: <strong style={{ color: 'var(--text)' }}>{activeDramaName}</strong>
            </p>
            <form onSubmit={saveEpisode} noValidate>
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
      {/* Bulk Scraper Movie Preview & Select Modal */}
      {showScrapePreviewModal && (
        <Modal
          isOpen={showScrapePreviewModal}
          onClose={() => setShowScrapePreviewModal(false)}
          title="ជ្រើសរើសភាពយន្តដើម្បីទាញយក"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '75vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>ជ្រើសរើស Category:</span>
                <select
                  className="form-input"
                  value={selectedScrapeCategory}
                  onChange={e => setSelectedScrapeCategory(e.target.value)}
                  style={{ margin: 0, width: '180px', height: '36px', padding: '0 10px', fontSize: '13px' }}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedPreviewUrls(previewMovies.map(m => m.url))}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Select All
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedPreviewUrls([])}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Movies List Scroll Grid */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', background: 'rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
                {previewMovies.map(movie => {
                  const isChecked = selectedPreviewUrls.includes(movie.url);
                  return (
                    <div
                      key={movie.url}
                      onClick={() => {
                        setSelectedPreviewUrls(prev =>
                          isChecked ? prev.filter(u => u !== movie.url) : [...prev, movie.url]
                        );
                      }}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: 'var(--r-md)',
                        overflow: 'hidden',
                        border: isChecked ? '2px solid var(--accent)' : '2px solid transparent',
                        background: 'var(--bg-card)',
                        transition: 'all 0.2s ease',
                        boxShadow: isChecked ? '0 0 10px rgba(0, 122, 255, 0.2)' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Checkbox overlay indicator */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        zIndex: 10,
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.4)',
                        background: isChecked ? 'var(--accent)' : 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}>
                        {isChecked && '✓'}
                      </div>

                      {/* Poster */}
                      <div style={{ position: 'relative', width: '100%', paddingTop: '150%', background: 'var(--border)' }}>
                        {movie.poster ? (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--text-3)' }}>No poster</div>
                        )}
                        <span style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          {movie.year}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <p style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          margin: 0,
                          color: 'var(--text)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.3,
                          maxHeight: '2.6em'
                        }}>
                          {movie.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button className="btn btn-ghost" onClick={() => setShowScrapePreviewModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleImportSelected}
                disabled={selectedPreviewUrls.length === 0}
                style={{ borderRadius: 'var(--r-md)' }}
              >
                ទាញយកកុនដែលបានជ្រើសរើស ({selectedPreviewUrls.length})
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
