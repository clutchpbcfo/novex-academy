'use client';

import Link from 'next/link';
import type { Module } from '@/types';

interface ModCardProps {
  module: Module;
  progress?: number;
}

const TIER_COLORS: Record<Module['tier'], string> = {
  core: 'var(--cyan)',
  advanced: 'var(--purple)',
  final: 'var(--gold)',
};

export function ModCard({ module, progress = 0 }: ModCardProps) {
  const tierColor = TIER_COLORS[module.tier];
  return (
    <Link href={`/academy/${module.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="mod-card-hover"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 22,
          cursor: 'pointer',
          transition: 'all 0.25s',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-4px)';
          el.style.borderColor = 'var(--cyan)';
          el.style.boxShadow = '0 10px 28px rgba(0,229,255,0.08)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = '';
          el.style.borderColor = 'var(--border)';
          el.style.boxShadow = '';
        }}
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
          <span
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 4,
              background: `${tierColor}22`,
              border: `1px solid ${tierColor}55`,
              color: tierColor,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {module.tag}
          </span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 8 }}>
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
            borderTop: '1px solid var(--border)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          <span>⏱ {module.duration}</span>
          <span>{module.lessons} lessons</span>
        </div>
        {progress > 0 && (
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
    </Link>
  );
}
