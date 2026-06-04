import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { contentService } from '../services/contentService';
import { setAuthTokenChangeHandler } from '../services/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isCoach = Boolean(user?.is_coach ?? session?.user?.user_metadata?.is_coach);
  const isAuthenticated = Boolean(session?.user);

  const refreshUser = useCallback(async () => {
    const { data: { session: nextSession } } = await authService.getSession();

    if (!nextSession) {
      setSession(null);
      setUser(null);
      return null;
    }

    setSession(nextSession);

    try {
      const { data: profile } = await contentService.getUserProfile(nextSession.user.id);
      setUser(profile || null);
      return profile || null;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await authService.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await refreshUser();
    return { ...data, profile };
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setSession(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      await refreshUser();
      if (mounted) setIsLoading(false);
    };

    bootstrap();

    const { data: { subscription } } = authService.onAuthStateChange(async () => {
      await refreshUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  useEffect(() => {
    setAuthTokenChangeHandler(async (event) => {
      if (event === 'cleared') {
        setSession(null);
        setUser(null);
        return;
      }
      if (event === 'refreshed') {
        await refreshUser();
      }
    });

    return () => setAuthTokenChangeHandler(null);
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      session,
      isCoach,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, session, isCoach, isAuthenticated, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
