import type { LeaderboardEntry } from '@/types';
import { fmtUSD } from '@/lib/utils';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  metric: 'pnl' | 'nxp' | 'wr';
}

export function LeaderboardRow({ entry, metric }: LeaderboardRowProps) {
  const isTop3 = entry.rank <= 3;
  const trendUp = entry.trend.startsWith('+');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 110px 110px 110px 100px',
        gap: 14,
        padding: entry.isYou ? '14px 20px 14px 17px' : '14px 20px',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        background: entry.isYou
          ? 'linear-gradient(90deg, rgba(0,229,255,0.08), transparent)'
          : undefined,
        borderLeft: entry.isYou ? '3px solid var(--cyan)' : undefined,
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = entry.isYou
          ? 'linear-gradient(90deg, rgba(0,229,255,0.12), transparent)'
          : 'rgba(255,255,255,0.02)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = entry.isYou
          ? 'linear-gradient(90deg, rgba(0,229,255,0.08), transparent)'
          : '';
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
          fontSize: 14,
          color: isTop3 ? 'var(--gold)' : 'var(--text-secondary)',
        }}
      >
        #{entry.rank}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: entry.avatarEmoji ? 'var(--bg-elev)' : entry.avatarBg,
            border: entry.avatarEmoji ? '1px solid var(--border)' : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: entry.avatarEmoji ? undefined : '#000',
            fontSize: entry.avatarEmoji ? 18 : 13,
            flexShrink: 0,
          }}
        >
          {entry.avatarEmoji ?? entry.avatarInitials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{entry.name}</div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            @{entry.handle}
          </div>
        </div>
        {entry.isYou && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              padding: '2px 6px',
              background: 'var(--cyan-soft)',
              color: 'var(--cyan)',
              borderRadius: 3,
              letterSpacing: '0.1em',
            }}
          >
            YOU
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 13,
          textAlign: 'right',
          color: metric === 'pnl' ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {fmtUSD(entry.pnl)}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 13,
          textAlign: 'right',
          color: metric === 'nxp' ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {entry.nxp.toLocaleString()}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 13,
          textAlign: 'right',
          color: metric === 'wr' ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
      >
        {entry.wr}%
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          textAlign: 'right',
          color: trendUp ? 'var(--green)' : entry.trend === '0%' ? 'var(--text-muted)' : 'var(--red)',
        }}
      >
        {entry.trend}
      </span>
    </div>
  );
}
