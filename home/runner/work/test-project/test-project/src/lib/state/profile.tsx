'use client';

import { atom, useAtom, SetStateAction, WritableAtom, Atom } from 'jotai';
import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import type { UserProfile } from '@/lib/types';
import { blockchainService } from '@/services/blockchain';
import { Address } from 'viem';

export const avatarSeeds = [
    'Daniel', 'Gizmo', 'Leo', 'Willow', 'Oliver', 'Lucy', 'Max', 'Zoe', 'Milo',
    'Cleo', 'Rocky', 'Chloe', 'Toby', 'Sophie', 'Cody', 'Lily', 'Buster', 'Mia', 'Duke',
    'Luna', 'Bear', 'Sadie', 'Murphy', 'Lola', 'Winston', 'Ruby', 'Zeus', 'Stella',
    'Apollo', 'Penny', 'Loki', 'Rosie', 'Thor', 'Coco', 'Odin', 'Daisy', 'Axel', 'Gracie',
    'Hercules', 'Phoebe', 'Finn', 'Nala', 'Gus', 'Izzy', 'Koda', 'Hazel', 'Bruno', 'Piper'
];

export const defaultProfile: UserProfile = {
  username: '',
  bio: '',
  twitter: '',
  website: '',
};

interface ProfileContextType {
  profileAtom: WritableAtom<UserProfile, [SetStateAction<UserProfile>], void>;
  isLoadingAtom: Atom<boolean>;
  fetchProfileAtom: WritableAtom<null, [], Promise<void>>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};

export const useProfile = () => {
    const { profileAtom, isLoadingAtom, fetchProfileAtom } = useProfileContext();
    const [profile] = useAtom(profileAtom);
    const [isLoading] = useAtom(isLoadingAtom);
    const [, fetchProfile] = useAtom(fetchProfileAtom);

    return { profile, isLoading, fetchProfile };
}

// Factory function to create atoms, ensuring they are recreated per user session
const createProfileAtoms = (address: Address | null | undefined): ProfileContextType => {
  const profileAtom = atom<UserProfile>(defaultProfile);
  const isLoadingAtom = atom<boolean>(true);
  
  const fetchProfileAtom = atom(
    null,
    async (get, set) => {
      if (!address) {
        set(profileAtom, defaultProfile);
        set(isLoadingAtom, false);
        return;
      }
      set(isLoadingAtom, true);
      try {
        const fetchedProfile = await blockchainService.getProfile(address);
        set(profileAtom, fetchedProfile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        set(profileAtom, defaultProfile); // Reset to default on error
      } finally {
        set(isLoadingAtom, false);
      }
    }
  );

  return {
      profileAtom,
      isLoadingAtom,
      fetchProfileAtom
  };
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, connected } = useWallet();
  
  // Re-create atoms when the address changes. This effectively resets state for a new user.
  const profileAtoms = useMemo(() => createProfileAtoms(address), [address]);

  const [, fetchProfile] = useAtom(profileAtoms.fetchProfileAtom);
  
  // Fetch profile when the provider mounts or when the user connects their wallet
  useEffect(() => {
    if (connected && address) {
      fetchProfile();
    }
  }, [connected, address, fetchProfile]);

  return (
    <ProfileContext.Provider value={profileAtoms}>
      {children}
    </ProfileContext.Provider>
  );
};
