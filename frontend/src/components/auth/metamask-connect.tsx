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
        className={`flex items-center gap-2 justify-center px-4 py-3 border border-[#0A0A0A]/15 bg-[#F4F4F4] text-sm ${className ?? ''}`}
      >
        <span className="text-lg">🦊</span>
        <span className="font-mono text-[#0A0A0A]">{shortenAddress(address)}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/55">connected</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isConnecting}
        className="w-full flex items-center justify-center gap-2 px-4 h-12 border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] font-mono text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-[#0A0A0A] hover:text-white disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connecting…
          </>
        ) : (
          <>
            <span className="text-lg">🦊</span>
            {isMetaMaskInstalled ? 'Connect MetaMask' : 'Install MetaMask'}
          </>
        )}
      </button>
      {error && <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{error}</p>}
    </div>
  );
}
