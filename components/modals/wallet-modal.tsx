'use client';

import { useTranslations } from 'next-intl';
import { WALLETS_ORDERED, WALLET_META } from '@/lib/wallet/orderly';
import { broadcastSession } from '@/lib/wallet/bridge';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import { useQueryClient } from '@tanstack/react-query';
import type { WalletProvider } from '@/types';
import { useState } from 'react';

/* ── wallet logo background styles ─────────────────────────────── */
const WALLET_LOGO_STYLES: Record<string, string> = {
  phantom:       'bg-[#AB9FF2]',
  solflare:      'bg-[#FC8C17]',
  backpack:      'bg-[#E33E3F]',
  metamask:      'bg-[#F6851B]',
  walletconnect: 'bg-[#3B99FC]',
  coinbase:      'bg-[#0052FF]',
  okx:           'bg-[#000000]',
  rabby:         'bg-[#8697FF]',
  binance:       'bg-[#F0B90B]',
  trust:         'bg-[#0500FF]',
  ledger:        'bg-[#000000]',
};

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

/* ── helpers: talk to real browser wallet extensions ────────────── */

async function connectSolana(provider: WalletProvider): Promise<string> {
  const walletMap: Record<string, () => unknown> = {
    phantom:  () => (window as any).phantom?.solana,
    solflare: () => (window as any).solflare,
    backpack: () => (window as any).backpack,
  };
  const getWallet = walletMap[provider];
  const wallet = getWallet?.();
  if (!wallet) throw new Error(provider + ' not installed');
  const resp = await (wallet as any).connect();
  return resp.publicKey.toString();
}

async function connectEVM(provider: WalletProvider): Promise<string> {
  let eth: any = null;

  switch (provider) {
    case 'metamask':
      eth = (window as any).ethereum?.isMetaMask
        ? (window as any).ethereum
        : (window as any).ethereum?.providers?.find((p: any) => p.isMetaMask);
      break;
    case 'coinbase':
      eth = (window as any).ethereum?.isCoinbaseWallet
        ? (window as any).ethereum
        : (window as any).ethereum?.providers?.find((p: any) => p.isCoinbaseWallet);
      break;
    case 'okx':
      eth = (window as any).okxwallet;
      break;
    case 'rabby':
      eth = (window as any).ethereum?.isRabby
        ? (window as any).ethereum
        : (window as any).ethereum?.providers?.find((p: any) => p.isRabby);
      break;
    case 'trust':
      eth = (window as any).trustwallet || (window as any).ethereum;
      break;
    case 'binance':
      eth = (window as any).BinanceChain;
      break;
    case 'walletconnect':
      eth = (window as any).ethereum;
      break;
    case 'ledger':
      eth = (window as any).ethereum;
      break;
    default:
      eth = (window as any).ethereum;
  }

  if (!eth) throw new Error(provider + ' not installed');
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  if (!accounts[0]) throw new Error('No account returned');
  return accounts[0];
}

/* ── component ─────────────────────────────────────────────────── */

export function WalletModal({ open, onClose }: WalletModalProps) {
  const t = useTranslations();
  const setSession = useWalletStore((s) => s.setSession);
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState<WalletProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleConnect(provider: WalletProvider) {
    setConnecting(provider);
    setError(null);

    try {
      const meta = WALLET_META[provider];
      const isSolana = meta.network === 'solana';

      // Real wallet connection via browser extension APIs
      const address = isSolana
        ? await connectSolana(provider)
        : await connectEVM(provider);

      const zeroAddr = ('0x' + '0'.repeat(40)) as any;

      const session = {
        provider,
        providerName: meta.name,
        address,
        network: meta.network,
        balance: 0,
        orderlyAccountId: zeroAddr,
        orderlyKey: '',
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
    } catch (err: any) {
      const msg = err?.message || 'Connection failed';
      if (msg.includes('not installed')) {
        setError(WALLET_META[provider].name + ' is not installed. Please install the extension and try again.');
      } else if (msg.includes('User rejected') || msg.includes('user rejected')) {
        setError('Connection cancelled.');
      } else {
        setError(msg);
      }
    } finally {
      setConnecting(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* modal */}
      <div
        className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-semibold text-white">
            {t('wallet.connectWallet')}
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* error banner */}
        {error && (
          <div className="mx-5 mb-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* wallet list */}
        <div className="px-3 pb-5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {WALLETS_ORDERED.map((w) => {
            const isConnecting = connecting === w.id;
            return (
              <button
                key={w.id}
                disabled={connecting !== null}
                onClick={() => handleConnect(w.id as WalletProvider)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <span
                  className={'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ' + (WALLET_LOGO_STYLES[w.id] || 'bg-white/10')}
                >
                  {w.init}
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-white text-sm font-medium">
                    {isConnecting ? 'Connecting...' : w.name}
                  </span>
                  <span className="text-white/40 text-xs">{w.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
            }
