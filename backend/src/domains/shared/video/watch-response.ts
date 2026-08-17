type VideoRow = Record<string, unknown>;

function pickCategory(row: VideoRow) {
  const cat = (row.category ?? row.categories) as VideoRow | undefined;
  if (!cat || typeof cat !== 'object') return undefined;
  return {
    id: cat.id,
    name_en: cat.nameEn ?? cat.name_en,
    name_ar: cat.nameAr ?? cat.name_ar,
  };
}

export function isVideoPublic(row: VideoRow): boolean {
  return Boolean(row.isPublic ?? row.is_public);
}

/** API payload for GET /videos/:id — omits play fields when canPlay is false. */
export function formatWatchVideoResponse(row: VideoRow, canPlay: boolean) {
  const category = pickCategory(row);
  const locked: Record<string, unknown> = {
    id: row.id,
    title_en: row.titleEn ?? row.title_en,
    title_ar: row.titleAr ?? row.title_ar,
    thumbnail_url: row.thumbnailUrl ?? row.thumbnail_url,
    thumbnail_path: row.thumbnailPath ?? row.thumbnail_path,
    category_id: row.categoryId ?? row.category_id,
    canPlay,
  };

  if (category) {
    locked.category = category;
    locked.categories = category;
  }

  if (!canPlay) return locked;

  return {
    ...locked,
    description_en: row.descriptionEn ?? row.description_en,
    description_ar: row.descriptionAr ?? row.description_ar,
    duration_seconds: row.durationSeconds ?? row.duration_seconds,
    is_public: row.isPublic ?? row.is_public,
    created_at: row.createdAt ?? row.created_at,
    video_url: row.videoUrl ?? row.video_url,
    video_path: row.videoPath ?? row.video_path,
  };
}
