/**
 * Tests for the new /api/state passthrough + the widened /api/equity.
 *
 * Pins:
 *   - /api/state returns { state, stale: false } on success.
 *   - /api/state returns { state: null, stale: true } on upstream
 *     failure (no 500).
 *   - /api/equity surfaces peak, drawdown, dailyPnl, dailyTrades,
 *     openPositions, mode.
 *   - /api/equity uses the bot's `equity_curve` array when present
 *     (the {t, v} shape, not number[]).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

function mockFetch(okBody: unknown, opts: { throws?: boolean } = {}) {
  const fn = vi.fn(async () => {
    if (opts.throws) throw new Error('network');
    return new Response(JSON.stringify(okBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('/api/state passthrough', () => {
  beforeEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  it('returns { state, stale: false } on success', async () => {
    mockFetch({ ts: 1714000000, account_value: 277.26, mode: 'LIVE' });
    const { GET } = await import('@/app/api/state/route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stale).toBe(false);
    expect(body.state).toBeDefined();
    expect(body.state.account_value).toBe(277.26);
    expect(body.state.mode).toBe('LIVE');
  });

  it('returns { state: null, stale: true } on upstream failure', async () => {
    mockFetch(null, { throws: true });
    const { GET } = await import('@/app/api/state/route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stale).toBe(true);
    expect(body.state).toBeNull();
  });
});

describe('/api/equity v2 widened payload', () => {
  beforeEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  it('surfaces peak / drawdown / dailyPnl / dailyTrades / openPositions / mode', async () => {
    mockFetch({
      ts: 1777510176,
      account_value: 277.26,
      peak_portfolio: 309.87,
      drawdown_pct: -10.52,
      daily_pnl: -3.75,
      daily_trades: 2,
      open_position_count: 0,
      mode: 'LIVE',
    });
    const { GET } = await import('@/app/api/equity/route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.total).toBe(277.26);
    expect(body.peak).toBe(309.87);
    expect(body.drawdown).toBeCloseTo(-10.52, 2);
    expect(body.dailyPnl).toBe(-3.75);
    expect(body.dailyTrades).toBe(2);
    expect(body.openPositions).toBe(0);
    expect(body.mode).toBe('LIVE');
    // Fallback path: no equity_curve → single-tip array
    expect(body.points).toEqual([277.26]);
  });

  it('passes through the bot\'s equity_curve array (the {t,v} shape)', async () => {
    const curve = [
      { t: 'start', v: -997.2 },
      { t: '2026-04-29T18:52', v: 277.26 },
    ];
    mockFetch({ account_value: 277.26, peak_portfolio: 309.87, equity_curve: curve });
    const { GET } = await import('@/app/api/equity/route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.points).toEqual(curve);
    expect(body.points[0]).toEqual({ t: 'start', v: -997.2 });
  });

  it('falls back to drawdown calculated from peak when bot omits drawdown_pct', async () => {
    mockFetch({ account_value: 100, peak_portfolio: 200 });
    const { GET } = await import('@/app/api/equity/route');
    const res = await GET();
    const body = await res.json();
    expect(body.pct).toBeCloseTo(-50, 1);
    expect(body.drawdown).toBeCloseTo(-50, 1);
  });
});
