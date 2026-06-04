import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteGuardLoader from './RouteGuardLoader';

const TRAINEE_REDIRECT_MESSAGE =
  'The coach dashboard is for coaches only. Browse videos and packages on the home page.';

const CoachRoute = ({ children }) => {
  const { isAuthenticated, isCoach, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteGuardLoader message="Loading dashboard access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isCoach) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          authMessage: TRAINEE_REDIRECT_MESSAGE,
          authMessageAr: 'لوحة التحكم مخصصة للمدربين فقط. تصفح الفيديوهات والباقات من الصفحة الرئيسية.',
        }}
      />
    );
  }

  return children;
};

export default CoachRoute;
