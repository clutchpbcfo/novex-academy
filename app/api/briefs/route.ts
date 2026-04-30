/**
 * app/api/briefs/route.ts
 *
 * 4H Brief Loop passthrough. The bot's `ctn_4h_brief.py` postmortem
 * runs 10 minutes after each fleet decision, classifies the outcome
 * (RIGHT / WRONG / FLAT), and persists to `briefs.jsonl` (last 30).
 * `ctn_dashboard.py` exposes that file at `/api/briefs`.
 *
 * Memory: SESSION-2026-04-29 — Brief Loop shipped, /api/briefs
 * confirmed serving 200 via cloudflared tunnel.
 *
 * Query: `?limit=N` — default 20, max 30 (the underlying file caps
 * at 30 entries).
 *
 * On upstream failure we return `{ briefs: [], stale: true }` so the
 * /briefs page can render an empty state instead of a 500.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCtn } from '@/lib/ctn/fetch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface Brief {
  ts: number;
  asset: string;
  side: 'long' | 'short' | 'flat';
  tier?: string;
  score?: number;
  result: 'RIGHT' | 'WRONG' | 'FLAT';
  pct_move?: number;
  confluence?: string[];
  postmortem?: string;
  [k: string]: unknown;
}

interface UpstreamBrief {
  ts?: number;
  timestamp?: number;
  asset?: string;
  symbol?: string;
  side?: string;
  tier?: string;
  score?: number;
  result?: string;
  outcome?: string;
  pct_move?: number;
  move_pct?: number;
  confluence?: string[] | string;
  postmortem?: string;
  note?: string;
  [k: string]: unknown;
}

function normalizeOutcome(s: string | undefined): Brief['result'] {
  const v = String(s ?? '').toUpperCase();
  if (v === 'RIGHT' || v === 'WIN' || v === 'CORRECT') return 'RIGHT';
  if (v === 'WRONG' || v === 'LOSS' || v === 'INCORRECT') return 'WRONG';
  return 'FLAT';
}

function normalizeSide(s: string | undefined): Brief['side'] {
  const v = String(s ?? '').toLowerCase();
  if (v === 'long' || v === 'buy') return 'long';
  if (v === 'short' || v === 'sell') return 'short';
  return 'flat';
}

function normalize(b: UpstreamBrief): Brief {
  const conf = Array.isArray(b.confluence)
    ? b.confluence
    : typeof b.confluence === 'string'
      ? b.confluence.split(/[,|]/).map((x) => x.trim()).filter(Boolean)
      : [];
  return {
    ts: typeof b.ts === 'number' ? b.ts : (b.timestamp ?? 0),
    asset: String(b.asset ?? b.symbol ?? '').replace(/^PERP_/, '').replace(/_USDC$/, ''),
    side: normalizeSide(b.side),
    tier: b.tier,
    score: typeof b.score === 'number' ? b.score : undefined,
    result: normalizeOutcome(b.result ?? b.outcome),
    pct_move: typeof b.pct_move === 'number' ? b.pct_move : b.move_pct,
    confluence: conf,
    postmortem: b.postmortem ?? b.note,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requested = parseInt(searchParams.get('limit') ?? '20', 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(1, requested), 30) : 20;

  try {
    const raw = await fetchCtn<UpstreamBrief[] | { briefs?: UpstreamBrief[] }>(
      '/api/briefs',
    );
    const list: UpstreamBrief[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.briefs)
        ? raw.briefs
        : [];
    const briefs: Brief[] = list
      .map(normalize)
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
      .slice(0, limit);
    return NextResponse.json({ briefs, stale: false });
  } catch (err) {
    console.warn('[api/briefs] ctn-api unreachable:', String(err));
    return NextResponse.json({ briefs: [], stale: true }, { status: 200 });
  }
}
