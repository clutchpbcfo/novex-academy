'use client';

import { useTranslations } from 'next-intl';
import { WALLETS_ORDERED, WALLET_META } from '@/lib/wallet/orderly';
import { broadcastSession } from '@/lib/wallet/bridge';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { useQueryClient } from '@tanstack/react-query';
import type { WalletProvider } from '@/types';

const WALLET_LOGO_STYLES: Record<WalletProvider, React.CSSProperties> = {
  phantom: { background: '#ab9ff2', color: '#000' },
  solflare: { background: 'linear-gradient(135deg, #fc7507, #ffbe3d)', color: '#000' },
  backpack: { background: '#e33e3e', color: '#fff' },
  metamask: { background: '#f6851b', color: '#fff' },
  walletconnect: { background: '#3b99fc', color: '#fff' },
  coinbase: { background: '#0052ff', color: '#fff' },
  okx: { background: '#000', border: '1px solid #333', color: '#fff' },
  rabby: { background: '#7084ff', color: '#fff' },
  binance: { background: 'linear-gradient(135deg, #f3ba2f, #f0b90b)', color: '#000' },
  trust: { background: '#3375bb', color: '#fff' },
  ledger: { background: '#000', border: '1px solid #333', color: '#fff' },
};

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const t = useTranslations();
  const setSession = useWalletStore((s) => s.setSession);
  const queryClient = useQueryClient();

  if (!open) return null;

  async function handleConnect(provider: WalletProvider) {
    const meta = WALLET_META[provider];
    // Mock connect: in production, wire to @orderly.network/hooks useConnect()
    const mockAddress =
      meta.network === 'solana'
        ? `${Math.random().toString(36).slice(2, 10)}...${Math.random().toString(36).slice(2, 6)}`
        : `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const mockAccountId = `0x${Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('')}` as `0x${string}`;

    const session = {
      provider,
      providerName: meta.name,
      address: mockAddress,
      network: meta.network,
      balance: 12450.8,
      orderlyAccountId: mockAccountId,
      orderlyKey: `ed25519:${Math.random().toString(36).slice(2, 34)}`,
      connectedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });

    setSession(session);
    queryClient.invalidateQueries({ queryKey: ['session'] });
    broadcastSession();
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,8,13,0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            maxWidth: 480,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            animation: 'slideUp 0.25s',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'var(--text-muted)',
              fontSize: 22,
              lineHeight: 1,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            }}
          >
            ×
          </button>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.01em' }}>
            {t('wallet.title')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
            {t('wallet.sub')}
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: '60vh',
              overflowY: 'auto',
              paddingRight: 4,
              marginRight: -4,
            }}
          >
            {WALLETS_ORDERED.map((w) => (
              <button
                key={w.id}
                onClick={() => handleConnect(w.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 14,
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--cyan)';
                  el.style.background = 'rgba(0,229,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--border)';
                  el.style.background = 'var(--bg-elev)';
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                    ...WALLET_LOGO_STYLES[w.id],
                  }}
                >
                  {w.init}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {w.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.sub}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
