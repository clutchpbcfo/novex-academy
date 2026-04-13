import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getSession } from '@/lib/wallet/session';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No active session' }, { status: 401 });
  }

  const secret = process.env.NOVEX_DEEPLINK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Deeplink secret not configured' }, { status: 500 });
  }

  const secretKey = new TextEncoder().encode(secret);
  const token = await new SignJWT({ address: session.address, provider: session.provider })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90s')
    .sign(secretKey);

  const url = `novex://session?token=${token}`;
  return NextResponse.json({ url });
}
