
'use client';

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { activeChain } from './chains';
import React from 'react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

const metadata = {
  name: 'Intuition BETs',
  description: 'A premium prediction arena.',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

export const config = createConfig({
  chains: [activeChain],
  transports: {
    [activeChain.id]: http()
  },
});

createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: activeChain.id,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
  }),
  chains: [activeChain],
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(var(--primary))',
    '--w3m-border-radius-master': '1rem',
    '--w3m-font-family': 'var(--font-space-grotesk)',
  },
});
