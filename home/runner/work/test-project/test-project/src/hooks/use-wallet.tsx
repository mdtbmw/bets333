
'use client';

import { useWeb3Modal, useWeb3ModalProvider, useDisconnect, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useIsMounted } from './use-is-mounted';
import { activeChain } from '@/lib/chains';
import { BrowserProvider } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import { useAccount, useBalance, useSwitchChain } from 'wagmi';
import { formatEther } from 'viem';

export function useWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();
  const { switchChain: wagmiSwitchChain } = useSwitchChain();

  const [balance, setBalance] = useState(0);
  const isMounted = useIsMounted();

  const connected = isMounted && isConnected;
  const wrongNetwork = isMounted && isConnected && chainId !== activeChain.id;

  const { data: wagmiBalance, isLoading: isBalanceLoading, refetch } = useBalance({
    address,
  });

  useEffect(() => {
    if (wagmiBalance) {
      setBalance(Number(formatEther(wagmiBalance.value)));
    } else {
      setBalance(0);
    }
  }, [wagmiBalance]);

  const fetchBalance = useCallback(() => {
    if (address) {
      refetch();
    }
  }, [address, refetch]);
  
  const switchChain = useCallback(() => {
      if (wagmiSwitchChain) {
          wagmiSwitchChain({ chainId: activeChain.id });
      } else {
          open({ view: 'Networks' });
      }
  }, [wagmiSwitchChain, open]);


  const walletClient = walletProvider ? new BrowserProvider(walletProvider, chainId) : null;
  
  return {
    address,
    connected,
    isConnecting: false, // isConnecting is not directly available in wagmi v2, can be derived if needed
    chain: activeChain,
    balance,
    balanceLoading: isBalanceLoading,
    fetchBalance,
    connectWallet: open,
    disconnect,
    walletClient,
    wrongNetwork,
    switchChain,
  };
}
