/* =============================================================
   DramaStream — Data Layer
   LocalStorage CRUD store with seed data
============================================================= */

const DB = (function () {
  'use strict';

  const STORE_KEY = 'dramastream_v2';

  /* ── Seed Data ─────────────────────────────────────────────── */
  const SEED = {
    adminHash: 'YWRtaW4xMjM=', // base64('admin123')
    categories: ['Romance', 'Action', 'Thriller', 'Comedy', 'Mystery', 'Fantasy'],
    dramas: [
      {
        id: 'd1',
        title: 'Crash Landing on You',
        description: 'A South Korean heiress accidentally paraglides into North Korean territory during a storm and meets a chic and warm-hearted army officer. He makes every effort to help her return home safely while love blossoms between the two.',
        poster: 'https://picsum.photos/seed/cloy/300/450',
        genre: 'Romance',
        trending: true,
        createdAt: Date.now() - 9e8,
        episodes: [
          { id: 'e1-1', title: 'Episode 1 — A Crash Landing', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e1-2', title: 'Episode 2 — Dangerous Territory', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e1-3', title: 'Episode 3 — Border Crossing', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e1-4', title: 'Episode 4 — Hidden Feelings', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e1-5', title: 'Episode 5 — The Escape Plan', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd2',
        title: 'Goblin: The Lonely and Great God',
        description: 'A goblin who has lived for 939 years seeks his human bride who alone can end his immortal life. Alongside him lives a grim reaper with no memories of his past, and together they form an unlikely found family.',
        poster: 'https://picsum.photos/seed/goblin/300/450',
        genre: 'Fantasy',
        trending: true,
        createdAt: Date.now() - 8e8,
        episodes: [
          { id: 'e2-1', title: 'Episode 1 — The Goblin\'s Bride', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e2-2', title: 'Episode 2 — The First Love', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e2-3', title: 'Episode 3 — Sword in His Chest', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e2-4', title: 'Episode 4 — The Grim Reaper', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd3',
        title: 'Vincenzo',
        description: 'A Korean-Italian Mafia consigliere returns to Korea to retrieve gold hidden beneath a Seoul plaza. Using villainous methods to fight corporate villains, he partners with a fiery lawyer to deliver justice in the most unorthodox way.',
        poster: 'https://picsum.photos/seed/vincenzo/300/450',
        genre: 'Action',
        trending: true,
        createdAt: Date.now() - 7e8,
        episodes: [
          { id: 'e3-1', title: 'Episode 1 — The Cassano Family', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e3-2', title: 'Episode 2 — Geumga Plaza', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e3-3', title: 'Episode 3 — The Cornetto Alliance', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e3-4', title: 'Episode 4 — The Chairman\'s Secret', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd4',
        title: 'Squid Game',
        description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games inside a secret facility. Unbeknownst to them, a deadly prize awaits — and losing means death. A brutal, unforgettable survival thriller.',
        poster: 'https://picsum.photos/seed/squidgame/300/450',
        genre: 'Thriller',
        trending: true,
        createdAt: Date.now() - 6e8,
        episodes: [
          { id: 'e4-1', title: 'Episode 1 — Red Light, Green Light', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e4-2', title: 'Episode 2 — Hell', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e4-3', title: 'Episode 3 — The Man with the Umbrella', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e4-4', title: 'Episode 4 — Stick to the Team', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e4-5', title: 'Episode 5 — A Fair World', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd5',
        title: 'Itaewon Class',
        description: 'After his father is killed by a food industry tycoon\'s son, an ex-convict builds a street-food business empire in Itaewon. With a ragtag team and sheer determination, he wages war against the corrupt corporation responsible.',
        poster: 'https://picsum.photos/seed/itaewon/300/450',
        genre: 'Action',
        trending: false,
        createdAt: Date.now() - 5e8,
        episodes: [
          { id: 'e5-1', title: 'Episode 1 — The Beginning', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e5-2', title: 'Episode 2 — A New Day', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e5-3', title: 'Episode 3 — Pride', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd6',
        title: 'My Love from the Star',
        description: 'An alien who arrived on Earth 400 years ago during the Joseon era falls in love with a top actress as his final days on the planet finally approach. A timeless romance spanning centuries.',
        poster: 'https://picsum.photos/seed/lovefromstar/300/450',
        genre: 'Romance',
        trending: false,
        createdAt: Date.now() - 4e8,
        episodes: [
          { id: 'e6-1', title: 'Episode 1 — 400 Years', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e6-2', title: 'Episode 2 — The Actress Next Door', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e6-3', title: 'Episode 3 — First Touch', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd7',
        title: 'Kingdom',
        description: 'Set in Korea\'s Joseon period, a crown prince investigates a mysterious plague turning people into monsters, while powerful court factions conspire to seize the throne. A gripping period political-zombie thriller.',
        poster: 'https://picsum.photos/seed/kingdom2/300/450',
        genre: 'Thriller',
        trending: true,
        createdAt: Date.now() - 3e8,
        episodes: [
          { id: 'e7-1', title: 'Episode 1 — The Kingdom\'s Curse', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e7-2', title: 'Episode 2 — The Physician', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e7-3', title: 'Episode 3 — North of the Wall', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd8',
        title: 'Strong Woman Do Bong-soon',
        description: 'A woman born with superhuman strength dreams of becoming a game developer. She becomes the personal bodyguard of a quirky gaming CEO, and sweet romance blossoms as they tackle a serial kidnapper terrorizing her neighborhood.',
        poster: 'https://picsum.photos/seed/strongwoman/300/450',
        genre: 'Comedy',
        trending: false,
        createdAt: Date.now() - 2e8,
        episodes: [
          { id: 'e8-1', title: 'Episode 1 — Superhuman Girl', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e8-2', title: 'Episode 2 — The Bodyguard', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e8-3', title: 'Episode 3 — Secret Revealed', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd9',
        title: 'Hotel Del Luna',
        description: 'A luxurious but eerie hotel that caters exclusively to wandering souls is managed by a beautiful yet ill-tempered owner who has been bound to it for over 1,300 years as divine punishment for a sin committed long ago.',
        poster: 'https://picsum.photos/seed/hoteldelluna/300/450',
        genre: 'Fantasy',
        trending: false,
        createdAt: Date.now() - 1e8,
        episodes: [
          { id: 'e9-1', title: 'Episode 1 — Check In', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e9-2', title: 'Episode 2 — The Hotel Manager', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e9-3', title: 'Episode 3 — Souls of the Night', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      },
      {
        id: 'd10',
        title: 'Signal',
        description: 'A criminal profiler in the present communicates with a detective from 1986 through a mysterious walkie-talkie. Together across time, they work to solve cold cases — but altering the past has unforeseen consequences.',
        poster: 'https://picsum.photos/seed/signal2/300/450',
        genre: 'Mystery',
        trending: false,
        createdAt: Date.now(),
        episodes: [
          { id: 'e10-1', title: 'Episode 1 — The Signal', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e10-2', title: 'Episode 2 — Past & Present', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
          { id: 'e10-3', title: 'Episode 3 — The First Case', videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }
        ]
      }
    ]
  };

  /* ── Internal helpers ──────────────────────────────────────── */
  function uid() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* ── Public API ────────────────────────────────────────────── */
  return {
    /* Read full store */
    get() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) {
          const seed = deepClone(SEED);
          this.save(seed);
          return seed;
        }
        return JSON.parse(raw);
      } catch (e) {
        return deepClone(SEED);
      }
    },

    save(data) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('[DB] Save failed (storage full?):', e);
      }
    },

    /* ── Drama CRUD ──────────────────────────────────────────── */
    getDramas()     { return this.get().dramas || []; },
    getDrama(id)    { return this.getDramas().find(d => d.id === id) || null; },

    addDrama(drama) {
      const db = this.get();
      drama.id        = uid();
      drama.createdAt = Date.now();
      drama.episodes  = drama.episodes || [];
      db.dramas.unshift(drama);
      this.save(db);
      return drama;
    },

    updateDrama(id, updates) {
      const db  = this.get();
      const idx = db.dramas.findIndex(d => d.id === id);
      if (idx > -1) {
        db.dramas[idx] = { ...db.dramas[idx], ...updates };
        this.save(db);
        return true;
      }
      return false;
    },

    deleteDrama(id) {
      const db = this.get();
      db.dramas = db.dramas.filter(d => d.id !== id);
      this.save(db);
    },

    /* ── Episode CRUD ────────────────────────────────────────── */
    addEpisode(dramaId, ep) {
      const db    = this.get();
      const drama = db.dramas.find(d => d.id === dramaId);
      if (!drama) return null;
      ep.id          = uid();
      ep.createdAt   = Date.now();
      drama.episodes = drama.episodes || [];
      drama.episodes.push(ep);
      this.save(db);
      return ep;
    },

    updateEpisode(dramaId, epId, updates) {
      const db    = this.get();
      const drama = db.dramas.find(d => d.id === dramaId);
      if (!drama) return false;
      const idx = (drama.episodes || []).findIndex(e => e.id === epId);
      if (idx > -1) {
        drama.episodes[idx] = { ...drama.episodes[idx], ...updates };
        this.save(db);
        return true;
      }
      return false;
    },

    deleteEpisode(dramaId, epId) {
      const db    = this.get();
      const drama = db.dramas.find(d => d.id === dramaId);
      if (!drama) return;
      drama.episodes = (drama.episodes || []).filter(e => e.id !== epId);
      this.save(db);
    },

    /* ── Categories ──────────────────────────────────────────── */
    getCategories() { return this.get().categories || []; },

    /* ── Auth ────────────────────────────────────────────────── */
    checkAdmin(pwd) {
      return btoa(String(pwd)) === this.get().adminHash;
    },

    setAdminPassword(pwd) {
      const db     = this.get();
      db.adminHash = btoa(String(pwd));
      this.save(db);
    },

    /* ── Dev Helpers ─────────────────────────────────────────── */
    reset() {
      localStorage.removeItem(STORE_KEY);
      console.log('[DB] Store reset to seed data.');
    },

    /* ── Migration: inject built-in dramas if missing ────────── */
    patchBuiltins() {
      const db     = this.get();
      const titles = db.dramas.map(d => d.title);

      /* ── Sdach Sva 2023 (ស្តេចស្វា ២០២៣) ──────────────────── */
      if (!titles.includes('Sdach Sva 2023')) {
        const eps = [
          { id:'ss01', title:'Episode 1',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1OqBEF.mp4' },
          { id:'ss02', title:'Episode 2',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1JpMIW.mp4' },
          { id:'ss03', title:'Episode 3',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2I083P.mp4' },
          { id:'ss04', title:'Episode 4',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1PGG23.mp4' },
          { id:'ss05', title:'Episode 5',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2l8GiH.mp4' },
          { id:'ss06', title:'Episode 6',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0PyCnp.mp4' },
          { id:'ss07', title:'Episode 7',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0H0QHJ.mp4' },
          { id:'ss08', title:'Episode 8',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2KDwbb.mp4' },
          { id:'ss09', title:'Episode 9',   videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1ILY4J.mp4' },
          { id:'ss10', title:'Episode 10',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0HvGoy.mp4' },
          { id:'ss11', title:'Episode 11',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2XI1px.mp4' },
          { id:'ss12', title:'Episode 12',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2B7lvU.mp4' },
          { id:'ss13', title:'Episode 13',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0NT7VQ.mp4' },
          { id:'ss14', title:'Episode 14',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0NeJto.mp4' },
          { id:'ss15', title:'Episode 15',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2J4qmm.mp4' },
          { id:'ss16', title:'Episode 16',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1YUdgx.mp4' },
          { id:'ss17', title:'Episode 17',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2ouHF5.mp4' },
          { id:'ss18', title:'Episode 18',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0KQnit.mp4' },
          { id:'ss19', title:'Episode 19',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0MeIOn.mp4' },
          { id:'ss20', title:'Episode 20',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1KlEuV.mp4' },
          { id:'ss21', title:'Episode 21',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1KlFJ7.mp4' },
          { id:'ss22', title:'Episode 22',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2NIyUb.mp4' },
          { id:'ss23', title:'Episode 23',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1OJwsK.mp4' },
          { id:'ss24', title:'Episode 24',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2kpM9X.mp4' },
          { id:'ss25', title:'Episode 25',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0KP0py.mp4' },
          { id:'ss26', title:'Episode 26',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2SiFIw.mp4' },
          { id:'ss27', title:'Episode 27',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0KaBkC.mp4' },
          { id:'ss28', title:'Episode 28',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1PK3ju.mp4' },
          { id:'ss29', title:'Episode 29',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1UP7fd.mp4' },
          { id:'ss30', title:'Episode 30',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2LGzo0.mp4' },
          { id:'ss31', title:'Episode 31',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1LG0lm.mp4' },
          { id:'ss32', title:'Episode 32',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1LOXBC.mp4' },
          { id:'ss33', title:'Episode 33',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0qt6G5.mp4' },
          { id:'ss34', title:'Episode 34',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1TgVsA.mp4' },
          { id:'ss35', title:'Episode 35',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0UhZ9R.mp4' },
          { id:'ss36', title:'Episode 36',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1qCK45.mp4' },
          { id:'ss37', title:'Episode 37',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0l8XaX.mp4' },
          { id:'ss38', title:'Episode 38',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0U0uqR.mp4' },
          { id:'ss39', title:'Episode 39',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2lHKiv.mp4' },
          { id:'ss40', title:'Episode 40',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1N2tRV.mp4' },
          { id:'ss41', title:'Episode 41',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2R6wiQ.mp4' },
          { id:'ss42', title:'Episode 42',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1PX06b.mp4' },
          { id:'ss43', title:'Episode 43',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2PY6L1.mp4' },
          { id:'ss44', title:'Episode 44',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1m4VML.mp4' },
          { id:'ss45', title:'Episode 45',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0UmILA.mp4' },
          { id:'ss46', title:'Episode 46',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1g6KVq.mp4' },
          { id:'ss47', title:'Episode 47',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1MnBi0.mp4' },
          { id:'ss48', title:'Episode 48',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0U4aHM.mp4' },
          { id:'ss49', title:'Episode 49',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2mMvA9.mp4' },
          { id:'ss50', title:'Episode 50',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0cKgJl.mp4' },
          { id:'ss51', title:'Episode 51',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2N5QYC.mp4' },
          { id:'ss52', title:'Episode 52',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1Rbx7u.mp4' },
          { id:'ss53', title:'Episode 53',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2Qazsb.mp4' },
          { id:'ss54', title:'Episode 54',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0cvGbZ.mp4' },
          { id:'ss55', title:'Episode 55',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1WqDpd.mp4' },
          { id:'ss56', title:'Episode 56',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1SvU4E.mp4' },
          { id:'ss57', title:'Episode 57',  videoUrl:'https://channelcom.tech/GkVuk7?from=copy_link' },
          { id:'ss58', title:'Episode 58',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0Q3E3P.mp4' },
          { id:'ss59', title:'Episode 59',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2S5Q1c.mp4' },
          { id:'ss60', title:'Episode 60',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2oZQy9.mp4' },
          { id:'ss61', title:'Episode 61',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2tfgMr.mp4' },
          { id:'ss62', title:'Episode 62',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2tfgMr.mp4' },
          { id:'ss63', title:'Episode 63',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1Tj40o.mp4' },
          { id:'ss64', title:'Episode 64',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2tK3J5.mp4' },
          { id:'ss65', title:'Episode 65',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1Tumw2.mp4' },
          { id:'ss66', title:'Episode 66',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1X9n0d.mp4' },
          { id:'ss67', title:'Episode 67',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0T53d2.mp4' },
          { id:'ss68', title:'Episode 68',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2jWTX4.mp4' },
          { id:'ss69', title:'Episode 69',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1PCI1y.mp4' },
          { id:'ss70', title:'Episode 70',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2ecP4Z.mp4' },
          { id:'ss71', title:'Episode 71',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0ussx5.mp4' },
          { id:'ss72', title:'Episode 72',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0QvZXJ.mp4' },
          { id:'ss73', title:'Episode 73',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0Sxle1.mp4' },
          { id:'ss74', title:'Episode 74',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2VAz42.mp4' },
          { id:'ss75', title:'Episode 75',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2vbh5r.mp4' },
          { id:'ss76', title:'Episode 76',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0QHhp0.mp4' },
          { id:'ss77', title:'Episode 77',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0TKy3n.mp4' },
          { id:'ss78', title:'Episode 78',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0qufvL.mp4' },
          { id:'ss79', title:'Episode 79',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1kmF4e.mp4' },
          { id:'ss80', title:'Episode 80',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2Refe7.mp4' },
          { id:'ss81', title:'Episode 81',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2JWmj6.mp4' },
          { id:'ss82', title:'Episode 82',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1S9xHt.mp4' },
          { id:'ss83', title:'Episode 83',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2VD60K.mp4' },
          { id:'ss84', title:'Episode 84',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1SKo6J.mp4' },
          { id:'ss85', title:'Episode 85',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0wpfg5.mp4' },
          { id:'ss86', title:'Episode 86',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2rvfWv.mp4' },
          { id:'ss87', title:'Episode 87',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1SWPLJ.mp4' },
          { id:'ss88', title:'Episode 88',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0KZPJs.mp4' },
          { id:'ss89', title:'Episode 89',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0ZoxNY.mp4' },
          { id:'ss90', title:'Episode 90',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/2lBtoS.mp4' },
          { id:'ss91', title:'Episode 91',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1wM9Er.mp4' },
          { id:'ss92', title:'Episode 92',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0XqbFQ.mp4' },
          { id:'ss93', title:'Episode 93',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1sB4v9.mp4' },
          { id:'ss94', title:'Episode 94',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/1Vzk9P.mp4' },
          { id:'ss95', title:'Episode 95',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s7/0hBExl.mp4' },
          { id:'ss96', title:'Episode 96',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/1GYN3r.mp4' },
          { id:'ss97', title:'Episode 97',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/25uW04.mp4' },
          { id:'ss98', title:'Episode 98',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/1pf6wW.mp4' },
          { id:'ss99', title:'Episode 99',  videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/0m7EaO.mp4' },
          { id:'ss100',title:'Episode 100', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/2uQPSY.mp4' },
          { id:'ss101',title:'Episode 101', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/1uvapR.mp4' },
          { id:'ss102',title:'Episode 102', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/0HyRFT.mp4' },
          { id:'ss103',title:'Episode 103', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/2vdUOd.mp4' },
          { id:'ss104',title:'Episode 104', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/2vn9fd.mp4' },
          { id:'ss105',title:'Episode 105', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/0fYwns.mp4' },
          { id:'ss106',title:'Episode 106', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/0quIru.mp4' },
          { id:'ss107',title:'Episode 107', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/1Hp76H.mp4' },
          { id:'ss108',title:'Episode 108', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/0rS7Zu.mp4' },
          { id:'ss109',title:'Episode 109', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/0DoibL.mp4' },
          { id:'ss110',title:'Episode 110', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/12ItBZ.mp4' },
          { id:'ss111',title:'Episode 111', videoUrl:'https://bigf.bigo.sg/asia_live/V4s2/1vBwik.mp4' }
        ];

        db.dramas.unshift({
          id:          'sdach-sva-2023',
          title:       'Sdach Sva 2023',
          description: 'ស្តេចស្វា ២០២៣ — រឿងភាគខ្មែរដ៏ល្បីល្បាញ ដែលនិយាយអំពីស្តេចស្វា ព្រះវររាជ ដ៏មានអំណាចខ្លាំង ដែលតស៊ូប្រឆាំងនឹងអំពើអាក្រក់ ដើម្បីការពារប្រជារាស្ត្រ និងផែនដីទាំងមូល ។ ត្រូវបានស្វាគមន៍ដ៏ខ្លាំងពីអ្នកទស្សនាកម្ពុជា នៅឆ្នាំ ២០២៣ ។',
          poster:      'https://picsum.photos/seed/sdachsva2023/300/450',
          genre:       'Action',
          trending:    true,
          createdAt:   Date.now(),
          episodes:    eps
        });

        this.save(db);
        console.log('[DB] Patched: Sdach Sva 2023 added (111 episodes).');
      }
    }
  };
})();

