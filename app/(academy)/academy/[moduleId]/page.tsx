'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { MODULES } from '@/lib/data/modules';
import { useProgressStore } from '@/lib/state/use-progress-store';
import { nextUnlockedLesson } from '@/lib/progress/selectors';
import { notFound } from 'next/navigation';

export default function ModuleDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const { moduleId } = useParams<{ moduleId: string }>();
  const getModuleProgress = useProgressStore((s) => s.getModuleProgress);
  const checkModuleUnlocked = useProgressStore((s) => s.isModuleUnlocked);
  const checkLessonUnlocked = useProgressStore((s) => s.isLessonUnlocked);
  const isComplete = useProgressStore((s) => s.isComplete);
  const completed = useProgressStore((s) => s.completed);

  const mod = MODULES.find((m) => m.id === parseInt(moduleId));

  // Gate: redirect immediately if module is locked
  const unlocked = mod ? checkModuleUnlocked(mod.id) : false;
  useEffect(() => {
    if (mod && !unlocked) {
      router.replace(nextUnlockedLesson(completed));
    }
  }, [mod, unlocked, router, completed]);

  if (!mod) return notFound();
  // While redirect is in flight, render nothing (content never paints)
  if (!unlocked) return null;

  const progress = getModuleProgress(mod.id, mod.items.length);

  const TIER_COLORS = { core: 'var(--cyan)', advanced: 'var(--purple)', final: 'var(--gold)' };
  const tierColor = TIER_COLORS[mod.tier];

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
      <Link
        href="/academy"
        style={{
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 24,
        }}
      >
        {t('academy.back')}
      </Link>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: tierColor,
              fontWeight: 700,
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}
          >
            {t('academy.module')} {mod.num} · {mod.tag}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {mod.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{mod.desc}</p>
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 12,
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            <span>⏱ {mod.duration}</span>
            <span>
              {mod.lessons} {t('academy.lessons')}
            </span>
          </div>
        </div>
        {progress > 0 && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: tierColor,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {progress}% complete
          </div>
        )}
      </div>

      {progress > 0 && (
        <div
          style={{
            height: 4,
            background: 'var(--border)',
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: `linear-gradient(90deg, var(--cyan), var(--purple))`,
              transition: 'width 0.4s',
            }}
          />
        </div>
      )}

      {/* Lesson list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mod.items.map((lesson, idx) => {
          const done = isComplete(`${mod.id}-${idx}`);
          const lessonUnlocked = checkLessonUnlocked(mod.id, idx);

          const rowContent = (
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${done ? 'rgba(0,230,118,0.3)' : lessonUnlocked ? 'var(--border)' : 'rgba(26,37,56,0.5)'}`,
                borderRadius: 'var(--radius)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s',
                cursor: lessonUnlocked ? 'pointer' : 'not-allowed',
                opacity: lessonUnlocked ? 1 : 0.45,
              }}
              onMouseEnter={
                lessonUnlocked
                  ? (e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = done
                        ? 'rgba(0,230,118,0.5)'
                        : 'var(--cyan)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)';
                    }
                  : undefined
              }
              onMouseLeave={
                lessonUnlocked
                  ? (e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = done
                        ? 'rgba(0,230,118,0.3)'
                        : 'var(--border)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                    }
                  : undefined
              }
              title={!lessonUnlocked ? `Complete Lesson ${idx} to unlock` : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: done
                      ? 'rgba(0,230,118,0.15)'
                      : lessonUnlocked
                        ? 'var(--bg-elev)'
                        : 'rgba(13,20,32,0.6)',
                    border: `1px solid ${done ? 'var(--green)' : lessonUnlocked ? 'var(--border)' : 'rgba(26,37,56,0.5)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: done ? 11 : 13,
                    fontWeight: 700,
                    color: done ? 'var(--green)' : lessonUnlocked ? 'var(--text-muted)' : 'var(--text-muted)',
                    flexShrink: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {done ? '✓' : lessonUnlocked ? idx + 1 : '🔒'}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: lessonUnlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {lesson.t}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {t('academy.lesson')} {idx + 1}
                  </div>
                </div>
              </div>
              <span
                style={{
                  color: done ? 'var(--green)' : lessonUnlocked ? 'var(--cyan)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {done ? t('academy.done') : lessonUnlocked ? t('academy.start') : 'LOCKED'}
              </span>
            </div>
          );

          if (!lessonUnlocked) {
            return <div key={idx}>{rowContent}</div>;
          }

          return (
            <Link key={idx} href={`/academy/${mod.id}/${idx}`} style={{ textDecoration: 'none' }}>
              {rowContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
