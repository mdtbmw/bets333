
'use client';

import { createConfig, http } from 'wagmi';
import { activeChain, chains } from '@/lib/chains';
import { walletConnect, injected } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
if (!projectId) {
    console.warn("WalletConnect Project ID is not set. Mobile wallet connections will not work.");
}

const metadata = {
  name: 'Intuition BETs',
  description: 'A premium prediction arena.',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

export const wagmiConfig = createConfig({
  chains: chains,
  transports: {
    [activeChain.id]: http(),
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
  ],
  ssr: true,
});
