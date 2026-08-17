/** Same-origin /api on Vercel; localhost in dev. Ignores dead external API host. */
function resolveApiBase(): string {
  const configured = process.env.REACT_APP_API_URL?.replace(/\/$/, '');
  const deadExternalApi = 'api.abdelrhmanabdelkhalek.com';

  if (typeof window !== 'undefined') {
    if (!configured || configured.includes(deadExternalApi)) {
      return '/api';
    }
    try {
      const url = new URL(configured, window.location.origin);
      if (url.origin === window.location.origin) {
        return url.pathname.replace(/\/$/, '') || '/api';
      }
    } catch {
      /* use configured value below */
    }
    return configured;
  }

  if (configured) return configured;
  return process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:4000/api';
}

const API_BASE = resolveApiBase();
const TOKEN_KEY = 'abk_access_token';

// Access JWT remains in localStorage so existing Bearer clients keep working.
// Refresh is already an httpOnly cookie (see auth/routes.ts). TODO(wave-b):
// move the access token to memory + httpOnly cookie in a dedicated rewrite.

let refreshPromise: Promise<string> | null = null;
let authTokenChangeHandler: ((event: string) => void) | null = null;

export function setAuthTokenChangeHandler(handler: (event: string) => void): void {
  authTokenChangeHandler = handler;
}

function notifyAuthTokenChange(event: string): void {
  if (typeof authTokenChangeHandler === 'function') {
    authTokenChangeHandler(event);
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function tryRefreshToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Refresh failed');
  return data.accessToken as string;
}

export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = tryRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export interface ApiFetchOptions extends RequestInit {
  _retry?: boolean;
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && !options._retry && !path.startsWith('/auth/login')) {
    try {
      const newToken = await refreshAccessToken();
      setAccessToken(newToken);
      notifyAuthTokenChange('refreshed');
      return apiFetch<T>(path, { ...options, _retry: true });
    } catch {
      setAccessToken(null);
      notifyAuthTokenChange('cleared');
    }
  }

  if (!res.ok) {
    const err = new Error(
      (data as { error?: string }).error || res.statusText || 'Request failed'
    ) as ApiError;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export { API_BASE, TOKEN_KEY };
