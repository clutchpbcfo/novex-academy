/**
 * app/api/progress/award/route.ts
 *
 * Academy award endpoint — mints Academy badges on lesson/module/exam
 * completion events per NOVEX-BADGE-WIRING-SPEC.md §5.4 (academy.award
 * stream) and §4.5 (the 5 Academy badges).
 *
 * Accepted request shapes (all POST, JSON body):
 *
 *   { type: 'module_complete', moduleId: 1..5, nxp?: number,
 *     wallet?: string, existingBadges?: unknown }
 *     → mints MODULE_BADGE_IDS[key] for the given module.
 *
 *   { type: 'exam_pass', scorePct: number, nxp?: number,
 *     wallet?: string, existingBadges?: unknown }
 *     → mints CIO_BADGE_ID when scorePct >= EXAM_PASS_PCT.
 *
 *   { type: 'cio', nxp: number }
 *     → legacy stub kept for back-compat (mints nothing persistently;
 *        logs award + returns ok). New callers should use 'exam_pass'.
 *
 * Idempotency: every mint branch calls normalizeBadges(existingBadges)
 * and skips the mint if the badge is already present. Response always
 * echoes `{ minted, badgeId, nxpAwarded, badges }` so the caller can
 * persist the updated badge set without re-deriving it.
 *
 * Persistence: Phase 1 logs the award and returns the post-mint badge
 * array. A future Phase 2 patch will add Blob/DB write here; callers
 * today are expected to persist the returned `badges` array themselves
 * (keeps the route pure and easy to test).
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  CIO_BADGE_ID,
  EXAM_PASS_PCT,
  MODULE_BADGE_IDS,
  moduleIdToKey,
  nxpForModule,
  type ModuleKey,
} from '@/lib/academy/canon';
import { normalizeBadges } from '@/lib/badges/normalize';

export const runtime = 'nodejs';

type ModuleCompleteBody = {
  type: 'module_complete';
  moduleId: number;
  nxp?: number;
  wallet?: string;
  existingBadges?: unknown;
};

type ExamPassBody = {
  type: 'exam_pass';
  scorePct: number;
  nxp?: number;
  wallet?: string;
  existingBadges?: unknown;
};

type CioLegacyBody = { type: 'cio'; nxp: number };

type AwardBody = ModuleCompleteBody | ExamPassBody | CioLegacyBody;

type MintOutcome = {
  ok: true;
  minted: boolean;
  badgeId: string;
  nxpAwarded: number;
  badges: string[];
};

function mint(badgeId: string, existing: unknown, nxpIfNew: number): MintOutcome {
  const have = normalizeBadges(existing);
  const alreadyHas = have.includes(badgeId);
  const nxpAwarded = alreadyHas ? 0 : nxpIfNew;
  const badges = alreadyHas ? have : [...have, badgeId];
  return { ok: true, minted: !alreadyHas, badgeId, nxpAwarded, badges };
}

export async function POST(req: NextRequest) {
  let body: AwardBody;
  try {
    body = (await req.json()) as AwardBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  // academy.award stream: module completion -> mint module badge
  if (body.type === 'module_complete') {
    const key: ModuleKey | null = moduleIdToKey(body.moduleId);
    if (!key) {
      return NextResponse.json(
        { ok: false, error: `Unknown moduleId: ${body.moduleId}` },
        { status: 400 },
      );
    }
    const badgeId = MODULE_BADGE_IDS[key];
    const nxpIfNew = body.nxp ?? nxpForModule(key);
    const result = mint(badgeId, body.existingBadges, nxpIfNew);
    if (result.minted) {
      console.log(
        `[academy.award] mint ${badgeId} for ${body.wallet ?? '<anon>'} +${result.nxpAwarded} NXP`,
      );
    }
    return NextResponse.json(result);
  }

  // academy.award stream: M05 exam pass -> mint CIO badge
  if (body.type === 'exam_pass') {
    if (typeof body.scorePct !== 'number' || body.scorePct < EXAM_PASS_PCT) {
      return NextResponse.json({
        ok: true,
        minted: false,
        badgeId: CIO_BADGE_ID,
        nxpAwarded: 0,
        badges: normalizeBadges(body.existingBadges),
        reason: `Score ${body.scorePct}% below pass threshold ${EXAM_PASS_PCT}%`,
      });
    }
    const nxpIfNew = body.nxp ?? nxpForModule('M05');
    const result = mint(CIO_BADGE_ID, body.existingBadges, nxpIfNew);
    if (result.minted) {
      console.log(
        `[academy.award] mint ${CIO_BADGE_ID} for ${body.wallet ?? '<anon>'} +${result.nxpAwarded} NXP (exam ${body.scorePct}%)`,
      );
    }
    return NextResponse.json(result);
  }

  // Legacy stub (pre-Phase-1) — kept so older callers don't 400.
  if (body.type === 'cio') {
    console.log(`CIO badge awarded. +${body.nxp} NXP`);
    return NextResponse.json({ ok: true, badge: 'cio', nxpAwarded: body.nxp });
  }

  return NextResponse.json(
    { ok: false, error: 'Unknown award type' },
    { status: 400 },
  );
}
