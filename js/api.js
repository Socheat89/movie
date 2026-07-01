/* =============================================================
   DramaStream — API Client
   Replaces localStorage DB. All data fetched from FastAPI backend.
   Set API_BASE_URL to your deployed backend URL when going live.
============================================================= */

const API_BASE_URL = (function () {
  // Auto-detect: if running locally use localhost, else use production URL.
  // Change the production URL below after deploying to Render/Railway.
  const LOCAL  = 'http://localhost:8000';
  const PROD   = 'https://backend-cb159e78.fastapicloud.dev';

  return (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.protocol === 'file:')
    ? LOCAL
    : PROD;
})();

/* ── Shared fetch with no-cache headers ───────────────────────── */
async function apiFetch(path, options = {}) {
  const url = API_BASE_URL + path;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(err.detail || 'API error'), { status: res.status });
  }
  return res.json();
}

/* ── Admin session (in-memory only — no localStorage) ────────── */
const _admin = { authed: false };

/* =============================================================
   PUBLIC API — mirrors old DB interface used by page scripts
============================================================= */
const API = {

  /* ── Dramas ──────────────────────────────────────────────── */
  async getDramas() {
    return apiFetch('/api/dramas');
  },

  async getDrama(id) {
    try { return await apiFetch(`/api/dramas/${id}`); }
    catch (e) { return null; }
  },

  async getEpisodes(dramaId) {
    try { return await apiFetch(`/api/dramas/${dramaId}/episodes`); }
    catch (e) { return []; }
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

  /* ── Episodes ────────────────────────────────────────────── */
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

  /* ── Categories ──────────────────────────────────────────── */
  async getCategories() {
    try { return await apiFetch('/api/categories'); }
    catch (e) { return ['Romance','Action','Thriller','Comedy','Mystery','Fantasy','Biography']; }
  },

  /* ── Auth ────────────────────────────────────────────────── */
  async checkAdmin(password) {
    try {
      await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      _admin.authed = true;
      return true;
    } catch (e) {
      return false;
    }
  },

  isAuthed() { return _admin.authed; },
  logout()   { _admin.authed = false; },

  /* ── Import drama from uploaded JSON (admin) ─────────────── */
  async importDramaFromJson(drama) {
    return this.addDrama(drama);
  }
};
