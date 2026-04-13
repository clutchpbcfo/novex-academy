import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession, clearSession } from '@/lib/wallet/session';
import type { Session } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null);
  if (Date.now() > session.expiresAt) {
    await clearSession();
    return NextResponse.json(null);
  }
  return NextResponse.json(session);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Session;
  await setSession(body);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
