
'use client';

import React from 'react';
import { ProfileProvider } from '@/lib/state/profile';
import { NotificationsProvider } from '@/lib/state/notifications';
import { HeaderStateProvider } from '@/lib/state/header';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';

const queryClient = new QueryClient();

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ProfileProvider>
                  <NotificationsProvider>
                    <HeaderStateProvider>
                        {children}
                    </HeaderStateProvider>
                  </NotificationsProvider>
                </ProfileProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
