import { useQuery, useQueryClient } from '@tanstack/react-query';



import { getContentService } from '../lib/getContentService';

import { queryKeys, readListFromCache } from '../lib/queryKeys';



import { useAuthQueryOptions } from './useAuthQuery';



export const useDashboardStats = (options = {}) => {

  const domain = options.domain || 'fitness';

  const svc = getContentService(domain);



  const auth = useAuthQueryOptions(options.enabled !== false);



  return useQuery({

    queryKey: queryKeys.dashboard.stats(domain),

    queryFn: () => svc.getStats(),

    staleTime: 60 * 1000,

    gcTime: 5 * 60 * 1000,

    ...auth,

  });

};



export const useRecentActivities = (language = 'en', options = {}) => {

  const domain = options.domain || 'fitness';

  const queryClient = useQueryClient();

  const auth = useAuthQueryOptions(options.enabled !== false);



  return useQuery({

    queryKey: queryKeys.recentActivities.byLanguage(language),

    queryFn: async () => {

      const svc = getContentService(domain);

      const unwrap = (data) => (data?.items != null ? data.items : data);

      const dashCategories = unwrap(queryClient.getQueryData(queryKeys.dashboard.categories(domain)));

      const dashVideos = unwrap(queryClient.getQueryData(queryKeys.dashboard.videos(domain)));

      const dashPackages = unwrap(queryClient.getQueryData(queryKeys.dashboard.packages(domain)));

      const [categories, videos, packages, subscriptions, stories] = await Promise.all([

        dashCategories != null ? readListFromCache(dashCategories) : svc.getCategories(),

        dashVideos != null ? readListFromCache(dashVideos) : svc.getVideos(),

        dashPackages != null ? readListFromCache(dashPackages) : svc.getPackages(),

        svc.getSubscriptions(),

        svc.getSuccessStories(),

      ]);



      const ACTIVITY_META = {

        category: { icon: 'folder', color: 'blue' },

        video: { icon: 'video', color: 'purple' },

        package: { icon: 'box', color: 'green' },

        subscription: { icon: 'user-check', color: 'indigo' },

        story: { icon: 'star', color: 'pink' },

      };



      const toCamel = (key) => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

      const pick = (item, enKey, arKey, lang) => {

        const en = item[enKey] ?? item[toCamel(enKey)];

        const ar = item[arKey] ?? item[toCamel(arKey)];

        return lang === 'ar' ? ar || en : en || ar;

      };

      const createdAt = (item) => item.created_at ?? item.createdAt;

      const toActivity = (type, id, title, time) => {

        const meta = ACTIVITY_META[type] || ACTIVITY_META.category;

        return { id: `${type}-${id}`, type, title: title || '—', time, icon: meta.icon, color: meta.color };

      };



      const activities = [];

      const categoryRows = Array.isArray(categories) ? categories : categories?.items ?? [];
      const videoRows = Array.isArray(videos) ? videos : videos?.items ?? [];
      const packageRows = Array.isArray(packages) ? packages : packages?.items ?? [];
      const subscriptionRows = Array.isArray(subscriptions)
        ? subscriptions
        : subscriptions?.items ?? [];
      const storyRows = Array.isArray(stories) ? stories : stories?.items ?? [];

      for (const c of categoryRows) {

        const time = createdAt(c);

        if (time) activities.push(toActivity('category', c.id, pick(c, 'name_en', 'name_ar', language), time));

      }

      for (const v of videoRows) {

        const time = createdAt(v);

        if (time) activities.push(toActivity('video', v.id, pick(v, 'title_en', 'title_ar', language), time));

      }

      for (const p of packageRows) {

        const time = createdAt(p);

        if (time) activities.push(toActivity('package', p.id, pick(p, 'name_en', 'name_ar', language), time));

      }

      for (const s of subscriptionRows) {

        const time = createdAt(s);

        if (!time) continue;

        const pkg = s.packages ?? s.package;

        const pkgName = pkg ? pick(pkg, 'name_en', 'name_ar', language) : language === 'ar' ? 'اشتراك' : 'Subscription';

        activities.push(toActivity('subscription', s.id, pkgName, time));

      }

      for (const st of storyRows) {

        const time = createdAt(st);

        if (time) activities.push(toActivity('story', st.id, pick(st, 'title_en', 'title_ar', language), time));

      }



      return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    },

    staleTime: 60 * 1000,

    gcTime: 5 * 60 * 1000,

    ...auth,

  });

};



