
'use client';

import React from 'react';
import { ProfileProvider } from '@/lib/state/profile';
import { NotificationsProvider } from '@/lib/state/notifications';
import { HeaderStateProvider } from '@/lib/state/header';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { Provider as JotaiProvider } from 'jotai';
import MainLayout from './layout/main-layout';

const queryClient = new QueryClient();

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <JotaiProvider>
            <ProfileProvider>
              <NotificationsProvider>
                <HeaderStateProvider>
                  <MainLayout>
                    {children}
                  </MainLayout>
                </HeaderStateProvider>
              </NotificationsProvider>
            </ProfileProvider>
          </JotaiProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
}
