import { NextRequest, NextResponse } from 'next/server';
import type { Trade } from '@/types';

const MOCK_TRADES: Trade[] = [
  { sym: 'SOL-PERP', side: 'LONG', size: '0.85R', pnl: '+2.4R', dollar: '+$486.20', time: '14m ago' },
  { sym: 'BTC-PERP', side: 'SHORT', size: '1.0R', pnl: '+1.8R', dollar: '+$360.00', time: '1h ago' },
  { sym: 'ETH-PERP', side: 'LONG', size: '0.75R', pnl: '-1.0R', dollar: '-$150.00', time: '3h ago' },
  { sym: 'ARB-PERP', side: 'LONG', size: '0.5R', pnl: '+3.2R', dollar: '+$480.00', time: '6h ago' },
  { sym: 'AVAX-PERP', side: 'SHORT', size: '0.85R', pnl: '+0.4R', dollar: '+$72.00', time: '12h ago' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') ?? '5');
  return NextResponse.json(MOCK_TRADES.slice(0, limit));
}
