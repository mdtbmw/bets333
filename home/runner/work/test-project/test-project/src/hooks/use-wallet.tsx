
'use client';

import { useAccount, useBalance, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { useIsMounted } from './use-is-mounted';
import { activeChain } from '@/lib/chains';

export function useWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();
  const { switchChain: wagmiSwitchChain } = useSwitchChain();
  const isMounted = useIsMounted();
  
  const { data: walletClient } = useWalletClient({ chainId: chainId });

  const { data: balanceData, isLoading: balanceLoading, refetch: fetchBalance } = useBalance({ 
    address,
  });

  const balance = balanceData ? parseFloat(balanceData.formatted) : 0;
  const connected = isMounted && isConnected;
  const wrongNetwork = isMounted && isConnected && chainId !== activeChain.id;

  return {
    address,
    connected,
    isConnecting: !isMounted && !isConnected,
    chain: isConnected ? activeChain : undefined,
    balance,
    balanceLoading,
    fetchBalance,
    connectWallet: open,
    disconnect,
    walletClient,
    wrongNetwork,
    switchChain: () => wagmiSwitchChain?.({ chainId: activeChain.id }),
  };
}
