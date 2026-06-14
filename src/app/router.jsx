import React, { Suspense, lazy } from 'react';

import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import DashboardRoute from '../components/CoachRoute';

import { ErrorBoundary } from './ErrorBoundary';

import { DashboardEntryRedirect } from './DashboardEntryRedirect';
import { DashboardRouteRedirect } from './DashboardRouteRedirect';
import { RouteThemeBridge } from './RouteThemeBridge';

const DomainPortalPage = lazy(() =>
  import(/* webpackChunkName: "domain-portal" */ '../pages/DomainPortalPage')
);



const Dashboard = lazy(() =>

  import(/* webpackChunkName: "dashboard" */ '../pages/Dashboard')

);



const FitnessHomePage = lazy(() =>

  import(/* webpackChunkName: "fitness-home" */ '../features/fitness/pages/FitnessHomePage')

);



const SquashHomePage = lazy(() =>

  import(/* webpackChunkName: "squash-home" */ '../features/squash/pages/SquashHomePage')

);



const Login = lazy(() =>

  import(/* webpackChunkName: "login" */ '../pages/Login')

);

const ResetPasswordPage = lazy(() =>
  import(/* webpackChunkName: "reset-password" */ '../features/auth/login/ResetPasswordPage')
);



const ComponentLoader = ({ message }) => (

  <div

    className="flex items-center justify-center section-py min-h-[200px]"

    role="status"

    aria-live="polite"

    aria-label={message || 'Loading content'}

  >

    <div

      className="rounded-full h-8 w-8 border-2 border-gray-200 border-t-[var(--color-primary)] animate-spin"

      aria-hidden="true"

    />

    {message && <span className="sr-only">{message}</span>}

  </div>

);



function LandingPage({ variant }) {
  const isSquash = variant === 'squash';
  return (
    <Suspense
      fallback={
        <ComponentLoader message={isSquash ? 'Loading squash site...' : 'Loading Football site...'} />
      }
    >
      {isSquash ? <SquashHomePage /> : <FitnessHomePage />}
    </Suspense>
  );
}



export function AppRouter() {

  return (

    <Router>
      <RouteThemeBridge />
      <Analytics />
      <Routes>

        <Route
          path="/"
          element={
            <Suspense fallback={<ComponentLoader message="Loading..." />}>
              <DomainPortalPage />
            </Suspense>
          }
        />
        <Route path="/fitness" element={<LandingPage variant="fitness" />} />
        <Route path="/squash" element={<LandingPage variant="squash" />} />

        <Route

          path="/login"

          element={

            <Suspense fallback={<ComponentLoader message="Loading login..." />}>

              <Login />

            </Suspense>

          }

        />

        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<ComponentLoader message="Loading..." />}>
              <ResetPasswordPage />
            </Suspense>
          }
        />

        <Route path="/dashboard" element={<DashboardEntryRedirect />} />
        <Route path="/dashboard/:domain" element={<DashboardRouteRedirect />} />
        <Route
          path="/dashboard/:domain/:section"
          element={
            <DashboardRoute>
              <ErrorBoundary
                fallbackTitle="Dashboard"
                fallbackMessage="Unable to load dashboard. Please refresh the page."
              >
                <Suspense fallback={<ComponentLoader message="Loading dashboard..." />}>
                  <Dashboard />
                </Suspense>
              </ErrorBoundary>
            </DashboardRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </Router>

  );

}

