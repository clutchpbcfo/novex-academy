import type { Module } from '@/types';
import { MODULE_LESSONS } from '@/lib/academy/canon';

export const MODULES: Module[] = [
  {
    id: 1,
    num: '01',
    title: 'Perp Fundamentals',
    tag: 'Foundations',
    desc: 'Leverage, margin, funding, liquidation — the mechanics every Novex trader must internalize.',
    duration: '45 min',
    lessons: MODULE_LESSONS.M01,
    tier: 'core',
    items: [
      {
        t: 'What Are Perpetual Futures?',
        body: `<p>A perpetual futures contract lets you take leveraged exposure to an asset <em>without an expiration date</em>. Unlike traditional futures, perps don't settle — they track spot via a <b>funding rate</b> paid between longs and shorts.</p><h3>Why perps matter</h3><ul><li>Capital efficiency — 10x-50x leverage means 5% of your bankroll controls 100% of position size</li><li>Both directions — long or short any asset with one click</li><li>24/7 liquid markets — no market close, no gaps, no weekends off</li></ul><div class="callout">On Novex, all perps are settled in USDC and cleared through Orderly Network's shared orderbook.</div>`,
      },
      {
        t: 'Leverage & Margin Explained',
        body: `<p>Leverage lets you trade a position larger than your deposit. At <b>35x</b> — Novex's default — $1,000 margin controls a $35,000 position.</p><h3>The margin equation</h3><p><code>Required Margin = Position Size / Leverage</code></p><p>With 35x on a $10,000 position: <code>$10,000 / 35 = $285 margin</code></p><h3>Initial vs Maintenance</h3><ul><li><b>Initial margin</b> — what you post to open the trade</li><li><b>Maintenance margin</b> — the minimum to keep it open (typically 50% of initial)</li><li>Drop below maintenance → <b>liquidation</b></li></ul>`,
      },
      {
        t: 'Funding Rates',
        body: `<p>Funding is the periodic payment (every 8h on most venues) exchanged between longs and shorts to keep perp price aligned with spot.</p><ul><li><b>Positive funding</b> → longs pay shorts (market is too bullish)</li><li><b>Negative funding</b> → shorts pay longs (market is too bearish)</li></ul><div class="callout">Funding above +0.10% / period is a SENSEI signal input. Sustained high funding often precedes a long squeeze.</div>`,
      },
      {
        t: 'Liquidation Mechanics',
        body: `<p>Liquidation triggers when your position's margin ratio crosses the maintenance threshold. The exchange force-closes your position at the liquidation price.</p><h3>Protecting yourself</h3><ul><li>Never risk more than 1-2% of account per trade</li><li>Use stop losses <b>above</b> your liquidation price</li><li>Monitor the funding impact on margin over long holds</li></ul>`,
      },
    ],
    quiz: {
      q: 'If you open a $20,000 BTC-PERP position with 35x leverage, what is the required margin?',
      opts: ['$286', '$571', '$2,000', '$7,000'],
      correct: 1,
      explain: '$20,000 / 35 = $571. That is the required margin at 35x leverage.',
    },
  },
  {
    id: 2,
    num: '02',
    title: 'SENSEI Signal Mastery',
    tag: 'Strategy',
    desc: 'The 12-dimensional scoring engine. Read a signal in 5 seconds. Trust the /19 scale.',
    duration: '1h 10m',
    lessons: MODULE_LESSONS.M02,
    tier: 'core',
    items: [
      {
        t: 'The SENSEI Stack — 12 Dimensions',
        body: `<p>SENSEI v7.7 scores every setup across twelve independent dimensions, each worth 1-2 points. Total: <b>/19</b>.</p><ul><li>Regime (2pts)</li><li>Trend Structure (2pts)</li><li>Momentum (2pts)</li><li>Volume Confirmation (1pt)</li><li>Liquidity Sweep (2pts)</li><li>Order Flow (1pt)</li><li>Funding Divergence (1pt)</li><li>Sentiment Edge (1pt)</li><li>Volatility Compression (2pts)</li><li>Macro Alignment (1pt)</li><li>Risk/Reward Geometry (2pts)</li><li>Confluence Bonus (2pts)</li></ul>`,
      },
      {
        t: 'Reading the /19 Scale',
        body: `<p>Every signal is a number. Every number is an action.</p><ul><li><b>14+</b> → LEGENDARY — full-size, max conviction</li><li><b>10-13</b> → PREMIUM — standard size, high probability</li><li><b>7-9</b> → STANDARD — reduced size or skip</li><li><b>&lt;7</b> → no trade</li></ul><div class="callout">LEGENDARY signals are rare — expect 2-4 per week across the full asset universe during good regimes.</div>`,
      },
      {
        t: 'Regime Filter — Why Only CHOPPY / CONSOLIDATING',
        body: `<p>SENSEI performs dramatically better in range-bound regimes. Trending and explosive markets chew up mean-reversion setups.</p><p>The block is hard-coded: <code>if regime in (TRENDING, EXPLOSIVE): skip</code></p><h3>Regime classification</h3><ul><li><b>CHOPPY</b> — sideways, low ATR, mean-reverting</li><li><b>CONSOLIDATING</b> — range building, volume declining</li><li><b>TRENDING</b> — directional, higher highs/lows</li><li><b>EXPLOSIVE</b> — volatility breakout, no structure</li></ul>`,
      },
      {
        t: 'Confluence Bonus',
        body: `<p>The +2 bonus fires when 3 or more dimensions all point the same direction at the same timeframe. It's what separates a good signal from a legendary one.</p>`,
      },
      {
        t: 'Worked Example — A 16/19 LONG',
        body: `<p>Live example from the fleet: SOL-PERP at 142.30, 5m chart.</p><ul><li>Regime: CHOPPY (+2)</li><li>Structure: higher low swept (+2)</li><li>Momentum: RSI divergence (+2)</li><li>Volume: surge on sweep (+1)</li><li>Liquidity: 2k contract sweep below (+2)</li><li>Order flow: CVD flipping (+1)</li><li>Funding: -0.04% (+1)</li><li>Sentiment: retail short (+1)</li><li>Compression: Bollinger squeeze (+2)</li><li>R/R: 3.8:1 to overhead VAH (+2)</li></ul><div class="callout">Total: 16/19 → LEGENDARY LONG. Result: +4.2R in 47 minutes.</div>`,
      },
    ],
    quiz: {
      q: "What's the minimum SENSEI score to qualify as a PREMIUM signal?",
      opts: ['7', '10', '14', '12'],
      correct: 1,
      explain: 'PREMIUM is 10-13. LEGENDARY is 14+.',
    },
  },
  {
    id: 3,
    num: '03',
    title: 'Fleet Intelligence',
    tag: 'Advanced',
    desc: '7 agents. 1 decision. How the v2 multi-agent fleet stress-tests every setup before you risk a dollar.',
    duration: '55 min',
    lessons: MODULE_LESSONS.M03,
    tier: 'advanced',
    items: [
      {
        t: 'Fleet Topology',
        body: `<p>SENSEI tells you the math says go. The fleet tells you whether the rest of the world agrees with the math right now. Both have to nod before the bot picks up the phone.</p><p>The v2 fleet is a seven-agent pipeline that runs in parallel to SENSEI on every signal candidate. Three agents read the world; two agents argue both sides; two agents decide and gatekeep. They do it in under a minute.</p><h3>The seven seats</h3><ul><li><b>Sentiment Analyst</b> — scrapes X, Discord, funding, and open-interest skew. Output: a one-line "where retail is leaning" tag.</li><li><b>Flow Analyst</b> — reads CVD, large prints, liquidation clusters, and stop pools. Output: who the tape is hunting.</li><li><b>Macro Analyst</b> — DXY, BTC dominance, rate expectations, risk-on / risk-off. Output: a regime label.</li><li><b>Bull Researcher (Grok)</b> — given the three reads above, argues the long case. Cites the specific signals it found.</li><li><b>Bear Researcher (Grok)</b> — same fuel, opposite job. Argues the short case.</li><li><b>Decision Agent</b> — reads both briefs side-by-side and writes a verdict with a conviction percentage.</li><li><b>Risk Gate</b> — vetoes anything that would breach exposure caps, drawdown limits, or correlation rules. Last word.</li></ul><div class="callout">A LEGENDARY SENSEI signal can still be killed by the Risk Gate alone. Fleet conviction does not override portfolio safety.</div>`,
      },
      {
        t: 'Fleet Modes',
        body: `<p>Three execution modes you can toggle per account:</p><ul><li><b>ENGINE_ONLY</b> — SENSEI only, no fleet. Fastest, leanest.</li><li><b>FLEET_CONSENSUS</b> — take the trade only if SENSEI and fleet agree. Safest.</li><li><b>FLEET_OVERRIDE</b> — fleet can override SENSEI when conviction is extreme. Highest EV, highest variance.</li></ul>`,
      },
      {
        t: 'Reading Fleet Output',
        body: `<p>Every trade in your journal carries a one-word fleet verdict next to the SENSEI score:</p><ul><li><code>AGREE</code> — fleet conviction matches SENSEI direction. Standard size.</li><li><code>DISAGREE</code> — fleet leans the other way. In FLEET_CONSENSUS mode the trade is skipped; in FLEET_OVERRIDE mode the bot may take it anyway, smaller.</li><li><code>OVERRIDE</code> — fleet conviction is so strong on the opposite side that it cancels a SENSEI signal even when the math agrees by score.</li></ul><h3>Where the edge actually lives</h3><p>When fleet <b>DISAGREES</b> with a LEGENDARY signal, audit that trade post-close. Those are the trades that teach you the regime. If LEGENDARY shorts keep losing while fleet was DISAGREE-bullish, the regime has shifted under you and the math is out of date — time to reweight.</p><p>The Brief Loop on /briefs is exactly this audit, automated. Read the postmortem, then read the score guide, then take the next trade with a calibrated head.</p>`,
      },
      {
        t: 'When to Trust the Fleet',
        body: `<p>The fleet earns its keep around macro inflections — FOMC, CPI, BTC ETF flow shifts, large-spot ETF rebalances. Macro context dominates microstructure for hours after these prints, and SENSEI on its own can't see the regime change as fast as the agents reading the news.</p><p>The fleet earns its keep <b>least</b> during pure microstructure plays — quiet sessions, range-bound chop, EMA-21 reclaims with no macro story. There the math is the math; the agents add noise rather than signal.</p><h3>The heuristic</h3><ol><li>Macro print in the last 6 hours? <b>Trust the fleet.</b></li><li>Asset-specific narrative news (token unlock, exploit, listing)? <b>Trust the fleet.</b></li><li>Pure intraday range with no headlines? <b>Trust the engine.</b></li><li>SENSEI score 14+ AND fleet AGREE? <b>Take it size-up.</b></li><li>SENSEI 14+ AND fleet OVERRIDE? <b>Skip it. The trade was already wrong.</b></li></ol>`,
      },
    ],
    quiz: {
      q: 'Which fleet mode takes a trade only when SENSEI and the fleet agree?',
      opts: ['FLEET_OVERRIDE', 'FLEET_CONSENSUS', 'ENGINE_ONLY', 'GROK_VETO'],
      correct: 1,
      explain: 'FLEET_CONSENSUS requires agreement. Safest mode.',
    },
  },
  {
    id: 4,
    num: '04',
    title: 'Risk Management',
    tag: 'Core',
    desc: 'Position sizing, circuit breakers, max drawdown rules. The boring stuff that keeps you alive.',
    duration: '40 min',
    lessons: MODULE_LESSONS.M04,
    tier: 'core',
    items: [
      {
        t: 'The 1-2% Rule',
        body: `<p>Never risk more than 2% of account equity on any single trade. Ever. The 1-2% range is what survives a long string of losses; anything above 5% is a guaranteed account-killer over enough trades.</p><h3>Why the math forces this</h3><p>At 2% per trade, you can lose ten in a row and still have 81.7% of your account left. At 10% per trade, ten in a row leaves you with 34.9% — and you need to almost <b>triple</b> what's left just to get back to flat. Losing streaks are not theoretical. Every operator hits a 6-loss run eventually.</p><h3>The relationship between risk, stop, and size</h3><p>The dollar at risk is fixed by the rule. Size flexes to match the stop:</p><ul><li>Tight stop (0.5%) → larger position. 35x leverage on a 0.5% stop means 17.5% of account margin posted, but the dollar risk is still 1%.</li><li>Wide stop (2%) → smaller position. Same dollar risk, less margin posted.</li></ul><p>The terminal's position sizer does this math automatically — give it stop distance and risk-percent, it gives you exact margin to post.</p><div class="callout">Risk is the first input. Stop placement is second. Size falls out of those two. Never the other way around.</div>`,
      },
      {
        t: 'Novex Position Sizer',
        body: `<p>Built into the terminal. You give it three inputs; it gives you one number.</p><h3>Inputs</h3><ul><li><b>Stop distance</b> — percent from entry. Pulled directly from the SENSEI alert payload (<code>sl</code> field) when you act on a signal.</li><li><b>Risk percent</b> — defaults to 1% per trade. Adjustable in settings.</li><li><b>Account equity</b> — read live from <code>account_value</code> on the Orderly side, so the sizer always uses fresh truth, not yesterday's number.</li></ul><h3>Output</h3><p>A single dollar amount of margin to post. Hit the order ticket, that number goes in the margin field, the leverage and notional auto-derive.</p><h3>What the sizer also blocks</h3><ul><li>Position size that would breach 2-position concurrent limit.</li><li>Position that would push correlated exposure (e.g. two BTC longs) above 4% combined risk.</li><li>Any sizing during a halted session (drawdown / consecutive-loss circuit breaker).</li></ul>`,
      },
      {
        t: 'Circuit Breakers',
        body: `<p>Two hard-coded rules in the bot. They trigger automatically and they cannot be overridden mid-session.</p><h3>3 consecutive losses → 24h cooldown</h3><p>The bot stops opening new positions. Existing positions are unaffected — TP and SL still execute. The cooldown clears 24h after the third loss closes. The first lesson of pain is to stop adding to it.</p><h3>5% daily drawdown → day over</h3><p>Calculated against opening-of-day equity. As soon as realized + unrealized PnL crosses −5%, all open positions are flattened and the bot halts until the daily reset (00:00 UTC).</p><h3>Why these are not negotiable</h3><p>Both rules are reset-or-grow patterns. Without them, a single bad regime read becomes a six-trade revenge sequence and a 30% drawdown that takes weeks to climb out of. With them, your worst day is bad but recoverable, and the next morning you start with a clean head.</p><div class="callout">Daily PnL and consecutive-loss counters survive process restarts via <code>ctn_risk_state.json</code>. You cannot bypass the circuit breaker by killing and reviving the bot.</div>`,
      },
      {
        t: 'Max 2 Concurrent Positions',
        body: `<p>The bot will not hold more than two concurrent positions, ever. Not because two is magic — because correlation risk is the silent killer of crypto perp accounts.</p><h3>The trap</h3><p>You take a BTC long. Then an ETH long, "for diversification". Then a SOL long because the chart looks identical. Then an ARB long because alts are running. You have not diversified. You have <b>quadrupled the same trade</b>. When BTC reverses 3% on a macro headline, all four positions hit stops within minutes.</p><h3>What the cap actually does</h3><ul><li>Forces you to pick the highest-conviction expression of a thesis instead of spreading the bet thin.</li><li>Caps total exposure to roughly 4% portfolio risk under the 2% rule.</li><li>Keeps margin posted to a level that survives a 10% adverse move on either position without liquidation.</li></ul><p>If a third LEGENDARY signal fires while two are open, the bot logs it, posts a notification, and waits. The signal is not lost — it just doesn't open a third leg.</p>`,
      },
    ],
    quiz: {
      q: 'What happens after 3 consecutive losses on the Novex bot?',
      opts: ['Nothing', 'Alert email', '24h cooldown', 'Account closes'],
      correct: 2,
      explain: 'Circuit breaker. 24h cooldown, no exceptions.',
    },
  },
  {
    id: 5,
    num: '05',
    title: 'Graduation',
    tag: 'Certification',
    desc: 'Final exam. 25 questions covering the full curriculum. Pass with 80%+ to earn your CIO chip.',
    duration: '30 min',
    lessons: MODULE_LESSONS.M05,
    tier: 'final',
    isExam: true,
    items: [
      {
        t: 'The CIO Exam',
        body: `<p>Twenty-five scenario-based questions, drawn from real trade logs and real Brief Loop postmortems. Thirty-minute timer. Pass at 80% or above.</p><p>Three of the questions are deliberately ambiguous — situations where two reasonable answers exist and only the higher-EV one earns full credit. We score them anyway because trading is full of those.</p><h3>What passing unlocks</h3><ul><li><b>CIO chip</b> — shown next to your handle on the leaderboard and in TG.</li><li><b>Fleet OVERRIDE mode</b> — the terminal lets you flip from FLEET_CONSENSUS to FLEET_OVERRIDE. Higher EV, higher variance. You will not be asked again.</li><li><b>CIO channel access</b> — a private TG room for graduates, where the daily fleet briefs are pre-posted before they go public.</li><li><b>+160 NXP</b> — bringing you to the 600 NXP cap and locking in your operator status.</li></ul><h3>Rules of the room</h3><ul><li>One question at a time. No back-button.</li><li>Timer starts on click. If it hits 00:00 the exam auto-submits whatever you have.</li><li>Retakes allowed after 24 hours. Ten attempts total. After the tenth, the chip is permanently locked at your highest score.</li></ul><div class="callout">There is no shortcut and no answer key. The exam is harder than the lessons because the trading floor is harder than the curriculum. Pass it and you've earned the chip.</div>`,
      },
    ],
    quiz: null,
  },
];

export const TICKER_DATA = [
  { s: 'BTC', p: '$67,420', c: '+1.24%', up: true },
  { s: 'ETH', p: '$3,512', c: '-0.48%', up: false },
  { s: 'SOL', p: '$142.30', c: '+3.82%', up: true },
  { s: 'AVAX', p: '$28.45', c: '+2.11%', up: true },
  { s: 'ARB', p: '$0.62', c: '-1.33%', up: false },
  { s: 'OP', p: '$1.74', c: '+0.88%', up: true },
  { s: 'SUI', p: '$1.26', c: '+4.40%', up: true },
  { s: 'FUNDING BTC', p: '+0.008%', c: '8h', up: true },
  { s: 'NOVEX TVL', p: '$4.82M', c: '+2.1%', up: true },
  { s: 'SENSEI 24H', p: '14W / 4L', c: '78% WR', up: true },
];
