
'use client';

import { useWallet } from '@/hooks/use-wallet';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Award, Swords, Shield, BarChart2 } from 'lucide-react';
import { blockchainService } from '@/services/blockchain';
import type { Event, UserProfile as UserProfileType, UserStats } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserIDCard } from '@/components/profile/user-id-card';
import { BetHistoryTable } from '@/components/profile/bet-history-table';
import { calculateUserStats } from '@/lib/ranks';

export default function ProfilePage({ params }: { params: { address: `0x${string}` } }) {
    const viewingAddress = params.address;
    const { address: connectedAddress } = useWallet();
    const router = useRouter();

    const [stats, setStats] = useState<UserStats | null>(null);

    const isOwnProfile = useMemo(() => connectedAddress?.toLowerCase() === viewingAddress.toLowerCase(), [connectedAddress, viewingAddress]);

    const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery<UserProfileType | null>({
        queryKey: ['userProfile', viewingAddress],
        queryFn: () => blockchainService.getUserProfile(viewingAddress),
        enabled: !!viewingAddress,
    });
    
    const { data: userHistory, isLoading: isHistoryLoading, error: historyError } = useQuery({
        queryKey: ['userBetHistory', viewingAddress],
        queryFn: async () => {
             const allEvents = await blockchainService.getAllEvents();
             if (allEvents.length === 0) return [];
             
             const eventIds = allEvents.map(e => BigInt(e.id));
             const userBets = await blockchainService.getMultipleUserBets(viewingAddress, eventIds);

             const history = allEvents.map((event, index) => ({
                 event,
                 bet: userBets[index]
             })).filter(item => item.bet && (item.bet.yesAmount > 0n || item.bet.noAmount > 0n));
             
             const newStats = calculateUserStats(allEvents, userBets);
             setStats(newStats);

             return history;
        },
        enabled: !!viewingAddress
    });

    const username = useMemo(() => profile?.username || `${viewingAddress.slice(0, 6)}...${viewingAddress.slice(-4)}`, [profile, viewingAddress]);
    const userAvatar = useMemo(() => profile?.avatarUrl || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${viewingAddress}`, [profile, viewingAddress]);
    
    const isLoading = isProfileLoading || isHistoryLoading;
    const error = profileError || historyError;

    if (error) {
        return (
             <div className="space-y-6">
                <PageHeader
                    title="User Not Found"
                    description="The requested user profile could not be loaded."
                />
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Profile Error</AlertTitle>
                    <AlertDescription>
                        There was an error fetching the profile data for this address. It's possible the user does not exist or there was a network issue.
                    </AlertDescription>
                </Alert>
             </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row-reverse gap-8 items-start">
                 <UserIDCard user={{ name: username, address: viewingAddress }} stats={stats} />

                 <div className="flex-1 w-full space-y-8">
                    <Card className="w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <CardHeader>
                            <CardTitle>Betting History</CardTitle>
                            <CardDescription>A complete record of all bets placed by this user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <BetHistoryTable history={userHistory ?? []} isLoading={isLoading} />
                        </CardContent>
                    </Card>

                    {isOwnProfile && (
                         <Card className="w-full animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                                <CardDescription>Customize your public-facing identity.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <Button onClick={() => router.push('/profile/edit')}>Edit My Profile</Button>
                            </CardContent>
                        </Card>
                    )}
                 </div>
            </div>
        </div>
    );
}
