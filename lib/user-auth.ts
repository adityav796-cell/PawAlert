// User authentication utilities - OTP based authentication

// Store user session in localStorage
export interface UserSession {
  phoneNumber: string;
  userId: string;
  name: string;
  isAdmin: boolean;
  loginTime: number;
}

export function setUserSession(session: UserSession) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pawalert_user_session', JSON.stringify(session));
  }
}

export function getUserSession(): UserSession | null {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('pawalert_user_session');
    return session ? JSON.parse(session) : null;
  }
  return null;
}

export function clearUserSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pawalert_user_session');
  }
}

export function isUserLoggedIn(): boolean {
  return getUserSession() !== null;
}

export function isAdmin(): boolean {
  const session = getUserSession();
  return session?.isAdmin === true;
}

// Generate a random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate phone number format (Indian phone numbers)
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s\-]/g, '');
  // Accept 10 digit Indian numbers or with country code
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
}

// Format phone number to standard format
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  // If it's just 10 digits, add country code
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  // If it already has 91, just add +
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return '+' + cleaned;
  }
  return '+' + cleaned;
}
