/**
 * app/api/trades/route.ts
 *
 * Live trades passthrough. Reads ctn-api.novex.finance/api/trades and
 * shapes each entry to the academy's `Trade` interface.
 *
 * Upstream shape varies; we normalize defensively so the UI never
 * crashes on a missing field. On upstream failure we return an empty
 * array (not a 500) so the academy keeps rendering.
 *
 * Query: `?limit=N` — default 5, max 50.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCtn } from '@/lib/ctn/fetch';
import type { Trade } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CtnTrade {
  symbol?: string;
  sym?: string;
  side?: string;
  size?: number | string;
  notional?: number;
  pnl?: number;
  pnl_pct?: number;
  realized_pnl?: number;
  rpnl?: number;
  ts?: number;
  closed_at?: number;
  [k: string]: unknown;
}

function fmtPct(n: number | undefined): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '0.00%';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function fmtUsd(n: number | undefined): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '$0.00';
  // Unicode minus instead of naked dash (Bible rule).
  const sign = n >= 0 ? '+' : '−';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function fmtRelTime(ts: number | undefined): string {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return '';
  const now = Date.now() / 1000;
  const delta = Math.max(0, now - ts);
  if (delta < 60) return `${Math.floor(delta)}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

function normalize(t: CtnTrade): Trade {
  const sym = String(t.symbol ?? t.sym ?? '').replace(/^PERP_/, '').replace(/_USDC$/, '');
  const sideUpper = String(t.side ?? '').toUpperCase();
  const side: Trade['side'] = sideUpper === 'SHORT' || sideUpper === 'SELL' ? 'SHORT' : 'LONG';
  const sizeNum = typeof t.size === 'number' ? t.size : Number(t.size ?? 0);
  const size = Number.isFinite(sizeNum) ? sizeNum.toFixed(4) : String(t.size ?? '');
  const dollar =
    typeof t.realized_pnl === 'number'
      ? fmtUsd(t.realized_pnl)
      : typeof t.rpnl === 'number'
        ? fmtUsd(t.rpnl)
        : fmtUsd(t.pnl);
  const pnl = fmtPct(t.pnl_pct);
  const time = fmtRelTime(t.closed_at ?? t.ts);
  return { sym, side, size, pnl, dollar, time };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requested = parseInt(searchParams.get('limit') ?? '5', 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(1, requested), 50) : 5;

  try {
    const raw = await fetchCtn<CtnTrade[] | { trades?: CtnTrade[] }>('/api/trades');
    const list: CtnTrade[] = Array.isArray(raw) ? raw : Array.isArray(raw.trades) ? raw.trades : [];
    const trades: Trade[] = list.slice(0, limit).map(normalize);
    return NextResponse.json(trades);
  } catch (err) {
    console.warn('[api/trades] ctn-api unreachable:', String(err));
    return NextResponse.json([], { status: 200 });
  }
}
