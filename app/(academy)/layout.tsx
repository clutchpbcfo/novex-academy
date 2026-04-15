'use client';

import { useEffect } from 'react';
import { Ticker } from '@/components/academy/ticker';
import { NavBar } from '@/components/academy/navbar';
import { useSession } from '@/hooks/use-session';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { useQueryClient } from '@tanstack/react-query';
import { broadcastSession } from '@/lib/wallet/bridge';
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';

/** Bridge Dynamic SDK auth state to server session + Zustand store */
function DynamicSessionBridge() {
    const { primaryWallet } = useDynamicContext();
    const queryClient = useQueryClient();

  useEffect(() => {
        if (!primaryWallet?.address) return;

                const chain = primaryWallet.chain;
        const network = chain === 'SOL' ? 'solana' : 'ethereum';

                const connectorName = (primaryWallet.connector?.name ?? '').toLowerCase();
        const provider =
                connectorName.includes('phantom') ? 'phantom' :
                connectorName.includes('coinbase') ? 'coinbase' :
                connectorName.includes('walletconnect') ? 'walletconnect' :
                connectorName.includes('solflare') ? 'solflare' :
                'metamask';

                const session = {
                        provider,
                        providerName: primaryWallet.connector?.name ?? 'Unknown',
                        address: primaryWallet.address,
                        network,
                        balance: 0,
                        orderlyAccountId: '0x',
                        orderlyKey: '',
                        connectedAt: Date.now(),
                        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                };

                fetch('/api/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(session),
                }).then(() => {
                        queryClient.invalidateQueries({ queryKey: ['session'] });
                        broadcastSession();
                });
  }, [primaryWallet?.address, queryClient]);

  return null;
}

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
    const setSession = useWalletStore((s) => s.setSession);
    const queryClient = useQueryClient();
    const { setShowAuthFlow } = useDynamicContext();

  useSession();

  async function handleDisconnect() {
        await fetch('/api/session', { method: 'DELETE' });
        setSession(null);
        queryClient.invalidateQueries({ queryKey: ['session'] });
        broadcastSession();
  }

  return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <DynamicSessionBridge />
                <Ticker />
                <NavBar
                          onConnect={() => setShowAuthFlow(true)}
                          onDisconnect={handleDisconnect}
                        />
                <main style={{ flex: 1 }}>{children}</main>main>
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
                        &copy; 2026 Novex Finance.{' '}
                        <a href="https://novex.finance" style={{ color: 'var(--text-secondary)', textDecoration: 'none', marginLeft: 10 }}>
                                  Terminal
                        </a>a>
                        <a href="/academy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', margin: '0 10px' }}>
                                  Academy
                        </a>a>
                        <a href="/vault" style={{ color: 'var(--text-secondary)', textDecoration: 'none', margin: '0 10px' }}>
                                  Vault
                        </a>a>
                </footer>footer>
              <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }} aria-hidden>
                      <DynamicWidget />
              </div>div>
        </div>div>
      );
}</footer>
