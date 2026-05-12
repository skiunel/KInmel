import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Create Account | Kinmel',
  description: 'Join Kinmel and start shopping with signed reviews.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12 bg-white">
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden font-sans text-base font-black uppercase tracking-[-0.02em] text-[#0A0A0A]">
          Kinmel<span className="text-[#E63946]">®</span>
        </Link>

        <div className="w-full max-w-sm">
          <RegisterForm />
        </div>
      </div>

      {/* Right brand panel */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col relative bg-[#F4F4F4] border-l border-[#0A0A0A]/10">
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <Link href="/" className="font-sans text-lg font-black uppercase tracking-[-0.02em] text-[#0A0A0A]">
            Kinmel<span className="text-[#E63946]">®</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-5">
              ◆ Join the catalogue
            </p>
            <h1 className="font-sans font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.9] text-[clamp(2.5rem,5vw,4.5rem)] mb-6">
              Shop with proof.
            </h1>
            <p className="text-[#0A0A0A]/60 text-base leading-relaxed max-w-sm">
              Create your account and join thousands of buyers who trust Kinmel&apos;s signed reviews.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-px bg-[#0A0A0A]/10 border border-[#0A0A0A]/10">
              {[
                { val: '10K+', label: 'Signed reviews' },
                { val: '99%', label: 'Satisfaction' },
                { val: '0', label: 'Fake stars' },
              ].map((s) => (
                <div key={s.label} className="bg-[#F4F4F4] p-5 text-center">
                  <p className="font-sans text-3xl font-black tracking-[-0.03em] text-[#0A0A0A]">{s.val}</p>
                  <p className="text-[10px] text-[#0A0A0A]/45 mt-1 uppercase tracking-[0.22em] font-mono">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {['MetaMask', 'Polygon Amoy', 'SSL', 'GDPR'].map((b) => (
                <span
                  key={b}
                  className="border border-[#0A0A0A]/15 bg-white px-3 py-1 text-[10px] font-mono text-[#0A0A0A]/65 uppercase tracking-[0.18em]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40">
            © {new Date().getFullYear()} Kinmel® · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
