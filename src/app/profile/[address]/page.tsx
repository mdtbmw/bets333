

'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode.react';
import { Download, Share2, QrCode } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';
import type { UserStats, UserProfile } from '@/lib/types';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getRank, calculateUserStats } from '@/lib/ranks';
import { blockchainService } from '@/services/blockchain';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Camera } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { avatarSeeds } from '@/lib/state/profile';
import { Address } from 'viem';


const DossierCard = ({ user, stats }: { user: { name: string; address: string | undefined, avatarSeed: string }, stats: UserStats | null }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${user.address}` : '';
    const { isAdmin } = useAdmin();
    
    const userRank = useMemo(() => getRank(stats?.trustScore ?? 0), [stats]);
    const defaultUsername = useMemo(() => {
        if (user.name) return user.name;
        if (!user.address) return 'Anonymous';
        // Create a deterministic default name from the address
        const index = parseInt(user.address.slice(-4), 16) % avatarSeeds.length;
        return avatarSeeds[index];
    }, [user.name, user.address]);
    
    useEffect(() => {
        const card = cardRef.current;
        if (!card || !card.parentElement) return;

        const parent = card.parentElement;
        
        const handleMouseMove = (e: MouseEvent) => {
            const rect = parent.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 25; 
            const rotateY = (centerX - x) / 25;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        };

        const handleMouseLeave = () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        };
        
        if (window.matchMedia("(min-width: 1024px)").matches) {
            parent.addEventListener('mousemove', handleMouseMove);
            parent.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (parent) {
                parent.removeEventListener('mousemove', handleMouseMove);
                parent.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    return (
        <div className="perspective-[1000px]">
            <div id="profile-card" ref={cardRef} className="card-3d relative w-full aspect-[0.8] sm:aspect-auto xl:aspect-[0.7] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/60 bg-card group border border-border">
                <div className="absolute inset-0 bg-background/10 dark:bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] dark:opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/5 dark:to-black"></div>
                <div className="absolute inset-0 bg-holographic bg-[length:200%_200%] opacity-10 dark:opacity-20 group-hover:opacity-40 mix-blend-overlay animate-shimmer pointer-events-none"></div>

                <div className="relative z-10 p-6 md:p-8 flex flex-col items-center text-center h-full">
                    <div className="w-full flex justify-between items-start mb-6 md:mb-8">
                        <div className="px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{userRank.name} Tier</span>
                        </div>
                        {isAdmin && (
                            <div className="px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-md">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Admin</span>
                            </div>
                        )}
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                             <QrCode className="w-6 h-6 text-muted-foreground opacity-50 hover:opacity-100 hover:text-primary transition-opacity" />
                        </a>
                    </div>

                    <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-20 animate-pulse-slow"></div>
                        <div className="relative w-full h-full rounded-full p-[3px] bg-gradient-to-br from-primary to-zinc-800">
                            <img src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${user.avatarSeed}`} alt="Profile" className="rounded-full bg-background w-full h-full object-cover border-4 border-background"/>
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight mb-1">{defaultUsername}</h1>
                    <p className="text-muted-foreground text-sm font-mono mb-6">{user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : '...'}</p>

                    <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                        <div className="bg-background/40 p-4 rounded-2xl border border-border backdrop-blur-sm">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Trust Score</p>
                            <p className="text-xl md:text-2xl font-display font-bold text-foreground">{stats?.trustScore.toFixed(1) ?? '0.0'}</p>
                        </div>
                        <div className="bg-background/40 p-4 rounded-2xl border border-border backdrop-blur-sm">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Founded</p>
                             {isAdmin ? (
                                <p className="text-lg md:text-xl font-display font-bold text-primary">Intuition BETs</p>
                            ) : (
                                <p className="text-lg md:text-xl font-display font-bold text-muted-foreground">Block #1</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default function PublicProfilePage() {
    const { address: profileAddress } = useParams();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const addressString = useMemo(() => Array.isArray(profileAddress) ? profileAddress[0] : profileAddress, [profileAddress]);


    const fetchProfileData = useCallback(async () => {
        if (!addressString || typeof addressString !== 'string') {
            setError("Invalid user address.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [allEvents, userProfile] = await Promise.all([
                blockchainService.getAllEvents(),
                blockchainService.getProfile(addressString as Address)
            ]);

            setProfile(userProfile);

            if (allEvents.length === 0) {
                setStats({ wins: 0, losses: 0, totalBets: 0, accuracy: 0, trustScore: 0 });
            } else {
                const eventIds = allEvents.map(e => BigInt(e.id));
                const userBetsOnAllEvents = await blockchainService.getMultipleUserBets(eventIds, addressString as Address);
                const userStats = calculateUserStats(allEvents, userBetsOnAllEvents);
                setStats(userStats);
            }
        } catch (e: any) {
            console.error("Failed to fetch user profile data:", e);
            setError("Could not load profile data for this user.");
        } finally {
            setLoading(false);
        }
    }, [addressString]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full py-20">
                <Skeleton className="w-full max-w-sm aspect-[0.8] rounded-[2.5rem]" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full py-20">
                <Alert variant="destructive" className="max-w-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Profile</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto py-10 animate-slide-up">
            <PageHeader title="On-Chain Identity" description="A public record of this user's signal and performance." />
            <div className="mt-8">
                 <DossierCard user={{ name: profile?.username || '', address: addressString, avatarSeed: profile?.username || addressString || 'default' }} stats={stats} />
            </div>
        </div>
    )
}

    