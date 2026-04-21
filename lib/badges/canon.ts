/**
 * lib/badges/canon.ts
 *
 * The 48-badge catalog, derived from NOVEX-BADGE-WIRING-SPEC.md §4.
 * Edit freely — this is the single source of truth for badge metadata
 * (names, icons, criteria, tiers). Triggers live in lib/badges/triggers.*.
 *
 * Tier buckets (derived from NXP bonus):
 *   bronze: NXP ≤ 25
 *   silver: 25 < NXP ≤ 75
 *   gold:   75 < NXP ≤ 250
 *   mythic: NXP > 250
 *
 * Icons are emoji placeholders for the initial ship. Swap for SVG
 * sprites later without touching the grid component — BadgeLockedGrid
 * renders whatever string is in `icon`.
 */

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'mythic';
export type BadgeCategory =
  | 'volume'
  | 'performance'
  | 'streak'
  | 'quest'
  | 'academy'
  | 'special';

export interface AcademyBadge {
  id: string;
  name: string;
  icon: string;
  criteria: string;
  tier: BadgeTier;
  category: BadgeCategory;
  nxpBonus: number;
}

// ---------------------------------------------------------------------------
// 4.1 Volume (10)
// ---------------------------------------------------------------------------
const VOLUME: AcademyBadge[] = [
  { id: 'first_trade', name: 'First Blood',     icon: '🩸', criteria: 'Complete your first trade.',          tier: 'bronze', category: 'volume', nxpBonus: 5 },
  { id: 'vol_1k',      name: 'Small Guns',      icon: '🔫', criteria: 'Lifetime volume ≥ $1K.',              tier: 'bronze', category: 'volume', nxpBonus: 10 },
  { id: 'vol_10k',     name: 'Getting Serious', icon: '💼', criteria: 'Lifetime volume ≥ $10K.',             tier: 'bronze', category: 'volume', nxpBonus: 20 },
  { id: 'vol_50k',     name: 'Mid-Size',        icon: '📊', criteria: 'Lifetime volume ≥ $50K.',             tier: 'silver', category: 'volume', nxpBonus: 35 },
  { id: 'vol_100k',    name: 'Six-Fig Club',    icon: '💰', criteria: 'Lifetime volume ≥ $100K.',            tier: 'silver', category: 'volume', nxpBonus: 50 },
  { id: 'vol_500k',    name: 'Half-Mill',       icon: '🏦', criteria: 'Lifetime volume ≥ $500K.',            tier: 'gold',   category: 'volume', nxpBonus: 100 },
  { id: 'vol_1m',      name: 'Million-Moved',   icon: '💎', criteria: 'Lifetime volume ≥ $1M.',              tier: 'gold',   category: 'volume', nxpBonus: 150 },
  { id: 'vol_5m',      name: 'Whale',           icon: '🐋', criteria: 'Lifetime volume ≥ $5M.',              tier: 'gold',   category: 'volume', nxpBonus: 250 },
  { id: 'vol_10m',     name: 'Kraken',          icon: '🦑', criteria: 'Lifetime volume ≥ $10M.',             tier: 'mythic', category: 'volume', nxpBonus: 400 },
  { id: 'vol_50m',     name: 'Market Mover',    icon: '🌊', criteria: 'Lifetime volume ≥ $50M.',             tier: 'mythic', category: 'volume', nxpBonus: 500 },
];

// ---------------------------------------------------------------------------
// 4.2 Performance (8)
// ---------------------------------------------------------------------------
const PERFORMANCE: AcademyBadge[] = [
  { id: 'first_profit',      name: 'In the Green',     icon: '🌱', criteria: 'First winning trade.',                                   tier: 'bronze', category: 'performance', nxpBonus: 5 },
  { id: 'profitable_trader', name: 'Profitable Trader',icon: '📈', criteria: 'Cumulative realized PnL > 0 for 30 days.',              tier: 'bronze', category: 'performance', nxpBonus: 25 },
  { id: 'sharp_shooter',     name: 'Sharp Shooter',    icon: '🎯', criteria: 'Win rate ≥ 60% over 20+ trades.',                       tier: 'silver', category: 'performance', nxpBonus: 50 },
  { id: 'ice_veins',         name: 'Ice Veins',        icon: '🧊', criteria: 'Avg R ≥ 2.0 over 20+ trades.',                          tier: 'silver', category: 'performance', nxpBonus: 75 },
  { id: 'sensei_disciple',   name: 'SENSEI Disciple',  icon: '🥋', criteria: 'Execute a trade on a LEGENDARY SENSEI signal.',         tier: 'bronze', category: 'performance', nxpBonus: 25 },
  { id: 'sensei_master',     name: 'SENSEI Master',    icon: '🗡️', criteria: '10× profitable LEGENDARY executions.',                  tier: 'gold',   category: 'performance', nxpBonus: 100 },
  { id: 'fleet_commander',   name: 'Fleet Commander',  icon: '⚓', criteria: 'FLEET_CONSENSUS trade printed profitably.',             tier: 'silver', category: 'performance', nxpBonus: 50 },
  { id: 'whale_hunter',      name: 'Whale Hunter',     icon: '🎣', criteria: 'Single-trade PnL ≥ $5K.',                               tier: 'gold',   category: 'performance', nxpBonus: 100 },
];

// ---------------------------------------------------------------------------
// 4.3 Streak (8)
// ---------------------------------------------------------------------------
const STREAK: AcademyBadge[] = [
  { id: 'hot_streak',     name: 'Hot Streak',    icon: '🔥', criteria: '3 consecutive winning trades.', tier: 'bronze', category: 'streak', nxpBonus: 10 },
  { id: 'fire_streak',    name: 'Fire Streak',   icon: '🔥', criteria: '5 consecutive wins.',           tier: 'bronze', category: 'streak', nxpBonus: 25 },
  { id: 'blaze_streak',   name: 'Blazing',       icon: '⚡', criteria: '10 consecutive wins.',          tier: 'gold',   category: 'streak', nxpBonus: 75 },
  { id: 'iron_hands',     name: 'Iron Hands',    icon: '🤘', criteria: '3-day profit streak.',          tier: 'bronze', category: 'streak', nxpBonus: 15 },
  { id: 'diamond_hands',  name: 'Diamond Hands', icon: '💎', criteria: '7-day profit streak.',          tier: 'silver', category: 'streak', nxpBonus: 40 },
  { id: 'titanium_hands', name: 'Titanium',      icon: '🛡️', criteria: '14-day profit streak.',         tier: 'gold',   category: 'streak', nxpBonus: 100 },
  { id: 'lifer',          name: 'Lifer',         icon: '♾️', criteria: '30-day profit streak.',         tier: 'gold',   category: 'streak', nxpBonus: 250 },
  { id: 'immortal',       name: 'Immortal',      icon: '👑', criteria: '60-day profit streak.',         tier: 'mythic', category: 'streak', nxpBonus: 500 },
];

// ---------------------------------------------------------------------------
// 4.4 Quest / Daily (8)
// ---------------------------------------------------------------------------
const QUEST: AcademyBadge[] = [
  { id: 'daily_i',        name: 'Daily I',        icon: '📅', criteria: 'First Daily I completion.',          tier: 'bronze', category: 'quest', nxpBonus: 3 },
  { id: 'daily_vii',      name: 'Daily VII',      icon: '🗓️', criteria: 'First Daily VII completion.',        tier: 'bronze', category: 'quest', nxpBonus: 10 },
  { id: 'quest_grinder',  name: 'Grinder',        icon: '⚙️', criteria: 'Complete all 7 dailies in one day.', tier: 'bronze', category: 'quest', nxpBonus: 15 },
  { id: 'weekly_warrior', name: 'Weekly Warrior', icon: '⚔️', criteria: '7-day daily-quest streak.',          tier: 'bronze', category: 'quest', nxpBonus: 25 },
  { id: 'unstoppable',    name: 'Unstoppable',    icon: '🚀', criteria: '30-day daily-quest streak.',         tier: 'gold',   category: 'quest', nxpBonus: 100 },
  { id: 'master_i',       name: 'Master I',       icon: '🎓', criteria: 'First master-quest completion.',     tier: 'bronze', category: 'quest', nxpBonus: 25 },
  { id: 'master_legend',  name: 'Master Legend',  icon: '🏆', criteria: 'All active master quests complete.', tier: 'gold',   category: 'quest', nxpBonus: 250 },
  { id: 'no_rest',        name: 'No Days Off',    icon: '☀️', criteria: '90-day daily-quest streak.',         tier: 'mythic', category: 'quest', nxpBonus: 300 },
];

// ---------------------------------------------------------------------------
// 4.5 Academy (5) — from Canon v2
// ---------------------------------------------------------------------------
const ACADEMY: AcademyBadge[] = [
  { id: 'm01_perp',     name: 'Perp Graduate',    icon: '📘', criteria: 'Complete M01: Perps.',             tier: 'bronze', category: 'academy', nxpBonus: 0 },
  { id: 'm02_sensei',   name: 'SENSEI Literate',  icon: '📗', criteria: 'Complete M02: SENSEI.',            tier: 'bronze', category: 'academy', nxpBonus: 0 },
  { id: 'm03_fleet',    name: 'Desk Operator',    icon: '📙', criteria: 'Complete M03: The Desk.',          tier: 'silver', category: 'academy', nxpBonus: 0 },
  { id: 'm04_risk',     name: 'Risk-Aware',       icon: '📕', criteria: 'Complete M04: Risk.',              tier: 'silver', category: 'academy', nxpBonus: 0 },
  { id: 'cio_graduate', name: 'CIO',              icon: '🎖️', criteria: 'Pass M05 exam with ≥ 80%.',        tier: 'gold',   category: 'academy', nxpBonus: 0 },
];

// ---------------------------------------------------------------------------
// 4.6 Special (9) — lore & events
// ---------------------------------------------------------------------------
const SPECIAL: AcademyBadge[] = [
  { id: 'founder',           name: 'Founder',           icon: '🧬', criteria: 'Wallet in founder allowlist.',                    tier: 'mythic', category: 'special', nxpBonus: 500 },
  { id: 'day_one',           name: 'Day One',           icon: '1️⃣', criteria: 'Traded on launch day.',                            tier: 'gold',   category: 'special', nxpBonus: 100 },
  { id: 'og',                name: 'OG',                icon: '🌟', criteria: 'Joined before 2026-05-01.',                       tier: 'silver', category: 'special', nxpBonus: 50 },
  { id: 'ninja',             name: "Clutch's Ninja",    icon: '🥷', criteria: 'Owns a Novex avatar NFT.',                         tier: 'gold',   category: 'special', nxpBonus: 100 },
  { id: 'wickmaster_slayer', name: 'Wickmaster Slayer', icon: '🗡️', criteria: 'Survived a Wickmaster liquidation cascade.',       tier: 'gold',   category: 'special', nxpBonus: 150 },
  { id: 'comeback_kid',      name: 'Comeback Kid',      icon: '💪', criteria: 'Recovered +50% from a −20% drawdown week.',       tier: 'gold',   category: 'special', nxpBonus: 100 },
  { id: 'night_owl',         name: 'Night Owl',         icon: '🦉', criteria: '10 trades executed 00-06 UTC.',                   tier: 'bronze', category: 'special', nxpBonus: 25 },
  { id: 'ping_pong',         name: 'Ping Pong',         icon: '🏓', criteria: '5+ pairs traded profitably same day.',            tier: 'silver', category: 'special', nxpBonus: 50 },
  { id: 'referrer_i',        name: 'Referrer I',        icon: '📣', criteria: 'First referred wallet places a trade.',           tier: 'silver', category: 'special', nxpBonus: 50 },
];

// ---------------------------------------------------------------------------
// The full 48 — rendered in the order above (category-grouped)
// ---------------------------------------------------------------------------
export const ACADEMY_BADGES: AcademyBadge[] = [
  ...VOLUME,
  ...PERFORMANCE,
  ...STREAK,
  ...QUEST,
  ...ACADEMY,
  ...SPECIAL,
];

// Build-time invariant — catches catalog drift in CI
if (ACADEMY_BADGES.length !== 48) {
  throw new Error(
    `Badge canon out of sync: expected 48 badges, got ${ACADEMY_BADGES.length}. ` +
      `Update NOVEX-BADGE-WIRING-SPEC.md §4 in lockstep with this file.`
  );
}

// Helpers — useful for filtered grids (e.g. "Academy only" on module pages)
export const BADGES_BY_ID: Record<string, AcademyBadge> = Object.fromEntries(
  ACADEMY_BADGES.map((b) => [b.id, b])
);

export const BADGES_BY_CATEGORY: Record<BadgeCategory, AcademyBadge[]> = {
  volume: VOLUME,
  performance: PERFORMANCE,
  streak: STREAK,
  quest: QUEST,
  academy: ACADEMY,
  special: SPECIAL,
};
