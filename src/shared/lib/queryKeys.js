/**
 * TanStack Query key registry.
 *
 * Convention:
 * - Public landing: ['categories'], ['videos'], ...
 * - Dashboard (coach): ['dashboard', 'entity', pageParams]
 * - Meta: ['dashboard', 'stats'], ['recentActivities', language]
 * - Access: ['trainees', pageParams], ['subscriptions', pageParams]
 */

function withPageParams(baseKey, pageParams = {}) {
  const hasParams = pageParams && Object.keys(pageParams).length > 0;
  return hasParams ? [...baseKey, pageParams] : baseKey;
}

export const queryKeys = {
  categories: (domain = 'fitness') => (domain === 'squash' ? ['squash', 'categories'] : ['categories']),
  videos: (domain = 'fitness') => (domain === 'squash' ? ['squash', 'videos'] : ['videos']),
  video: (domain = 'fitness', id) => {
    const base = domain === 'squash' ? ['squash', 'video'] : ['video'];
    return id != null && id !== '' ? [...base, String(id)] : base;
  },
  packages: (domain = 'fitness') => (domain === 'squash' ? ['squash', 'packages'] : ['packages']),
  reviews: (domain = 'fitness') => (domain === 'squash' ? ['squash', 'reviews'] : ['reviews']),
  successStories: (domain = 'fitness') =>
    domain === 'squash' ? ['squash', 'success_stories'] : ['success_stories'],
  faqs: (domain = 'fitness') => (domain === 'squash' ? ['squash', 'faqs'] : ['faqs']),
  coaches: (domain = 'fitness') => (domain === 'squash' ? ['squash', 'coaches'] : ['coaches']),
  programs: (domain = 'fitness') => (domain === 'squash' ? ['squash', 'programs'] : ['programs']),

  landingSections: (domain = 'fitness') =>
    domain === 'squash' ? ['landing-sections', 'squash'] : ['landing-sections', 'fitness'],

  dashboard: {
    all: (domain = 'fitness') => (domain === 'squash' ? ['dashboard', 'squash'] : ['dashboard']),
    categories: (domain = 'fitness', pageParams = {}) =>
      withPageParams(
        domain === 'squash' ? ['dashboard', 'squash', 'categories'] : ['dashboard', 'categories'],
        pageParams
      ),
    categoriesAll: (domain = 'fitness') =>
      domain === 'squash'
        ? ['dashboard', 'squash', 'categories', 'all']
        : ['dashboard', 'categories', 'all'],
    videos: (domain = 'fitness', pageParams = {}) =>
      withPageParams(
        domain === 'squash' ? ['dashboard', 'squash', 'videos'] : ['dashboard', 'videos'],
        pageParams
      ),
    packages: (domain = 'fitness', pageParams = {}) =>
      withPageParams(
        domain === 'squash' ? ['dashboard', 'squash', 'packages'] : ['dashboard', 'packages'],
        pageParams
      ),
    reviews: (domain = 'fitness', pageParams = {}) =>
      withPageParams(
        domain === 'squash' ? ['dashboard', 'squash', 'reviews'] : ['dashboard', 'reviews'],
        pageParams
      ),
    successStories: (domain = 'fitness', pageParams = {}) =>
      withPageParams(
        domain === 'squash' ? ['dashboard', 'squash', 'success_stories'] : ['dashboard', 'success_stories'],
        pageParams
      ),
    faqs: (domain = 'fitness', pageParams = {}) =>
      withPageParams(
        domain === 'squash' ? ['dashboard', 'squash', 'faqs'] : ['dashboard', 'faqs'],
        pageParams
      ),
    coaches: (domain = 'fitness', pageParams = {}) =>
      withPageParams(
        domain === 'squash' ? ['dashboard', 'squash', 'coaches'] : ['dashboard', 'coaches'],
        pageParams
      ),
    programs: (domain = 'fitness', pageParams = {}) =>
      withPageParams(
        domain === 'squash' ? ['dashboard', 'squash', 'programs'] : ['dashboard', 'programs'],
        pageParams
      ),
    stats: (domain = 'fitness') =>
      domain === 'squash' ? ['dashboard', 'squash', 'stats'] : ['dashboard', 'stats'],
  },

  trainees: (domain = 'fitness', pageParams = {}) =>
    withPageParams(domain === 'squash' ? ['squash', 'trainees'] : ['trainees'], pageParams),
  subscriptions: (domain = 'fitness', pageParams = {}) =>
    withPageParams(domain === 'squash' ? ['squash', 'subscriptions'] : ['subscriptions'], pageParams),
  recentActivities: {
    all: () => ['recentActivities'],
    byLanguage: (language) => ['recentActivities', language],
  },

  trainee: {
    videos: (domain = 'fitness') =>
      domain === 'squash' ? ['trainee', 'squash', 'videos'] : ['trainee', 'videos'],
    favorites: (domain = 'fitness') =>
      domain === 'squash' ? ['trainee', 'squash', 'favorites'] : ['trainee', 'favorites'],
  },
};

/** Content entity → dashboard + public key pair for CRUD invalidation. */
const CONTENT_ENTITY_KEYS = {
  categories: {
    dashboard: queryKeys.dashboard.categories,
    public: queryKeys.categories,
  },
  videos: {
    dashboard: queryKeys.dashboard.videos,
    public: queryKeys.videos,
  },
  packages: {
    dashboard: queryKeys.dashboard.packages,
    public: queryKeys.packages,
  },
  reviews: {
    dashboard: queryKeys.dashboard.reviews,
    public: queryKeys.reviews,
  },
  successStories: {
    dashboard: queryKeys.dashboard.successStories,
    public: queryKeys.successStories,
  },
  faqs: {
    dashboard: queryKeys.dashboard.faqs,
    public: queryKeys.faqs,
  },
  coaches: {
    dashboard: queryKeys.dashboard.coaches,
    public: queryKeys.coaches,
  },
  programs: {
    dashboard: queryKeys.dashboard.programs,
    public: queryKeys.programs,
  },
};

/** Dashboard list query key prefix for a content entity (invalidates all pages). */
export function getDashboardListQueryKey(entity, domain = 'fitness') {
  const keys = CONTENT_ENTITY_KEYS[entity];
  return keys ? keys.dashboard(domain) : null;
}

/** Read items from dashboard cache (array or paginated envelope). */
export function readListFromCache(data) {
  if (Array.isArray(data)) return data;
  if (data?.items) return data.items;
  return data ?? [];
}

export function sameEntityId(a, b) {
  return String(a) === String(b);
}

/** Update one row in a paginated list cache envelope. */
export function patchPaginatedListItem(queryClient, queryKey, id, updater) {
  if (!queryKey) return;
  queryClient.setQueryData(queryKey, (old) => {
    if (!old?.items) return old;
    return {
      ...old,
      items: old.items.map((row) => (sameEntityId(row.id, id) ? updater(row) : row)),
    };
  });
}

/** Prepend a row on page 1 and bump total. */
export function prependPaginatedListItem(queryClient, queryKey, item, pageSize) {
  if (!queryKey) return;
  queryClient.setQueryData(queryKey, (old) => {
    if (!old?.items) return old;
    const items = [item, ...old.items].slice(0, pageSize);
    return {
      ...old,
      items,
      total: (old.total ?? old.items.length) + 1,
    };
  });
}

/** Remove a row from paginated list cache and decrement total. */
export function removePaginatedListItem(queryClient, queryKey, id) {
  if (!queryKey) return;
  queryClient.setQueryData(queryKey, (old) => {
    if (!old?.items) return old;
    return {
      ...old,
      items: old.items.filter((row) => !sameEntityId(row.id, id)),
      total: Math.max(0, (old.total ?? old.items.length) - 1),
    };
  });
}

/**
 * After coach CRUD on a content entity: refresh dashboard list, public cache,
 * stats, activity feed, and categories-all dropdown cache.
 * @param {{ deferSecondary?: boolean }} options - when true, only dashboard (+ categoriesAll) refetch immediately
 */
export async function invalidateContentCrud(queryClient, entity, domain = 'fitness', options = {}) {
  const { deferSecondary = false } = options;
  const keys = CONTENT_ENTITY_KEYS[entity];
  if (!keys) return;

  const queryKeyList = [keys.dashboard(domain)];
  if (entity === 'categories') {
    queryKeyList.push(queryKeys.dashboard.categoriesAll(domain));
  }
  queryKeyList.push(keys.public(domain), queryKeys.dashboard.stats(domain));
  if (entity === 'videos') {
    queryKeyList.push(queryKeys.video(domain));
  }
  if (domain === 'fitness') {
    queryKeyList.push(queryKeys.recentActivities.all());
  }

  if (deferSecondary) {
    setTimeout(() => {
      void Promise.all(
        queryKeyList.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      );
    }, 0);
    return;
  }

  await Promise.all(
    queryKeyList.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  );
}

/**
 * After subscription / trainee access changes.
 */
export function invalidateAccessCrud(queryClient, domain = 'fitness') {
  queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions(domain) });
  queryClient.invalidateQueries({ queryKey: queryKeys.trainees(domain) });
  queryClient.invalidateQueries({ queryKey: queryKeys.trainee.videos(domain) });
  queryClient.invalidateQueries({ queryKey: queryKeys.videos(domain) });
  queryClient.invalidateQueries({ queryKey: queryKeys.video(domain) });
  queryClient.invalidateQueries({ queryKey: queryKeys.categories(domain) });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(domain) });
  if (domain === 'fitness') {
    queryClient.invalidateQueries({ queryKey: queryKeys.recentActivities.all() });
  }
}

/**
 * On dashboard auth ready: refresh all coach-gated queries.
 */
export function invalidateDashboardSession(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all('fitness') });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all('squash') });
  queryClient.invalidateQueries({ queryKey: queryKeys.trainees('fitness') });
  queryClient.invalidateQueries({ queryKey: queryKeys.trainees('squash') });
  queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions('fitness') });
  queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions('squash') });
  queryClient.invalidateQueries({ queryKey: queryKeys.recentActivities.all() });
}
