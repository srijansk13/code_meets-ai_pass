import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';

function getJwtSecret() {
  const secretKey = process.env.ADMIN_SECURITY_KEY || 'chaos-admin-default-secret-key-2026';
  return new TextEncoder().encode(crypto.createHash('sha256').update(secretKey).digest('hex'));
}

/**
 * Hash a plain text key using SHA-256 to match PostgreSQL `encode(digest(key, 'sha256'), 'hex')`
 */
export function hashAdminKey(key: string): string {
  return crypto.createHash('sha256').update(key.trim()).digest('hex');
}

export interface AdminSessionPayload {
  authenticated: boolean;
  deviceLabel: string;
}

/**
 * Create a signed admin session JWT
 */
export async function createAdminSessionToken(deviceLabel: string = 'Gate Admin'): Promise<string> {
  const secret = getJwtSecret();
  return await new SignJWT({ authenticated: true, deviceLabel })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

/**
 * Verify current request admin session from cookies
 */
export async function verifyAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    if (payload.authenticated) {
      return {
        authenticated: true,
        deviceLabel: (payload.deviceLabel as string) || 'Gate Admin',
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export { SESSION_COOKIE_NAME };
