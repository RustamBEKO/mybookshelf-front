import Cookies from 'js-cookie';
import type { Role } from '@/types';

const TOKEN_KEY = 'access_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 3 / 24, sameSite: 'lax' });
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user_info');
}

export function getUserInfo(): { id: string; name: string; email: string; role: Role } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_info');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveUserInfo(info: { id: string; name: string; email: string; role: Role }): void {
  localStorage.setItem('user_info', JSON.stringify(info));
}

export function isAdmin(): boolean {
  const role = getUserInfo()?.role;
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdmin(): boolean {
  return getUserInfo()?.role === 'SUPER_ADMIN';
}
