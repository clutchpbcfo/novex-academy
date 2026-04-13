'use client';

import { TICKER_DATA } from '@/lib/data/modules';

export function Ticker() {
  const items = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div
      style={{
        background: '#060a11',
        borderBottom: '1px solid var(--border)',
        height: 30,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'tickerScroll 80s linear infinite',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.04em',
        }}
      >
        {items.map((t, i) => (
          <span key={i} style={{ paddingRight: 56, color: 'var(--text-secondary)' }}>
            <b style={{ color: 'var(--gold)', fontWeight: 700, marginRight: 6 }}>{t.s}</b>
            {t.p}{' '}
            <span style={{ color: t.up ? 'var(--green)' : 'var(--red)' }}>{t.c}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
