/**
 * app/(academy)/briefs/page.tsx
 *
 * Brief Stream — postmortems from the 4H Brief Loop. Polls /api/briefs
 * (which proxies ctn-api) every 30s. Mobile-first single-column;
 * 2 columns at >=720px.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Brief } from '@/app/api/briefs/route';

interface BriefsResponse { briefs: Brief[]; stale?: boolean; }

const POLL_MS = 30_000;

function fmtAge(ts: number | undefined): string {
  if (!ts) return '';
  const ms = Date.now() / 1000 - ts;
  if (ms < 60) return `${Math.floor(ms)}s ago`;
  if (ms < 3600) return `${Math.floor(ms / 60)}m ago`;
  if (ms < 86400) return `${Math.floor(ms / 3600)}h ago`;
  return `${Math.floor(ms / 86400)}d ago`;
}

function resultColor(r: Brief['result']): string {
  if (r === 'RIGHT') return '#00E676';
  if (r === 'WRONG') return '#FF3B5C';
  return 'var(--text-muted)';
}

function sideColor(s: Brief['side']): string {
  if (s === 'long') return '#00E676';
  if (s === 'short') return '#FF3B5C';
  return 'var(--text-muted)';
}

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<Brief[] | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/briefs?limit=30', { cache: 'no-store' });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as BriefsResponse;
        if (cancelled) return;
        setBriefs(data.briefs ?? []);
        setStale(Boolean(data.stale));
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(String(e));
      }
    }
    void load();
    const id = setInterval(load, POLL_MS);
    const refresh = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearInterval(refresh);
    };
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 22px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>
            4H Brief Loop · Postmortems
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '6px 0 0' }}>Brief Stream</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '8px 0 0', maxWidth: 640 }}>
            Every 4H candle close, the fleet writes a postmortem on its last
            call — was it right, was it wrong, what shifted? Read the math
            after the fact and learn the regime in real time.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {stale ? (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-elev)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>⚠ Stale</span>
          ) : (
            <span style={{ fontSize: 10, color: '#00E676', background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.3)', padding: '4px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E676' }} />
              Live · {POLL_MS / 1000}s
            </span>
          )}
        </div>
      </div>

      {error && briefs === null && (
        <div style={{ border: '1px solid rgba(255,59,92,0.4)', background: 'rgba(255,59,92,0.06)', color: '#FF3B5C', padding: 16, borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
          Could not load briefs: {error}
        </div>
      )}

      {briefs === null && !error && (
        <div style={{ display: 'grid', gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 140, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', opacity: 0.5 }} />
          ))}
        </div>
      )}

      {briefs !== null && briefs.length === 0 && (
        <div style={{ padding: 48, background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>No briefs yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            The 4H Brief Loop posts a postmortem 10 minutes after each fleet
            decision. Check back at the next 4H candle close.
          </div>
        </div>
      )}

      {briefs !== null && briefs.length > 0 && (
        <div className="briefs-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr' }}>
          {briefs.map((b, i) => (
            <article key={`${b.ts}-${b.asset}-${i}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `3px solid ${resultColor(b.result)}`, borderRadius: 'var(--radius-sm)', padding: 18 }}>
              <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 14, color: 'var(--gold)' }}>{b.asset || '—'}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: sideColor(b.side), textTransform: 'uppercase', letterSpacing: '0.12em' }}>{b.side}</span>
                  {b.tier && <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', background: 'var(--bg-elev)', padding: '2px 6px', borderRadius: 3, fontWeight: 700 }}>{b.tier}</span>}
                  {typeof b.score === 'number' && <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>{b.score}/19</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: resultColor(b.result), textTransform: 'uppercase', letterSpacing: '0.12em' }}>{b.result}</span>
              </header>

              {typeof b.pct_move === 'number' && (
                <div style={{ fontSize: 13, color: b.pct_move >= 0 ? '#00E676' : '#FF3B5C', fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
                  {b.pct_move >= 0 ? '+' : '−'}{Math.abs(b.pct_move).toFixed(2)}% in 4H
                </div>
              )}

              {b.confluence && b.confluence.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {b.confluence.map((c, idx) => (
                    <span key={idx} style={{ fontSize: 11, background: 'var(--bg-elev)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 4, color: 'var(--text-secondary)' }}>{c}</span>
                  ))}
                </div>
              )}

              {b.postmortem && (
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 10px' }}>{b.postmortem}</p>
              )}

              <footer style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span>{fmtAge(b.ts)}</span>
                <Link href="/sensei" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.04em' }}>Score guide →</Link>
              </footer>
            </article>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 720px) {
          .briefs-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
