import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Create Account | Kinmel',
  description: 'Join Kinmel and start shopping with signed reviews.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-[#07070F]">
      {/* Left form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00F5FF]">
            <span className="text-white font-black">K</span>
          </div>
          <span className="font-heading text-lg font-black tracking-tight text-white">Kinmel</span>
        </div>

        <div className="w-full max-w-sm">
          <RegisterForm />
        </div>
      </div>

      {/* Right brand panel */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col relative overflow-hidden bg-mesh-2 noise">
        <div className="absolute inset-0">
          <div className="orb orb-violet top-1/4 right-0 size-[26rem] translate-x-1/3" />
          <div className="orb orb-cyan bottom-1/4 left-0 size-[22rem] -translate-x-1/3" />
          <div className="orb top-1/2 right-1/4 size-[18rem]" style={{ background: 'rgba(255,107,180,0.18)' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00F5FF] glow-violet">
              <span className="text-white font-black text-lg">K</span>
            </div>
            <span className="font-heading text-xl font-black tracking-tight text-white">
              Kinmel
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="mb-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#00F5FF]/40 bg-[#00F5FF]/10 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-[#00F5FF]">
                <span className="size-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
                Join the Community
              </span>
            </div>
            <h1 className="font-heading text-5xl xl:text-6xl font-black text-white leading-[0.9] tracking-tight mb-6">
              Shop with<br />
              <span className="gradient-text-animated">proof.</span>
            </h1>
            <p className="text-white/55 text-lg leading-relaxed max-w-xs">
              Create your account and join thousands of buyers who trust Kinmel&apos;s signed reviews.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3 perspective-1000">
              {[
                { val: '10K+', label: 'Verified reviews', color: '#6C63FF' },
                { val: '99%', label: 'Satisfaction rate', color: '#00F5FF' },
                { val: '0', label: 'Fake stars', color: '#FFD700' },
              ].map((s) => (
                <div key={s.label} className="card-3d p-4 text-center">
                  <p className="font-heading text-2xl font-black" style={{ color: s.color, textShadow: `0 0 18px ${s.color}55` }}>{s.val}</p>
                  <p className="text-[10px] text-white/45 mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {['MetaMask verified', 'Polygon Amoy', 'SSL secured', 'GDPR compliant'].map((b) => (
                <span key={b} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-mono text-white/55 uppercase tracking-wider backdrop-blur-xl">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/30 font-mono">
            © {new Date().getFullYear()} Kinmel. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
