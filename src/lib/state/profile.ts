
'use client';

import { atom, useAtom } from 'jotai';
import { useWallet } from '@/hooks/use-wallet';
import { useEffect } from 'react';
import { blockchainService } from '@/services/blockchain';
import { UserProfile } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// --- ATOMS ---

// The core atom for storing the user's profile data.
const profileAtom = atom<UserProfile>({
    address: undefined,
    username: undefined,
    avatar: undefined,
});

// A derived atom to check if the profile has been loaded.
export const isProfileLoadedAtom = atom((get) => !!get(profileAtom).address);


// --- HOOKS ---

/**
 * Custom hook for managing the user's profile.
 * It syncs with the wallet address and fetches profile data from the blockchain.
 * 
 * @returns An object containing the user's profile and a function to refetch it.
 */
export function useProfile() {
    const { address } = useWallet();
    const [profile, setProfile] = useAtom(profileAtom);
    const queryClient = useQueryClient();

    const { data: fetchedProfile, refetch } = useQuery({
        queryKey: ['userProfile', address],
        queryFn: async () => {
            if (!address) return null;
            return await blockchainService.getUserProfile(address);
        },
        enabled: !!address,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        if (address && fetchedProfile) {
            setProfile({
                address: address,
                username: fetchedProfile.username || undefined,
                avatar: fetchedProfile.avatarUrl || undefined,
            });
        } else if (address) {
            setProfile({ address });
        } else {
            setProfile({ address: undefined, username: undefined, avatar: undefined });
        }
    }, [address, fetchedProfile, setProfile]);

    const refetchProfile = () => {
        if (address) {
            queryClient.invalidateQueries({ queryKey: ['userProfile', address] });
        }
    };
    
    return { profile, refetchProfile };
}

// --- CONSTANTS ---

// A list of seed strings for generating deterministic avatars.
export const avatarSeeds = [
  "Intuition", "Oracle", "Signal", "Apex", "Clarity", "Genesis", "Vector", "Matrix",
  "Zenith", "Nadir", "Cipher", "Pulse", "Echo", "Mirage", "Chrono", "Nexus"
];
