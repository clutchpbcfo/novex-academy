/**
 * components/badges/BadgeLockedGrid.tsx
 *
 * Badge Wiring §6 — locked-state grid for Vault/profile surfaces.
 *
 * Renders the full 48-badge canon as a responsive grid. Earned badges show
 * in full color; unearned badges render greyscale + reduced opacity with a
 * padlock overlay. Hover/tap reveals tooltip with badge name and unlock
 * criteria.
 *
 * Drop-in usage:
 *   import { BadgeLockedGrid } from '@/components/badges/BadgeLockedGrid';
 *   import { ACADEMY_BADGES } from '@/lib/badges/canon';
 *
 *   <BadgeLockedGrid
 *     allBadges={ACADEMY_BADGES}
 *     earnedIds={normalizeBadges(trader.badges)}
 *   />
 *
 * Assumes canon entry shape (adapt field names to match lib/badges/canon.ts):
 *   {
 *     id: string;          // stable id, matches what's in traders.json
 *     name: string;        // display name
 *     icon: string;        // path or emoji (falls back to text glyph)
 *     criteria: string;    // one-line "how to earn" copy
 *     tier?: 'bronze' | 'silver' | 'gold' | 'mythic';
 *   }
 */

'use client';

import { useState } from 'react';

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  /** One-line "how to earn" copy. Falls back to `description` if criteria missing. */
  criteria?: string;
  description?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'mythic';
}

export interface BadgeLockedGridProps {
  allBadges: BadgeDef[];
  earnedIds: string[];
  /** Optional: compact mode shrinks cells for profile sidebars. */
  compact?: boolean;
  /** Optional: click handler, useful for opening a detail modal. */
  onBadgeClick?: (badge: BadgeDef, earned: boolean) => void;
}

const TIER_RING: Record<NonNullable<BadgeDef['tier']>, string> = {
  bronze: 'ring-amber-700/60',
  silver: 'ring-slate-400/60',
  gold: 'ring-yellow-400/70',
  mythic: 'ring-fuchsia-500/70',
};

export function BadgeLockedGrid({
  allBadges,
  earnedIds,
  compact = false,
  onBadgeClick,
}: BadgeLockedGridProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const earnedSet = new Set(earnedIds);

  const cellBase = compact ? 'w-14 h-14' : 'w-20 h-20';
  const iconBase = compact ? 'text-2xl' : 'text-3xl';
  const gridCols = compact
    ? 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10'
    : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8';

  return (
    <div className="w-full">
      <div className={`grid gap-3 ${gridCols}`}>
        {allBadges.map((badge) => {
          const earned = earnedSet.has(badge.id);
          const ring = badge.tier ? TIER_RING[badge.tier] : 'ring-cyan-500/40';
          return (
            <div
              key={badge.id}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoverId(badge.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(badge.id)}
              onBlur={() => setHoverId(null)}
            >
              <button
                type="button"
                onClick={() => onBadgeClick?.(badge, earned)}
                aria-label={`${badge.name}${earned ? '' : ' (locked)'}`}
                className={[
                  cellBase,
                  'rounded-xl flex items-center justify-center',
                  'ring-2 transition-all duration-200',
                  'focus:outline-none focus:ring-4 focus:ring-cyan-400/60',
                  earned
                    ? `bg-neutral-900 ${ring} hover:scale-105`
                    : 'bg-neutral-950 ring-neutral-800 grayscale opacity-40 hover:opacity-60',
                ].join(' ')}
              >
                <span className={iconBase} aria-hidden="true">
                  {badge.icon}
                </span>
                {!earned && (
                  <span
                    className="absolute bottom-1 right-1 text-xs text-neutral-500"
                    aria-hidden="true"
                  >
                    {'\u{1F512}'}
                  </span>
                )}
              </button>

              {hoverId === badge.id && (
                <div
                  role="tooltip"
                  className={[
                    'absolute z-10 top-full mt-2 w-52 p-3 rounded-lg',
                    'bg-neutral-900 border border-neutral-800 shadow-xl',
                    'text-left pointer-events-none',
                  ].join(' ')}
                >
                  <div className="text-sm font-semibold text-cyan-300">
                    {badge.name}
                  </div>
                  <div className="mt-1 text-xs text-neutral-400 leading-snug">
                    {badge.criteria || badge.description || 'Unlock criteria hidden.'}
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-neutral-500">
                    {earned ? 'Earned' : 'Locked'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-neutral-500 text-center">
        {earnedIds.length} of {allBadges.length} earned
      </div>
    </div>
  );
}

export default BadgeLockedGrid;
