import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/crypto';
import type { Session } from '@/types';

const COOKIE_NAME = 'novex_session';
const COOKIE_OPTS = {
  domain: process.env.NODE_ENV === 'production' ? '.novex.finance' : undefined,
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24, // 24h
};

export async function setSession(session: Session): Promise<void> {
  const encrypted = await encrypt(JSON.stringify(session));
  cookies().set(COOKIE_NAME, encrypted, COOKIE_OPTS);
}

export async function getSession(): Promise<Session | null> {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(await decrypt(raw)) as Session;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  cookies().set(COOKIE_NAME, '', { ...COOKIE_OPTS, maxAge: 0 });
}
