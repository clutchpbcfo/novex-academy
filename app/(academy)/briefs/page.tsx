/**
 * app/(academy)/briefs/page.tsx  (v2 — filter chips + countdown empty state)
 *
 * Brief Stream — postmortems from the 4H Brief Loop. Polls /api/briefs
 * every 30s.
 *
 * v2 changes:
 *   - Asset filter chips (ALL / BTC / ETH / SOL — derived from data so
 *     adding a new asset to the bot just shows up).
 *   - Result filter chips (ALL / RIGHT / WRONG / FLAT).
 *   - Manual refresh button next to the live indicator.
 *   - Filters persist in URL params (?asset=BTC&result=RIGHT) so a
 *     reader can bookmark or share a filtered view.
 *   - Empty state replaces the bare "No briefs yet" with a live
 *     "Next postmortem in Xh Ym" countdown to the next 4H candle
 *     close + 10min brief-loop delay.
 *
 * The 4H schedule is hard-coded against the CTN cron (00, 04, 08,
 * 12, 16, 20 UTC). Briefs land at HH:15 UTC (5min buffer + 10min
 * postmortem delay). See SESSION-2026-04-29-MASTER-SAVE.md §4.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Brief } from '@/app/api/briefs/route';

interface BriefsResponse { briefs: Brief[]; stale?: boolean; }

const POLL_MS = 30_000;
const BRIEF_DELAY_MIN = 15; // 4H mark + 5min buffer + 10min postmortem
const BRIEF_HOURS_UTC = [0, 4, 8, 12, 16, 20] as const;

type ResultFilter = 'ALL' | Brief['result'];

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

/**
 * Returns ms until the next brief is expected to land:
 *   next 4H candle close (UTC) + 15 minutes (cron buffer + postmortem).
 */
function msUntilNextBrief(now = new Date()): number {
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  const utcS = now.getUTCSeconds();
  const utcMs = now.getUTCMilliseconds();

  // Find the next scheduled 4H mark
  let nextH = BRIEF_HOURS_UTC.find((h) => {
    if (h > utcH) return true;
    if (h === utcH && utcM < BRIEF_DELAY_MIN) return true;
    return false;
  });

  // After 20:00 → next is 00:00 tomorrow
  const target = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + (nextH === undefined ? 1 : 0),
      nextH ?? 0,
      BRIEF_DELAY_MIN,
      0,
      0,
    ),
  );
  return target.getTime() - now.getTime();
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return 'any moment';
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function chipStyle(active: boolean, accent: string = 'var(--cyan)'): React.CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '6px 12px',
    borderRadius: 999,
    border: `1px solid ${active ? accent : 'var(--border)'}`,
    background: active ? `${accent}15` : 'transparent',
    color: active ? accent : 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.12s',
  };
}

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<Brief[] | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const assetFilter = (sp?.get('asset') ?? 'ALL').toUpperCase();
  const resultFilter = ((sp?.get('result') ?? 'ALL').toUpperCase() as ResultFilter);

  function setFilter(key: 'asset' | 'result', value: string) {
    const params = new URLSearchParams(sp?.toString() ?? '');
    if (value === 'ALL') params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  async function load(manual = false) {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch('/api/briefs?limit=30', { cache: 'no-store' });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as BriefsResponse;
      setBriefs(data.briefs ?? []);
      setStale(Boolean(data.stale));
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      if (manual) setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      if (cancelled) return;
      await load(false);
    }
    void tick();
    const id = setInterval(tick, POLL_MS);
    const refresh = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearInterval(refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build asset filter list from data — always shows ALL plus any
  // asset that has appeared in a brief, so adding ETH/SOL/etc. on
  // the bot side just lights up here.
  const assets = useMemo(() => {
    const set = new Set<string>(['ALL']);
    (briefs ?? []).forEach((b) => b.asset && set.add(b.asset));
    return Array.from(set);
  }, [briefs]);

  const filtered = useMemo(() => {
    if (!briefs) return null;
    return briefs.filter((b) => {
      if (assetFilter !== 'ALL' && b.asset.toUpperCase() !== assetFilter) return false;
      if (resultFilter !== 'ALL' && b.result !== resultFilter) return false;
      return true;
    });
  }, [briefs, assetFilter, resultFilter]);

  const hasActiveFilter = assetFilter !== 'ALL' || resultFilter !== 'ALL';
  const countdownMs = msUntilNextBrief();

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
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            aria-label="Refresh briefs"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '5px 10px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: refreshing ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
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

      {/* Filter chips */}
      {briefs !== null && briefs.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginRight: 4 }}>Asset</span>
            {assets.map((a) => (
              <button key={a} type="button" onClick={() => setFilter('asset', a)} style={chipStyle(assetFilter === a)}>{a}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginRight: 4 }}>Result</span>
            {(['ALL', 'RIGHT', 'WRONG', 'FLAT'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFilter('result', r)}
                style={chipStyle(
                  resultFilter === r,
                  r === 'RIGHT' ? '#00E676' : r === 'WRONG' ? '#FF3B5C' : 'var(--cyan)',
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => router.replace(pathname)}
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '5px 10px',
                borderRadius: 999,
                border: '1px dashed var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Clear filters ✕
            </button>
          )}
        </div>
      )}

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

      {/* Empty state — split: nothing in store at all vs. filters
          excluded everything */}
      {briefs !== null && briefs.length === 0 && (
        <div style={{ padding: 48, background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>No briefs yet today</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            The 4H Brief Loop posts a postmortem 10 minutes after each fleet
            decision.
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700, marginBottom: 6 }}>
            Next postmortem in
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 800, color: 'var(--cyan)', letterSpacing: '0.04em' }}>
            {fmtCountdown(countdownMs)}
          </div>
        </div>
      )}

      {briefs !== null && briefs.length > 0 && filtered !== null && filtered.length === 0 && (
        <div style={{ padding: 32, background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No briefs match this filter</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {briefs.length} brief{briefs.length === 1 ? '' : 's'} hidden by filters above.
          </div>
        </div>
      )}

      {filtered !== null && filtered.length > 0 && (
        <div className="briefs-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr' }}>
          {filtered.map((b, i) => (
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
