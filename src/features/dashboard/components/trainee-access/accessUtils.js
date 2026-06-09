export const FILTER_ALL = 'all';
export const VISIBILITY_ALL = 'all';
export const VISIBILITY_PUBLIC = 'public';
export const VISIBILITY_PRIVATE = 'private';

export const getVideoCategoryId = (video) => String(video.category_id ?? video.categoryId ?? '');

export const isVideoPublic = (video) => video?.is_public === true || video?.isPublic === true;

export const buildSelectedVideos = (access, catalogVideos) => {
  const fromDb = new Set(
    (access.videos || []).map((a) => String(a.videoId || a.video_id || ''))
  );
  const categoryIds = (access.categories || []).map((a) =>
    String(a.categoryId || a.category_id || '')
  );

  if (fromDb.size === 0 && categoryIds.length > 0) {
    catalogVideos
      .filter((v) => categoryIds.includes(getVideoCategoryId(v)))
      .forEach((v) => fromDb.add(String(v.id)));
  }

  return fromDb;
};

export const getCategoryVideoCount = (categoryId, catalogVideos) =>
  catalogVideos.filter((v) => getVideoCategoryId(v) === categoryId).length;

export const getCategorySelectionState = (categoryId, catalogVideos, selectedVideos) => {
  const categoryVideos = catalogVideos.filter((v) => getVideoCategoryId(v) === categoryId);
  if (categoryVideos.length === 0) return { checked: false, indeterminate: false };

  const selectedCount = categoryVideos.filter((v) => selectedVideos.has(String(v.id))).length;
  if (selectedCount === 0) return { checked: false, indeterminate: false };
  if (selectedCount === categoryVideos.length) return { checked: true, indeterminate: false };
  return { checked: false, indeterminate: true };
};

export const filterCategoriesBySearch = (categories, search, isAr) => {
  const query = search.trim().toLowerCase();
  if (!query) return categories;
  return categories.filter((cat) => {
    const name = (isAr ? cat.name_ar : cat.name_en) || '';
    return name.toLowerCase().includes(query);
  });
};

export const filterVideosBySearch = (videos, search, isAr) => {
  const query = search.trim().toLowerCase();
  if (!query) return videos;
  return videos.filter((v) => {
    const title = (isAr ? v.title_ar : v.title_en) || '';
    return title.toLowerCase().includes(query);
  });
};

export const filterVideosByCategory = (videos, categoryId) => {
  if (categoryId === FILTER_ALL) return videos;
  return videos.filter((v) => getVideoCategoryId(v) === categoryId);
};

export const filterVideosByVisibility = (videos, visibility) => {
  if (visibility === VISIBILITY_ALL) return videos;
  if (visibility === VISIBILITY_PUBLIC) return videos.filter((v) => isVideoPublic(v));
  return videos.filter((v) => !isVideoPublic(v));
};

export const setsEqual = (a, b) => {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
};

export const createSnapshot = (categories, videos) => ({
  categories: new Set(categories),
  videos: new Set(videos),
});
