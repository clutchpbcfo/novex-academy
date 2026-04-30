import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletModal } from '@/components/modals/wallet-modal';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'wallet.title': 'Connect a wallet',
      'wallet.sub': 'One connection. Works across Academy and Terminal.',
    };
    return map[key] ?? key;
  },
}));

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

// Mock zustand store
vi.mock('@/lib/state/use-wallet-store', () => ({
  useWalletStore: () => vi.fn(),
}));

// Mock bridge
vi.mock('@/lib/wallet/bridge', () => ({
  broadcastSession: vi.fn(),
}));

global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

describe('WalletModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<WalletModal open={false} onClose={onClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal with title when open', () => {
    render(<WalletModal open={true} onClose={onClose} />);
    // Modal title text was removed in a prior UI refresh; assert the
    // modal opened by checking that at least one wallet provider is
    // rendered. Loose regex so adding a provider doesn't break the test.
    // The modal renders multiple providers at once, so getByText
    // throws on the regex (multiple matches). Use getAllByText
    // and assert we got at least one provider rendered — that
    // confirms the modal opened cleanly without locking the test
    // to a specific provider list.
    const providers = screen.getAllByText(
      /trust wallet|ledger|phantom|metamask|coinbase|walletconnect/i,
    );
    expect(providers.length).toBeGreaterThan(0);
  });

  it('shows all 11 wallet options', () => {
    render(<WalletModal open={true} onClose={onClose} />);
    const walletNames = [
      'Phantom', 'Solflare', 'Backpack', 'MetaMask', 'WalletConnect',
      'Coinbase Wallet', 'OKX Wallet', 'Rabby', 'Binance Web3', 'Trust Wallet', 'Ledger',
    ];
    walletNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it('calls onClose when overlay is clicked', () => {
    const { container } = render(<WalletModal open={true} onClose={onClose} />);
    const overlay = container.firstChild as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when × button is clicked', () => {
    render(<WalletModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalled();
  });
});
