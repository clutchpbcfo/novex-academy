/**
 * Tests for the ctn-api passthrough routes.
 *
 * We mock global fetch so the test never hits the live tunnel.
 * Each route must:
 *   - return 200 with normalized payload on upstream success
 *   - return 200 with empty/stale payload on upstream failure
 *   - request the right path
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

function mockFetch(
  okBody: unknown,
  opts: { ok?: boolean; status?: number; throws?: boolean } = {},
) {
  const { ok = true, status = ok ? 200 : 500, throws = false } = opts;
  const fn = vi.fn(async () => {
    if (throws) throw new Error('network');
    return new Response(JSON.stringify(okBody), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('/api/equity passthrough', () => {
  beforeEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  it('shapes account_value from /api/state', async () => {
    mockFetch({ ts: 1714000000, account_value: 312.45, peak_portfolio: 320.0, mode: 'LIVE' });
    const { GET } = await import('@/app/api/equity/route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.total).toBe(312.45);
    expect(body.points).toEqual([312.45]);
    expect(body.mode).toBe('LIVE');
    expect(body.pct).toBeCloseTo(-2.36, 1);
  });

  it('returns stale skeleton on upstream failure (no 500)', async () => {
    mockFetch(null, { throws: true });
    const { GET } = await import('@/app/api/equity/route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.points).toEqual([]);
    expect(body.stale).toBe(true);
  });
});

describe('/api/trades passthrough', () => {
  beforeEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  it('normalizes upstream trades to the academy Trade shape', async () => {
    mockFetch([
      { symbol: 'PERP_BTC_USDC', side: 'long', size: 0.012, realized_pnl: 4.32, pnl_pct: 1.42, closed_at: Date.now() / 1000 - 120 },
      { sym: 'ETH', side: 'SHORT', size: '0.5', rpnl: -1.2, pnl_pct: -0.61, ts: Date.now() / 1000 - 7200 },
    ]);
    const { GET } = await import('@/app/api/trades/route');
    const req = new Request('http://localhost/api/trades?limit=5');
    const res = await GET(req as unknown as import('next/server').NextRequest);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].sym).toBe('BTC');
    expect(body[0].side).toBe('LONG');
    expect(body[0].dollar).toMatch(/\+\$4\.32/);
    expect(body[1].side).toBe('SHORT');
    expect(body[1].dollar).toMatch(/[−-]\$1\.20/);
  });

  it('returns empty array on upstream failure', async () => {
    mockFetch(null, { throws: true });
    const { GET } = await import('@/app/api/trades/route');
    const req = new Request('http://localhost/api/trades');
    const res = await GET(req as unknown as import('next/server').NextRequest);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });
});

describe('/api/briefs passthrough', () => {
  beforeEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  it('normalizes upstream briefs and sorts newest first', async () => {
    mockFetch([
      { ts: 1000, asset: 'BTC', side: 'long', score: 14, outcome: 'right', move_pct: 1.2, confluence: 'HTF, Sweep, BBWP' },
      { ts: 2000, symbol: 'PERP_ETH_USDC', side: 'SHORT', score: 9, result: 'wrong', pct_move: -0.4, confluence: ['DMI', 'Volume'] },
    ]);
    const { GET } = await import('@/app/api/briefs/route');
    const req = new Request('http://localhost/api/briefs');
    const res = await GET(req as unknown as import('next/server').NextRequest);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stale).toBe(false);
    expect(body.briefs).toHaveLength(2);
    expect(body.briefs[0].ts).toBe(2000);
    expect(body.briefs[0].asset).toBe('ETH');
    expect(body.briefs[0].side).toBe('short');
    expect(body.briefs[0].result).toBe('WRONG');
    expect(body.briefs[1].confluence).toEqual(['HTF', 'Sweep', 'BBWP']);
  });

  it('returns stale empty payload on upstream failure', async () => {
    mockFetch(null, { throws: true });
    const { GET } = await import('@/app/api/briefs/route');
    const req = new Request('http://localhost/api/briefs');
    const res = await GET(req as unknown as import('next/server').NextRequest);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stale).toBe(true);
    expect(body.briefs).toEqual([]);
  });
});
