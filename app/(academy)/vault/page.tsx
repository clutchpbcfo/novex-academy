'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { useProfileStore } from '@/lib/state/use-profile-store';
import { useProgressStore } from '@/lib/state/use-progress-store';
import { useEquityCurve } from '@/hooks/use-equity-curve';
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

export default function VaultPage() {
  const t = useTranslations();
  const session = useWalletStore((s) => s.session);
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

  const totalLessons = MODULES.reduce((sum, m) => sum + m.items.length, 0);
  const completedLessons = MODULES.reduce(
    (sum, m) => sum + Math.floor((getModuleProgress(m.id, m.items.length) / 100) * m.items.length),
    0,
  );
  const gradPct = Math.round((completedLessons / totalLessons) * 100);

  const AVATAR_GRADIENT_MAP: Record<string, string> = {
    'cyan-purple': 'linear-gradient(135deg, var(--cyan), var(--purple))',
    'gold-orange': 'linear-gradient(135deg, var(--gold), var(--orange))',
    'green-cyan': 'linear-gradient(135deg, var(--green), var(--cyan))',
    'red-purple': 'linear-gradient(135deg, var(--red), var(--purple))',
    'pink-orange': 'linear-gradient(135deg, #e91e63, var(--orange))',
    'blue-cyan': 'linear-gradient(135deg, #3b99fc, var(--cyan))',
  };

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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 24,
        }}
      >
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
          {/* Glow effect */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(0,229,255,0.2), transparent 70%)', pointerEvents: 'none' }} />

          {/* Avatar */}
          <div style={{ position: 'relative', width: 84, marginBottom: 14 }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: AVATAR_GRADIENT_MAP[profile.avatarBg] ?? AVATAR_GRADIENT_MAP['cyan-purple'],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#000',
                fontSize: 30,
                boxShadow: 'var(--cyan-glow)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {profile.avatarInitials}
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
            {profile.displayName}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", marginBottom: 18, position: 'relative', zIndex: 1 }}>
            @{profile.handle}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55, marginBottom: 20, position: 'relative', zIndex: 1 }}>
            {profile.bio}
          </div>

          {/* Rank */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 4, background: 'rgba(168,85,247,0.15)', border: '1px solid var(--purple)', color: 'var(--purple)' }}>
              {t('vault.premium')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('vault.rank')} #6</span>
          </div>

          {/* NXP bar */}
          <div style={{ marginTop: 18, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>
                {t('vault.novexXp')}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gold)' }}>
                11,340
              </span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: '62%', background: 'linear-gradient(90deg, var(--gold), var(--orange))', boxShadow: '0 0 12px var(--gold-soft)', borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              3,660 XP {t('vault.toLegendary')}
            </div>
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
            <StatCard label={t('vault.totalPnl')} value="+$24,750" delta="+14.2%" up />
            <StatCard label={t('vault.winRate')} value="59%" delta="+2.1%" up />
            <StatCard label={t('vault.avgR')} value="2.4R" delta="+0.3R" up />
            <StatCard label={t('vault.bestStreak')} value="8W" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <StatCard label={t('vault.totalTrades')} value="142" />
            <StatCard label={t('vault.sharpe')} value="2.82" delta="+0.1" up />
            <StatCard label={t('vault.maxDd')} value="-8.4%" delta="-1.2%" />
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
                {equityData && (
                  <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em', marginTop: 8, color: equityData.pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {fmtPct(equityData.pct)}
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t('vault.cumulative')}</div>
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
            <div style={{ padding: '0' }}>
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
