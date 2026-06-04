import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'dashboard-view-mode';

function readStoredMode(entityKey, defaultMode = 'table') {
  if (typeof window === 'undefined') return defaultMode;
  try {
    const stored = sessionStorage.getItem(`${STORAGE_PREFIX}:${entityKey}`);
    return stored === 'cards' || stored === 'table' ? stored : defaultMode;
  } catch {
    return defaultMode;
  }
}

export function useViewMode(entityKey, { defaultMode = 'table' } = {}) {
  const [viewMode, setViewModeState] = useState(() => readStoredMode(entityKey, defaultMode));

  const setViewMode = useCallback(
    (mode) => {
      if (mode !== 'table' && mode !== 'cards') return;
      setViewModeState(mode);
      try {
        sessionStorage.setItem(`${STORAGE_PREFIX}:${entityKey}`, mode);
      } catch {
        /* ignore quota / private mode */
      }
    },
    [entityKey]
  );

  return { viewMode, setViewMode };
}
