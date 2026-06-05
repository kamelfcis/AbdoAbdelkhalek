import { squashEn } from './squash.en';
import { squashAr } from './squash.ar';
import { squashDashboardEn } from './squashDashboard.en';
import { squashDashboardAr } from './squashDashboard.ar';
import { loginEn } from './login.en';
import { loginAr } from './login.ar';
import { getDashboardTranslation } from './dashboard';

const squashMessages = { en: squashEn, ar: squashAr };
const loginMessages = { en: loginEn, ar: loginAr };

export function getSquashTranslation(lang, key) {
  const table = squashMessages[lang] || squashMessages.en;
  return table[key] ?? squashMessages.en[key] ?? key;
}

/** @deprecated Prefer getDashboardTranslation('squash', lang, key) */
export function getSquashDashboardTranslation(lang, key) {
  return getDashboardTranslation('squash', lang, key);
}

export function getLoginTranslation(lang, key) {
  const table = loginMessages[lang] || loginMessages.en;
  return table[key] ?? loginMessages.en[key] ?? key;
}

export {
  squashEn,
  squashAr,
  squashDashboardEn,
  squashDashboardAr,
  loginEn,
  loginAr,
  getDashboardTranslation,
};
