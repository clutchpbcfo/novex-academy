import { NextRequest, NextResponse } from 'next/server';
import type { BlobTrader } from '@/types';

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_BASE ??
  'https://gbifpfm0chnluoyc.public.blob.vercel-storage.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'wallet param required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BLOB_BASE}/traders.json`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`);

    const traders: any[] = await res.json();
    const raw = traders.find(
      (t) => (t.wallet_address ?? t.wallet ?? '').toLowerCase() === wallet.toLowerCase(),
    );

    if (!raw) return NextResponse.json(null);

    // Map blob fields to BlobTrader shape
    const mapped: BlobTrader = {
      wallet: raw.wallet_address ?? raw.wallet ?? wallet,
      username: raw.username ?? '',
      nxp: raw.total_nxp ?? raw.nxp ?? 0,
      tier: raw.tier ?? 'Rookie',
      volume: raw.lifetime_volume ?? raw.volume ?? 0,
      pnl: raw.all_time_pnl ?? raw.alltime_pnl ?? raw.pnl ?? 0,
      wr: raw.win_rate ?? raw.wr ?? 0,
      activeDays: raw.active_days ?? raw.activeDays ?? 0,
      badges: raw.badges ?? [],
      rank: raw.rank ?? 0,
      trades: raw.total_trades ?? raw.trades ?? 0,
            bestStreak: raw.max_profit_streak ?? raw.max_streak ?? 0,
            bestTrade: raw.max_single_trade ?? 0,
            profitDays: raw.profitable_days ?? 0,
            uniquePairs: raw.unique_pairs ?? 0,
    };

    return NextResponse.json(mapped);
  } catch (err) {
    console.error('[trader] fetch error:', err);
    return NextResponse.json(
      { error: 'Unable to fetch trader data' },
      { status: 503 },
    );
  }
}
