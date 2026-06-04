import { apiFetch, setAccessToken, getAccessToken } from './apiClient';
import type { User } from '../../types';

const AUTH_EVENT = 'abk-auth-change';

interface ApiUser {
  id: string;
  email: string;
  fullName?: string;
  isCoach?: boolean;
  phone?: string;
}

interface Session {
  access_token: string;
  user: {
    id: string;
    email: string;
    user_metadata: { full_name?: string; is_coach?: boolean };
  };
}

function emitAuthChange(session: Session | null): void {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { session } }));
}

function buildSession(user: ApiUser, accessToken: string): Session {
  return {
    access_token: accessToken,
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.fullName, is_coach: user.isCoach },
    },
  };
}

export const authService = {
  async getSession(): Promise<{ data: { session: Session | null } }> {
    const token = getAccessToken();
    if (!token) return { data: { session: null } };
    try {
      const { user } = await apiFetch<{ user: ApiUser }>('/auth/me');
      return { data: { session: buildSession(user, token) } };
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401) {
        setAccessToken(null);
        emitAuthChange(null);
      }
      return { data: { session: null } };
    }
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const handler = (e: Event) =>
      callback('SIGNED_IN', (e as CustomEvent).detail?.session ?? null);
    window.addEventListener(AUTH_EVENT, handler);
    return {
      data: {
        subscription: {
          unsubscribe: () => window.removeEventListener(AUTH_EVENT, handler),
        },
      },
    };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const result = await apiFetch<{ accessToken: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(result.accessToken);
    const session = buildSession(result.user, result.accessToken);
    emitAuthChange(session);
    return { data: { user: session.user, session }, error: null };
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { data?: { full_name?: string; phone?: string; registered_from?: 'fitness' | 'squash' } };
  }) {
    const meta = options?.data || {};
    const result = await apiFetch<{ user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        fullName: meta.full_name || email,
        phone: meta.phone,
        registeredFrom: meta.registered_from,
      }),
    });
    return { data: { user: result.user }, error: null };
  },

  async signOut() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    emitAuthChange(null);
    return { error: null };
  },

  async refreshSession() {
    try {
      const { accessToken } = await apiFetch<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
      });
      setAccessToken(accessToken);
      const { data } = await this.getSession();
      emitAuthChange(data.session);
      return { data, error: null };
    } catch (e) {
      return { data: { session: null }, error: e };
    }
  },
};
