import { useQuery } from '@tanstack/react-query';

import { contentService } from '../services/contentService';
import { queryKeys } from '../lib/queryKeys';

import { useAuthQueryOptions } from './useAuthQuery';



export const useDashboardStats = (options = {}) => {

  const auth = useAuthQueryOptions(options.enabled !== false);

  return useQuery({

    queryKey: queryKeys.dashboard.stats(),

    queryFn: () => contentService.getStats(),

    staleTime: 60 * 1000,

    ...auth,

  });

};



export const useRecentActivities = (language = 'en', options = {}) => {

  const auth = useAuthQueryOptions(options.enabled !== false);

  return useQuery({

    queryKey: queryKeys.recentActivities.byLanguage(language),

    queryFn: async () => {

      const [categories, videos, packages, subscriptions, stories] = await Promise.all([

        contentService.getCategories(),

        contentService.getVideos(),

        contentService.getPackages(),

        contentService.getSubscriptions(),

        contentService.getSuccessStories(),

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

      for (const c of categories || []) {

        const time = createdAt(c);

        if (time) activities.push(toActivity('category', c.id, pick(c, 'name_en', 'name_ar', language), time));

      }

      for (const v of videos || []) {

        const time = createdAt(v);

        if (time) activities.push(toActivity('video', v.id, pick(v, 'title_en', 'title_ar', language), time));

      }

      for (const p of packages || []) {

        const time = createdAt(p);

        if (time) activities.push(toActivity('package', p.id, pick(p, 'name_en', 'name_ar', language), time));

      }

      for (const s of subscriptions || []) {

        const time = createdAt(s);

        if (!time) continue;

        const pkg = s.packages ?? s.package;

        const pkgName = pkg ? pick(pkg, 'name_en', 'name_ar', language) : language === 'ar' ? 'اشتراك' : 'Subscription';

        activities.push(toActivity('subscription', s.id, pkgName, time));

      }

      for (const st of stories || []) {

        const time = createdAt(st);

        if (time) activities.push(toActivity('story', st.id, pick(st, 'title_en', 'title_ar', language), time));

      }



      return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    },

    staleTime: 60 * 1000,

    ...auth,

  });

};


