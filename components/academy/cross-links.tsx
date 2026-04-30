/**
 * components/academy/cross-links.tsx
 *
 * "Beyond the curriculum" cross-link section. Two cards: Sensei
 * (score-guide for the TradingView indicator) and Briefs (4H
 * postmortem stream). Drop into any academy page where it makes
 * sense:
 *
 *   - app/(academy)/academy/page.tsx — at the bottom of the
 *     module-index page, after the 5 modules.
 *   - app/(academy)/academy/[moduleId]/page.tsx — at the bottom of
 *     each module's detail page, after the lesson list.
 *   - app/(academy)/page.tsx — on the academy home if it has one.
 *
 * Usage:
 *   import { CrossLinks } from '@/components/academy/cross-links';
 *   <CrossLinks />
 *
 * Variant prop lets you tune what shows. `compact` for module pages
 * (single row), `full` for the index page (richer cards).
 */

import Link from 'next/link';

interface CrossLinksProps {
  variant?: 'full' | 'compact';
  className?: string;
}

interface CardSpec {
  href: string;
  label: string;
  title: string;
  blurb: string;
  accent: string;
}

const CARDS: CardSpec[] = [
  {
    href: '/sensei',
    label: 'TradingView Indicator',
    title: 'NOVEX SENSEI — Score Guide',
    blurb:
      'The 9-dimension confluence score, the tier system, the EMA ladder, and how to wire alerts. Read this before acting on any LEGENDARY signal.',
    accent: 'var(--cyan)',
  },
  {
    href: '/briefs',
    label: '4H Brief Loop',
    title: 'Brief Stream — Live Postmortems',
    blurb:
      "Every 4 hours, the AI fleet writes a postmortem on its last call — RIGHT, WRONG, or FLAT. Read the math after the fact and learn the regime in real time.",
    accent: 'var(--gold)',
  },
];

export function CrossLinks({ variant = 'full', className }: CrossLinksProps) {
  const compact = variant === 'compact';
  return (
    <section
      className={className}
      style={{
        marginTop: compact ? 32 : 56,
        padding: compact ? 0 : '32px 0',
        borderTop: compact ? '1px solid var(--border)' : 'none',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontWeight: 700,
          marginBottom: 16,
          marginTop: compact ? 28 : 0,
        }}
      >
        Beyond the curriculum
      </div>

      <div
        className="novex-cross-grid"
        style={{
          display: 'grid',
          gap: 14,
          gridTemplateColumns: '1fr',
        }}
      >
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            style={{
              display: 'block',
              padding: compact ? 18 : 22,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${c.accent}`,
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              transition: 'border-color 0.12s, transform 0.12s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = c.accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              // Restore the colored left border
              (e.currentTarget as HTMLElement).style.borderLeft = `3px solid ${c.accent}`;
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: c.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: compact ? 16 : 18,
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}
            >
              {c.title}
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
                marginBottom: 10,
              }}
            >
              {c.blurb}
            </div>
            <div
              style={{
                fontSize: 11,
                color: c.accent,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Open →
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        @media (min-width: 720px) {
          .novex-cross-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
