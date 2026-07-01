const PATTERNS = {
  youtube: [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ],
  tiktok: /tiktok\.com\/@[^/]+\/video\/(\d+)/,
  vimeo: /vimeo\.com\/(?:video\/)?(\d+)/,
  dailymotion: /dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/
};

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
  return /\.(mp4|webm|ogg|m3u8|mkv)(\?|$|#)/i.test(url);
}

export const Embed = {
  getEmbedUrl(url) {
    if (!url || typeof url !== 'string') return '';
    url = url.trim();

    if (/\/embed\/|embed\.php|player\.vimeo/.test(url)) return url;

    const ytId = extractYouTubeId(url);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`;
    }

    if (isFacebook(url)) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=640&autoplay=0`;
    }

    const ttM = url.match(PATTERNS.tiktok);
    if (ttM) {
      return `https://www.tiktok.com/embed/v2/${ttM[1]}`;
    }

    const vmM = url.match(PATTERNS.vimeo);
    if (vmM) {
      return `https://player.vimeo.com/video/${vmM[1]}?badge=0&autopause=0`;
    }

    const dmM = url.match(PATTERNS.dailymotion);
    if (dmM) {
      return `https://www.dailymotion.com/embed/video/${dmM[1]}`;
    }

    return url;
  },

  getType(url) {
    if (!url) return 'other';
    if (/youtube|youtu\.be/.test(url))                      return 'youtube';
    if (/facebook|fb\.watch/.test(url))                     return 'facebook';
    if (/tiktok/.test(url))                                 return 'tiktok';
    if (/vimeo/.test(url))                                  return 'vimeo';
    if (/dailymotion/.test(url))                            return 'dailymotion';
    if (/\.(mp4|webm|ogg|m3u8|mkv)(\?|$|#)/i.test(url))   return 'direct';
    return 'other';
  }
};
