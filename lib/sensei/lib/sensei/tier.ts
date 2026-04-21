/**
 * SENSEI signal tier thresholds — single source of truth.
 *
 * Live engine: ~/.openclaw/workspace/scripts/novex-sensei-engine.py
 * Denominator: 17 (14 scoring dimensions; 3 carry long/short branches).
 *
 * Do not hardcode 4/6/8 or /17 anywhere else in the Academy UI — import
 * from this file so threshold changes flow from one place.
 */

export const TIER_STANDARD = 4;
export const TIER_PREMIUM = 6;
export const TIER_LEGENDARY = 8;
export const TIER_MAX = 17;

export type SenseiTier = 'NO_SIGNAL' | 'STANDARD' | 'PREMIUM' | 'LEGENDARY';

export function tierFromScore(score: number): SenseiTier {
  if (score >= TIER_LEGENDARY) return 'LEGENDARY';
  if (score >= TIER_PREMIUM) return 'PREMIUM';
  if (score >= TIER_STANDARD) return 'STANDARD';
  return 'NO_SIGNAL';
}

export const TIER_COPY = {
  short: 'STANDARD=4+, PREMIUM=6+, LEGENDARY=8+. All scores are out of 17.',
  denominator: TIER_MAX,
} as const;
