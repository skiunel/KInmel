'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Search, ArrowRight, Lock, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyIndexPage() {
  const [hash, setHash] = useState('');
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    router.push(`/verify/${hash.trim()}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden">
      <div className="orb orb-violet left-1/4 top-1/4 size-[28rem] opacity-30" />
      <div className="orb orb-cyan right-1/4 bottom-1/4 size-[22rem] opacity-20" />

      <div className="relative z-10 max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#8B7FFF] flex items-center justify-center text-white mx-auto mb-8 shadow-[0_8px_32px_rgba(108,99,255,0.5)]">
            <Shield className="w-8 h-8" />
          </div>

          <p className="font-mono text-xs uppercase tracking-widest text-[#6C63FF] mb-4">
            Blockchain Verification
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tight gradient-text mb-6">
            Verify a Review
          </h1>
          <p className="text-white/50 text-base mb-12 max-w-xl mx-auto leading-relaxed">
            Every review on Kinmel is permanently recorded on the blockchain.
            Enter a review ID or transaction hash to view its cryptographic proof.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleVerify}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-xl mx-auto mb-16"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            placeholder="Enter review ID (e.g. 64abc123...)"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="w-full h-14 pl-12 pr-32 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl text-white text-sm outline-none placeholder:text-white/30 focus:border-[#6C63FF]/50 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
            required
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 inline-flex items-center gap-2 px-5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #8B7FFF)', boxShadow: '0 4px 20px rgba(108,99,255,0.4)' }}
          >
            Verify <ArrowRight className="w-4 h-4" />
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left"
        >
          <div className="glass-card p-5">
            <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center mb-4">
              <Lock className="w-4 h-4 text-[#6C63FF]" />
            </div>
            <h3 className="font-bold text-sm text-white mb-2">Tamper-proof</h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Reviews are hashed and pinned to IPFS, ensuring content can never be altered.
            </p>
          </div>
          <div className="glass-card p-5">
            <div className="w-9 h-9 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center mb-4">
              <Zap className="w-4 h-4 text-[#FFD700]" />
            </div>
            <h3 className="font-bold text-sm text-white mb-2">On-chain anchored</h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Cryptographic proofs are anchored to the blockchain with public timestamps.
            </p>
          </div>
          <div className="glass-card p-5">
            <div className="w-9 h-9 rounded-xl bg-[#00F5FF]/10 border border-[#00F5FF]/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-4 h-4 text-[#00F5FF]" />
            </div>
            <h3 className="font-bold text-sm text-white mb-2">Publicly auditable</h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Anyone can independently verify the authenticity of a review using our tools.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
