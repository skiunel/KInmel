import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Login | Kinmel',
  description: 'Sign in to your Kinmel account.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[#07070F]">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col relative overflow-hidden bg-mesh-2 noise">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="orb orb-violet top-0 left-0 size-[28rem] -translate-x-1/3 -translate-y-1/3" />
          <div className="orb orb-cyan bottom-0 right-0 size-[26rem] translate-x-1/3 translate-y-1/3" />
          <div className="orb top-1/2 left-1/2 size-[18rem] -translate-x-1/2 -translate-y-1/2" style={{ background: 'rgba(255,107,180,0.18)' }} />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00F5FF] glow-violet">
              <span className="text-white font-black text-lg">K</span>
            </div>
            <span className="font-heading text-xl font-black tracking-tight text-white">
              Kinmel
            </span>
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="mb-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#6C63FF]/40 bg-[#6C63FF]/10 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-[#6C63FF]">
                <span className="size-1.5 rounded-full bg-[#6C63FF] animate-pulse" />
                Signed by buyer
              </span>
            </div>
            <h1 className="font-heading text-5xl xl:text-6xl font-black text-white leading-[0.9] tracking-tight mb-6">
              Trust the<br />
              <span className="gradient-text-animated">chain.</span>
            </h1>
            <p className="text-white/55 text-lg leading-relaxed max-w-xs">
              Every review on Kinmel is signed with MetaMask and anchored permanently on Polygon Amoy.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              {[
                { icon: '🔐', label: 'MetaMask signing', sub: 'Wallet-signed review proofs', color: '#6C63FF' },
                { icon: '⛓', label: 'Polygon Amoy', sub: 'Immutable on-chain anchoring', color: '#00F5FF' },
                { icon: '✓', label: 'Verified buyers only', sub: 'No fake stars, ever', color: '#FFD700' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg" style={{ background: `${f.color}15`, borderColor: `${f.color}55`, boxShadow: `0 0 20px ${f.color}30` }}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-white/45">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-xs text-white/30 font-mono">
            © {new Date().getFullYear()} Kinmel. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00F5FF]">
            <span className="text-white font-black">K</span>
          </div>
          <span className="font-heading text-lg font-black tracking-tight text-white">Kinmel</span>
        </div>

        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
