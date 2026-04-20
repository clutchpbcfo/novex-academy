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
        body: `<p>The v2 fleet is a 7-agent pipeline that runs in parallel to SENSEI:</p><ul><li><b>Sentiment Analyst</b> — scrapes X, Discord, funding, OI</li><li><b>Flow Analyst</b> — CVD, large prints, liquidation clusters</li><li><b>Macro Analyst</b> — DXY, BTC dominance, rates, risk-on/off</li><li><b>Bull Researcher (Grok)</b> — argues the long case</li><li><b>Bear Researcher (Grok)</b> — argues the short case</li><li><b>Decision Agent</b> — weighs both researchers</li><li><b>Risk Gate</b> — vetoes if exposure is wrong</li></ul>`,
      },
      {
        t: 'Fleet Modes',
        body: `<p>Three execution modes you can toggle per account:</p><ul><li><b>ENGINE_ONLY</b> — SENSEI only, no fleet. Fastest, leanest.</li><li><b>FLEET_CONSENSUS</b> — take the trade only if SENSEI and fleet agree. Safest.</li><li><b>FLEET_OVERRIDE</b> — fleet can override SENSEI when conviction is extreme. Highest EV, highest variance.</li></ul>`,
      },
      {
        t: 'Reading Fleet Output',
        body: `<p>Every trade carries a fleet verdict in the journal: <code>AGREE</code> / <code>DISAGREE</code> / <code>OVERRIDE</code>. When fleet <b>DISAGREES</b> with a LEGENDARY signal, audit that trade post-close — that's where the edge lives.</p>`,
      },
      {
        t: 'When to Trust the Fleet',
        body: `<p>Fleet calls matter most around macro inflections (FOMC, CPI, BTC ETF flow changes). Fleet calls matter least during pure microstructure plays — then trust the engine.</p>`,
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
        body: `<p>Never risk more than 2% of account equity on any single trade. At 35x leverage with a 1% stop, that's 70% of account notional — tight.</p>`,
      },
      {
        t: 'Novex Position Sizer',
        body: `<p>Built into the terminal. Given stop distance and account size, it computes your exact margin posting to achieve the target risk.</p>`,
      },
      {
        t: 'Circuit Breakers',
        body: `<p>Hard-coded rules in the bot: <b>3 losses in a row = 24h cooldown</b>. <b>5% daily drawdown = day over</b>. No exceptions, no revenge trading.</p>`,
      },
      {
        t: 'Max 2 Concurrent Positions',
        body: `<p>Correlation risk is the silent killer. Two BTC perps + three ETH alts = you're 100% long beta.</p>`,
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
        body: `<p>25 scenario-based questions pulled from real trade logs. You'll have 30 minutes. Pass threshold: 80%.</p><p>Passing unlocks:</p><ul><li>CIO chip (shows in leaderboard)</li><li>Access to fleet OVERRIDE mode on the terminal</li><li>Discord CIO channel</li><li>160 NXP bonus</li></ul><div class="callout">Retakes allowed after 24h. Ten attempts total — make them count.</div>`,
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
import type { Module } from '@/types';

export const MODULES: Module[] = [
  {
    id: 1,
    num: '01',
    title: 'Perp Fundamentals',
    tag: 'Foundations',
    desc: 'Leverage, margin, funding, liquidation — the mechanics every Novex trader must internalize.',
    duration: '45 min',
    lessons: 4,
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
    lessons: 5,
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
    lessons: 4,
    tier: 'advanced',
    items: [
      {
        t: 'Fleet Topology',
        body: `<p>The v2 fleet is a 7-agent pipeline that runs in parallel to SENSEI:</p><ul><li><b>Sentiment Analyst</b> — scrapes X, Discord, funding, OI</li><li><b>Flow Analyst</b> — CVD, large prints, liquidation clusters</li><li><b>Macro Analyst</b> — DXY, BTC dominance, rates, risk-on/off</li><li><b>Bull Researcher (Grok)</b> — argues the long case</li><li><b>Bear Researcher (Grok)</b> — argues the short case</li><li><b>Decision Agent</b> — weighs both researchers</li><li><b>Risk Gate</b> — vetoes if exposure is wrong</li></ul>`,
      },
      {
        t: 'Fleet Modes',
        body: `<p>Three execution modes you can toggle per account:</p><ul><li><b>ENGINE_ONLY</b> — SENSEI only, no fleet. Fastest, leanest.</li><li><b>FLEET_CONSENSUS</b> — take the trade only if SENSEI and fleet agree. Safest.</li><li><b>FLEET_OVERRIDE</b> — fleet can override SENSEI when conviction is extreme. Highest EV, highest variance.</li></ul>`,
      },
      {
        t: 'Reading Fleet Output',
        body: `<p>Every trade carries a fleet verdict in the journal: <code>AGREE</code> / <code>DISAGREE</code> / <code>OVERRIDE</code>. When fleet <b>DISAGREES</b> with a LEGENDARY signal, audit that trade post-close — that's where the edge lives.</p>`,
      },
      {
        t: 'When to Trust the Fleet',
        body: `<p>Fleet calls matter most around macro inflections (FOMC, CPI, BTC ETF flow changes). Fleet calls matter least during pure microstructure plays — then trust the engine.</p>`,
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
    lessons: 4,
    tier: 'core',
    items: [
      {
        t: 'The 1-2% Rule',
        body: `<p>Never risk more than 2% of account equity on any single trade. At 35x leverage with a 1% stop, that's 70% of account notional — tight.</p>`,
      },
      {
        t: 'Novex Position Sizer',
        body: `<p>Built into the terminal. Given stop distance and account size, it computes your exact margin posting to achieve the target risk.</p>`,
      },
      {
        t: 'Circuit Breakers',
        body: `<p>Hard-coded rules in the bot: <b>3 losses in a row = 24h cooldown</b>. <b>5% daily drawdown = day over</b>. No exceptions, no revenge trading.</p>`,
      },
      {
        t: 'Max 2 Concurrent Positions',
        body: `<p>Correlation risk is the silent killer. Two BTC perps + three ETH alts = you're 100% long beta.</p>`,
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
    lessons: 1,
    tier: 'final',
    isExam: true,
    items: [
      {
        t: 'The CIO Exam',
        body: `<p>25 scenario-based questions pulled from real trade logs. You'll have 30 minutes. Pass threshold: 80%.</p><p>Passing unlocks:</p><ul><li>CIO chip (shows in leaderboard)</li><li>Access to fleet OVERRIDE mode on the terminal</li><li>Discord CIO channel</li><li>160 NXP bonus</li></ul><div class="callout">Retakes allowed after 24h. Ten attempts total — make them count.</div>`,
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
