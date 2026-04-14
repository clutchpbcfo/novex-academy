import { NextRequest, NextResponse } from 'next/server';
import type { LeaderboardEntry, BlobTrader } from '@/types';

const BLOB_BASE =
  process.env.NEXT_PUBLIC_BLOB_BASE ??
  'https://gbifpfm0chnluoyc.public.blob.vercel-storage.com';

const GRADIENT_POOL = [
  'linear-gradient(135deg,#ff6b35,#f7931e)',
  'linear-gradient(135deg,#a855f7,#e91e63)',
  'linear-gradient(135deg,#00e5ff,#00c853)',
  'linear-gradient(135deg,#ffd166,#ff9500)',
  'linear-gradient(135deg,#00c853,#00e676)',
  'linear-gradient(135deg,#00e5ff,#a855f7)',
  'linear-gradient(135deg,#3b99fc,#00e5ff)',
  'linear-gradient(135deg,#ff3b5c,#a855f7)',
  'linear-gradient(135deg,#ffd166,#00e676)',
  'linear-gradient(135deg,#f6851b,#ff6b35)',
];

function walletToGradient(wallet: string): string {
  const last2 = wallet.slice(-2);
  const idx = parseInt(last2, 16);
  return GRADIENT_POOL[isNaN(idx) ? 0 : idx % GRADIENT_POOL.length];
}

function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function toInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/[\s._]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get('metric') ?? 'pnl';

  try {
    const res = await fetch(`${BLOB_BASE}/traders.json`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`);

    const traders: BlobTrader[] = await res.json();

    const entries: LeaderboardEntry[] = traders.map((trader) => ({
      rank: trader.rank ?? 0,
      name: trader.username || shortAddr(trader.wallet),
      handle: trader.username
        ? trader.username.toLowerCase().replace(/[\s]+/g, '.')
        : shortAddr(trader.wallet),
      avatarBg: walletToGradient(trader.wallet),
      avatarInitials: toInitials(trader.username || trader.wallet),
      wallet: trader.wallet,
      pnl: trader.pnl ?? 0,
      nxp: trader.nxp ?? 0,
      wr: trader.wr ?? 0,
      trend: '+0%',
    }));

    const sorted = [...entries]
      .sort((a, b) => {
        if (metric === 'nxp') return b.nxp - a.nxp;
        if (metric === 'wr') return b.wr - a.wr;
        return b.pnl - a.pnl;
      })
      .map((e, i) => ({ ...e, rank: i + 1 }));

    return NextResponse.json(sorted);
  } catch (err) {
    console.error('[leaderboard] fetch error:', err);
    return NextResponse.json(
      { error: 'Leaderboard temporarily unavailable' },
      { status: 503 },
    );
  }
}
