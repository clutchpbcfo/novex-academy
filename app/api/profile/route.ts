import { NextRequest, NextResponse } from 'next/server';
import type { Profile } from '@/types';

let MOCK_PROFILE: Profile = {
  displayName: 'Clutch',
  handle: 'clutch.novex',
  bio: 'Regime-aware perp trader. Only choppy, only premium. SENSEI v7.7 on 5m.',
  avatarBg: 'cyan-purple',
  avatarInitials: 'CL',
  twitter: '@clutch_novex',
  discord: 'clutch#0001',
};

export async function GET() {
  return NextResponse.json(MOCK_PROFILE);
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as Partial<Profile>;
  MOCK_PROFILE = { ...MOCK_PROFILE, ...body };
  return NextResponse.json(MOCK_PROFILE);
}
