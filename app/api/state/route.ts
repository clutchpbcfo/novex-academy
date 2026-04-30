/**
 * app/api/state/route.ts
 *
 * Direct passthrough of ctn-api.novex.finance/api/state. Used by
 * dashboard widgets that want the full bot state in one call rather
 * than composing /api/equity + /api/trades + /api/briefs.
 *
 * Returns { state: CtnState, stale: boolean }. On upstream failure
 * returns { state: null, stale: true } at HTTP 200 so the academy
 * never 500s on a tunnel flap.
 */

import { NextResponse } from 'next/server';
import { fetchCtn } from '@/lib/ctn/fetch';
import type { CtnState } from '@/lib/ctn/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface StateResponse {
  state: CtnState | null;
  stale: boolean;
}

export async function GET() {
  try {
    const state = await fetchCtn<CtnState>('/api/state');
    const payload: StateResponse = { state, stale: false };
    return NextResponse.json(payload);
  } catch (err) {
    console.warn('[api/state] ctn-api unreachable:', String(err));
    const stale: StateResponse = { state: null, stale: true };
    return NextResponse.json(stale, { status: 200 });
  }
}
