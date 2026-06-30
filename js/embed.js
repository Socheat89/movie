/* =============================================================
   DramaStream — Video Embed Engine
   Converts YouTube / Facebook / TikTok / Vimeo / Dailymotion
   standard share URLs into embeddable iframe src URLs.
============================================================= */

const Embed = (function () {
  'use strict';

  /* ── URL pattern matchers ───────────────────────────────────── */
  const PATTERNS = {
    // Standard watch URL:  https://www.youtube.com/watch?v=VIDEO_ID
    // Short URL:           https://youtu.be/VIDEO_ID
    // Shorts:              https://www.youtube.com/shorts/VIDEO_ID
    youtube: [
      /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ],

    // https://www.tiktok.com/@user/video/1234567890123456789
    tiktok: /tiktok\.com\/@[^/]+\/video\/(\d+)/,

    // https://vimeo.com/123456789
    vimeo: /vimeo\.com\/(?:video\/)?(\d+)/,

    // https://www.dailymotion.com/video/x7abcde
    dailymotion: /dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/
  };

  /* ── Helpers ─────────────────────────────────────────────────── */
  function extractYouTubeId(url) {
    for (const pattern of PATTERNS.youtube) {
      const m = url.match(pattern);
      if (m) return m[1];
    }
    return null;
  }

  function isFacebook(url) {
    return /facebook\.com|fb\.watch/.test(url);
  }

  function isDirectVideo(url) {
    // Direct CDN video files: .mp4, .webm, .ogg, .m3u8
    return /\.(mp4|webm|ogg|m3u8|mkv)(\?|$|#)/i.test(url);
  }

  /* ── Public API ──────────────────────────────────────────────── */
  return {
    /**
     * Convert any supported video URL into an embed URL.
     * @param {string} url  — original share/watch URL
     * @returns {string}    — embeddable iframe src, or original URL if unrecognised
     */
    getEmbedUrl(url) {
      if (!url || typeof url !== 'string') return '';
      url = url.trim();

      // Already an embed URL — return as-is
      if (/\/embed\/|embed\.php|player\.vimeo/.test(url)) return url;

      // YouTube
      const ytId = extractYouTubeId(url);
      if (ytId) {
        return `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`;
      }

      // Facebook Video
      if (isFacebook(url)) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=640&autoplay=0`;
      }

      // TikTok
      const ttM = url.match(PATTERNS.tiktok);
      if (ttM) {
        return `https://www.tiktok.com/embed/v2/${ttM[1]}`;
      }

      // Vimeo
      const vmM = url.match(PATTERNS.vimeo);
      if (vmM) {
        return `https://player.vimeo.com/video/${vmM[1]}?badge=0&autopause=0`;
      }

      // Dailymotion
      const dmM = url.match(PATTERNS.dailymotion);
      if (dmM) {
        return `https://www.dailymotion.com/embed/video/${dmM[1]}`;
      }

      // Unknown — return as-is (may be a direct embed already)
      return url;
    },

    /**
     * Detect the platform of a URL.
     * @returns {string} 'youtube' | 'facebook' | 'tiktok' | 'vimeo' | 'dailymotion' | 'other'
     */
    getType(url) {
      if (!url) return 'other';
      if (/youtube|youtu\.be/.test(url))                      return 'youtube';
      if (/facebook|fb\.watch/.test(url))                     return 'facebook';
      if (/tiktok/.test(url))                                 return 'tiktok';
      if (/vimeo/.test(url))                                  return 'vimeo';
      if (/dailymotion/.test(url))                            return 'dailymotion';
      if (/\.(mp4|webm|ogg|m3u8|mkv)(\?|$|#)/i.test(url))   return 'direct';
      return 'other';
    },

    /**
     * Render a player or launch-card for the given video URL.
     * Facebook URLs → styled "Watch on Facebook" button (embed blocked by FB policy).
     * All others    → standard iframe embed.
     */
    renderPlayer(url) {
      if (!url) {
        return `
          <div class="player-no-video">
            <div class="nvid-icon">▶</div>
            <p>No video selected</p>
            <small>Select an episode from the list to start watching.</small>
          </div>`;
      }

      const type = this.getType(url);

      /* ── Direct MP4 / CDN video URL ────────────────────────────
         Render using the browser's native HTML5 <video> player.
         Supports: .mp4, .webm, .m3u8 (CDN/HLS streams)
      ─────────────────────────────────────────────────────────── */
      if (type === 'direct' || isDirectVideo(url)) {
        // Normalize URL (fix common typos like httpS:// → https://)
        const cleanUrl = url.replace(/^httpS:\/\//i, 'https://');
        return `<video
          controls
          autoplay
          preload="auto"
          controlslist="nodownload"
          oncontextmenu="return false;"
        >
          <source src="${cleanUrl}" type="video/mp4">
          <p style="color:#fff;padding:20px;">Your browser does not support video playback.</p>
        </video>`;
      }

      /* ── Facebook: cannot be embedded on external domains ──────
         Facebook's plugin/video.php requires the embedding domain
         to be whitelisted in Facebook's developer app settings.
         Solution: open video directly on Facebook in a new tab.
      ─────────────────────────────────────────────────────────── */
      if (type === 'facebook') {
        return `
          <div class="player-no-video" style="gap:18px;">
            <div style="font-size:3rem;">📘</div>
            <p style="font-size:1rem;font-weight:700;color:var(--text);">Facebook Video</p>
            <small style="color:var(--text-2);text-align:center;line-height:1.7;max-width:320px;">
              Facebook videos cannot be embedded directly.<br>
              Click below to watch it on Facebook.
            </small>
            <a
              href="${url}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary"
              style="margin-top:4px;gap:10px;font-size:0.95rem;padding:13px 28px;"
            >
              <span style="font-size:1.1rem;">▶</span> Watch on Facebook
            </a>
          </div>`;
      }

      /* ── All other platforms: standard iframe embed ─────────── */
      const embedUrl = this.getEmbedUrl(url);

      return `<iframe
        src="${embedUrl}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
        title="Episode Player"
      ></iframe>`;
    }
  };
})();
