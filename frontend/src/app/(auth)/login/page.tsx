import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Login | Kinmel',
  description: 'Sign in to your Kinmel account.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col relative bg-[#F4F4F4] border-r border-[#0A0A0A]/10">
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <Link href="/" className="font-sans text-lg font-black uppercase tracking-[-0.02em] text-[#0A0A0A]">
            Kinmel<span className="text-[#E63946]">®</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-5">
              ◆ Signed by buyer
            </p>
            <h1 className="font-sans font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.9] text-[clamp(2.5rem,5vw,4.5rem)] mb-6">
              Trust the chain.
            </h1>
            <p className="text-[#0A0A0A]/60 text-base leading-relaxed max-w-sm mb-12">
              Every review on Kinmel is signed with the buyer&apos;s wallet and anchored permanently on Polygon Amoy.
            </p>

            <div className="space-y-5 border-t border-[#0A0A0A]/10 pt-8">
              {[
                { n: '001', label: 'MetaMask signing', sub: 'Wallet-signed review proofs' },
                { n: '002', label: 'Polygon Amoy', sub: 'Immutable on-chain anchoring' },
                { n: '003', label: 'Verified buyers only', sub: 'No fake stars, ever' },
              ].map((f) => (
                <div key={f.label} className="flex items-baseline gap-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946] w-8 shrink-0">
                    {f.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-tight text-[#0A0A0A]">{f.label}</p>
                    <p className="text-xs text-[#0A0A0A]/50 mt-0.5">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40">
            © {new Date().getFullYear()} Kinmel® · All rights reserved
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12 bg-white">
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden font-sans text-base font-black uppercase tracking-[-0.02em] text-[#0A0A0A]">
          Kinmel<span className="text-[#E63946]">®</span>
        </Link>

        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
