export interface ExamQuestion {
  q: string;
  opts: string[];
  correct: number;
  explain: string;
}

export interface OperatorExam {
  durationSecs: number;
  passPct: number;
  nxpAward: number;
  questions: ExamQuestion[];
}

export const OPERATOR_EXAM: OperatorExam = {
  durationSecs: 30 * 60,
  passPct: 80,
  nxpAward: 500,
  questions: [
    // ───── Module 1 — Perp Fundamentals (6) ─────
    {
      q: 'You open a $14,000 ETH-PERP position at 35x. Approximate margin posted?',
      opts: ['$200', '$285', '$400', '$1,400'],
      correct: 2,
      explain: '$14,000 / 35 = $400.',
    },
    {
      q: 'Funding has run +0.18% per 8h on BTC for two consecutive periods. What does that tell you about positioning?',
      opts: [
        'Crowd is heavily short — long squeeze likely',
        'Crowd is heavily long — short squeeze risk',
        'Funding is neutral',
        'Volatility is collapsing',
      ],
      correct: 1,
      explain:
        'Sustained positive funding = longs paying shorts = crowded long book; SENSEI flags this as squeeze risk.',
    },
    {
      q: 'Initial margin vs maintenance margin — which keeps the position open?',
      opts: [
        'Initial',
        'Maintenance',
        'Both must be posted at all times',
        'Neither — only realized PnL matters',
      ],
      correct: 1,
      explain:
        'Initial opens the trade; maintenance keeps it open. Drop below maintenance → liquidation.',
    },
    {
      q: 'On a 35x SOL-PERP long at $150 entry, roughly what move against you triggers liquidation (ignoring fees)?',
      opts: ['~0.5%', '~2.4%', '~5%', '~10%'],
      correct: 1,
      explain:
        'At 35x, ~1/35 ≈ 2.86% wipes out initial margin; maintenance lifts the actual liq trigger to ~2.36%.',
    },
    {
      q: "Why are perps called 'perpetual'?",
      opts: [
        'They auto-renew weekly',
        'They have no expiration date and track spot via funding',
        'They settle every 8 hours',
        'They convert to spot on close',
      ],
      correct: 1,
      explain:
        'No expiration — funding is the mechanism that keeps perp price tethered to spot.',
    },
    {
      q: "Stop-loss placement relative to liquidation price — what's the rule?",
      opts: [
        'At the liq price',
        'Below the liq price (long) / above (short)',
        'Above the liq price (long) / below (short)',
        'Stops are unnecessary at high leverage',
      ],
      correct: 2,
      explain:
        'Your stop must trigger BEFORE the exchange liquidates you — closer to entry than the liq line.',
    },

    // ───── Module 2 — SENSEI Signal Mastery (7) ─────
    {
      q: 'Maximum possible SENSEI score?',
      opts: ['12', '15', '19', '21'],
      correct: 2,
      explain: 'Twelve dimensions, total 19 points.',
    },
    {
      q: 'Tier for a 12/19 signal?',
      opts: ['STANDARD', 'PREMIUM', 'LEGENDARY', 'NO_TRADE'],
      correct: 1,
      explain: 'PREMIUM is 10–13. LEGENDARY is 14+.',
    },
    {
      q: 'Regimes SENSEI is hard-coded to skip?',
      opts: [
        'CHOPPY + CONSOLIDATING',
        'TRENDING + EXPLOSIVE',
        'All four',
        'Only EXPLOSIVE',
      ],
      correct: 1,
      explain:
        'Mean-reversion edge dies in TRENDING/EXPLOSIVE; engine refuses to fire there.',
    },
    {
      q: 'When does the +2 Confluence Bonus fire?',
      opts: [
        'Whenever score is above 10',
        'When 3+ dimensions agree on direction at the same timeframe',
        'Only on LEGENDARY signals',
        'On any regime change',
      ],
      correct: 1,
      explain: 'Confluence = 3+ dimensions aligned, same TF. It is the LEGENDARY-maker.',
    },
    {
      q: 'Score threshold below which SENSEI emits no trade signal at all?',
      opts: ['<5', '<7', '<10', '<14'],
      correct: 1,
      explain: 'Anything under 7 is filtered out before the engine emits.',
    },
    {
      q: 'Volatility Compression dimension is worth how many points?',
      opts: ['1', '2', '3', '4'],
      correct: 1,
      explain: '2 points — Bollinger/keltner squeeze is a high-conviction MR setup driver.',
    },
    {
      q: 'You see a 9/19 LONG, regime CHOPPY, RR 2.4. Action?',
      opts: [
        'Full-size long',
        'Reduced size or skip — STANDARD tier',
        'Add to existing position',
        'Wait for fleet OVERRIDE',
      ],
      correct: 1,
      explain: '9/19 = STANDARD. Reduce size or skip per the tier rules.',
    },

    // ───── Module 3 — Fleet Intelligence (5) ─────
    {
      q: 'How many agents in the v2 fleet?',
      opts: ['3', '5', '7', '12'],
      correct: 2,
      explain: 'Sentiment, Flow, Macro, Bull, Bear, Decision, Risk Gate = 7.',
    },
    {
      q: 'Which fleet mode requires SENSEI + fleet to AGREE before taking the trade?',
      opts: ['FLEET_OVERRIDE', 'FLEET_CONSENSUS', 'ENGINE_ONLY', 'GROK_ONLY'],
      correct: 1,
      explain: 'CONSENSUS = both must agree. Safest mode.',
    },
    {
      q: "Fleet says LONG with 80% conviction. SENSEI is silent. You're running FLEET_OVERRIDE. What happens?",
      opts: [
        'No trade — engine blocks it',
        'Fleet override fires the trade with reduced size',
        'Trade fires at full size',
        'Bot pauses for 24h',
      ],
      correct: 1,
      explain: 'OVERRIDE permits fleet-only trades; size is throttled (50% notional).',
    },
    {
      q: 'When does fleet input matter MOST?',
      opts: [
        'Quiet ranges',
        'Around macro inflections (FOMC, CPI, ETF flow)',
        'Inside the first 5 min of a candle',
        'On weekends',
      ],
      correct: 1,
      explain: 'Macro shocks are where multi-agent context beats pure microstructure.',
    },
    {
      q: 'Where does the highest-edge audit material live?',
      opts: [
        'Trades where fleet AGREES with SENSEI',
        'Trades where fleet DISAGREES with a LEGENDARY signal',
        'Trades that hit max drawdown',
        'Closed trades on weekends',
      ],
      correct: 1,
      explain:
        "DISAGREE-on-LEGENDARY is the diff between book and reality — that's the edge.",
    },

    // ───── Module 4 — Risk Management (7) ─────
    {
      q: 'Max risk per trade as % of account equity?',
      opts: ['0.5%', '1–2%', '5%', '10%'],
      correct: 1,
      explain: 'Hard rule: never risk more than 1–2% of equity on any single trade.',
    },
    {
      q: 'How many consecutive losses trigger the 24-hour circuit breaker?',
      opts: ['2', '3', '5', '10'],
      correct: 1,
      explain: '3-loss streak = 24h cooldown, no exceptions, no overrides.',
    },
    {
      q: 'Max simultaneous open positions on the Novex bot?',
      opts: ['1', '2', '3', '5'],
      correct: 1,
      explain: 'Hard cap of 2. Correlation risk kills accounts faster than bad signals.',
    },
    {
      q: 'Daily drawdown cap (default config)?',
      opts: ['2%', '5%', '10%', 'No cap'],
      correct: 2,
      explain:
        '10% daily loss cap = day over. Bot disables itself for the rest of the UTC day.',
    },
    {
      q: "You're up +6% on the day, hit a -4% trade. Bot's daily PnL?",
      opts: ['+10%', '+2%', '-4%', 'Trade was blocked'],
      correct: 1,
      explain: '+6% − 4% = +2%. Cap is on cumulative daily loss, not per-trade.',
    },
    {
      q: 'After the 3-loss circuit breaker fires, you can resume trading by…',
      opts: [
        'Restarting the bot',
        'Manually overriding via TG command',
        'Waiting 24 hours — no overrides',
        'Connecting a different wallet',
      ],
      correct: 2,
      explain: 'There is no override. 24h hard cooldown. By design.',
    },
    {
      q: 'BTC long + ETH long + SOL long all open at the same time. The hidden risk?',
      opts: [
        'Funding cost stack',
        '100% long-beta — single correlated bet',
        'Liquidation cascade across symbols',
        'All of the above',
      ],
      correct: 3,
      explain:
        'All three. Same direction across correlated majors = one trade dressed as three.',
    },
  ],
};
