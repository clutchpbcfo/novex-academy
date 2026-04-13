export type WalletProvider =
  | 'phantom'
  | 'solflare'
  | 'backpack'
  | 'metamask'
  | 'walletconnect'
  | 'coinbase'
  | 'okx'
  | 'rabby'
  | 'binance'
  | 'trust'
  | 'ledger';

export interface Session {
  provider: WalletProvider;
  providerName: string;
  address: `0x${string}` | string;
  network: 'solana' | 'ethereum' | 'base' | 'arbitrum' | 'optimism' | 'bnb';
  balance: number;
  orderlyAccountId: `0x${string}`;
  orderlyKey: string;
  connectedAt: number;
  expiresAt: number;
}

export interface Profile {
  displayName: string;
  handle: string;
  bio: string;
  avatarBg:
    | 'cyan-purple'
    | 'gold-orange'
    | 'green-cyan'
    | 'red-purple'
    | 'pink-orange'
    | 'blue-cyan';
  avatarInitials: string;
  twitter?: string;
  discord?: string;
}

export interface Module {
  id: number;
  num: string;
  title: string;
  tag: string;
  desc: string;
  duration: string;
  lessons: number;
  tier: 'core' | 'advanced' | 'final';
  items: Lesson[];
  quiz: Quiz | null;
}

export interface Lesson {
  t: string;
  body: string;
}

export interface Quiz {
  q: string;
  opts: string[];
  correct: number;
  explain: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  avatarBg: string;
  avatarInitials: string;
  pnl: number;
  nxp: number;
  wr: number;
  trend: string;
  isYou?: boolean;
}

export interface Trade {
  sym: string;
  side: 'LONG' | 'SHORT';
  size: string;
  pnl: string;
  dollar: string;
  time: string;
}

export interface EquityCurve {
  points: number[];
  total: number;
  pct: number;
}

export interface ProgressData {
  completed: number;
  total: number;
  modules: Record<string, number>;
}

export interface WalletMeta {
  id: WalletProvider;
  name: string;
  sub: string;
  network: Session['network'];
  colorClass: string;
  init: string;
}
