import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { type, nxp } = (await req.json()) as { type: string; nxp: number };

  if (type === 'cio') {
    // In production: persist badge + NXP award to DB, unlock CIO chip
    console.log(`CIO badge awarded. +${nxp} NXP`);
    return NextResponse.json({ ok: true, badge: 'cio', nxpAwarded: nxp });
  }

  return NextResponse.json({ ok: false, error: 'Unknown award type' }, { status: 400 });
}
