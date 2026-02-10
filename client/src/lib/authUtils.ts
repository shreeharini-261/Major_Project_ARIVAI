const TOKEN_KEY = 'arivai_access_token';
const REFRESH_TOKEN_KEY = 'arivai_refresh_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      return data.accessToken;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }

  clearTokens();
  return null;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      setTokens(data.accessToken, data.refreshToken);
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export async function register(
  email: string, 
  password: string, 
  firstName?: string, 
  lastName?: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName })
    });

    const data = await response.json();

    if (response.ok) {
      setTokens(data.accessToken, data.refreshToken);
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || 'Registration failed' };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  clearTokens();
}
