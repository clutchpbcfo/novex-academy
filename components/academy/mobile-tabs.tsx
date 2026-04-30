/**
 * components/academy/mobile-tabs.tsx
 *
 * Three-tab bottom bar used on mobile and inside the iOS Capacitor
 * wrap. Mirrors the App Store information architecture:
 *
 *   Tab 1 — Academy       ( /academy )
 *   Tab 2 — Brief Stream  ( /briefs  )
 *   Tab 3 — Open Terminal ( https://novex.finance/terminal )
 *
 * The Terminal tab opens novex.finance/terminal. On native iOS we
 * route through Capacitor's Browser plugin (in-app) so we don't get
 * bounced to Safari. On the web we plain-navigate.
 *
 * Hides itself on >=720px on the web; always shows on Capacitor native.
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const TERMINAL_URL = 'https://novex.finance/terminal';

interface CapacitorBrowser { open: (opts: { url: string; presentationStyle?: string }) => Promise<void>; }
interface CapacitorGlobal { isNativePlatform?: () => boolean; Plugins?: { Browser?: CapacitorBrowser }; }
declare global { interface Window { Capacitor?: CapacitorGlobal; } }

function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

async function openTerminal() {
  if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.Browser) {
    try {
      await window.Capacitor.Plugins.Browser.open({ url: TERMINAL_URL, presentationStyle: 'popover' });
      return;
    } catch { /* fall through */ }
  }
  if (typeof window !== 'undefined') window.location.href = TERMINAL_URL;
}

interface IconProps { active: boolean; }

function AcademyIcon({ active }: IconProps) {
  const c = active ? 'var(--cyan)' : 'currentColor';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 7l9-4 9 4-9 4-9-4Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M7 9.5v4.5c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5V9.5" stroke={c} strokeWidth="1.6"/>
      <path d="M21 7v6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function BriefsIcon({ active }: IconProps) {
  const c = active ? 'var(--cyan)' : 'currentColor';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={c} strokeWidth="1.6"/>
      <path d="M8 8h8M8 12h8M8 16h5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function TerminalIcon({ active }: IconProps) {
  const c = active ? 'var(--gold)' : 'currentColor';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={c} strokeWidth="1.6"/>
      <path d="M7 10l3 2-3 2M13 14h4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MobileTabs() {
  const pathname = usePathname() ?? '/';
  const [native, setNative] = useState(false);
  useEffect(() => { setNative(isCapacitorNative()); }, []);

  const isAcademy = pathname.startsWith('/academy');
  const isBriefs = pathname.startsWith('/briefs');

  return (
    <>
      <nav className="novex-mobile-tabs" data-native={native ? '1' : '0'} aria-label="Primary">
        <Link href="/academy" aria-label="Academy" aria-current={isAcademy ? 'page' : undefined} className={`novex-mobile-tab ${isAcademy ? 'is-active' : ''}`}>
          <AcademyIcon active={isAcademy} />
          <span>Academy</span>
        </Link>
        <Link href="/briefs" aria-label="Brief Stream" aria-current={isBriefs ? 'page' : undefined} className={`novex-mobile-tab ${isBriefs ? 'is-active' : ''}`}>
          <BriefsIcon active={isBriefs} />
          <span>Briefs</span>
        </Link>
        <button type="button" aria-label="Open Terminal" className="novex-mobile-tab" onClick={(e) => { e.preventDefault(); void openTerminal(); }}>
          <TerminalIcon active={false} />
          <span>Terminal</span>
        </button>
      </nav>
      <div className="novex-mobile-tabs-spacer" aria-hidden />

      <style jsx>{`
        .novex-mobile-tabs {
          position: fixed; bottom: 0; left: 0; right: 0;
          height: calc(60px + env(safe-area-inset-bottom, 0));
          padding-bottom: env(safe-area-inset-bottom, 0);
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          background: rgba(5, 8, 13, 0.94);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--border);
          z-index: 99;
        }
        .novex-mobile-tabs-spacer { height: 0; }
        @media (max-width: 719px) {
          .novex-mobile-tabs-spacer { height: calc(60px + env(safe-area-inset-bottom, 0)); }
        }
        @media (min-width: 720px) {
          .novex-mobile-tabs { display: none; }
        }
        .novex-mobile-tabs[data-native='1'] { display: grid !important; }
        .novex-mobile-tabs[data-native='1'] ~ .novex-mobile-tabs-spacer {
          height: calc(60px + env(safe-area-inset-bottom, 0));
        }
        .novex-mobile-tab {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          background: transparent; border: none;
          color: var(--text-muted);
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; font-family: inherit;
          padding: 6px 4px; cursor: pointer;
        }
        .novex-mobile-tab.is-active { color: var(--cyan); }
      `}</style>
    </>
  );
}
