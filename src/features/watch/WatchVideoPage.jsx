import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import { getSquashTranslation } from '../../shared/i18n';
import { useVideo } from '../../shared/hooks/useVideo';
import { useVideos } from '../../shared/hooks/useVideos';
import { useVideoFavorites } from '../../shared/hooks/useVideoFavorites';
import { resolveVideoPlayUrl } from '../../shared/lib/resolveVideoPlayUrl';
import { getVideoThumbSrc } from '../../shared/lib/videoThumb';
import { buildWatchPath, isWatchVideoId } from '../../shared/lib/watchRoutes';
import { loginPath } from '../../shared/lib/authRoutes';
import VideoPlayer from '../../shared/components/VideoPlayer';
import OptimizedImage from '../fitness/sections/OptimizedImage';
import { WatchLandingChrome } from './WatchLandingChrome';

const SQUASH_WATCH_KEYS = {
  'watch-share': 'videos.share',
  'watch-copied': 'videos.copied',
  'watch-locked-title': 'videos.locked',
  'watch-login-to-watch': 'videos.loginToWatch',
  'watch-not-found': 'videos.notFound',
  'watch-related-videos': 'videos.related',
  'watch-back-videos': 'videos.back',
  'video-loading': 'videos.loading',
  'video-not-available': 'videos.unavailable',
  'video-fullscreen': 'videos.fullscreen',
  'video-exit-fullscreen': 'videos.exitFullscreen',
  'nav.login': 'nav.login',
  'nav.videos': 'nav.videos',
};

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '';
  const total = Math.max(0, Math.floor(Number(seconds)));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function pickTitle(video, isAr) {
  if (!video) return '';
  if (isAr) return video.title_ar || video.title_en || video.title || '';
  return video.title_en || video.title_ar || video.title || '';
}

function pickDescription(video, isAr) {
  if (!video) return '';
  if (isAr) return video.description_ar || video.description_en || '';
  return video.description_en || video.description_ar || '';
}

function pickCategory(video, isAr) {
  if (!video) return '';
  if (typeof video.category === 'string') return video.category;
  if (isAr) {
    return video.categories?.name_ar || video.category_name_ar || video.category || '';
  }
  return video.categories?.name_en || video.category_name_en || video.category || '';
}

function lockedVideoFromError(error) {
  if (error?.status !== 403 || !error.data || typeof error.data !== 'object') return null;
  const data = error.data;
  return {
    ...data,
    canPlay: false,
    title_en: data.title_en || data.titleEn || data.title,
    title_ar: data.title_ar || data.titleAr || data.title,
    thumbnail_url: data.thumbnail_url || data.thumbnailUrl || data.thumb,
    thumbnail_path: data.thumbnail_path || data.thumbnailPath,
    category_name_en: data.category_name_en || data.categoryNameEn || data.category,
    category_name_ar: data.category_name_ar || data.categoryNameAr || data.category,
  };
}

export default function WatchVideoPage({ domain: domainProp }) {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const domain =
    domainProp === 'squash' || domainProp === 'fitness'
      ? domainProp
      : location.pathname.startsWith('/squash/')
        ? 'squash'
        : 'fitness';
  const { currentLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isAr = currentLanguage === 'ar';
  const isRTL = isAr;
  const [copied, setCopied] = useState(false);

  const t = useCallback(
    (key) => {
      if (domain === 'squash') {
        return getSquashTranslation(currentLanguage, SQUASH_WATCH_KEYS[key] || key);
      }
      return getTranslation(key, currentLanguage);
    },
    [domain, currentLanguage]
  );

  const validId = isWatchVideoId(String(videoId || ''));
  const videoQuery = useVideo(domain, validId ? videoId : undefined);
  const { data: catalog = [] } = useVideos(domain);
  const { toggleFavorite, isFavorite } = useVideoFavorites(domain, isAuthenticated);

  const error = videoQuery.error;
  const payload = videoQuery.data;
  const lockedVideo = payload?.locked || payload?.canPlay === false
    ? payload
    : lockedVideoFromError(error);
  const requiresAuth = Boolean(payload?.requiresAuth) || error?.status === 401 || Boolean(error?.data?.requiresAuth);
  const notFound = !validId || Boolean(payload?.notFound) || error?.status === 404;
  const video = requiresAuth || notFound ? lockedVideo : payload || lockedVideo;
  const canPlay = Boolean(payload) && payload.canPlay !== false && !payload.requiresAuth && !payload.notFound && !requiresAuth && !notFound;
  const playUrl = canPlay ? resolveVideoPlayUrl(payload, domain) : '';
  const posterUrl = getVideoThumbSrc(video, domain, 'card').src || video?.thumb || '';
  const title = pickTitle(video, isAr);
  const description = pickDescription(video, isAr);
  const categoryLabel = pickCategory(video, isAr);
  const durationLabel = formatDuration(video?.duration_seconds ?? video?.durationSeconds);
  const loginHref = loginPath(domain, buildWatchPath(domain, videoId));

  useEffect(() => {
    const prev = document.title;
    if (title) document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);

  const related = useMemo(() => {
    if (!video) return [];
    const categoryId = String(video.category_id ?? video.categoryId ?? '');
    return (catalog || [])
      .filter((item) => String(item.id) !== String(videoId))
      .filter((item) => !categoryId || String(item.category_id ?? item.categoryId) === categoryId)
      .slice(0, 8);
  }, [catalog, video, videoId]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const stateBlock = (icon, message, action) => (
    <div className="aspect-video w-full rounded-lg bg-[var(--color-bg-muted)] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}
      <div className="relative z-10">
        <i className={`fas ${icon} text-4xl text-[var(--color-primary)] mb-4`} aria-hidden="true" />
        <p className="text-[var(--color-text)] font-semibold mb-4">{message}</p>
        {action}
      </div>
    </div>
  );

  return (
    <WatchLandingChrome domain={domain}>
      <section className="section-py bg-[var(--color-bg-muted)]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 min-w-0">
              {videoQuery.isLoading && validId ? (
                <div className="aspect-video w-full rounded-lg bg-[var(--color-surface)] animate-pulse" />
              ) : notFound ? (
                stateBlock(
                  'fa-circle-exclamation',
                  t('watch-not-found'),
                  <Link
                    to={`/${domain}#videos`}
                    className="inline-flex items-center text-[var(--color-primary)] hover:underline"
                  >
                    {t('watch-back-videos')}
                  </Link>
                )
              ) : requiresAuth ? (
                stateBlock(
                  'fa-lock',
                  t('watch-login-to-watch'),
                  <button
                    type="button"
                    onClick={() => navigate(loginHref)}
                    className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] text-white px-6 py-2.5 rounded-full font-semibold"
                  >
                    {domain === 'squash' ? t('nav.login') : getTranslation('nav-login', currentLanguage)}
                  </button>
                )
              ) : !canPlay ? (
                stateBlock('fa-lock', t('watch-locked-title'))
              ) : (
                <VideoPlayer
                  playUrl={playUrl}
                  posterUrl={posterUrl}
                  title={title}
                  getLabel={t}
                  notAvailableLabel={t('video-not-available')}
                  className="aspect-video w-full rounded-lg"
                />
              )}

              <div className={`mt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-2">
                  {title || (videoQuery.isLoading ? '…' : '')}
                </h1>
                <div className={`flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)] mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {categoryLabel && <span>{categoryLabel}</span>}
                  {durationLabel && <span>{durationLabel}</span>}
                </div>
                <div className={`flex flex-wrap items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]"
                  >
                    <i className={`fas ${copied ? 'fa-check' : 'fa-share-alt'} ${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />
                    {copied ? t('watch-copied') : t('watch-share')}
                  </button>
                  {isAuthenticated && video?.id && (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(video.id)}
                      className={`px-4 py-2 rounded-xl border border-[var(--color-border)] ${
                        isFavorite(video.id)
                          ? 'bg-[var(--color-warning)] text-[var(--color-text)]'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-warning)]'
                      }`}
                    >
                      <i className={`fas fa-star ${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />
                      {isFavorite(video.id)
                        ? isAr
                          ? 'إزالة من المفضلة'
                          : 'Remove from favorites'
                        : isAr
                          ? 'إضافة إلى المفضلة'
                          : 'Add to favorites'}
                    </button>
                  )}
                </div>
                {description && (
                  <p className="text-[var(--color-text-muted)] whitespace-pre-wrap">{description}</p>
                )}
              </div>
            </div>

            <aside>
              {related.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">{t('watch-related-videos')}</h2>
                  <ul className="space-y-3">
                    {related.map((item) => {
                      const thumb = getVideoThumbSrc(item, domain, 'card').src;
                      const itemTitle = pickTitle(item, isAr);
                      return (
                        <li key={item.id}>
                          <Link
                            to={buildWatchPath(domain, item.id)}
                            className={`flex gap-3 rounded-lg overflow-hidden bg-[var(--color-surface)] hover:shadow-md transition ${isRTL ? 'flex-row-reverse' : ''}`}
                          >
                            <div className="relative w-36 shrink-0 bg-[var(--color-bg-muted)]">
                              {thumb ? (
                                <OptimizedImage
                                  src={thumb}
                                  alt={itemTitle}
                                  className="w-full h-20 object-cover"
                                  width={288}
                                  height={162}
                                />
                              ) : (
                                <div className="w-full h-20 flex items-center justify-center">
                                  <i className="fas fa-video text-[var(--color-text-muted)]" aria-hidden="true" />
                                </div>
                              )}
                            </div>
                            <div className="py-2 pr-2 min-w-0">
                              <p className="font-semibold text-sm text-[var(--color-text)] line-clamp-2">{itemTitle}</p>
                              <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">
                                {pickCategory(item, isAr)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </WatchLandingChrome>
  );
}
