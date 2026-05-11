'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    n: '001',
    title: 'Acquire',
    body: 'Browse a small catalogue. Order. Pay how you prefer — card, eSewa, Khalti, on delivery.',
  },
  {
    n: '002',
    title: 'Receive',
    body: 'Use the object. Live with it. Form an actual opinion. There is no rush to review.',
  },
  {
    n: '003',
    title: 'Sign',
    body: 'When you write a review, you sign it. It becomes part of a public ledger that no one — not us — can quietly edit.',
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-[#0B0B0D] py-24 sm:py-32 border-t border-[#EDE7DA]/8">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-6 mb-20">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF3D00] mb-6">
              ◆ 003 / The Method
            </p>
            <h2 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-[-0.04em] leading-[0.88] text-[#EDE7DA]">
              How
              <br />
              <span className="italic font-light">it</span> works.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pt-10">
            <p className="text-[15px] leading-[1.7] text-[#EDE7DA]/65 max-w-md">
              No paid placements. No vanishing comments. No incentivised five-stars.
              A buyer writes, signs, and that is the record.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#EDE7DA]/8">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className={`py-12 lg:py-16 lg:px-10 px-6 ${idx < STEPS.length - 1 ? 'border-b md:border-b-0 md:border-r border-[#EDE7DA]/8' : ''}`}
            >
              <div className="flex items-baseline justify-between mb-12">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#EDE7DA]/40">
                  Step {step.n}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#FF3D00]">◆</span>
              </div>
              <h3 className="font-heading text-4xl md:text-5xl font-black uppercase tracking-[-0.02em] text-[#EDE7DA] leading-none">
                {step.title}
              </h3>
              <p className="mt-6 text-sm leading-relaxed text-[#EDE7DA]/55 max-w-xs">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-16 pt-8 border-t border-[#EDE7DA]/8 flex flex-wrap items-baseline justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#EDE7DA]/40">
            Signatures verified on a public chain · Polygon Amoy
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#EDE7DA]/40">
            K / 2026
          </p>
        </div>
      </div>
    </section>
  );
}
