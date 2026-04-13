'use client';

import { useTranslations } from 'next-intl';
import type { Session } from '@/types';

interface BridgeBannerProps {
  session: Session | null;
}

export function BridgeBanner({ session }: BridgeBannerProps) {
  const t = useTranslations();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg, rgba(168,85,247,0.08), rgba(0,229,255,0.04))',
        border: '1px solid rgba(168,85,247,0.25)',
        borderRadius: 'var(--radius)',
        padding: '14px 20px',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(168,85,247,0.15)',
            border: '1px solid rgba(168,85,247,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--purple)',
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          ⇌
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
          {session ? (
            <>
              <b style={{ color: 'var(--purple)', fontWeight: 700 }}>{t('bridge.live')}</b>{' '}
              {t('bridge.liveDesc')}
            </>
          ) : (
            <>
              <b style={{ color: 'var(--purple)', fontWeight: 700 }}>{t('bridge.once')}</b>{' '}
              {t('bridge.onceDesc')}
            </>
          )}
        </div>
      </div>
      <a
        href="https://novex.finance"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: 'var(--purple)',
          color: '#fff',
          padding: '8px 16px',
          fontSize: 12,
          fontWeight: 700,
          borderRadius: 'var(--radius-sm)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        {t('bridge.cta')}
      </a>
    </div>
  );
}
