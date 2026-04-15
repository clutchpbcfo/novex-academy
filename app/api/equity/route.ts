import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Integrate real equity curve data from Orderly / terminal
  // For now, return empty data — no fake curves
  return NextResponse.json({ points: [], total: 0, pct: 0 });
}
