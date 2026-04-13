'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { MODULES } from '@/lib/data/modules';
import { useProgressStore } from '@/lib/state/use-progress-store';
import { nextUnlockedLesson } from '@/lib/progress/selectors';
import { ExamView } from '@/components/academy/exam-view';

export default function LessonPage() {
  const t = useTranslations();
  const router = useRouter();
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const markComplete = useProgressStore((s) => s.markComplete);
  const checkLessonUnlocked = useProgressStore((s) => s.isLessonUnlocked);
  const completed = useProgressStore((s) => s.completed);

  const modIdx = parseInt(moduleId);
  const lessonIdx = parseInt(lessonId);
  const mod = MODULES.find((m) => m.id === modIdx);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [examMode, setExamMode] = useState(false);

  const lessonUnlocked = mod
    ? checkLessonUnlocked(modIdx, lessonIdx)
    : false;

  // Gate: redirect immediately if lesson is locked or params are invalid
  useEffect(() => {
    if (!mod || lessonIdx < 0 || lessonIdx >= (mod?.items.length ?? 0) || !lessonUnlocked) {
      router.replace(nextUnlockedLesson(completed));
    }
  }, [mod, lessonIdx, lessonUnlocked, router, completed]);

  // While redirect is in flight or params are bad, render nothing
  if (!mod || lessonIdx < 0 || lessonIdx >= mod.items.length || !lessonUnlocked) {
    return null;
  }

  // Module 5 — Graduation: render ExamView when user clicks BEGIN
  if (examMode) {
    return (
      <ExamView
        onExit={() => {
          setExamMode(false);
          router.push('/academy/5');
        }}
      />
    );
  }

  const lesson = mod.items[lessonIdx];
  const hasNext = lessonIdx < mod.items.length - 1;
  const hasPrev = lessonIdx > 0;
  const isLastLesson = lessonIdx === mod.items.length - 1;

  function handleComplete() {
    markComplete(`${modIdx}-${lessonIdx}`);
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId: modIdx, lessonIndex: lessonIdx }),
    });
  }

  function handleNext() {
    handleComplete();
    if (hasNext) {
      router.push(`/academy/${modIdx}/${lessonIdx + 1}`);
    } else {
      router.push(`/academy/${modIdx}`);
    }
  }

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
      <Link
        href={`/academy/${modIdx}`}
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
        {t('academy.backTo')} {mod.title}
      </Link>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 36,
          maxWidth: 860,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--cyan)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {t('academy.lesson')} {lessonIdx + 1} · {mod.title}
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          {lesson.t}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
          Module {mod.num} — {mod.tag}
        </p>

        <div
          className="lesson-content"
          style={{ fontSize: 15, lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: lesson.body }}
        />

        {/* Module-level quiz (shown on last lesson of non-exam modules) */}
        {mod.quiz && isLastLesson && (
          <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              {t('academy.knowledge')}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>{mod.quiz.q}</div>
            {mod.quiz.opts.map((opt, i) => {
              let borderColor = 'var(--border)';
              let bg = 'var(--bg-elev)';
              let color = 'var(--text-primary)';

              if (quizAnswer !== null) {
                if (i === mod.quiz!.correct) {
                  borderColor = 'var(--green)';
                  bg = 'rgba(0,230,118,0.08)';
                  color = 'var(--green)';
                } else if (i === quizAnswer && i !== mod.quiz!.correct) {
                  borderColor = 'var(--red)';
                  bg = 'rgba(255,59,92,0.08)';
                  color = 'var(--red)';
                }
              }

              return (
                <button
                  key={i}
                  disabled={quizAnswer !== null}
                  onClick={() => setQuizAnswer(i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    padding: '14px 18px',
                    marginBottom: 8,
                    borderRadius: 'var(--radius-sm)',
                    color,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: quizAnswer !== null ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {opt}
                </button>
              );
            })}
            {quizAnswer !== null && (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  fontWeight: 600,
                  background:
                    quizAnswer === mod.quiz.correct
                      ? 'rgba(0,230,118,0.08)'
                      : 'rgba(255,59,92,0.08)',
                  border: `1px solid ${quizAnswer === mod.quiz.correct ? 'var(--green)' : 'var(--red)'}`,
                  color: quizAnswer === mod.quiz.correct ? 'var(--green)' : 'var(--red)',
                }}
              >
                {quizAnswer === mod.quiz.correct ? t('academy.correct') : t('academy.wrong')}
                {mod.quiz.explain}
              </div>
            )}
          </div>
        )}

        {/* Operator Exam launch — Module 5 only */}
        {mod.isExam && isLastLesson && (
          <div
            style={{
              marginTop: 32,
              paddingTop: 28,
              borderTop: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'var(--gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Operator Certification
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
              When you&apos;re ready, begin the exam. The 30-minute timer starts on click.
            </div>
            <button
              onClick={() => setExamMode(true)}
              style={{
                background: 'var(--gold)',
                color: '#1a1200',
                padding: '12px 22px',
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              BEGIN OPERATOR EXAM →
            </button>
          </div>
        )}

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid var(--border)',
          }}
        >
          {hasPrev ? (
            <Link
              href={`/academy/${modIdx}/${lessonIdx - 1}`}
              style={{
                padding: '10px 20px',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              {t('academy.prev')}
            </Link>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            style={{
              padding: '10px 20px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--cyan)',
              color: '#000',
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'inherit',
            }}
          >
            {hasNext ? t('academy.next') : t('academy.finish')}
          </button>
        </div>
      </div>
    </div>
  );
}
