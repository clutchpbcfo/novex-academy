'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { useProfileStore } from '@/lib/state/use-profile-store';
import { useProgressStore } from '@/lib/state/use-progress-store';
import { useEquityCurve } from '@/hooks/use-equity-curve';
import { useTrader } from '@/hooks/use-trader';
import { BridgeBanner } from '@/components/academy/bridge-banner';
import { StatCard } from '@/components/academy/stat-card';
import { TradeRow } from '@/components/academy/trade-row';
import { BadgeCard } from '@/components/academy/badge-card';
import { PnlChart } from '@/components/academy/pnl-chart';
import { ProfileEditorModal } from '@/components/modals/profile-editor-modal';
import { BADGES } from '@/lib/data/badges';
import { MODULES } from '@/lib/data/modules';
import { useQuery } from '@tanstack/react-query';
import type { Trade } from '@/types';
import { fmtUSD, fmtPct } from '@/lib/utils';

const RANGE_OPTIONS = ['7D', '30D', '90D'] as const;
type Range = (typeof RANGE_OPTIONS)[number];

const NXP_TIERS = [
  { name: 'Rookie', threshold: 0, next: 100 },
  { name: 'Trader', threshold: 100, next: 300 },
  { name: 'Pro', threshold: 300, next: 750 },
  { name: 'Whale', threshold: 750, next: 1500 },
  { name: 'Elite', threshold: 1500, next: 3000 },
  { name: 'Legend', threshold: 3000, next: 6000 },
  { name: 'Master', threshold: 6000, next: 10000 },
  { name: 'Sensei', threshold: 10000, next: null },
] as const;

function getTierInfo(nxp: number) {
  const tier = [...NXP_TIERS].reverse().find((t) => nxp >= t.threshold) ?? NXP_TIERS[0];
  if (tier.next === null) return { tierName: 'Sensei', nextTier: 'MAX', xpToNext: 0, pct: 100 };
  const range = tier.next - tier.threshold;
  const progress = nxp - tier.threshold;
  const nextTierName = NXP_TIERS.find((t) => t.threshold === tier.next)?.name ?? 'MAX';
  return {
    tierName: tier.name,
    nextTier: nextTierName,
    xpToNext: tier.next - nxp,
    pct: Math.min(100, Math.round((progress / range) * 100)),
  };
}

export default function VaultPage() {
  const t = useTranslations();
  const session = useWalletStore((s) => s.session);
  const setWalletModalOpen = useWalletStore((s) => s.setWalletModalOpen);
  const { profile } = useProfileStore();
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);
  const [profileOpen, setProfileOpen] = useState(false);
  const [range, setRange] = useState<Range>('30D');

  const { data: equityData } = useEquityCurve(range);
  const { data: trades } = useQuery<Trade[]>({
    queryKey: ['trades'],
    queryFn: () => fetch('/api/trades?limit=5').then((r) => r.json()),
    staleTime: 60_000,
  });

  // Fetch real trader data from blob
  const { data: trader, isLoading: traderLoading } = useTrader(session?.address);

  const totalLessons = MODULES.reduce((sum, m) => sum + m.items.length, 0);
  const completedLessons = MODULES.reduce(
    (sum, m) => sum + Math.floor((getModuleProgress(m.id, m.items.length) / 100) * m.items.length),
    0,
  );
  const gradPct = Math.round((completedLessons / totalLessons) * 100);

  const tierInfo = getTierInfo(trader?.nxp ?? 0);
  const emoji = profile.avatarEmoji ?? '⚡';

  // ── State 1: No wallet connected ──────────────────────────────────────────
  if (!session) {
    return (
      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
        <BridgeBanner session={null} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 420,
            gap: 20,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48 }}>🔐</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}>
            Connect your wallet to view your stats
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 380 }}>
            Your NXP, tier, PnL, and trade history are linked to your wallet address.
          </p>
          <button
            onClick={() => setWalletModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, var(--cyan), #00a8cc)',
              color: '#000',
              padding: '12px 28px',
              fontSize: 13,
              fontWeight: 800,
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              border: 'none',
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            CONNECT WALLET
          </button>
          {/* Progress ring still shows 0% */}
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <svg width={80} height={80}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="8" />
              <text x="40" y="40" textAnchor="middle" dominantBaseline="middle"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 800, fill: 'var(--text-primary)' }}>
                0%
              </text>
            </svg>
            <div>
              <div style={{ fontSize: 11, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: 4 }}>
                Curriculum Progress
              </div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>0 / {totalLessons}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Connect wallet to track progress
              </div>
            </div>
          </div>
        </div>
        <ProfileEditorModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    );
  }

  const shortAddr = (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

  // ── State 2: Wallet connected, loading blob ────────────────────────────────
  if (traderLoading) {
    return (
      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
        <BridgeBanner session={session} />
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your stats…
        </div>
      </div>
    );
  }

  // ── State 3a: Wallet connected, NOT found in traders.json ─────────────────
  const isNewTrader = !trader;

  // ── Full render (State 3b: found) ─────────────────────────────────────────
  const displayName = profile.displayName || shortAddr(session.address);
  const handle = profile.handle || shortAddr(session.address);
  const nxp = trader?.nxp ?? 0;
  const rank = trader?.rank ?? null;
  const pnl = trader?.pnl ?? 0;
  const wr = trader?.wr ?? 0;
  const volume = trader?.volume ?? 0;
  const trades2 = trader?.trades ?? 0;

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
      <BridgeBanner session={session} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
            {t('vault.eyebrow')}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{t('vault.title')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{t('vault.sub')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* Left: Profile card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(168,85,247,0.04))',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(0,229,255,0.2), transparent 70%)', pointerEvents: 'none' }} />

          {/* Emoji Avatar */}
          <div style={{ position: 'relative', width: 84, marginBottom: 14 }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: 'var(--bg-elev)',
                border: '2px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 38,
                boxShadow: 'var(--cyan-glow)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {emoji}
            </div>
            <button
              onClick={() => setProfileOpen(true)}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--bg-elev)',
                border: '1px solid var(--cyan)',
                color: 'var(--cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ✎
            </button>
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.01em', position: 'relative', zIndex: 1 }}>
            {displayName}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", marginBottom: 18, position: 'relative', zIndex: 1 }}>
            @{handle}
          </div>

          {profile.bio && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55, marginBottom: 20, position: 'relative', zIndex: 1 }}>
              {profile.bio}
            </div>
          )}

          {isNewTrader ? (
            <div style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
              <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 4, background: 'rgba(148,163,184,0.1)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                New Trader
              </span>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
                Start trading on the terminal to build your stats.
              </p>
            </div>
          ) : (
            /* Tier + Rank */
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative', zIndex: 1 }}>
              <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 4, background: 'rgba(168,85,247,0.15)', border: '1px solid var(--purple)', color: 'var(--purple)' }}>
                {tierInfo.tierName}
              </span>
              {rank !== null && (
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('vault.rank')} #{rank}</span>
              )}
            </div>
          )}

          {/* NXP bar */}
          <div style={{ marginTop: 18, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>
                {t('vault.novexXp')}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gold)' }}>
                {nxp.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${tierInfo.pct}%`, background: 'linear-gradient(90deg, var(--gold), var(--orange))', boxShadow: '0 0 12px var(--gold-soft)', borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
            {tierInfo.nextTier !== 'MAX' ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                {tierInfo.xpToNext.toLocaleString()} XP to {tierInfo.nextTier}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--gold)', fontFamily: "'JetBrains Mono', monospace" }}>
                MAX TIER — SENSEI
              </div>
            )}
          </div>

          {/* Socials */}
          {(profile.twitter || profile.tradingView) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              {profile.twitter && (
                <span style={{ padding: '6px 10px', fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  𝕏 {profile.twitter}
                </span>
              )}
              {profile.tradingView && (
                <span style={{ padding: '6px 10px', fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  📈 {profile.tradingView}
                </span>
              )}
            </div>
          )}

          <button
            onClick={() => setProfileOpen(true)}
            style={{
              width: '100%',
              marginTop: 20,
              padding: 10,
              background: 'rgba(0,229,255,0.1)',
              border: '1px solid rgba(0,229,255,0.3)',
              color: 'var(--cyan)',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {t('vault.editProfile')}
          </button>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <StatCard label={t('vault.totalPnl')} value={isNewTrader ? '—' : fmtUSD(pnl)} delta={isNewTrader ? undefined : `${pnl >= 0 ? '+' : ''}${((pnl / Math.max(volume, 1)) * 100).toFixed(1)}%`} up={pnl >= 0} />
            <StatCard label={t('vault.winRate')} value={isNewTrader ? '—' : `${wr}%`} />
            <StatCard label="Volume" value={isNewTrader ? '—' : fmtUSD(volume)} />
            <StatCard label={t('vault.bestStreak')} value="—" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <StatCard label={t('vault.totalTrades')} value={isNewTrader ? '—' : trades2.toString()} />
            <StatCard label={t('vault.sharpe')} value="—" />
            <StatCard label={t('vault.maxDd')} value="—" />
            <StatCard label={t('vault.graduation')} value={`${gradPct}%`} delta={`${completedLessons}/${totalLessons}`} up={gradPct > 0} />
          </div>

          {/* PnL chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {t('vault.equityCurve')}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                  Coming soon — historical equity curve
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {RANGE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: range === r ? 'var(--cyan)' : 'var(--text-secondary)',
                      background: range === r ? 'var(--cyan-soft)' : 'transparent',
                      borderRadius: 4,
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {equityData && <PnlChart points={equityData.points} height={180} />}
          </div>

          {/* Recent trades */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {t('vault.recentTrades')}
              </span>
              <a href="https://novex.finance" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>
                {t('vault.fullJournal')}
              </a>
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr 100px 100px', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                <span>Symbol</span>
                <span>Side</span>
                <span>Size</span>
                <span style={{ textAlign: 'right' }}>PnL (R)</span>
                <span style={{ textAlign: 'right' }}>PnL ($)</span>
              </div>
              {(trades ?? []).map((trade, i) => (
                <TradeRow key={i} trade={trade} />
              ))}
              {(!trades || trades.length === 0) && (
                <div style={{ padding: '20px 14px', fontSize: 13, color: 'var(--text-muted)' }}>
                  No recent trades to display.
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {t('vault.achievements')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {BADGES.filter((b) => b.earned).length}/{BADGES.length} {t('vault.locked')}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
              {BADGES.map((badge, i) => (
                <BadgeCard key={i} badge={badge} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProfileEditorModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
