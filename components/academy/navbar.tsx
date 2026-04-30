'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { useProfileStore } from '@/lib/state/use-profile-store';
import { useTrader } from '@/hooks/use-trader';
import { shortAddr } from '@/lib/utils';
import { LanguagePicker } from '@/components/modals/language-picker';

interface NavBarProps {
  onConnect: () => void;
  onDisconnect: () => void;
}

const NAV_LINKS = [
  { href: '/', tKey: 'nav.home' },
  { href: '/academy', tKey: 'nav.academy' },
  { href: '/briefs', tKey: 'nav.briefs' },
  { href: '/sensei', tKey: 'nav.sensei' },
  { href: '/vault', tKey: 'nav.vault' },
  { href: '/leaderboard', tKey: 'nav.leaderboard' },
] as const;

export function NavBar({ onConnect, onDisconnect }: NavBarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const session = useWalletStore((s) => s.session);
  const { profile } = useProfileStore();
  const { data: trader } = useTrader(session?.address);

  const nxp = trader?.nxp ?? null;
  const rank = trader?.rank ?? null;
  const emoji = profile.avatarEmoji ?? '⚡';

  return (
    <nav
      style={{
        background: 'rgba(5,8,13,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 28px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'linear-gradient(135deg, var(--cyan), #0088ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#000',
              fontSize: 15,
              boxShadow: 'var(--cyan-glow)',
            }}
          >
            N
          </div>
          <span style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 800, letterSpacing: '0.04em' }}>
            NOVEX
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 2 }}>
          {NAV_LINKS.map(({ href, tKey }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--cyan-soft)' : 'transparent',
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t(tKey)}
              </Link>
            );
          })}
          <a
            href="https://novex.finance/terminal"
            data-novex-cta="open-terminal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#000',
              background: 'linear-gradient(135deg, var(--gold), #FFB800)',
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              transition: 'all 0.15s',
              boxShadow: '0 0 0 1px rgba(255,215,0,0.3)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 0 14px rgba(255,215,0,0.45), 0 0 0 1px rgba(255,215,0,0.6)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 0 0 1px rgba(255,215,0,0.3)';
            }}
          >
            {t('nav.openTerminal')}
            <span aria-hidden style={{ fontSize: 13 }}>→</span>
          </a>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {session && nxp !== null && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>
                {t('nav.nxp')}
              </span>
              <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--gold)' }}>
                {nxp.toLocaleString()}
              </span>
            </div>
            <div style={{ width: 1, height: 26, background: 'var(--border)' }} />
          </>
        )}
        {session && rank !== null && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>
                {t('nav.rank')}
              </span>
              <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--purple)' }}>
                #{rank}
              </span>
            </div>
            <div style={{ width: 1, height: 26, background: 'var(--border)' }} />
          </>
        )}
        <LanguagePicker />
        {session ? (
          <button
            onClick={onDisconnect}
            title="Disconnect"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(0,230,118,0.06)',
              border: '1px solid rgba(0,230,118,0.3)',
              padding: '7px 12px 7px 10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,230,118,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,230,118,0.06)';
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--green)',
                boxShadow: '0 0 8px var(--green)',
                animation: 'pulse 2s ease-in-out infinite',
                display: 'block',
              }}
            />
            <span style={{ fontSize: 18 }}>{emoji}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
              {shortAddr(session?.address ?? "")}
            </span>
          </button>
        ) : (
          <button
            onClick={onConnect}
            style={{
              background: 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(0,229,255,0.05))',
              border: '1px solid rgba(0,229,255,0.5)',
              color: 'var(--cyan)',
              padding: '9px 18px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--cyan-glow)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
          >
            {t('nav.connect')}
          </button>
        )}
      </div>
    </nav>
  );
}
