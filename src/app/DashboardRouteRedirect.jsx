import { Navigate, useParams } from 'react-router-dom';
import {
  buildDashboardPath,
  parseDomain,
  DEFAULT_SECTION,
} from '../features/dashboard/config/dashboardRoutes';

/** Redirect /dashboard or /dashboard/:domain to .../overview */
export function DashboardRouteRedirect() {
  const { domain } = useParams();
  const d = domain ? parseDomain(domain) : undefined;
  return <Navigate to={buildDashboardPath(d || 'fitness', DEFAULT_SECTION)} replace />;
}

export default DashboardRouteRedirect;
