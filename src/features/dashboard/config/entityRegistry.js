import { fitnessConfig } from '../../../domains/fitness/config';

import { squashConfig } from '../../../domains/squash/config';



/** Shared coach sidebar — same sections for fitness and squash dashboards */

export const coachNavItems = [

  { key: 'overview', icon: 'chart-line', labelKey: 'nav-overview' },

  { key: 'categories', icon: 'folder', labelKey: 'nav-categories' },

  { key: 'videos', icon: 'video', labelKey: 'nav-videos' },

  { key: 'subscriptions', icon: 'user-check', labelKey: 'nav-subscriptions' },

  { key: 'packages', icon: 'box', labelKey: 'nav-packages' },

  { key: 'trainees', icon: 'users', labelKey: 'nav-trainees' },

  { key: 'success-stories', icon: 'trophy', labelKey: 'nav-success-stories' },

  { key: 'faqs', icon: 'question-circle', labelKey: 'nav-faqs' },

  { key: 'reviews', icon: 'whatsapp', labelKey: 'nav-reviews', iconClassName: 'text-green-600' },

];



export const entityRegistry = {

  fitness: {

    config: fitnessConfig,

    navItems: coachNavItems,

    hasSubscriptions: true,

    hasTrainees: true,

    titleEn: 'Football Dashboard',

    titleAr: 'لوحة كرة قدم',

  },

  squash: {

    config: squashConfig,

    navItems: coachNavItems,

    hasSubscriptions: true,

    hasTrainees: true,

    titleEn: 'Squash Dashboard',

    titleAr: 'لوحة الإسكواش',

  },

};



export function getEntityRegistry(domain) {

  return entityRegistry[domain] || entityRegistry.fitness;

}

