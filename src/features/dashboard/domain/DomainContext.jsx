import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEntityRegistry } from '../config/entityRegistry';
import {
  parseDomain,
  buildDashboardPath,
  resolveSectionForDomainChange,
  DEFAULT_SECTION,
} from '../config/dashboardRoutes';

const DashboardDomainContext = createContext(null);

export function DashboardDomainProvider({ children }) {
  const navigate = useNavigate();
  const { domain: domainParam, section: sectionParam } = useParams();
  const adminDomain = parseDomain(domainParam || 'fitness');
  const registry = useMemo(() => getEntityRegistry(adminDomain), [adminDomain]);

  const setAdminDomain = useCallback(
    (domain) => {
      const next = parseDomain(domain);
      const section = resolveSectionForDomainChange(next, sectionParam || DEFAULT_SECTION);
      navigate(buildDashboardPath(next, section), { replace: true });
    },
    [navigate, sectionParam]
  );

  const value = useMemo(
    () => ({ adminDomain, setAdminDomain, registry, apiPrefix: registry.config.baseApiPath }),
    [adminDomain, setAdminDomain, registry]
  );

  return (
    <DashboardDomainContext.Provider value={value}>{children}</DashboardDomainContext.Provider>
  );
}

export function useDashboardDomain() {
  const ctx = useContext(DashboardDomainContext);
  if (!ctx) {
    throw new Error('useDashboardDomain must be used within DashboardDomainProvider');
  }
  return ctx;
}
