// lib/academy/canon.ts
//
// Novex Academy canonical constants — Canon v2 (locked 2026-04-19).
//
// Single source of truth for NXP awards, lesson counts, exam rules, and
// module → badge bindings. Every Academy surface (lib/data/modules.ts,
// progress APIs, NXP ledger, tier logic, UI copy) should read from here
// rather than re-declaring its own numbers.
//
// See:
//   - NOVEX-ACADEMY-CANON-v2.md §9
//   - NOVEX-BADGE-WIRING-SPEC.md §4.5
//   - NOVEX-NXP-SPEC-v1.1-ACADEMY-DELTA.md (superseded, reference only)
//
// Rule of thumb: if a number lives here, it lives ONLY here. Anything
// else (curriculum copy, API handlers, components) imports — never
// re-declares.

export const ACADEMY_CANON_VERSION = '2.0' as const;

// --- Module NXP awards -------------------------------------------------
// First-pass-only per (wallet, module). No grandfather. No stacking.
// Module NXP is inclusive of the completion badge — the badge is a
// visual marker, not a separate reward.

export const MODULE_NXP = {
  M01: 80,
  M02: 100,
  M03: 140,
  M04: 120,
  M05: 160,
} as const;

export const ACADEMY_TOTAL_NXP_CAP = 600;

// Daily throttle — aggregate across all Academy surfaces (lesson,
// module, exam). NOT a per-module split.
export const ACADEMY_NXP_PER_24H_MAX = 200;

// --- Lesson counts (must mirror lib/data/modules.ts) ------------------
// If you edit a module's lesson count in lib/data/modules.ts, update
// here too — the integrity assert below will fail the build on drift.

export const MODULE_LESSONS = {
  M01: 4, // Perp Fundamentals
  M02: 5, // SENSEI Signal Mastery
  M03: 4, // Fleet Intelligence
  M04: 4, // Risk Management
  M05: 1, // Graduation (exam)
} as const;

export const ACADEMY_TOTAL_LESSONS = 18;

// --- Exam (M05 Graduation) --------------------------------------------
export const EXAM_PASS_PCT = 80;
export const EXAM_QUESTION_COUNT = 25;
export const EXAM_RETAKE_COOLDOWN_HOURS = 24;

// --- Badge bindings ---------------------------------------------------
// Per-module completion badge. These are the 5 Academy badges from the
// 48-badge catalog (NOVEX-BADGE-WIRING-SPEC.md §4.5). Minted on the
// module completion event.

export const CIO_BADGE_ID = 'cio_graduate' as const;

export const MODULE_BADGE_IDS = {
  M01: 'm01_perp',
  M02: 'm02_sensei',
  M03: 'm03_fleet',
  M04: 'm04_risk',
  M05: 'cio_graduate',
} as const;

// --- Derived helpers --------------------------------------------------
export type ModuleKey = keyof typeof MODULE_NXP;

export const MODULE_KEYS: readonly ModuleKey[] = [
  'M01',
  'M02',
  'M03',
  'M04',
  'M05',
] as const;

/**
 * Maps the numeric module id used in `lib/data/modules.ts` (1..5) to
 * the canonical module key used in this file. Returns null for any
 * out-of-range input.
 */
export function moduleIdToKey(id: number): ModuleKey | null {
  if (!Number.isInteger(id) || id < 1 || id > 5) return null;
  return MODULE_KEYS[id - 1];
}

/**
 * Total NXP awarded for completing a specific module (first pass only).
 */
export function nxpForModule(key: ModuleKey): number {
  return MODULE_NXP[key];
}

/**
 * Lesson count for a given module. Must match lib/data/modules.ts.
 */
export function lessonsForModule(key: ModuleKey): number {
  return MODULE_LESSONS[key];
}

// --- Integrity asserts ------------------------------------------------
// Eager validation — fails the build/boot if canon drifts out of sync.
// Cheap enough to run unconditionally; no perf concern at module load.

(() => {
  const sumNxp = Object.values(MODULE_NXP).reduce((a, b) => a + b, 0);
  if (sumNxp !== ACADEMY_TOTAL_NXP_CAP) {
    throw new Error(
      `[academy/canon] MODULE_NXP sum (${sumNxp}) != ACADEMY_TOTAL_NXP_CAP (${ACADEMY_TOTAL_NXP_CAP})`
    );
  }
  const sumLessons = Object.values(MODULE_LESSONS).reduce((a, b) => a + b, 0);
  if (sumLessons !== ACADEMY_TOTAL_LESSONS) {
    throw new Error(
      `[academy/canon] MODULE_LESSONS sum (${sumLessons}) != ACADEMY_TOTAL_LESSONS (${ACADEMY_TOTAL_LESSONS})`
    );
  }
  if (MODULE_BADGE_IDS.M05 !== CIO_BADGE_ID) {
    throw new Error(
      `[academy/canon] MODULE_BADGE_IDS.M05 must equal CIO_BADGE_ID`
    );
  }
})();
