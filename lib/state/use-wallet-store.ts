import { create } from 'zustand';
import type { Session } from '@/types';

interface WalletStore {
  session: Session | null;
  setSession: (session: Session | null) => void;
  walletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  walletModalOpen: false,
  setWalletModalOpen: (open) => set({ walletModalOpen: open }),
}));
