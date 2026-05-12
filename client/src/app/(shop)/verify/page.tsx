'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
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
    <div className="relative min-h-screen bg-white pt-24 pb-24 border-b border-[#0A0A0A]/10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-12 gap-8 mb-16 lg:mb-24 items-end border-b border-[#0A0A0A]/10 pb-12"
        >
          <div className="lg:col-span-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-4">
              ◆ Public Ledger
            </p>
            <h1 className="font-sans font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.9] text-[clamp(3rem,9vw,7rem)]">
              Verify a review.
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[14px] leading-[1.55] text-[#0A0A0A]/65 max-w-md">
              Every review on Kinmel is signed by the buyer who placed the order
              and recorded permanently on chain. Paste a review ID or transaction hash.
            </p>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleVerify}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl mb-20 flex border border-[#0A0A0A]"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A0A0A]/40" />
            <input
              type="text"
              placeholder="review ID or 0x… tx hash"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="w-full h-14 pl-11 pr-4 bg-white text-[#0A0A0A] text-sm outline-none placeholder:text-[#0A0A0A]/35 font-mono"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-7 h-14 bg-[#0A0A0A] text-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#E63946] transition-colors"
          >
            Verify <ArrowRight className="w-4 h-4" />
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 border-t border-[#0A0A0A]/10"
        >
          {[
            {
              n: '001',
              title: 'Tamper-proof',
              body: 'Review content is hashed and pinned to IPFS. The text on chain cannot be silently altered.',
            },
            {
              n: '002',
              title: 'On-chain anchored',
              body: 'A cryptographic proof of every review is anchored to Polygon Amoy with a public timestamp.',
            },
            {
              n: '003',
              title: 'Publicly auditable',
              body: 'Anyone can independently verify a review without trusting Kinmel.',
            },
          ].map((step, idx, arr) => (
            <div
              key={step.n}
              className={`py-10 lg:py-14 lg:px-8 ${idx < arr.length - 1 ? 'border-b md:border-b-0 md:border-r border-[#0A0A0A]/10' : ''}`}
            >
              <div className="flex items-baseline justify-between mb-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40">
                  Note {step.n}
                </span>
                <span className="font-mono text-[10px] text-[#E63946]">◆</span>
              </div>
              <h3 className="font-sans text-2xl md:text-3xl font-black uppercase tracking-[-0.02em] text-[#0A0A0A] leading-none">
                {step.title}
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-[#0A0A0A]/60 max-w-xs">
                {step.body}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
