
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { UserStats } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getRank } from "@/lib/ranks";
import { DynamicIcon } from "@/lib/icons";
import { formatAddress, getEtherscanUrl } from "@/lib/utils";

interface UserIDCardProps {
    user: {
        name: string;
        address?: `0x${string}`;
    };
    stats: UserStats | null;
}

export function UserIDCard({ user, stats }: UserIDCardProps) {
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!user.address) return;
        navigator.clipboard.writeText(user.address);
        setIsCopied(true);
        toast({ title: "Address Copied!" });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const rank = stats ? getRank(stats.trustScore) : getRank(0);
    const userAvatar = user.address ? `https://api.dicebear.com/9.x/pixel-art/svg?seed=${user.address}` : `https://api.dicebear.com/9.x/pixel-art/svg?seed=default`;

    return (
        <Card className="w-full xl:w-80 flex-shrink-0 animate-slide-up">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50 shadow-lg">
                        <AvatarImage src={userAvatar} alt={user.name} />
                        <AvatarFallback>
                            <Skeleton className="w-full h-full" />
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                    {user.address && (
                        <div className="flex items-center gap-2 mt-1 font-mono text-xs text-muted-foreground">
                            <span>{formatAddress(user.address)}</span>
                            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleCopy}>
                                {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </Button>
                            <a href={getEtherscanUrl(user.address)} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center bg-secondary p-3 rounded-lg">
                        <span className="text-sm text-muted-foreground">Rank</span>
                        <div className="flex items-center gap-2">
                             <DynamicIcon name={rank.icon} className="w-4 h-4 text-primary" />
                             <span className="font-bold text-foreground">{rank.name}</span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center bg-secondary p-3 rounded-lg">
                        <span className="text-sm text-muted-foreground">Trust Score</span>
                        {stats ? (
                            <span className="font-bold text-foreground font-mono">{stats.trustScore.toFixed(2)}</span>
                        ) : (
                            <Skeleton className="h-5 w-16" />
                        )}
                    </div>
                    <div className="flex justify-between items-center bg-secondary p-3 rounded-lg">
                        <span className="text-sm text-muted-foreground">Accuracy</span>
                         {stats ? (
                            <span className="font-bold text-emerald-400 font-mono">{stats.accuracy.toFixed(2)}%</span>
                        ) : (
                            <Skeleton className="h-5 w-16" />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
