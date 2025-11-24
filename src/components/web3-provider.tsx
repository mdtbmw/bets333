
'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { activeChain } from '@/lib/chains';

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect will not function correctly.');
}

// 1. Create modal
createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(var(--primary))',
    '--w3m-border-radius-master': '1rem',
    '--w3m-font-family': 'var(--font-space-grotesk)',
  },
  defaultChain: activeChain,
});


export function Web3Provider({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
