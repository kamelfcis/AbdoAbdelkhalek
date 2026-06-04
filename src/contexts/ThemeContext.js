import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applyThemeVariables, themeIds } from '../design-system/themes';
import { resolveDomain } from '../shared/hooks/useDomain';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};

/**
 * Optional hook — returns theme context or safe defaults when outside provider.
 */
export const useThemeOptional = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children, defaultMode = 'light' }) => {
  const domain = useMemo(() => resolveDomain(), []);
  const themeId = domain === themeIds.SQUASH ? themeIds.SQUASH : themeIds.FITNESS;

  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return defaultMode;
    const saved = localStorage.getItem('themeMode');
    if (saved) return saved;
    return defaultMode;
  });

  useEffect(() => {
    applyThemeVariables(themeId, mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.setAttribute('data-squash-ui', themeId === themeIds.SQUASH ? 'true' : 'false');
    localStorage.setItem('themeMode', mode);
  }, [themeId, mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(
    () => ({
      themeId,
      mode,
      setMode,
      toggleMode,
      isDark: mode === 'dark',
      isFitness: themeId === themeIds.FITNESS,
      isSquash: themeId === themeIds.SQUASH,
    }),
    [themeId, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
