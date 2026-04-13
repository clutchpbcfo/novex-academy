import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { type, nxp } = (await req.json()) as { type: string; nxp: number };

  if (type === 'operator') {
    // In production: persist badge + NXP award to DB, unlock operator rank
    console.log(`Operator badge awarded. +${nxp} NXP`);
    return NextResponse.json({ ok: true, badge: 'operator', nxpAwarded: nxp });
  }

  return NextResponse.json({ ok: false, error: 'Unknown award type' }, { status: 400 });
}
