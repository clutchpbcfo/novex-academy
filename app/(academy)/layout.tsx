'use client';

import { Ticker } from '@/components/academy/ticker';
import { NavBar } from '@/components/academy/navbar';
import { WalletModal } from '@/components/modals/wallet-modal';
import { useSession } from '@/hooks/use-session';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { useQueryClient } from '@tanstack/react-query';
import { broadcastSession } from '@/lib/wallet/bridge';

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  const setSession = useWalletStore((s) => s.setSession);
  const walletModalOpen = useWalletStore((s) => s.walletModalOpen);
  const setWalletModalOpen = useWalletStore((s) => s.setWalletModalOpen);
  const queryClient = useQueryClient();

  // Hydrate session on mount
  useSession();

  async function handleDisconnect() {
    await fetch('/api/session', { method: 'DELETE' });
    setSession(null);
    queryClient.invalidateQueries({ queryKey: ['session'] });
    broadcastSession();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Ticker />
      <NavBar
        onConnect={() => setWalletModalOpen(true)}
        onDisconnect={handleDisconnect}
      />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: 28,
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}
      >
        © 2026 Novex Finance.{' '}
        <a href="https://novex.finance" style={{ color: 'var(--text-secondary)', textDecoration: 'none', margin: '0 10px' }}>
          Terminal
        </a>
        <a href="/academy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', margin: '0 10px' }}>
          Academy
        </a>
        <a href="/vault" style={{ color: 'var(--text-secondary)', textDecoration: 'none', margin: '0 10px' }}>
          Vault
        </a>
      </footer>
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </div>
  );
}
