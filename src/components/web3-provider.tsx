
'use client';

import React, { ReactNode } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { activeChain } from '@/lib/chains';

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

export const ethersConfig = defaultConfig({
  metadata,
  defaultChainId: activeChain.id,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true, 
});

createWeb3Modal({
  ethersConfig,
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

export function Web3Provider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
