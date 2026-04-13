'use client';

import Link from 'next/link';
import type { Module } from '@/types';

interface ModCardProps {
  module: Module;
  progress?: number;
  locked?: boolean;
}

const TIER_COLORS: Record<Module['tier'], string> = {
  core: 'var(--cyan)',
  advanced: 'var(--purple)',
  final: 'var(--gold)',
};

export function ModCard({ module, progress = 0, locked = false }: ModCardProps) {
  const tierColor = locked ? 'var(--text-muted)' : TIER_COLORS[module.tier];
  const prevModuleId = module.id - 1;

  const inner = (
    <div
      className={locked ? undefined : 'mod-card-hover'}
      title={
        locked
          ? `Complete Module ${String(prevModuleId).padStart(2, '0')} to unlock`
          : undefined
      }
      style={{
        background: locked ? 'rgba(13,20,32,0.6)' : 'var(--bg-card)',
        border: `1px solid ${locked ? 'rgba(26,37,56,0.5)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 22,
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s',
        position: 'relative',
        overflow: 'hidden',
        opacity: locked ? 0.55 : 1,
      }}
      onMouseEnter={
        locked
          ? undefined
          : (e) => {
              const el = e.currentTarget;
              el.style.transform = 'translateY(-4px)';
              el.style.borderColor = 'var(--cyan)';
              el.style.boxShadow = '0 10px 28px rgba(0,229,255,0.08)';
            }
      }
      onMouseLeave={
        locked
          ? undefined
          : (e) => {
              const el = e.currentTarget;
              el.style.transform = '';
              el.style.borderColor = 'var(--border)';
              el.style.boxShadow = '';
            }
      }
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: tierColor,
          fontWeight: 700,
          letterSpacing: '0.1em',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>MODULE {module.num}</span>
        {locked ? (
          <span style={{ fontSize: 14 }}>🔒</span>
        ) : (
          <span
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 4,
              background: `${TIER_COLORS[module.tier]}22`,
              border: `1px solid ${TIER_COLORS[module.tier]}55`,
              color: TIER_COLORS[module.tier],
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {module.tag}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          marginBottom: 8,
          color: locked ? 'var(--text-muted)' : 'var(--text-primary)',
        }}
      >
        {module.title}
      </div>

      <div
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: 16,
        }}
      >
        {module.desc}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-muted)',
          paddingTop: 14,
          borderTop: `1px solid ${locked ? 'rgba(26,37,56,0.4)' : 'var(--border)'}`,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 700,
        }}
      >
        <span>⏱ {module.duration}</span>
        {locked ? (
          <span style={{ color: 'var(--text-muted)' }}>
            Complete Module {String(prevModuleId).padStart(2, '0')} to unlock
          </span>
        ) : (
          <span>{module.lessons} lessons</span>
        )}
      </div>

      {!locked && progress > 0 && (
        <div
          style={{
            height: 3,
            background: 'var(--border)',
            borderRadius: 2,
            overflow: 'hidden',
            marginTop: 10,
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
    </div>
  );

  // Locked cards are not wrapped in a Link — clicking does nothing
  if (locked) {
    return <div>{inner}</div>;
  }

  return (
    <Link href={`/academy/${module.id}`} style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  );
}
