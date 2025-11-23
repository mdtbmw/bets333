'use client';

import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, LogOut } from 'lucide-react';

export function AppHeader() {
  const [isConnected, setIsConnected] = useState(false);

  // Mock user data
  const user = {
    name: 'Alex Mercer',
    trustScore: 1250,
    avatar: 'https://picsum.photos/seed/user-avatar/40/40',
    initials: 'AM',
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex w-full items-center justify-end gap-4">
        {isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 rounded-full">
                <div className="flex items-center gap-3">
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Trust Score: {user.trustScore}
                    </p>
                  </div>
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsConnected(false)}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect Wallet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => setIsConnected(true)}>Connect Wallet</Button>
        )}
      </div>
    </header>
  );
}
