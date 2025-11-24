
'use client';

import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect, useSwitchNetwork, useWeb3ModalState } from '@web3modal/ethers/react';
import { useIsMounted } from './use-is-mounted';
import { activeChain } from '@/lib/chains';
import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { useCallback, useState, useEffect } from 'react';

export function useWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
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

  const fetchBalance = useCallback(async () => {
    if (!address || !connected) return;

    setBalanceLoading(true);
    try {
      // Use a generic provider to fetch balance to avoid wallet interactions
      const provider = new JsonRpcProvider(activeChain.rpcUrls.default.http[0]);
      const balanceBigInt = await provider.getBalance(address);
      const balanceInEther = parseFloat(balanceBigInt.toString()) / 1e18;
      setBalance(balanceInEther);
    } catch (e) {
      console.error("Failed to fetch balance:", e);
      setBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  }, [address, connected]);
  
  useEffect(() => {
    if (connected) {
      fetchBalance();
    }
  }, [connected, fetchBalance]);


  const walletClient = walletProvider ? new BrowserProvider(walletProvider, chainId) : null;
  
  return {
    address,
    connected,
    isConnecting,
    chain: activeChain, // Simplified to always return activeChain config
    balance,
    balanceLoading,
    fetchBalance,
    connectWallet: open,
    disconnect,
    walletClient,
    wrongNetwork,
    switchChain: () => switchNetwork(activeChain.id),
  };
}
