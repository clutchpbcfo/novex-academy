/**
 * app/(academy)/sensei/page.tsx
 *
 * NOVEX SENSEI — Trader's Guide. Source: Ai Agency/academy-sensei-page.md.
 * Renders with Novex palette tokens. No naked dashes; em-dash with
 * spaces or unicode minus where standing in for a number.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NOVEX SENSEI — Trader’s Guide',
  description:
    'Confluence-scored signal indicator. Tier-based alerts. Bar-close confirmed. Built for the Novex framework.',
};

const SECTION_PAD = '24px 0';
const HR_STYLE: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--border)',
  margin: '36px 0',
};

interface TierRow { icon: string; name: string; threshold: string; meaning: string; color: string; }
const TIERS: TierRow[] = [
  { icon: '⭐', name: 'LEGENDARY', threshold: '≥ 8', meaning: 'Highest-confluence setups. All major dimensions agree.', color: 'var(--gold)' },
  { icon: '★',  name: 'PREMIUM',   threshold: '≥ 6', meaning: 'Strong confluence. Most dimensions agree.', color: 'var(--cyan)' },
  { icon: '▲',  name: 'STANDARD',  threshold: '≥ 4', meaning: 'Baseline opportunity. Worth scanning.', color: '#10B981' },
];

interface ScoreRow { comp: string; max: number; desc: string; }
const SCORE_TABLE: ScoreRow[] = [
  { comp: 'HTF Bias', max: 2, desc: 'Higher-timeframe EMA-21/50 stack alignment' },
  { comp: 'Sweep / Near', max: 3, desc: 'EMA-21 liquidity sweep with quality candle' },
  { comp: 'Fakeout', max: 2, desc: 'Weekly fib breach-and-reclaim structure' },
  { comp: 'DMI / ADX', max: 2, desc: 'Trend strength + direction confirmation' },
  { comp: 'Weekly Fib', max: 2, desc: 'Price near a 0.236 / 0.382 / 0.5 / 0.618 / 0.786 zone' },
  { comp: 'Daily Fib', max: 1, desc: 'Price near a daily 0.382 / 0.5 / 0.618 zone' },
  { comp: 'Volume', max: 1, desc: 'Confirmation candle ≥ 80% of MA' },
  { comp: 'BBWP', max: 3, desc: 'Volatility regime — compressed, building, or hot' },
  { comp: 'CME Gap', max: 1, desc: 'No active counter-gap blocking the trade' },
];

interface EmaRow { ema: number; hex: string; name: string; role: string; }
const EMAS: EmaRow[] = [
  { ema: 8,   hex: '#189AFF', name: 'Blue',    role: 'Fastest accent — short-term tape' },
  { ema: 21,  hex: '#FFD700', name: 'Gold',    role: 'Primary structure — sweep zone anchor' },
  { ema: 50,  hex: '#10B981', name: 'Emerald', role: 'Momentum filter — TP1 anchor' },
  { ema: 100, hex: '#00D4FF', name: 'Cyan',    role: 'Continuation map' },
  { ema: 200, hex: '#A855F7', name: 'Purple',  role: 'Macro tide — slowest reference' },
];

const h2Style: React.CSSProperties = { fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em', margin: '0 0 12px' };
const h3Style: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '22px 0 10px' };
const pStyle: React.CSSProperties = { fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)', margin: '0 0 12px' };
const ulStyle: React.CSSProperties = { margin: '6px 0 12px', paddingLeft: 22, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 };
const olStyle: React.CSSProperties = { margin: '6px 0 12px', paddingLeft: 22, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: '10px 14px' };
const codeStyle: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, background: 'rgba(0,212,255,0.08)', color: 'var(--cyan)', padding: '2px 6px', borderRadius: 4 };
const preStyle: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, background: 'var(--bg-elev)', border: '1px solid var(--border)', padding: 14, borderRadius: 8, overflow: 'auto', color: 'var(--text-secondary)', margin: '8px 0 14px' };

export default function SenseiPage() {
  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 24px 96px' }}>
      <div style={{ fontSize: 11, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700, marginBottom: 10 }}>
        TradingView Indicator · v0.1.5
      </div>
      <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.05, margin: '0 0 14px' }}>
        NOVEX SENSEI
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}> — Trader’s Guide</span>
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
        Confluence-scored signal indicator. Tier-based alerts. Bar-close confirmed.
      </p>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
        Built for the Novex framework, available invite-only on TradingView.
      </p>

      <hr style={HR_STYLE} />

      <section style={{ padding: SECTION_PAD }}>
        <h2 style={h2Style}>What it does</h2>
        <p style={pStyle}>
          NOVEX SENSEI watches nine independent market dimensions on every bar
          close and rolls them into a single confluence score. When the score,
          the risk-reward, and the structural gates all align, it fires one of
          three tier-classed alerts.
        </p>
        <p style={{ ...pStyle, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          You read the chart. The script reads the math.
        </p>
      </section>

      <section style={{ padding: SECTION_PAD }}>
        <h2 style={h2Style}>The tier system</h2>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {TIERS.map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: 16, alignItems: 'center', padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: 22, color: t.color }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight: 800, color: t.color, letterSpacing: '0.06em' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>Score {t.threshold}</div>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t.meaning}</div>
            </div>
          ))}
        </div>
        <p style={{ ...pStyle, marginTop: 24 }}>Every tier additionally must pass four hard gates before it can fire:</p>
        <ol style={olStyle}>
          <li><b>HTF bias alignment</b> — counter-trend signals are hard-blocked. If the higher-timeframe is bull, no shorts. If bear, no longs.</li>
          <li><b>Risk-Reward ≥ 1.2</b> — calculated from the proposed TP1 and SL.</li>
          <li><b>Cooldown gap</b> — same-side signals must wait the cooldown window.</li>
          <li><b>CME gap respect</b> — open weekend gaps are honored. The script will not signal counter-gap.</li>
        </ol>
      </section>

      <section style={{ padding: SECTION_PAD }}>
        <h2 style={h2Style}>How the score is built</h2>
        <p style={pStyle}>Each component contributes points to the total. Maximum possible is 17.</p>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-card)', marginTop: 14 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elev)' }}>
                <th style={thStyle}>Component</th>
                <th style={{ ...thStyle, textAlign: 'right', width: 60 }}>Max</th>
                <th style={thStyle}>What it measures</th>
              </tr>
            </thead>
            <tbody>
              {SCORE_TABLE.map((r) => (
                <tr key={r.comp} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{r.comp}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--gold)' }}>{r.max}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginTop: 18, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          A tier is a threshold on this score. Nothing more, nothing less. The math is the math.
        </p>
      </section>

      <section style={{ padding: SECTION_PAD }}>
        <h2 style={h2Style}>The EMA ladder</h2>
        <p style={pStyle}>Five exponential moving averages, color-coded across the Novex palette:</p>
        <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
          {EMAS.map((e) => (
            <div key={e.ema} style={{ display: 'grid', gridTemplateColumns: '88px 110px 1fr', gap: 14, alignItems: 'center', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: e.hex, fontSize: 16 }}>EMA-{e.ema}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: e.hex, boxShadow: `0 0 10px ${e.hex}` }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{e.name}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{e.role}</div>
            </div>
          ))}
        </div>
        <p style={{ ...pStyle, marginTop: 18 }}>
          The EMA-21 is the heart of the system. Sweeps below (longs) and above
          (shorts) of EMA-21 with quality reclaim candles are the highest-value setups.
        </p>
      </section>

      <section style={{ padding: SECTION_PAD }}>
        <h2 style={h2Style}>Setting up alerts</h2>
        <h3 style={h3Style}>Standard chart alert (no webhook)</h3>
        <ol style={olStyle}>
          <li>Open the chart with NOVEX SENSEI applied.</li>
          <li>Click the alarm clock on the chart toolbar (or press <code style={codeStyle}>Alt + A</code>).</li>
          <li><b>Condition:</b> <code style={codeStyle}>NOVEX SENSEI</code> → <code style={codeStyle}>Any alert() function call</code>.</li>
          <li><b>Trigger:</b> <code style={codeStyle}>Once Per Bar Close</code> (the script enforces this internally too).</li>
          <li><b>Expiration:</b> open-ended.</li>
          <li><b>Alert name:</b> anything you want — does not affect logic.</li>
          <li>Save.</li>
        </ol>
        <p style={pStyle}>You will now get a TradingView notification on every tier signal.</p>

        <h3 style={h3Style}>Webhook automation (advanced)</h3>
        <p style={pStyle}>
          If you run your own bot or webhook receiver, the script emits a clean
          JSON body inside the alert message. Example:
        </p>
        <pre style={preStyle}>{'⭐ LEGENDARY LONG | {"side":"long","entry":75800.00,"tp1":76900.00,\n                    "sl":75150.00,"rr":1.69,"tier":"LEGENDARY","score":9}'}</pre>
        <p style={pStyle}>Schema:</p>
        <ul style={ulStyle}>
          <li><code style={codeStyle}>side</code> — <code style={codeStyle}>long</code> or <code style={codeStyle}>short</code></li>
          <li><code style={codeStyle}>entry</code> — bar close price at signal time</li>
          <li><code style={codeStyle}>tp1</code> — suggested TP1 (EMA50/100/200 step or ATR-based)</li>
          <li><code style={codeStyle}>sl</code> — suggested stop</li>
          <li><code style={codeStyle}>rr</code> — risk-reward ratio (already passed the ≥ 1.2 floor)</li>
          <li><code style={codeStyle}>tier</code>, <code style={codeStyle}>score</code> — tier label and raw score</li>
        </ul>
        <p style={pStyle}>Wire the webhook URL into your TradingView alert. Parse the everything-after-the-pipe as JSON.</p>
      </section>

      <section style={{ padding: SECTION_PAD }}>
        <h2 style={h2Style}>How to use this in practice</h2>
        <p style={pStyle}>The signal is the <b>start</b> of your read. Not the end.</p>
        <p style={pStyle}>
          A LEGENDARY tag means the math says nine dimensions stack. It does
          not mean the trade is risk-free, that you should size big, or that
          the bar after will go your way. It means the asymmetry is there for
          the taker who manages risk.
        </p>
        <p style={pStyle}>Recommended workflow:</p>
        <ol style={olStyle}>
          <li><b>Confirm with your eyes.</b> Every signal — pull up the chart and verify structure. Is price actually where the score implies? Is the higher-timeframe still aligned right now?</li>
          <li><b>Size for the volatility, not the conviction.</b> ATR is large → size smaller. Confluence is high → still size for the worst case.</li>
          <li><b>Honor the SL.</b> The script’s SL is calculated from ATR plus recent swing. If price violates it, the thesis is wrong. Move on.</li>
          <li><b>Take TP1 if it triggers.</b> TP1 is the EMA-50/100/200 step or ATR multiple. It is the realistic first close. Banking it pays for the trade.</li>
        </ol>
      </section>

      <section style={{ padding: SECTION_PAD, marginTop: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <Link href="/academy" style={{ padding: '12px 22px', fontSize: 13, fontWeight: 800, borderRadius: 'var(--radius-sm)', background: 'var(--cyan)', color: '#000', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Open the Academy</Link>
          <Link href="/briefs" style={{ padding: '12px 22px', fontSize: 13, fontWeight: 800, borderRadius: 'var(--radius-sm)', background: 'var(--gold)', color: '#1a1200', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Read 4H Briefs</Link>
        </div>
      </section>

      <section style={{ padding: SECTION_PAD, marginTop: 16 }}>
        <h2 style={h2Style}>Disclaimer</h2>
        <p style={{ ...pStyle, color: 'var(--text-muted)', fontSize: 13 }}>
          NOVEX SENSEI is a research and educational tool. It does not provide
          financial advice and does not guarantee future results. You are
          responsible for your own risk management, position sizing, and
          execution. Past confluence does not predict future outcomes.
        </p>
        <p style={{ ...pStyle, color: 'var(--text-muted)', fontSize: 13 }}>
          NOVEX SENSEI is the property of Novex Finance. Reproduction, resale,
          or republishing of the source is not permitted. Access is
          invite-only. If you received an invite, it is yours alone.
        </p>
      </section>
    </div>
  );
}
