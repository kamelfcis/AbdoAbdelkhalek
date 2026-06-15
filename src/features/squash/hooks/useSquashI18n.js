import { useCallback, useMemo } from 'react';
import { getSquashTranslation } from '../../../shared/i18n';

const SQUASH_LANDING_LANG = 'en';

/** Squash public landing is English-only; dashboard uses separate i18n. */
export function useSquashI18n() {
  const t = useCallback((key) => getSquashTranslation(SQUASH_LANDING_LANG, key), []);

  const noop = useCallback(() => {}, []);

  return useMemo(
    () => ({
      t,
      lang: SQUASH_LANDING_LANG,
      isAr: false,
      isRTL: false,
      toggleLanguage: noop,
      setCurrentLanguage: noop,
    }),
    [t, noop]
  );
}

export default useSquashI18n;
