import { useCallback, useMemo } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getSquashTranslation } from '../../../shared/i18n';

export function useSquashI18n() {
  const { currentLanguage, toggleLanguage, setCurrentLanguage } = useLanguage();
  const isAr = currentLanguage === 'ar';

  const t = useCallback(
    (key) => getSquashTranslation(currentLanguage, key),
    [currentLanguage]
  );

  return useMemo(
    () => ({
      t,
      lang: currentLanguage,
      isAr,
      isRTL: isAr,
      toggleLanguage,
      setCurrentLanguage,
    }),
    [t, currentLanguage, isAr, toggleLanguage, setCurrentLanguage]
  );
}

export default useSquashI18n;
