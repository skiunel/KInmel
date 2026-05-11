'use client';

import { useCallback, useEffect, useState } from 'react';
import { POLYGON_AMOY_CHAIN_ID_HEX, POLYGON_AMOY_RPC_URL } from '@/lib/runtime-config';

type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isMetaMaskInstalled: boolean;
  error: string | null;
}

const POLYGON_AMOY_PARAMS = {
  chainId: POLYGON_AMOY_CHAIN_ID_HEX,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: [POLYGON_AMOY_RPC_URL],
  blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    isMetaMaskInstalled: false,
    error: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const installed = !!window.ethereum?.isMetaMask;
    setState((s) => ({ ...s, isMetaMaskInstalled: installed }));

    if (!installed || !window.ethereum) return;

    const checkConnection = async () => {
      try {
        const accounts = (await window.ethereum!.request({
          method: 'eth_accounts',
        })) as string[];
        const chainId = (await window.ethereum!.request({
          method: 'eth_chainId',
        })) as string;

        if (accounts.length > 0) {
          setState((s) => ({
            ...s,
            address: accounts[0],
            chainId,
            isConnected: true,
          }));
        }
      } catch {
        // Silent — user not connected yet
      }
    };

    void checkConnection();

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setState((s) => ({ ...s, address: null, isConnected: false }));
      } else {
        setState((s) => ({ ...s, address: accounts[0], isConnected: true }));
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = args[0] as string;
      setState((s) => ({ ...s, chainId }));
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((s) => ({
        ...s,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return null;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts.length === 0) throw new Error('No accounts returned');

      const chainId = (await window.ethereum.request({
        method: 'eth_chainId',
      })) as string;

      setState({
        address: accounts[0],
        chainId,
        isConnected: true,
        isConnecting: false,
        isMetaMaskInstalled: true,
        error: null,
      });
      return accounts[0];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setState((s) => ({ ...s, isConnecting: false, error: message }));
      return null;
    }
  }, []);

  const switchToAmoy = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CHAIN_ID_HEX }],
      });
      return true;
    } catch (err) {
      const error = err as { code?: number };
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_AMOY_PARAMS],
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }, []);

  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!window.ethereum) return null;
      try {
        // Re-fetch current accounts directly — state.address may be stale
        // if called immediately after connect() before React re-renders.
        const accounts = (await window.ethereum.request({
          method: 'eth_accounts',
        })) as string[];
        const address = accounts[0] ?? state.address;
        if (!address) return null;
        const signature = (await window.ethereum.request({
          method: 'personal_sign',
          params: [message, address],
        })) as string;
        return signature;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Signature failed';
        setState((s) => ({ ...s, error: errMsg }));
        return null;
      }
    },
    [state.address]
  );

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      isMetaMaskInstalled: state.isMetaMaskInstalled,
      error: null,
    });
  }, [state.isMetaMaskInstalled]);

  const isOnAmoy = state.chainId === POLYGON_AMOY_CHAIN_ID_HEX;

  return {
    ...state,
    isOnAmoy,
    connect,
    disconnect,
    switchToAmoy,
    signMessage,
  };
}
