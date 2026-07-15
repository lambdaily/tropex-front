const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface Tokens {
  access: string;
  refresh: string;
}

interface ApiError {
  detail?: string;
  [key: string]: unknown;
}

function getTokens(): Tokens | null {
  const stored = localStorage.getItem('tropex_tokens');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function setTokens(tokens: Tokens) {
  localStorage.setItem('tropex_tokens', JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem('tropex_tokens');
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens?.refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    setTokens({ access: data.access, refresh: data.refresh || tokens.refresh });
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const tokens = getTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  console.log('[apiClient] Request:', { path, method: options.method, headers });

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && tokens?.refresh) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers['Authorization'] = `Bearer ${newAccess}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({ detail: res.statusText }));
    console.error('[apiClient] Error:', { status: res.status, error });
    throw error;
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const data = await res.json();
  console.log('[apiClient] Response:', { path, data });
  return data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  getTokens,
  setTokens,
  clearTokens,
};
