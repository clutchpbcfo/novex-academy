import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '@/types';

const DEFAULT_PROFILE: Profile = {
  displayName: '',
  handle: '',
  bio: '',
  avatarBg: 'cyan-purple',
  avatarInitials: '',
  avatarEmoji: '🥷',
};

interface ProfileStore {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: 'novex-profile',
    },
  ),
);
