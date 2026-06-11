import { cdnUrl, toCdnUrl } from './cdn';
import { resolveDomainMediaUrl } from './mediaBuckets';

export function isYouTubeUrl(url) {
  return /youtu\.be|youtube\.com/.test(url || '');
}

export function toYouTubeEmbed(url) {
  try {
    if (!url) return '';
    const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
    const watchMatch = url.match(/[?&]v=([\w-]+)/);
    const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
    const id =
      (shortMatch && shortMatch[1]) ||
      (watchMatch && watchMatch[1]) ||
      (embedMatch && embedMatch[1]);
    if (!id) return url;
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
  } catch {
    return url;
  }
}

/**
 * Resolve a playable URL for a video record (MP4/CDN or YouTube embed).
 * @param {object} video
 * @param {'fitness'|'squash'|string} [domain='fitness']
 */
export function resolveVideoPlayUrl(video, domain = 'fitness') {
  if (!video) return '';

  if (video.video_url) {
    if (isYouTubeUrl(video.video_url)) return toYouTubeEmbed(video.video_url);
    if (/^https?:\/\//.test(video.video_url)) return toCdnUrl(video.video_url);
  }

  if (video.video_path) {
    if (/^https?:\/\//.test(video.video_path)) return toCdnUrl(video.video_path);
    if (domain === 'squash') {
      return resolveDomainMediaUrl(null, video.video_path, 'squash', 'videos');
    }
    const normalized = String(video.video_path).replace(/^\/+/, '');
    return cdnUrl('videos', normalized) || '';
  }

  return '';
}
