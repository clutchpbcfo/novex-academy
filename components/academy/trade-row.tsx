import type { Trade } from '@/types';

interface TradeRowProps {
  trade: Trade;
}

export function TradeRow({ trade }: TradeRowProps) {
  const isUp = trade.pnl.startsWith('+');
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 80px 1fr 100px 100px',
        gap: 12,
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        fontSize: 13,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = '';
      }}
    >
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
        {trade.sym}
      </span>
      <span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 3,
            textTransform: 'uppercase',
            background:
              trade.side === 'LONG' ? 'rgba(0,230,118,0.15)' : 'rgba(255,59,92,0.15)',
            color: trade.side === 'LONG' ? 'var(--green)' : 'var(--red)',
          }}
        >
          {trade.side}
        </span>
      </span>
      <span style={{ color: 'var(--text-secondary)' }}>{trade.size}</span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          textAlign: 'right',
          color: isUp ? 'var(--green)' : 'var(--red)',
        }}
      >
        {trade.pnl}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          textAlign: 'right',
          color: isUp ? 'var(--green)' : 'var(--red)',
          fontSize: 12,
        }}
      >
        {trade.dollar}
      </span>
    </div>
  );
}
