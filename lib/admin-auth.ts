// Admin authentication utilities
// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@pawalert.app';
const ADMIN_PASSWORD = 'PawAlert@2024';
const SESSION_KEY = 'pawalert_admin_session';

export interface AdminSession {
  email: string;
  loggedInAt: string;
}

export function validateAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function createAdminSession(email: string): AdminSession {
  return {
    email,
    loggedInAt: new Date().toISOString(),
  };
}

export function saveAdminSession(session: AdminSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as AdminSession;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession() !== null;
}
