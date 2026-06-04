import { fitnessDashboardEn } from './fitness.en';
import { fitnessDashboardAr } from './fitness.ar';
import { squashDashboardEn } from './squash.en';
import { squashDashboardAr } from './squash.ar';

const messages = {
  fitness: { en: fitnessDashboardEn, ar: fitnessDashboardAr },
  squash: { en: squashDashboardEn, ar: squashDashboardAr },
};

export function getDashboardTranslation(domain, lang, key) {
  const d = domain === 'squash' ? 'squash' : 'fitness';
  const l = lang === 'ar' ? 'ar' : 'en';
  const table = messages[d]?.[l] || messages.fitness.en;
  return table[key] ?? messages.fitness[l]?.[key] ?? messages.fitness.en[key] ?? key;
}

export { fitnessDashboardEn, fitnessDashboardAr, squashDashboardEn, squashDashboardAr };
