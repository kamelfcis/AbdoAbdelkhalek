import { loginEn } from './login.en';
import { loginAr } from './login.ar';

const loginMessages = { en: loginEn, ar: loginAr };

export function getLoginTranslation(lang, key) {
  const table = loginMessages[lang] || loginMessages.en;
  return table[key] ?? loginMessages.en[key] ?? key;
}

export { loginEn, loginAr };
