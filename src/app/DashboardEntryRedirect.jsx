import { Navigate, useSearchParams } from 'react-router-dom';
import { getDefaultDashboardPath, pathFromLegacySearchParams } from '../features/dashboard/config/dashboardRoutes';

/** /dashboard → canonical path (handles legacy ?domain=&section=) */
export function DashboardEntryRedirect() {
  const [searchParams] = useSearchParams();
  const legacy = pathFromLegacySearchParams(searchParams);
  return <Navigate to={legacy || getDefaultDashboardPath()} replace />;
}

export default DashboardEntryRedirect;
