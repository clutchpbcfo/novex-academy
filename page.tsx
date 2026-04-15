'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { BridgeBanner } from '@/components/academy/bridge-banner';
import { ModCard } from '@/components/academy/mod-card';
import { MODULES } from '@/lib/data/modules';
import { useProgressStore } from '@/lib/state/use-progress-store';


export default function DashboardPage() {
  const t = useTranslations();
  const session = useWalletStore((s) => s.session);
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);
  const checkModuleUnlocked = useProgressStore((s) => s.isModuleUnlocked);

  const totalLessons = MODULES.reduce((sum, m) => sum + m.items.length, 0);
  const completedLessons = MODULES.reduce(
    (sum, m) => sum + Math.floor((getModuleProgress(m.id, m.items.length) / 100) * m.items.length),
    0,
  );
  const overallPct = Math.round((completedLessons / totalLessons) * 100);

  // Progress ring
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallPct / 100) * circumference;

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
      <BridgeBanner session={session} />

      {/* Hero section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Hero card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(168,85,247,0.04))',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {session?.address && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {t('dash.welcome')}, <b style={{ color: 'var(--cyan)' }}>{(session?.address ?? '').slice(0, 6)}…</b>
            </div>
          )}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            {t('dash.heroTitle1')}{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('dash.heroTitle2')}
            </span>
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 15,
              lineHeight: 1.55,
              marginBottom: 24,
              maxWidth: 540,
            }}
          >
            {t('dash.heroSub')}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/academy"
              style={{
                background: 'linear-gradient(135deg, var(--cyan), #00a8cc)',
                color: '#000',
                padding: '12px 22px',
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {t('dash.continue')}
            </Link>
            <a
              href="https://novex.finance"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                padding: '12px 22px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {t('dash.openTerminal')}
            </a>
          </div>
        </div>

        {/* Progress ring */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
          }}
        >
          <svg width={120} height={120} style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="var(--purple)" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.6s' }}
            />
            <text
              x="60"
              y="60"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, fill: 'var(--text-primary)' }}
            >
              {overallPct}%
            </text>
          </svg>
          <div>
            <div style={{ fontSize: 11, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: 6 }}>
              {t('dash.progress')}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
              {completedLessons} / {totalLessons}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {t('dash.ofComplete')}
            </div>
            <Link
              href="/vault"
              style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}
            >
              {t('dash.viewVault')}
            </Link>
          </div>
        </div>
      </div>

      {/* Curriculum preview */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
            {t('dash.curriculumEyebrow')}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>
            {t('dash.curriculumTitle')}
          </h2>
        </div>
        <Link href="/academy" style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>
          {t('dash.viewAll')}
        </Link>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {MODULES.slice(0, 4).map((mod) => {
          const locked = !checkModuleUnlocked(mod.id);
          return (
            <ModCard
              key={mod.id}
              module={mod}
              progress={locked ? 0 : getModuleProgress(mod.id, mod.items.length)}
              locked={locked}
            />
          );
        })}
      </div>
    </div>
  );
}
