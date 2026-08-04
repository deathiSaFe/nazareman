import { cookies } from 'next/headers';

export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

export function validateAdminPassword(password: string): boolean {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return false;
  }

  return password === adminPassword;
}

export async function getAdminPasswordFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  const rawCookieValue = cookieStore.get('admin_password')?.value ?? '';

  if (!rawCookieValue) {
    return '';
  }

  try {
    return decodeURIComponent(rawCookieValue);
  } catch {
    return rawCookieValue;
  }
}