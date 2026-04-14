'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { useProfileStore } from '@/lib/state/use-profile-store';
import { BridgeBanner } from '@/components/academy/bridge-banner';
import { PodiumCard } from '@/components/academy/podium-card';
import { LeaderboardRow } from '@/components/academy/leaderboard-row';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import type { LeaderboardEntry } from '@/types';

type Range = '7D' | '30D' | '90D' | 'ALL';
type Metric = 'pnl' | 'nxp' | 'wr';

function fmtNxp(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function LeaderboardPage() {
  const t = useTranslations();
  const session = useWalletStore((s) => s.session);
  const { profile } = useProfileStore();
  const [range, setRange] = useState<Range>('30D');
  const [metric, setMetric] = useState<Metric>('pnl');

  const { data: rawEntries = [], isLoading, isError } = useLeaderboard({ range, metric });

  // Client-side: mark the connected user's row as isYou + inject emoji
  const connectedWallet = session?.address?.toLowerCase();
  const entries: LeaderboardEntry[] = rawEntries.map((e) => ({
    ...e,
    isYou: Boolean(connectedWallet && e.wallet?.toLowerCase() === connectedWallet),
    avatarEmoji:
      connectedWallet && e.wallet?.toLowerCase() === connectedWallet
        ? (profile.avatarEmoji ?? undefined)
        : undefined,
  }));

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const youEntry = entries.find((e) => e.isYou);

  // Summary computed from entries
  const totalTraders = entries.length;
  const totalNxp = entries.reduce((sum, e) => sum + e.nxp, 0);

  const RANGES: Range[] = ['7D', '30D', '90D', 'ALL'];
  const METRICS: { id: Metric; label: string }[] = [
    { id: 'pnl', label: t('lb.pnl') },
    { id: 'nxp', label: t('lb.nxp') },
    { id: 'wr', label: t('lb.wr') },
  ];

  const segStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 700,
    color: active ? 'var(--cyan)' : 'var(--text-secondary)',
    background: active ? 'var(--cyan-soft)' : 'transparent',
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.1s',
  });

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
      <BridgeBanner session={session} />

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
          {t('lb.eyebrow')}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          {t('lb.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('lb.sub')}</p>
      </div>

      {/* Summary cards */}
      {!isLoading && !isError && totalTraders > 0 && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '14px 20px',
              flex: '0 0 auto',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: 4 }}>
              TRADERS
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
              {totalTraders}
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '14px 20px',
              flex: '0 0 auto',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: 4 }}>
              TOTAL NXP
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gold)' }}>
              {fmtNxp(totalNxp)}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'inline-flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} style={segStyle(range === r)}>{r}</button>
          ))}
        </div>
        <div style={{ display: 'inline-flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
          {METRICS.map((m) => (
            <button key={m.id} onClick={() => setMetric(m.id)} style={segStyle(metric === m.id)}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 60,
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          Leaderboard temporarily unavailable. Please try again shortly.
        </div>
      )}

      {!isError && (
        <>
          {/* Podium */}
          {top3.length === 3 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 16,
                marginBottom: 24,
                alignItems: 'end',
              }}
            >
              {top3.map((entry) => (
                <PodiumCard key={entry.rank} entry={entry} metric={metric} />
              ))}
            </div>
          )}

          {/* Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 110px 110px 110px 100px',
                gap: 14,
                padding: '14px 20px',
                background: 'var(--bg-elev)',
                borderBottom: '1px solid var(--border)',
                fontSize: 10,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                fontWeight: 700,
              }}
            >
              <span>{t('lb.rank')}</span>
              <span>{t('lb.operator')}</span>
              <span style={{ textAlign: 'right' }}>{metric === 'pnl' ? t('lb.pnl') : metric === 'nxp' ? t('lb.nxp') : t('lb.wr')}</span>
              <span style={{ textAlign: 'right' }}>{t('lb.nxp')}</span>
              <span style={{ textAlign: 'right' }}>{t('lb.wr')}</span>
              <span style={{ textAlign: 'right' }}>Trend</span>
            </div>

            {isLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : (
              rest.map((entry) => (
                <LeaderboardRow key={entry.rank} entry={entry} metric={metric} />
              ))
            )}

            {/* Sticky you row */}
            {youEntry && youEntry.rank > 3 && (
              <div
                style={{
                  position: 'sticky',
                  bottom: 0,
                  background: 'var(--bg-elev)',
                  borderTop: '1px solid var(--cyan)',
                  boxShadow: '0 -12px 24px rgba(0,229,255,0.08)',
                }}
              >
                <LeaderboardRow entry={youEntry} metric={metric} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
