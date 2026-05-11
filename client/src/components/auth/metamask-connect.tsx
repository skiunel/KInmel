'use client';

import { Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { shortenAddress } from '@/lib/runtime-config';

interface MetaMaskConnectProps {
  onConnect?: (address: string) => void;
  className?: string;
}

export function MetaMaskConnect({ onConnect, className }: MetaMaskConnectProps) {
  const { address, isConnected, isConnecting, isMetaMaskInstalled, error, connect } =
    useWallet();

  const handleClick = async () => {
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    const addr = await connect();
    if (addr && onConnect) onConnect(addr);
  };

  if (isConnected && address) {
    return (
      <div
        className={`flex items-center gap-2 justify-center px-4 py-3 rounded-xl border border-[#00FF88]/30 bg-[#00FF88]/[0.08] text-sm ${className ?? ''}`}
      >
        <span className="text-lg">🦊</span>
        <span className="font-mono text-[#00FF88]">{shortenAddress(address)}</span>
        <span className="text-xs text-white/40">connected</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isConnecting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#6C63FF]/40 bg-[#6C63FF]/[0.08] text-white font-semibold transition-all hover:bg-[#6C63FF]/15 hover:shadow-[0_0_24px_rgba(108,99,255,0.4)] hover:border-[#6C63FF]/60 disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <span className="text-lg">🦊</span>
            {isMetaMaskInstalled ? 'Connect MetaMask Wallet' : 'Install MetaMask'}
          </>
        )}
      </button>
      {error && <p className="mt-2 text-xs text-[#FF6B6B]">{error}</p>}
    </div>
  );
}
