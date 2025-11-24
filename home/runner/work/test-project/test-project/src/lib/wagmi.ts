
'use client';

import { createWeb3Modal, defaultConfig } from '@web3modal/wagmi/react';
import { activeChain, chains } from '@/lib/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn("WalletConnect Project ID is not set. Mobile wallet connections will not work.");
}

const metadata = {
  name: 'Intuition BETs',
  description: 'A premium prediction arena.',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

export const wagmiConfig = defaultConfig({
  chains,
  projectId: projectId || 'dummy-project-id',
  metadata,
  ssr: true,
});

createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId: projectId || 'dummy-project-id',
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(var(--primary))',
    '--w3m-border-radius-master': '1rem',
    '--w3m-font-family': 'var(--font-space-grotesk)',
  },
  defaultChain: activeChain,
});
