import type { LeaderboardEntry } from '@/types';
import { fmtUSD } from '@/lib/utils';

interface PodiumCardProps {
  entry: LeaderboardEntry;
  metric: 'pnl' | 'nxp' | 'wr';
}

const RANK_CONFIG = {
  1: {
    medal: '🥇',
    borderColor: 'var(--gold)',
    bg: 'linear-gradient(180deg, rgba(255,209,102,0.1), var(--bg-card))',
    rankColor: 'var(--gold)',
    avatarBg: 'linear-gradient(135deg, var(--gold), #ff9500)',
    avatarSize: 72,
    fontSize: 26,
    metricSize: 24,
    extraPad: 8,
  },
  2: {
    medal: '🥈',
    borderColor: '#b8c5d6',
    bg: 'linear-gradient(180deg, rgba(184,197,214,0.08), var(--bg-card))',
    rankColor: '#b8c5d6',
    avatarBg: 'linear-gradient(135deg, #d4dde8, #8a9ab0)',
    avatarSize: 56,
    fontSize: 20,
    metricSize: 20,
    extraPad: 0,
  },
  3: {
    medal: '🥉',
    borderColor: '#cd7f32',
    bg: 'linear-gradient(180deg, rgba(205,127,50,0.08), var(--bg-card))',
    rankColor: '#cd7f32',
    avatarBg: 'linear-gradient(135deg, #e8a164, #a05e1f)',
    avatarSize: 56,
    fontSize: 20,
    metricSize: 20,
    extraPad: 0,
  },
} as const;

export function PodiumCard({ entry, metric }: PodiumCardProps) {
  const rank = Math.min(entry.rank, 3) as 1 | 2 | 3;
  const cfg = RANK_CONFIG[rank];

  const metricValue =
    metric === 'nxp'
      ? entry.nxp.toLocaleString()
      : metric === 'wr'
        ? `${entry.wr}%`
        : fmtUSD(entry.pnl);

  const metricLabel = metric === 'nxp' ? 'NXP' : metric === 'wr' ? 'Win Rate' : 'PnL';

  return (
    <div
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: `${20 + cfg.extraPad}px 20px`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s',
        order: rank === 1 ? 2 : rank === 2 ? 1 : 3,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          marginBottom: 10,
          color: cfg.rankColor,
        }}
      >
        #{entry.rank}
      </div>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{cfg.medal}</div>
      <div
        style={{
          width: cfg.avatarSize,
          height: cfg.avatarSize,
          borderRadius: '50%',
          background: cfg.avatarBg,
          margin: '0 auto 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: cfg.fontSize,
          color: rank === 3 ? '#fff' : '#000',
          boxShadow: rank === 1 ? '0 0 24px var(--gold-soft)' : undefined,
        }}
      >
        {entry.avatarInitials}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{entry.name}</div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 14,
        }}
      >
        @{entry.handle}
      </div>
      <div
        style={{
          fontSize: cfg.metricSize,
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          color: rank === 1 ? 'var(--gold)' : 'var(--text-primary)',
        }}
      >
        {metricValue}
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginTop: 2,
        }}
      >
        {metricLabel}
      </div>
    </div>
  );
}
