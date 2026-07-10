const API_BASE_URL = (function () {
  const LOCAL = 'http://localhost:8000';
  const PRODUCTION = 'https://movie.mekongcyberunit.app/backend/public';

  // Use local server for localhost development, production otherwise
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? LOCAL : PRODUCTION;
})();

async function apiFetch(path, options = {}) {
  const url = API_BASE_URL + path;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(err.detail || err.message || 'API error'), { status: res.status });
  }
  return res.json();
}

let _authed = false;

export const API = {
  async getDramas() {
    return apiFetch('/api/dramas');
  },

  async getDrama(id) {
    try {
      return await apiFetch(`/api/dramas/${id}`);
    } catch (e) {
      return null;
    }
  },

  async getEpisodes(dramaId) {
    try {
      return await apiFetch(`/api/dramas/${dramaId}/episodes`);
    } catch (e) {
      return [];
    }
  },

  async addDrama(drama) {
    return apiFetch('/api/dramas', {
      method: 'POST',
      body: JSON.stringify(drama)
    });
  },

  async updateDrama(id, updates) {
    return apiFetch(`/api/dramas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteDrama(id) {
    return apiFetch(`/api/dramas/${id}`, { method: 'DELETE' });
  },

  async addEpisode(dramaId, ep) {
    return apiFetch(`/api/dramas/${dramaId}/episodes`, {
      method: 'POST',
      body: JSON.stringify(ep)
    });
  },

  async updateEpisode(dramaId, epId, updates) {
    return apiFetch(`/api/dramas/${dramaId}/episodes/${epId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteEpisode(dramaId, epId) {
    return apiFetch(`/api/dramas/${dramaId}/episodes/${epId}`, { method: 'DELETE' });
  },

  async getCategories() {
    try {
      return await apiFetch('/api/categories');
    } catch (e) {
      return ['Romance', 'Action', 'Thriller', 'Comedy', 'Mystery', 'Fantasy', 'Biography'];
    }
  },

  async checkAdmin(password) {
    try {
      await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      _authed = true;
      localStorage.setItem('admin_authed', 'true');
      return true;
    } catch (e) {
      return false;
    }
  },

  isAuthed() {
    if (!_authed) {
      _authed = localStorage.getItem('admin_authed') === 'true';
    }
    return _authed;
  },

  async scrapeUrl(url) {
    return apiFetch('/api/admin/scrape', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  },

  async scrapePreview(url) {
    return apiFetch('/api/admin/scrape-preview', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  },

  async scrapeImport(movies, category) {
    return apiFetch('/api/admin/scrape-import', {
      method: 'POST',
      body: JSON.stringify({ movies, category })
    });
  },

  async saveCategories(categories) {
    return apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ categories })
    });
  },

  async bulkUpdateGenre(genre, assignedIds) {
    return apiFetch('/api/dramas/bulk-genre', {
      method: 'POST',
      body: JSON.stringify({ genre, assigned_ids: assignedIds })
    });
  },

  async changePassword(old_password, new_password) {
    return apiFetch('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password })
    });
  },

  async getSponsorQr() {
    return apiFetch('/api/settings/sponsor-qr');
  },

  async saveSponsorQr(qr_url) {
    return apiFetch('/api/settings/sponsor-qr', {
      method: 'POST',
      body: JSON.stringify({ qr_url })
    });
  },

  async uploadSponsorQr(file) {
    const formData = new FormData();
    formData.append('qr_file', file);
    const url = API_BASE_URL + '/api/settings/sponsor-qr/upload';
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to upload QR file.');
    }
    return res.json();
  },

  logout() {
    _authed = false;
    localStorage.removeItem('admin_authed');
  }
};
