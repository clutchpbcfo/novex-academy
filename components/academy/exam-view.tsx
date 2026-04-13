'use client';

import { useState, useEffect } from 'react';
import { OPERATOR_EXAM } from '@/lib/data/exam';

interface ExamViewProps {
  onExit: () => void;
}

export function ExamView({ onExit }: ExamViewProps) {
  const total = OPERATOR_EXAM.questions.length;
  const passNeeded = Math.ceil((OPERATOR_EXAM.passPct / 100) * total);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(total).fill(null));
  const [secs, setSecs] = useState(OPERATOR_EXAM.durationSecs);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  useEffect(() => {
    if (submitted) {
      const score = answers.reduce<number>(
        (acc, a, i) => acc + (a === OPERATOR_EXAM.questions[i].correct ? 1 : 0),
        0,
      );
      const passed = score >= passNeeded;
      if (passed) {
        fetch('/api/progress/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'operator', nxp: OPERATOR_EXAM.nxpAward }),
        }).catch(() => {});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const score = answers.reduce<number>(
    (acc, a, i) => acc + (a === OPERATOR_EXAM.questions[i].correct ? 1 : 0),
    0,
  );
  const passed = score >= passNeeded;
  const pct = Math.round((score / total) * 100);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  // ── Results screen ──
  if (submitted) {
    return (
      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
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
            Operator Exam · Result
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 8,
              color: passed ? 'var(--green)' : 'var(--red)',
            }}
          >
            {passed ? 'PASSED' : 'NOT YET'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 24 }}>
            You answered {score}/{total} correct ({pct}%).{' '}
            {passed
              ? `Operator rank unlocked. +${OPERATOR_EXAM.nxpAward} NXP awarded.`
              : `${passNeeded}/${total} required. Retakes allowed after 24h.`}
          </p>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 22,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 12,
              }}
            >
              Answer review
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {OPERATOR_EXAM.questions.map((q, i) => {
                const ok = answers[i] === q.correct;
                const userAns = answers[i] === null ? '—' : String.fromCharCode(65 + (answers[i] as number));
                const corrAns = String.fromCharCode(65 + q.correct);
                return (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr 90px',
                      gap: 12,
                      padding: '10px 12px',
                      background: 'var(--bg-elev)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: `3px solid ${ok ? 'var(--green)' : 'var(--red)'}`,
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                      }}
                    >
                      Q{String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{q.q}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{q.explain}</div>
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        fontSize: 11,
                        color: 'var(--text-muted)',
                      }}
                    >
                      You:{' '}
                      <b style={{ color: ok ? 'var(--green)' : 'var(--red)' }}>{userAns}</b>
                      <br />
                      Correct: <b style={{ color: 'var(--green)' }}>{corrAns}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onExit}
            style={{
              background: 'linear-gradient(135deg, var(--cyan), #00a8cc)',
              color: '#000',
              padding: '12px 22px',
              fontSize: 13,
              fontWeight: 800,
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Back to Academy
          </button>
        </div>
      </div>
    );
  }

  // ── Live exam screen ──
  const q = OPERATOR_EXAM.questions[idx];
  const answered = answers.filter((a) => a !== null).length;

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '32px 28px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}
          >
            Operator Exam · Question {idx + 1} / {total}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              Answered {answered}/{total}
            </span>
            <span
              style={{
                color: secs < 300 ? 'var(--red)' : 'var(--cyan)',
                fontWeight: 700,
              }}
            >
              ⏱ {mm}:{ss}
            </span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 22,
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{q.q}</div>
          {q.opts.map((o, i) => {
            const selected = answers[idx] === i;
            return (
              <button
                key={i}
                onClick={() => {
                  const next = [...answers];
                  next[idx] = i;
                  setAnswers(next);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: selected ? 'rgba(0,229,255,0.08)' : 'var(--bg-elev)',
                  border: `1px solid ${selected ? 'var(--cyan)' : 'var(--border)'}`,
                  padding: '14px 18px',
                  marginBottom: 8,
                  borderRadius: 'var(--radius-sm)',
                  color: selected ? 'var(--cyan)' : 'var(--text-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {String.fromCharCode(65 + i)}. {o}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            paddingTop: 24,
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            style={{
              padding: '10px 20px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderRadius: 'var(--radius-sm)',
              color: idx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: idx === 0 ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ← Prev
          </button>
          {idx < total - 1 ? (
            <button
              onClick={() => setIdx(idx + 1)}
              style={{
                padding: '10px 20px',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--cyan)',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => {
                if (answered < total) {
                  if (!confirm(`You have ${total - answered} unanswered. Submit anyway?`)) return;
                }
                setSubmitted(true);
              }}
              style={{
                padding: '10px 20px',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--green)',
                color: '#001a0a',
                border: `1px solid var(--green)`,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Submit Exam
            </button>
          )}
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 14,
            background: 'var(--bg-elev)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          Pass = {passNeeded}/{total} ({OPERATOR_EXAM.passPct}%). You may navigate freely between
          questions before submitting. Timer continues on background tab.
        </div>
      </div>
    </div>
  );
}
