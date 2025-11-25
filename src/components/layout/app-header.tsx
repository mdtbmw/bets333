
'use client';

import { useSetAtom } from 'jotai';
import { sidebarOpenAtom } from '@/lib/state/header';
import { Menu, X } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DynamicIcon } from '@/lib/icons';
import Link from 'next/link';
import { useProfile } from '@/hooks/use-profile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';


const UserMenu = () => {
  const { address, disconnect, shortAddress } = useWallet();
  const { profile } = useProfile();

  if (!address) {
    return null;
  }
  
  const displayName = profile.username || shortAddress;
  const userAvatar = profile.avatar || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${address}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="w-8 h-8 border-2 border-primary/50">
            <AvatarImage src={userAvatar} alt={displayName} />
            <AvatarFallback>
              <DynamicIcon name="User" className="w-4 h-4 text-muted-foreground"/>
            </AvatarFallback>
          </Avatar>
           <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-bold text-foreground leading-tight">{displayName}</span>
              <span className="text-xs text-muted-foreground leading-tight font-mono">{shortAddress}</span>
           </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/profile/${address}`}>
            <DynamicIcon name="UserCircle" className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
         <DropdownMenuItem asChild>
          <Link href="/achievements">
            <DynamicIcon name="Trophy" className="mr-2 h-4 w-4" />
            <span>My Artifacts</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}>
          <DynamicIcon name="LogOut" className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const AppHeader = () => {
  const setSidebarOpen = useSetAtom(sidebarOpenAtom);
  const { connected, connect } = useWallet();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <DynamicIcon name="PocketKnife" className="h-6 w-6 text-primary" />
              <span className="inline-block font-bold text-lg">Intuition</span>
            </Link>
             <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </button>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {connected ? (
              <UserMenu />
            ) : (
              <Button onClick={() => connect()}>Connect Wallet</Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
