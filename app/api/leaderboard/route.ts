import { NextRequest, NextResponse } from 'next/server';
import type { LeaderboardEntry } from '@/types';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Shibuya.MkVP', handle: 'shibuya.mkvp', avatarBg: 'linear-gradient(135deg,#ff6b35,#f7931e)', avatarInitials: 'SH', pnl: 48230, nxp: 18420, wr: 72, trend: '+12%' },
  { rank: 2, name: 'd1Sxic1.s8rq', handle: 'd1sxic1.s8rq', avatarBg: 'linear-gradient(135deg,#a855f7,#e91e63)', avatarInitials: 'D1', pnl: 42180, nxp: 16890, wr: 68, trend: '+8%' },
  { rank: 3, name: '3mYdt_VPeh', handle: '3mydt.vpeh', avatarBg: 'linear-gradient(135deg,#00e5ff,#00c853)', avatarInitials: '3M', pnl: 38720, nxp: 15200, wr: 66, trend: '-3%' },
  { rank: 4, name: 'SPG8u_NxwC', handle: 'spg8u.nxwc', avatarBg: 'linear-gradient(135deg,#ffd166,#ff9500)', avatarInitials: 'SP', pnl: 32440, nxp: 13850, wr: 64, trend: '+5%' },
  { rank: 5, name: 'Kenshin.42', handle: 'kenshin.42', avatarBg: 'linear-gradient(135deg,#00c853,#00e676)', avatarInitials: 'KE', pnl: 28900, nxp: 12600, wr: 61, trend: '+2%' },
  { rank: 6, name: 'Clutch', handle: 'clutch.novex', avatarBg: 'linear-gradient(135deg,#00e5ff,#a855f7)', avatarInitials: 'CL', pnl: 24750, nxp: 11340, wr: 59, trend: '+14%', isYou: true },
  { rank: 7, name: 'VaultKeeper', handle: 'vaultkeeper', avatarBg: 'linear-gradient(135deg,#3b99fc,#00e5ff)', avatarInitials: 'VK', pnl: 21300, nxp: 10120, wr: 58, trend: '-1%' },
  { rank: 8, name: 'Marksman', handle: 'marksman', avatarBg: 'linear-gradient(135deg,#ff3b5c,#a855f7)', avatarInitials: 'MA', pnl: 19540, nxp: 9480, wr: 56, trend: '+4%' },
  { rank: 9, name: 'Tesseract', handle: 'tesseract', avatarBg: 'linear-gradient(135deg,#ffd166,#00e676)', avatarInitials: 'TE', pnl: 17820, nxp: 8760, wr: 55, trend: '0%' },
  { rank: 10, name: 'Orbital', handle: 'orbital.x', avatarBg: 'linear-gradient(135deg,#f6851b,#ff6b35)', avatarInitials: 'OR', pnl: 15440, nxp: 7920, wr: 53, trend: '+6%' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get('metric') ?? 'pnl';

  const sorted = [...MOCK_LEADERBOARD].sort((a, b) => {
    if (metric === 'nxp') return b.nxp - a.nxp;
    if (metric === 'wr') return b.wr - a.wr;
    return b.pnl - a.pnl;
  }).map((e, i) => ({ ...e, rank: i + 1 }));

  return NextResponse.json(sorted);
}
