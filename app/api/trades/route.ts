import { NextRequest, NextResponse } from 'next/server';
import type { Trade } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') ?? '5');

  // TODO: Integrate real trade data from Orderly / terminal
  // For now, return empty array — no fake trades
  const trades: Trade[] = [];

  return NextResponse.json(trades.slice(0, limit));
}
