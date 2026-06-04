import React, { createContext, useContext } from 'react';
import { useDashboardPage } from '../hooks/useDashboardPage';

const DashboardCoachContext = createContext(null);

export function DashboardCoachProvider({ children }) {
  const value = useDashboardPage();
  return (
    <DashboardCoachContext.Provider value={value}>
      {children}
    </DashboardCoachContext.Provider>
  );
}

export function useDashboardCoach() {
  const ctx = useContext(DashboardCoachContext);
  if (!ctx) {
    throw new Error('useDashboardCoach must be used within DashboardCoachProvider');
  }
  return ctx;
}
