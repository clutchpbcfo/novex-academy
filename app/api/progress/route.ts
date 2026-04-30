/**
 * app/api/progress/route.ts
 *
 * Lesson-progress acknowledgement endpoint.
 *
 * Phase-1 contract:
 *   - GET returns the canonical totals (NEVER the hardcoded 19 that
 *     was here before — that was a Canon-drift bug). Per-module
 *     percentages are not server-tracked yet; client computes them
 *     from `useProgressStore`. We return zeros from the server so
 *     the UI knows to fall back to local state.
 *   - POST acknowledges a lesson completion. Persistence to Blob/DB
 *     is a Phase-2 concern; we log the event so server-side tooling
 *     can see it. The badge mint + NXP award lives in the sibling
 *     `/api/progress/award` route.
 *
 * Single source of truth for totals: `lib/academy/canon.ts`.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ACADEMY_TOTAL_LESSONS,
  ACADEMY_TOTAL_NXP_CAP,
  MODULE_KEYS,
} from '@/lib/academy/canon';

export const runtime = 'nodejs';

const EMPTY_MODULE_PCTS: Record<string, number> = Object.fromEntries(
  MODULE_KEYS.map((k, i) => [String(i + 1), 0]),
);

export async function GET() {
  return NextResponse.json({
    completed: 0,
    total: ACADEMY_TOTAL_LESSONS,
    nxpCap: ACADEMY_TOTAL_NXP_CAP,
    modules: EMPTY_MODULE_PCTS,
  });
}

export async function POST(req: NextRequest) {
  let body: { moduleId?: number; lessonIndex?: number } = {};
  try {
    body = (await req.json()) as { moduleId?: number; lessonIndex?: number };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const { moduleId, lessonIndex } = body;
  if (typeof moduleId !== 'number' || typeof lessonIndex !== 'number') {
    return NextResponse.json(
      { ok: false, error: 'moduleId and lessonIndex required (number)' },
      { status: 400 },
    );
  }
  console.log(
    `[api/progress] ack module=${moduleId} lesson=${lessonIndex} ts=${Date.now()}`,
  );
  return NextResponse.json({ ok: true });
}
