/**
 * app/api/equity/route.ts
 *
 * Live equity passthrough. Reads ctn-api.novex.finance/api/state and
 * shapes it to the `EquityCurve` interface the academy components
 * already consume.
 *
 * Source of truth: `account_value` field returned by the bot's
 * `/v1/positions` Orderly call (USDC + unsettled PnL + open MTM).
 * See memory: `reference_orderly_account_value.md`.
 *
 * On upstream failure we return an empty curve with `stale: true` so
 * the UI can render the skeleton and a small "stale" indicator
 * instead of a 500 page.
 */

import { NextResponse } from 'next/server';
import { fetchCtn } from '@/lib/ctn/fetch';
import type { EquityCurve } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CtnState {
  ts?: number;
  portfolio?: number;
  account_value?: number;
  peak_portfolio?: number;
  drawdown_pct?: number;
  daily_pnl?: number;
  daily_trades?: number;
  open_position_count?: number;
  mode?: string;
  equity_curve?: number[];
}

export async function GET() {
  try {
    const state = await fetchCtn<CtnState>('/api/state');

    const total =
      typeof state.account_value === 'number'
        ? state.account_value
        : typeof state.portfolio === 'number'
          ? state.portfolio
          : 0;

    const points: number[] = Array.isArray(state.equity_curve)
      ? state.equity_curve
      : total > 0
        ? [total]
        : [];

    const peak = state.peak_portfolio ?? total;
    const pct =
      peak > 0 && total > 0 ? Number((((total - peak) / peak) * 100).toFixed(2)) : 0;

    const payload: EquityCurve & { stale?: boolean; ts?: number; mode?: string } = {
      points,
      total,
      pct,
      ts: state.ts,
      mode: state.mode,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.warn('[api/equity] ctn-api unreachable:', String(err));
    return NextResponse.json(
      { points: [], total: 0, pct: 0, stale: true } satisfies EquityCurve & {
        stale: boolean;
      },
      { status: 200 },
    );
  }
}
