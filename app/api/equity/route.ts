/**
 * app/api/equity/route.ts  (v2 — widened payload + types)
 *
 * Live equity passthrough. Reads ctn-api.novex.finance/api/state and
 * shapes it to a richer EquityResponse.
 *
 * v2 changes vs the original passthrough:
 *   - Accepts the bot's actual `equity_curve` shape (array of
 *     `{t, v}` snapshots, not `number[]`). Old narrow `number[]`
 *     declaration was wrong at runtime.
 *   - Surfaces peak_portfolio, drawdown_pct, daily_pnl,
 *     daily_trades, open_position_count, mode — all useful for
 *     dashboard widgets.
 *   - Computes `drawdown` from peak vs total when the bot didn't
 *     send drawdown_pct directly.
 *
 * On upstream failure we return an empty curve with `stale: true`.
 *
 * Source of truth: `account_value` field returned by /v1/positions.
 * See memory: `reference_orderly_account_value.md`.
 */

import { NextResponse } from 'next/server';
import { fetchCtn } from '@/lib/ctn/fetch';
import type { CtnState, EquityPoint, EquityResponse } from '@/lib/ctn/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function pickTotal(state: CtnState): number {
  if (typeof state.account_value === 'number') return state.account_value;
  if (typeof state.portfolio === 'number') return state.portfolio;
  return 0;
}

function pickPoints(state: CtnState, total: number): EquityPoint[] {
  if (Array.isArray(state.equity_curve) && state.equity_curve.length > 0) {
    return state.equity_curve;
  }
  return total > 0 ? [total] : [];
}

function pickPct(total: number, peak: number, sentDd?: number): number {
  if (typeof sentDd === 'number') return Number(sentDd.toFixed(2));
  if (peak > 0 && total > 0) {
    return Number((((total - peak) / peak) * 100).toFixed(2));
  }
  return 0;
}

export async function GET() {
  try {
    const state = await fetchCtn<CtnState>('/api/state');
    const total = pickTotal(state);
    const peak = state.peak_portfolio ?? total;
    const pct = pickPct(total, peak, state.drawdown_pct);

    const payload: EquityResponse = {
      points: pickPoints(state, total),
      total,
      pct,
      drawdown: pct,
      peak,
      dailyPnl: state.daily_pnl,
      dailyTrades: state.daily_trades,
      openPositions: state.open_position_count,
      mode: state.mode,
      ts: state.ts,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.warn('[api/equity] ctn-api unreachable:', String(err));
    const stale: EquityResponse = {
      points: [],
      total: 0,
      pct: 0,
      stale: true,
    };
    return NextResponse.json(stale, { status: 200 });
  }
}
