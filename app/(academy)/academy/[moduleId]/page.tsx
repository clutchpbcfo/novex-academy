'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MODULES } from '@/lib/data/modules';
import { useProgressStore } from '@/lib/state/use-progress-store';
import { notFound } from 'next/navigation';

export default function ModuleDetailPage() {
  const t = useTranslations();
  const { moduleId } = useParams<{ moduleId: string }>();
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);
  const isComplete = useProgressStore((s) => s.isComplete);

  const mod = MODULES.find((m) => m.id === parseInt(moduleId));
  if (!mod) return notFound();

  const progress = getModuleProgress(mod.id, mod.items.length);

  const TIER_COLORS = { core: 'var(--cyan)', advanced: 'var(--purple)', final: 'var(--gold)' };
  const tierColor = TIER_COLORS[mod.tier];

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
      <Link
        href="/academy"
        style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}
      >
        {t('academy.back')}
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: tierColor, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
            {t('academy.module')} {mod.num} · {mod.tag}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {mod.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{mod.desc}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
            <span>⏱ {mod.duration}</span>
            <span>{mod.lessons} {t('academy.lessons')}</span>
          </div>
        </div>
        {progress > 0 && (
          <div style={{ fontSize: 14, fontWeight: 800, color: tierColor, fontFamily: "'JetBrains Mono', monospace" }}>
            {progress}% complete
          </div>
        )}
      </div>

      {progress > 0 && (
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, var(--cyan), var(--purple))`, transition: 'width 0.4s' }} />
        </div>
      )}

      {/* Lesson list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mod.items.map((lesson, idx) => {
          const done = isComplete(`${mod.id}-${idx}`);
          return (
            <Link
              key={idx}
              href={`/academy/${mod.id}/${idx}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${done ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = done ? 'rgba(0,230,118,0.5)' : 'var(--cyan)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = done ? 'rgba(0,230,118,0.3)' : 'var(--border)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'rgba(0,230,118,0.15)' : 'var(--bg-elev)', border: `1px solid ${done ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: done ? 'var(--green)' : 'var(--text-muted)', flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{lesson.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t('academy.lesson')} {idx + 1}</div>
                  </div>
                </div>
                <span style={{ color: done ? 'var(--green)' : 'var(--cyan)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {done ? t('academy.done') : t('academy.start')}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
