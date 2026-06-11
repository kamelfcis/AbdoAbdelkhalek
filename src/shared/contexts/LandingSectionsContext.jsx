import React, { createContext, useContext, useMemo } from 'react';
import { useLandingSections } from '../hooks/useLandingSections';
import { isSectionVisible, isSlugVisible } from '../config/landingSections';

const LandingSectionsContext = createContext(null);

export function LandingSectionsProvider({ domain, children }) {
  const { sections, isLoading } = useLandingSections(domain);

  const value = useMemo(
    () => ({
      domain,
      sections,
      isLoading,
      isSectionVisible: (key) => isSectionVisible(sections, key),
      isSlugVisible: (slug) => isSlugVisible(sections, slug),
    }),
    [domain, sections, isLoading]
  );

  return (
    <LandingSectionsContext.Provider value={value}>{children}</LandingSectionsContext.Provider>
  );
}

export function useLandingSectionsContext() {
  const ctx = useContext(LandingSectionsContext);
  if (!ctx) {
    throw new Error('useLandingSectionsContext must be used within LandingSectionsProvider');
  }
  return ctx;
}

/** Safe hook for nav components — returns all visible when outside provider. */
export function useLandingSectionsOptional() {
  const ctx = useContext(LandingSectionsContext);
  if (!ctx) {
    return {
      sections: {},
      isLoading: false,
      isSectionVisible: () => true,
      isSlugVisible: () => true,
    };
  }
  return ctx;
}
