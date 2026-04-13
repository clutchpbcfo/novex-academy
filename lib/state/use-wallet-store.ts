import { create } from 'zustand';
import type { Session } from '@/types';

interface WalletStore {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
