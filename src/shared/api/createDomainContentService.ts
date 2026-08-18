import { apiFetch } from './apiClient';
import type { ApiError } from './apiClient';
import { rewriteMediaUrls } from '../lib/cdn';
import { fetchList } from './fetchList';
import { mapFaq } from './mapFaq';
import type { Category, Video } from '../../types';

export { mapFaq } from './mapFaq';

function normalizeNestedCategory(raw: unknown): Category | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const row = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return {
    ...(row as unknown as Category),
    name_en: (row.name_en ?? row.nameEn) as string,
    name_ar: (row.name_ar ?? row.nameAr) as string,
  };
}

function mapVideo(v: Record<string, unknown> | null | undefined): Video | null {
  if (!v) return null;
  const row = rewriteMediaUrls(v) as Record<string, unknown>;
  return {
    ...(row as unknown as Video),
    categories: normalizeNestedCategory(row.category ?? row.categories),
    video_url: (row.video_url ?? row.videoUrl) as string,
    video_path: (row.video_path ?? row.videoPath) as string,
    thumbnail_url: (row.thumbnail_url ?? row.thumbnailUrl) as string,
    thumbnail_path: (row.thumbnail_path ?? row.thumbnailPath) as string,
    category_id: (row.category_id ?? row.categoryId) as string | number,
    is_public: (row.is_public ?? row.isPublic) as boolean,
    title_en: (row.title_en ?? row.titleEn) as string,
    title_ar: (row.title_ar ?? row.titleAr) as string,
    canPlay: (row.canPlay ?? row.can_play) !== false,
  };
}

function mapCategory(c: Record<string, unknown> | null | undefined): Category | null {
  if (!c) return null;
  const row = rewriteMediaUrls(c) as Record<string, unknown>;
  return {
    ...(row as unknown as Category),
    name_en: (row.name_en ?? row.nameEn) as string,
    name_ar: (row.name_ar ?? row.nameAr) as string,
    description_en: (row.description_en ?? row.descriptionEn) as string,
    description_ar: (row.description_ar ?? row.descriptionAr) as string,
    image_url: (row.image_url ?? row.imageUrl) as string,
    image_path: (row.image_path ?? row.imagePath) as string,
    is_public: (row.is_public ?? row.isPublic) as boolean,
  };
}

function mapReview(r: Record<string, unknown>) {
  if (!r) return r;
  const row = rewriteMediaUrls(r) as Record<string, unknown>;
  return {
    ...row,
    image_url: row.image_url ?? row.imageUrl,
    image_path: row.image_path ?? row.imagePath,
  };
}

function coercePrice(value: unknown): number | string | null | undefined {
  if (value == null) return value as null | undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : value;
  }
  if (typeof value === 'object' && value !== null) {
    // Decimal instance that wasn't converted by jsonReplacer (defensive)
    if (typeof (value as Record<string, unknown>).toNumber === 'function') {
      return (value as { toNumber(): number }).toNumber();
    }
    // Plain {s, e, d} object — decimal.js internal representation.
    // Each element of d stores 7 significant digits, so:
    //   value = d[0] * 10^(e - 6) + d[1] * 10^(e - 13) + ...
    if ('d' in value) {
      const dec = value as { s?: number; e?: number; d?: number[] };
      if (Array.isArray(dec.d) && dec.d.length > 0 && typeof dec.e === 'number') {
        let result = 0;
        for (let i = 0; i < dec.d.length; i++) {
          result += (dec.d[i] ?? 0) * 10 ** (dec.e - 6 - i * 7);
        }
        return (dec.s ?? 1) * result;
      }
    }
  }
  return undefined;
}

export function mapPackage(row: Record<string, unknown>) {
  const pkg = rewriteMediaUrls(row) as Record<string, unknown>;
  const packageType = pkg.type ?? pkg.packageType ?? pkg.package_type;
  const allow1Month = (pkg.allow_1_month ?? pkg.allow1Month) !== false;
  const allow3Months = (pkg.allow_3_months ?? pkg.allow3Months) !== false;
  const allow6Months = (pkg.allow_6_months ?? pkg.allow6Months) !== false;
  const available_durations: number[] = [
    ...(allow1Month ? [1] : []),
    ...(allow3Months ? [3] : []),
    ...(allow6Months ? [6] : []),
  ];
  return {
    ...pkg,
    name_en: pkg.name_en ?? pkg.nameEn,
    name_ar: pkg.name_ar ?? pkg.nameAr,
    description_en: pkg.description_en ?? pkg.descriptionEn,
    description_ar: pkg.description_ar ?? pkg.descriptionAr,
    price_egp: coercePrice(pkg.price_egp ?? pkg.priceEgp),
    price_usd: coercePrice(pkg.price_usd ?? pkg.priceUsd),
    price: coercePrice(pkg.price),
    price_egp_3m: coercePrice(pkg.price_egp_3m ?? pkg.priceEgp3m ?? pkg.price_egp3m),
    price_usd_3m: coercePrice(pkg.price_usd_3m ?? pkg.priceUsd3m ?? pkg.price_usd3m),
    price_egp_6m: coercePrice(pkg.price_egp_6m ?? pkg.priceEgp6m ?? pkg.price_egp6m),
    price_usd_6m: coercePrice(pkg.price_usd_6m ?? pkg.priceUsd6m ?? pkg.price_usd6m),
    duration_days: pkg.duration_days ?? pkg.durationDays,
    features_en: pkg.features_en ?? pkg.featuresEn,
    features_ar: pkg.features_ar ?? pkg.featuresAr,
    includes_video_feedback: pkg.includes_video_feedback ?? pkg.includesVideoFeedback,
    daily_support: pkg.daily_support ?? pkg.dailySupport,
    allow_1_month: allow1Month,
    allow_3_months: allow3Months,
    allow_6_months: allow6Months,
    available_durations: available_durations.length > 0 ? available_durations : [1],
    created_at: pkg.created_at ?? pkg.createdAt,
    updated_at: pkg.updated_at ?? pkg.updatedAt,
    level: pkg.level ?? pkg.packageLevel,
    type: packageType,
    packageType,
    is_active: pkg.is_active ?? pkg.isActive,
  };
}

function mapSuccessStory(row: Record<string, unknown>) {
  const story = rewriteMediaUrls(row) as Record<string, unknown>;
  return {
    ...story,
    title_en: story.title_en ?? story.titleEn,
    title_ar: story.title_ar ?? story.titleAr,
    content_en: story.content_en ?? story.contentEn ?? story.description_en ?? story.descriptionEn,
    content_ar: story.content_ar ?? story.contentAr ?? story.description_ar ?? story.descriptionAr,
    before_image_url: story.before_image_url ?? story.beforeImageUrl,
    before_image_path: story.before_image_path ?? story.beforeImagePath,
    after_image_url: story.after_image_url ?? story.afterImageUrl,
    after_image_path: story.after_image_path ?? story.afterImagePath,
    is_public: story.is_public ?? story.isPublic,
    is_featured: story.is_featured ?? story.isFeatured,
    display_order: story.display_order ?? story.displayOrder,
    published_at: story.published_at ?? story.publishedAt,
    created_at: story.created_at ?? story.createdAt,
    updated_at: story.updated_at ?? story.updatedAt,
  };
}

function mapEntity(row: Record<string, unknown>) {
  return rewriteMediaUrls(row);
}

/**
 * Factory for fitness (/api) or squash (/api/squash) content API.
 */
export function createDomainContentService(apiPrefix: string) {
  const p = (path: string) => `${apiPrefix}${path}`;

  return {
    getCategories: (params?: Record<string, unknown>) =>
      fetchList(p('/categories'), params, mapCategory),
    getVideos: (params?: Record<string, unknown>) =>
      fetchList(p('/videos'), params, mapVideo),
    getVideo: async (id: string | number) => {
      try {
        const row = await apiFetch<Record<string, unknown>>(p(`/videos/${id}`));
        return mapVideo(row);
      } catch (err) {
        const apiErr = err as ApiError;
        const data = (apiErr.data || {}) as Record<string, unknown>;
        if (apiErr.status === 403) {
          const mapped = mapVideo({
            ...data,
            title_en: data.title_en ?? data.titleEn ?? data.title,
            title_ar: data.title_ar ?? data.titleAr ?? data.title,
            thumbnail_url: data.thumbnail_url ?? data.thumbnailUrl ?? data.thumb,
          });
          return { ...mapped, canPlay: false, locked: true };
        }
        if (apiErr.status === 401) {
          const requiresAuth = data.requiresAuth !== false;
          if (requiresAuth) {
            return { requiresAuth: true, canPlay: false };
          }
        }
        if (apiErr.status === 404) {
          return { notFound: true, canPlay: false };
        }
        throw err;
      }
    },
    getPackages: (params?: Record<string, unknown>) =>
      fetchList(p('/packages'), params, mapPackage as (row: Record<string, unknown>) => unknown),
    getReviews: (params?: Record<string, unknown>) =>
      fetchList(p('/reviews'), params, mapReview as (row: Record<string, unknown>) => unknown),
    getSuccessStories: (params?: Record<string, unknown>) =>
      fetchList(p('/success-stories'), params, mapSuccessStory as (row: Record<string, unknown>) => unknown),
    getFaqs: (params?: Record<string, unknown>) =>
      fetchList(p('/faqs'), params, mapFaq as (row: Record<string, unknown>) => unknown),
    getSubscriptions: (params?: Record<string, unknown>) => fetchList(p('/subscriptions'), params),
    createSubscription: (data: unknown) =>
      apiFetch(p('/subscriptions'), { method: 'POST', body: JSON.stringify(data) }),
    updateSubscription: (id: string | number, data: unknown) =>
      apiFetch(p(`/subscriptions/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
    deleteSubscription: (id: string | number) => apiFetch(p(`/subscriptions/${id}`), { method: 'DELETE' }),
    getTrainees: (params?: Record<string, unknown>) => fetchList(p('/trainees'), params),
    deleteTrainee: (id: string | number) =>
      apiFetch(p(`/trainees/${id}`), { method: 'DELETE' }),
    resetTraineePassword: (id: string | number, password: string) =>
      apiFetch(p(`/trainees/${id}/password`), {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    getCoaches: (params?: Record<string, unknown>) =>
      fetchList(p('/coaches'), params, mapEntity as (row: Record<string, unknown>) => unknown),
    getPrograms: (params?: Record<string, unknown>) =>
      fetchList(p('/programs'), params, mapEntity as (row: Record<string, unknown>) => unknown),
    getStats: () => apiFetch(p('/stats')),

    createCategory: (data: unknown) =>
      apiFetch(p('/categories'), { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id: string | number, data: unknown) =>
      apiFetch(p(`/categories/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
    deleteCategory: (id: string | number) => apiFetch(p(`/categories/${id}`), { method: 'DELETE' }),

    createVideo: (data: unknown) =>
      apiFetch(p('/videos'), { method: 'POST', body: JSON.stringify(data) }),
    updateVideo: (id: string | number, data: unknown) =>
      apiFetch(p(`/videos/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
    deleteVideo: (id: string | number) => apiFetch(p(`/videos/${id}`), { method: 'DELETE' }),

    createPackage: async (data: unknown) => {
      const row = await apiFetch<Record<string, unknown>>(p('/packages'), {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return mapPackage(row);
    },
    updatePackage: async (id: string | number, data: unknown) => {
      const row = await apiFetch<Record<string, unknown>>(p(`/packages/${id}`), {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return mapPackage(row);
    },
    deletePackage: (id: string | number) => apiFetch(p(`/packages/${id}`), { method: 'DELETE' }),

    createReview: (data: unknown) =>
      apiFetch(p('/reviews'), { method: 'POST', body: JSON.stringify(data) }),
    updateReview: (id: string | number, data: unknown) =>
      apiFetch(p(`/reviews/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
    deleteReview: (id: string | number) => apiFetch(p(`/reviews/${id}`), { method: 'DELETE' }),

    createSuccessStory: (data: unknown) =>
      apiFetch(p('/success-stories'), { method: 'POST', body: JSON.stringify(data) }),
    updateSuccessStory: (id: string | number, data: unknown) =>
      apiFetch(p(`/success-stories/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
    deleteSuccessStory: (id: string | number) =>
      apiFetch(p(`/success-stories/${id}`), { method: 'DELETE' }),

    createFaq: (data: unknown) =>
      apiFetch(p('/faqs'), { method: 'POST', body: JSON.stringify(data) }),
    updateFaq: (id: string | number, data: unknown) =>
      apiFetch(p(`/faqs/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
    deleteFaq: (id: string | number) => apiFetch(p(`/faqs/${id}`), { method: 'DELETE' }),
    deleteFaqsBulk: (ids: string[]) =>
      apiFetch(p('/faqs/bulk'), { method: 'DELETE', body: JSON.stringify({ ids }) }),

    createCoach: (data: unknown) =>
      apiFetch(p('/coaches'), { method: 'POST', body: JSON.stringify(data) }),
    updateCoach: (id: string | number, data: unknown) =>
      apiFetch(p(`/coaches/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
    deleteCoach: (id: string | number) => apiFetch(p(`/coaches/${id}`), { method: 'DELETE' }),

    createProgram: (data: unknown) =>
      apiFetch(p('/programs'), { method: 'POST', body: JSON.stringify(data) }),
    updateProgram: (id: string | number, data: unknown) =>
      apiFetch(p(`/programs/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
    deleteProgram: (id: string | number) => apiFetch(p(`/programs/${id}`), { method: 'DELETE' }),

    getTraineeAccess: (userId: string) => apiFetch(p(`/access/trainee/${userId}`)),
    setTraineeAccess: (userId: string, body: unknown) =>
      apiFetch(p(`/access/trainee/${userId}`), { method: 'PUT', body: JSON.stringify(body) }),
    getVideoAccess: (videoId: string | number) => apiFetch(p(`/videos/${videoId}/access`)),
    setVideoAccess: (videoId: string | number, userIds: string[]) =>
      apiFetch(p(`/videos/${videoId}/access`), {
        method: 'PUT',
        body: JSON.stringify({ userIds }),
      }),
  };
}
