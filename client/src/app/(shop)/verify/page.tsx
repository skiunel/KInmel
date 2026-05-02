'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Search, ArrowRight, CheckCircle2, Lock, Zap } from 'lucide-react';

export default function VerifyIndexPage() {
  const [hash, setHash] = useState('');
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    router.push(`/verify/${hash.trim()}`);
  };

  return (
    <div className="min-h-[80vh] bg-[#FAFAF8] flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#16a34a]/[0.03] rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#22c55e] flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-[#16a34a]/20">
          <Shield className="w-8 h-8" />
        </div>
        
        <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-[#18181B] mb-4">
          Verify a Review
        </h1>
        <p className="text-[#71717a] text-lg mb-12 max-w-xl mx-auto">
          Every review on Kinmel is permanently recorded on the blockchain. Enter a review ID or transaction hash to view its cryptographic proof.
        </p>

        <form onSubmit={handleVerify} className="relative max-w-xl mx-auto mb-16">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
          <input 
            type="text" 
            placeholder="Enter review ID (e.g. 64abc123...)" 
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="w-full h-14 pl-12 pr-32 rounded-xl border border-[#e4e4e7] bg-white text-base outline-none focus:border-[rgba(22,163,74,0.4)] focus:shadow-[0_0_0_4px_rgba(22,163,74,0.08)] transition-all"
            required
          />
          <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 btn-primary !rounded-lg !px-6 !py-0 gap-2">
            Verify <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="card p-5">
            <Lock className="w-5 h-5 text-[#16a34a] mb-3" />
            <h3 className="font-bold text-sm text-[#18181B] mb-1">Tamper-proof</h3>
            <p className="text-xs text-[#71717a] leading-relaxed">Reviews are hashed and pinned to IPFS, ensuring content can never be altered.</p>
          </div>
          <div className="card p-5">
            <Zap className="w-5 h-5 text-[#f59e0b] mb-3" />
            <h3 className="font-bold text-sm text-[#18181B] mb-1">On-chain anchored</h3>
            <p className="text-xs text-[#71717a] leading-relaxed">Cryptographic proofs are anchored to the blockchain with public timestamps.</p>
          </div>
          <div className="card p-5">
            <CheckCircle2 className="w-5 h-5 text-[#3b82f6] mb-3" />
            <h3 className="font-bold text-sm text-[#18181B] mb-1">Publicly auditable</h3>
            <p className="text-xs text-[#71717a] leading-relaxed">Anyone can independently verify the authenticity of a review using our tools.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
