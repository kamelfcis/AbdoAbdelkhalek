import { apiFetch } from './apiClient';
import { rewriteMediaUrls } from '../lib/cdn';
import { fetchList } from './fetchList';
import { mapFaq } from './mapFaq';
import type { Category, Video } from '../../types';

export { mapFaq } from './mapFaq';

function mapVideo(v: Record<string, unknown> | null | undefined): Video | null {
  if (!v) return null;
  const row = rewriteMediaUrls(v) as Record<string, unknown>;
  return {
    ...(row as unknown as Video),
    categories: (row.category || row.categories) as Category,
    video_url: (row.video_url ?? row.videoUrl) as string,
    video_path: (row.video_path ?? row.videoPath) as string,
    thumbnail_url: (row.thumbnail_url ?? row.thumbnailUrl) as string,
    thumbnail_path: (row.thumbnail_path ?? row.thumbnailPath) as string,
    category_id: (row.category_id ?? row.categoryId) as string | number,
    is_public: (row.is_public ?? row.isPublic) as boolean,
    title_en: (row.title_en ?? row.titleEn) as string,
    title_ar: (row.title_ar ?? row.titleAr) as string,
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
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'd' in value) {
    const dec = value as { e?: number; d?: number[] };
    if (Array.isArray(dec.d) && dec.d.length === 1 && typeof dec.e === 'number') {
      return dec.d[0] * 10 ** dec.e;
    }
  }
  return String(value);
}

function mapPackage(row: Record<string, unknown>) {
  const pkg = rewriteMediaUrls(row) as Record<string, unknown>;
  return {
    ...pkg,
    name_en: pkg.name_en ?? pkg.nameEn,
    name_ar: pkg.name_ar ?? pkg.nameAr,
    description_en: pkg.description_en ?? pkg.descriptionEn,
    description_ar: pkg.description_ar ?? pkg.descriptionAr,
    price_egp: coercePrice(pkg.price_egp ?? pkg.priceEgp),
    price_usd: coercePrice(pkg.price_usd ?? pkg.priceUsd),
    duration_days: pkg.duration_days ?? pkg.durationDays,
    features_en: pkg.features_en ?? pkg.featuresEn,
    features_ar: pkg.features_ar ?? pkg.featuresAr,
    includes_video_feedback: pkg.includes_video_feedback ?? pkg.includesVideoFeedback,
    daily_support: pkg.daily_support ?? pkg.dailySupport,
    created_at: pkg.created_at ?? pkg.createdAt,
    updated_at: pkg.updated_at ?? pkg.updatedAt,
    level: pkg.level ?? pkg.packageLevel,
    type: pkg.type ?? pkg.packageType,
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

    createPackage: (data: unknown) =>
      apiFetch(p('/packages'), { method: 'POST', body: JSON.stringify(data) }),
    updatePackage: (id: string | number, data: unknown) =>
      apiFetch(p(`/packages/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
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
