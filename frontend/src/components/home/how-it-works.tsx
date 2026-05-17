'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { n: '001', title: 'Buy', body: 'Pick something. Pay with eSewa, Khalti, or cash on delivery.' },
  { n: '002', title: 'Use', body: 'Receive. Live with it. Form an actual opinion.' },
  { n: '003', title: 'Sign', body: 'Write a review. Sign it with your wallet. It enters the public ledger.' },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-16 lg:py-24 border-b border-[#0A0A0A]/10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-8 mb-12 items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946] mb-3">
              ◆ Method
            </p>
            <h2 className="font-sans font-black uppercase tracking-[-0.03em] text-[clamp(2rem,5vw,4rem)] text-[#0A0A0A] leading-[0.95]">
              Three steps.
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[14px] leading-[1.55] text-[#0A0A0A]/65 max-w-md">
              No paid placements. No vanishing comments. No incentivised five-stars.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#0A0A0A]/10">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`py-10 lg:py-14 lg:px-8 ${idx < STEPS.length - 1 ? 'border-b md:border-b-0 md:border-r border-[#0A0A0A]/10' : ''}`}
            >
              <div className="flex items-baseline justify-between mb-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40">
                  Step {step.n}
                </span>
                <span className="font-mono text-[10px] text-[#E63946]">◆</span>
              </div>
              <h3 className="font-sans text-3xl md:text-4xl font-black uppercase tracking-[-0.02em] text-[#0A0A0A] leading-none">
                {step.title}
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-[#0A0A0A]/60 max-w-xs">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[#0A0A0A]/10 flex flex-wrap items-baseline justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40">
            Signed on Polygon Amoy · Public ledger
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40">
            K · 2026
          </p>
        </div>
      </div>
    </section>
  );
}
