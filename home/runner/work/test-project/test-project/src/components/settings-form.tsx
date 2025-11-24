
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile, defaultProfile } from '@/lib/state/profile';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Trash2, Shield, Palette, Upload, Download, Moon, Sun, Camera, Lock, Twitter, Link as LinkIcon, Sliders, Save, Monitor, Smartphone, AlertOctagon, Check, Plus, LogOut, UserCog, ShieldCheck, QrCode, Wallet, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/use-wallet';
import { blockchainService } from '@/services/blockchain';
import { UserStats, UserProfile } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { AvatarSelectionDialog } from './profile/avatar-selection-dialog';
import { getRank, calculateUserStats } from '@/lib/ranks';
import { Address } from 'viem';


const DossierCard = ({ user, stats, onAvatarClick }: { user: { name: string; address: string | undefined, avatarSeed: string }, stats: UserStats | null, onAvatarClick: () => void }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${user.address}` : '';
    
    const userRank = useMemo(() => getRank(stats?.trustScore ?? 0), [stats]);
    
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
        <>
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
                        <QrCode className="w-6 h-6 text-muted-foreground opacity-50" />
                    </div>

                    <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-20 animate-pulse-slow"></div>
                        <div className="relative w-full h-full rounded-full p-[3px] bg-gradient-to-br from-primary to-zinc-800">
                            <img src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${user.avatarSeed}`} alt="Profile" className="rounded-full bg-background w-full h-full object-cover border-4 border-background"/>
                        </div>
                        <button onClick={onAvatarClick} className="absolute bottom-0 right-0 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center shadow-lg border-2 border-background cursor-pointer active-press transition-transform hover:scale-110">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight mb-1">{user.name || 'Anonymous Signal'}</h1>
                    <p className="text-muted-foreground text-sm font-mono mb-6">{user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : '...'}</p>

                    <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                        <div className="bg-background/40 p-4 rounded-2xl border border-border backdrop-blur-sm">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Trust Score</p>
                            <p className="text-xl md:text-2xl font-display font-bold text-foreground">{stats?.trustScore.toFixed(1) ?? '0.0'}</p>
                        </div>
                        <div className="bg-background/40 p-4 rounded-2xl border border-border backdrop-blur-sm">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Founded</p>
                            <p className="text-lg md:text-xl font-display font-bold text-muted-foreground">Intuition BETs</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all whitespace-nowrap tab-btn", active ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
        {label}
    </button>
)

export function SettingsForm() {
  const { profile, isLoading: isProfileLoading, fetchProfile } = useProfile();
  const { toast } = useToast();
  const { address, walletClient } = useWallet();

  const [activeTab, setActiveTab] = useState('general');
  const [localProfile, setLocalProfile] = useState<UserProfile>(defaultProfile);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);


  // When the on-chain profile loads, update our local form state
  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);
  
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAvatarSave = (newUsername: string) => {
    setLocalProfile(prev => ({ ...prev, username: newUsername }));
  }

  // Fetch user stats for the dossier
  const fetchUserStats = useCallback(async () => {
    if (!address) {
        setStatsLoading(false);
        return;
    };
    setStatsLoading(true);
    try {
        const allEvents = await blockchainService.getAllEvents();
        if (allEvents.length === 0) {
            setStats({ wins: 0, losses: 0, totalBets: 0, accuracy: 0, trustScore: 0 });
            setStatsLoading(false);
            return;
        }
        const eventIds = allEvents.map(e => BigInt(e.id));
        
        if (eventIds.length === 0) {
          setStats({ wins: 0, losses: 0, totalBets: 0, accuracy: 0, trustScore: 0 });
          return;
        }

        const userBetsOnAllEvents = await blockchainService.getMultipleUserBets(eventIds, address as Address);
        const newStats = calculateUserStats(allEvents, userBetsOnAllEvents);
        setStats(newStats);

    } catch (e) {
      console.error("Failed to fetch user stats for settings page:", e);
    } finally {
      setStatsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);


  const handleSaveGeneral = async () => {
    if (!walletClient || !address) {
        toast({ title: "Wallet not connected", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
        const txHash = await blockchainService.setProfile(walletClient, address, localProfile);
        toast({
            title: "Updating On-Chain Profile...",
            description: "Your transaction has been submitted. Please wait for confirmation.",
        });
        await blockchainService.waitForTransaction(txHash);
        await fetchProfile(); // Re-fetch the profile from the blockchain
        toast({
            title: "Identity Synchronized",
            description: "Your on-chain profile has been updated.",
        });
    } catch(e: any) {
        toast({
            title: "Error Saving Profile",
            description: e.message || "An unknown error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };


  const handleBurnProtocol = () => {
      toast({
          variant: "destructive",
          title: "Action Not Available",
          description: "This is a high-risk action and has been disabled in this interface."
      })
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start animate-slide-up">
        <div className="w-full xl:w-2/5 space-y-6">
            <DossierCard user={{ name: localProfile.username, address, avatarSeed: localProfile.username || address || 'default' }} stats={stats} onAvatarClick={() => setIsAvatarDialogOpen(true)} />
             <div className="bg-card/60 dark:glass-panel p-6 rounded-[2rem] border backdrop-blur-md">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Signal Nodes</h3>
                <div className="space-y-3">
                    <a href={localProfile.twitter ? `https://twitter.com/${localProfile.twitter}`: '#'} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all active-press group">
                        <Twitter className="w-4 h-4" />
                        <span className="text-xs font-bold">{localProfile.twitter ? `@${localProfile.twitter}` : 'Not Set'}</span>
                    </a>
                    <a href={localProfile.website || '#'} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all active-press">
                        <LinkIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">{localProfile.website || 'Not Set'}</span>
                    </a>
                </div>
            </div>
        </div>

        <div className="w-full xl:w-3/5 space-y-6">
             <div className="p-1.5 rounded-2xl bg-card border flex flex-wrap gap-1 max-w-full">
                <TabButton label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                <TabButton label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                <TabButton label="API Keys" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
            </div>

            {activeTab === 'general' && (
                <div className="bg-card/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-6 md:p-8 space-y-8 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    <div className="flex items-center justify-between border-b border-border pb-6">
                        <div>
                            <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-primary" /> On-Chain Identity
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">Configure your public-facing profile and identity. Changes require a transaction.</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" onClick={() => setIsAvatarDialogOpen(true)}>
                                <Camera className="w-5 h-5"/>
                            </Button>
                            <button onClick={handleSaveGeneral} disabled={isSaving || isProfileLoading} className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {isProfileLoading ? (
                        <div className="space-y-6">
                            <div className="h-16 bg-secondary rounded-lg animate-pulse" />
                            <div className="h-24 bg-secondary rounded-lg animate-pulse" />
                            <div className="grid grid-cols-2 gap-4">
                               <div className="h-16 bg-secondary rounded-lg animate-pulse" />
                               <div className="h-16 bg-secondary rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Display Name</label>
                                <span className="text-[9px] text-emerald-500 font-mono hidden group-focus-within:block">EDITABLE</span>
                            </div>
                            <div className="relative input-glow rounded-xl transition-all bg-background/50 dark:bg-black/40 border border-border group-focus-within:bg-background dark:group-focus-within:bg-black/60">
                                <Input type="text" value={localProfile.username} onChange={(e) => handleInputChange('username', e.target.value)} className="w-full bg-transparent border-none rounded-xl px-4 py-3 text-foreground focus:outline-none font-medium font-mono" />
                            </div>
                        </div>
                        <div className="space-y-2 group">
                             <div className="flex justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Handle</label>
                                <span className="text-[9px] text-zinc-600 font-mono">LOCKED</span>
                            </div>
                            <div className="relative rounded-xl transition-all bg-secondary border border-border opacity-70 cursor-not-allowed">
                                <Input type="text" value={`@${(address || '...').slice(2, 8)}`} disabled className="w-full bg-transparent border-none rounded-xl px-4 py-3 text-muted-foreground focus:outline-none font-mono text-sm cursor-not-allowed"/>
                                <Lock className="absolute right-4 top-3.5 w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>
                         <div className="col-span-full space-y-2 group">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Manifesto (Bio)</label>
                                <span className="text-[9px] font-mono text-muted-foreground">{localProfile.bio.length} / 256 CHARS</span>
                            </div>
                            <div className="relative input-glow rounded-xl transition-all bg-background/50 dark:bg-black/40 border border-border group-focus-within:bg-background dark:group-focus-within:bg-black/60">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                <Textarea rows={3} value={localProfile.bio} onChange={e => handleInputChange('bio', e.target.value)} maxLength={256} className="w-full bg-transparent border-none rounded-xl px-4 py-3 text-foreground focus:outline-none text-sm leading-relaxed resize-none font-mono" />
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Twitter Handle</label>
                            </div>
                            <div className="relative input-glow rounded-xl transition-all bg-background/50 dark:bg-black/40 border border-border group-focus-within:bg-background dark:group-focus-within:bg-black/60">
                                <div className="absolute top-0 left-3 h-full flex items-center text-muted-foreground group-focus-within:text-primary">@</div>
                                <Input type="text" value={localProfile.twitter} onChange={(e) => handleInputChange('twitter', e.target.value)} className="w-full bg-transparent border-none rounded-xl pl-8 pr-4 py-3 text-foreground focus:outline-none font-medium font-mono" />
                            </div>
                        </div>
                         <div className="space-y-2 group">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">Website</label>
                            </div>
                            <div className="relative input-glow rounded-xl transition-all bg-background/50 dark:bg-black/40 border border-border group-focus-within:bg-background dark:group-focus-within:bg-black/60">
                                 <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                <Input type="text" value={localProfile.website} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="https://..." className="w-full bg-transparent border-none rounded-xl pl-9 pr-4 py-3 text-foreground focus:outline-none font-medium font-mono" />
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            )}

            {activeTab === 'security' && (
                 <div className="bg-card/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 space-y-6">
                     <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2 border-b border-border pb-6">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" /> Security Matrix
                    </h2>
                    <div className="p-4 rounded-2xl bg-secondary border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-border/80 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors border">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Primary Ledger</p>
                                <p className="text-xs font-mono text-muted-foreground">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'} <span className="text-emerald-500 ml-2 text-[9px]">● CONNECTED</span></p>
                            </div>
                        </div>
                        <Button variant="outline" className="px-4 py-2 rounded-lg border-border text-xs font-bold text-muted-foreground hover:bg-accent transition-colors active-press">Manage Keys</Button>
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500"><Lock className="w-4 h-4" /></div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Biometric 2FA</p>
                                <p className="text-[10px] text-emerald-400/70">Hardware Enforced</p>
                            </div>
                        </div>
                        <input type="checkbox" className="cyber-toggle" checked readOnly />
                    </div>
                    <div className="p-6 rounded-[2rem] border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors mt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-destructive mb-1 uppercase tracking-widest flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> Danger Zone</h3>
                                <p className="text-[10px] text-muted-foreground">Deactivate identity signal. Irreversible.</p>
                            </div>
                            <Button variant="destructive" onClick={handleBurnProtocol} className="px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold hover:bg-destructive hover:text-white transition-colors active-press">Burn Protocol</Button>
                        </div>
                    </div>
                 </div>
            )}
            
            {activeTab === 'api' && (
                <div className="bg-card/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 text-center text-muted-foreground">
                    <p>API Key management is coming soon.</p>
                </div>
            )}
        </div>
        <AvatarSelectionDialog isOpen={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen} onSave={handleAvatarSave} />
    </div>
  );
}

    