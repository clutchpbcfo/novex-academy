import { create } from 'zustand';
import type { Profile } from '@/types';

const DEFAULT_PROFILE: Profile = {
  displayName: 'Clutch',
  handle: 'clutch.novex',
  bio: 'Regime-aware perp trader. Only choppy, only premium. SENSEI v7.7 on 5m.',
  avatarBg: 'cyan-purple',
  avatarInitials: 'CL',
  twitter: '@clutch_novex',
  discord: 'clutch#0001',
};

interface ProfileStore {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: DEFAULT_PROFILE,
  setProfile: (profile) => set({ profile }),
}));
