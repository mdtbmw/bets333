
'use client';

import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect, useSwitchNetwork, useWeb3ModalState } from '@web3modal/ethers/react';
import { useIsMounted } from './use-is-mounted';
import { activeChain } from '@/lib/chains';
import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import { useAccount, useBalance as useWagmiBalance } from 'wagmi';
import { formatEther } from 'viem';

export function useWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();
  const { open: isModalOpen } = useWeb3ModalState();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const isMounted = useIsMounted();

  const isConnecting = isModalOpen && !isConnected;

  const connected = isMounted && isConnected;
  const wrongNetwork = isMounted && isConnected && chainId !== activeChain.id;

  const { data: wagmiBalance, isLoading: isBalanceLoading, refetch } = useWagmiBalance({
    address,
  });

  useEffect(() => {
    if (wagmiBalance) {
      setBalance(Number(formatEther(wagmiBalance.value)));
    }
  }, [wagmiBalance]);

  const fetchBalance = useCallback(() => {
    refetch();
  }, [refetch]);

  const walletClient = walletProvider ? new BrowserProvider(walletProvider, chainId) : null;
  
  return {
    address,
    connected,
    isConnecting,
    chain: activeChain,
    balance,
    balanceLoading: isBalanceLoading,
    fetchBalance,
    connectWallet: open,
    disconnect,
    walletClient,
    wrongNetwork,
    switchChain: () => switchNetwork ? switchNetwork(activeChain.id) : open({ view: 'Networks' }),
  };
}
