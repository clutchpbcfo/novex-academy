import type { Badge } from '@/lib/data/badges';

interface BadgeCardProps {
  badge: Badge;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div
      style={{
        background: badge.earned ? undefined : 'var(--bg-elev)',
        backgroundImage: badge.earned
          ? 'linear-gradient(180deg, rgba(255,209,102,0.08), transparent)'
          : undefined,
        border: `1px solid ${badge.earned ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '14px 10px',
        textAlign: 'center',
        opacity: badge.earned ? 1 : 0.35,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (badge.earned) {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-3px)';
          el.style.boxShadow = '0 6px 20px rgba(255,209,102,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = '';
        el.style.boxShadow = '';
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{badge.icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700 }}>{badge.name}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{badge.desc}</div>
    </div>
  );
}
