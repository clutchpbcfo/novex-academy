/**
 * lib/ctn/types.ts
 *
 * Shared CTN-side types used by /api/equity, /api/state, /api/trades,
 * /api/briefs, and any future passthrough.
 *
 * Source of truth: ~/ctn/ctn_dashboard.py serves these shapes via
 * cloudflared at https://ctn-api.novex.finance.
 *
 * The bot's /api/state has been observed to return BOTH a single
 * scalar `account_value` AND a richer `equity_curve` array of
 * `{t, v}` snapshots. We accept either, normalize on read.
 */

/** Each point on the historical equity curve from the bot. */
export interface EquitySnapshot {
  /** ISO-8601 string OR a label like "start". The bot mixes both. */
  t: string;
  /** PnL in account-quote currency (USDC for Wallet 2). Can be negative. */
  v: number;
}

/** A point on the rendered equity curve in /api/equity responses. */
export type EquityPoint = number | EquitySnapshot;

/**
 * Full state payload as returned by ctn-api.novex.finance/api/state.
 * Every field is optional because (a) the bot grows fields over time
 * and (b) we want callers to handle missing fields gracefully if the
 * tunnel returns a partial response during a flap.
 */
export interface CtnState {
  /** Unix epoch seconds of last update. */
  ts?: number;
  /** Mode flag: 'LIVE' / 'DRY_RUN' / 'HALTED'. */
  mode?: string;
  /** Live account_value (USDC + unsettled + open MTM). */
  account_value?: number;
  /** Older field — historical USDC-only balance. Prefer account_value. */
  portfolio?: number;
  /** Peak account_value seen in this session. */
  peak_portfolio?: number;
  /** Current drawdown percent vs peak (negative number). */
  drawdown_pct?: number;
  /** Realized + unrealized PnL since 00:00 UTC. */
  daily_pnl?: number;
  /** Number of trades opened today. */
  daily_trades?: number;
  /** Consecutive losses (0 if last trade was green). */
  consec_losses?: number;
  /** Number of positions currently open. */
  open_position_count?: number;
  /** Optional historical equity curve. Each item is {t, v} OR scalar. */
  equity_curve?: EquityPoint[];
  /** Pass-through for fields the bot may add later. */
  [k: string]: unknown;
}

/**
 * Shape returned by /api/equity. Superset of the academy's existing
 * `EquityCurve` (in types/index.ts) — extra fields are additive so
 * the existing consumer doesn't need to change to keep working.
 */
export interface EquityResponse {
  points: EquityPoint[];
  total: number;
  pct: number;
  /** Drawdown vs peak (negative when underwater). */
  drawdown?: number;
  /** Peak account_value seen by the bot in this session. */
  peak?: number;
  /** Realized + unrealized PnL since 00:00 UTC. */
  dailyPnl?: number;
  /** Trades opened today. */
  dailyTrades?: number;
  /** Open positions right now. */
  openPositions?: number;
  /** LIVE / DRY_RUN / HALTED. */
  mode?: string;
  /** Unix epoch seconds of last upstream tick. */
  ts?: number;
  /** True if upstream was unreachable; fields above are zeros/undefined. */
  stale?: boolean;
}
