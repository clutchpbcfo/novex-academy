'use client';

import { useTranslations } from 'next-intl';
import { ModCard } from '@/components/academy/mod-card';
import { BridgeBanner } from '@/components/academy/bridge-banner';
import { MODULES } from '@/lib/data/modules';
import { useProgressStore } from '@/lib/state/use-progress-store';
import { useWalletStore } from '@/lib/state/use-wallet-store';

export default function AcademyPage() {
  const t = useTranslations();
  const session = useWalletStore((s) => s.session);
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);
  const checkModuleUnlocked = useProgressStore((s) => s.isModuleUnlocked);

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
      <BridgeBanner session={session} />
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--cyan)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: 6,
          }}
        >
          {t('academy.eyebrow')}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          {t('academy.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('academy.sub')}</p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {MODULES.map((mod) => {
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
