// Orderly SDK wrapper
// Real SDK: @orderly.network/hooks + @orderly.network/react-wallet-connector
// These are wired here as type stubs for now; install the actual packages when
// the real Orderly broker_id + network keys are available.

export interface OrderlyConnectResult {
  address: string;
  accountId: `0x${string}`;
  key: string;
}

// WALLET_META maps provider IDs to metadata (matches v4 exactly)
import type { WalletMeta, WalletProvider } from '@/types';

export const WALLET_META: Record<WalletProvider, WalletMeta> = {
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    sub: 'Solana',
    network: 'solana',
    colorClass: 'wl-phantom',
    init: 'P',
  },
  solflare: {
    id: 'solflare',
    name: 'Solflare',
    sub: 'Solana',
    network: 'solana',
    colorClass: 'wl-solflare',
    init: 'S',
  },
  backpack: {
    id: 'backpack',
    name: 'Backpack',
    sub: 'Solana / xNFT',
    network: 'solana',
    colorClass: 'wl-bp',
    init: 'B',
  },
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    sub: 'EVM — Base / Arbitrum / Ethereum',
    network: 'ethereum',
    colorClass: 'wl-meta',
    init: 'M',
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    sub: 'Any wallet via QR',
    network: 'ethereum',
    colorClass: 'wl-wc',
    init: 'W',
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    sub: 'EVM / Solana',
    network: 'base',
    colorClass: 'wl-cb',
    init: 'C',
  },
  okx: {
    id: 'okx',
    name: 'OKX Wallet',
    sub: 'Multi-chain',
    network: 'ethereum',
    colorClass: 'wl-okx',
    init: 'O',
  },
  rabby: {
    id: 'rabby',
    name: 'Rabby',
    sub: 'EVM',
    network: 'ethereum',
    colorClass: 'wl-rabby',
    init: 'R',
  },
  binance: {
    id: 'binance',
    name: 'Binance Web3',
    sub: 'BNB / EVM',
    network: 'bnb',
    colorClass: 'wl-bnb',
    init: 'BN',
  },
  trust: {
    id: 'trust',
    name: 'Trust Wallet',
    sub: 'EVM / Solana',
    network: 'ethereum',
    colorClass: 'wl-trust',
    init: 'T',
  },
  ledger: {
    id: 'ledger',
    name: 'Ledger',
    sub: 'Hardware — EVM',
    network: 'ethereum',
    colorClass: 'wl-ledger',
    init: 'L',
  },
};

// Ordered wallet list matching v4 exactly
export const WALLETS_ORDERED: WalletMeta[] = [
  WALLET_META.phantom,
  WALLET_META.solflare,
  WALLET_META.backpack,
  WALLET_META.metamask,
  WALLET_META.walletconnect,
  WALLET_META.coinbase,
  WALLET_META.okx,
  WALLET_META.rabby,
  WALLET_META.binance,
  WALLET_META.trust,
  WALLET_META.ledger,
];
