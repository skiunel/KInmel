'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#0A0A0A]/10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-start">
          <div className="lg:col-span-7">
            <p className="font-sans text-[clamp(3rem,11vw,9rem)] font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.86]">
              Kinmel<span className="text-[#E63946]">®</span>
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#0A0A0A]/55">
              Goods curated. Reviews signed. Made to be worn. Or judged. Or both.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <FooterColumn title="Shop">
              <FooterLink href="/products">All</FooterLink>
              <FooterLink href="/products?category=electronics">Electronics</FooterLink>
              <FooterLink href="/products?category=peripherals">Peripherals</FooterLink>
            </FooterColumn>
            <FooterColumn title="Trust">
              <FooterLink href="/verify">Ledger</FooterLink>
              <FooterLink href="/about">Method</FooterLink>
              <FooterLink href="https://amoy.polygonscan.com" external>
                Polygonscan
              </FooterLink>
            </FooterColumn>
            <FooterColumn title="Info">
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
            </FooterColumn>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#0A0A0A]/10">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0A0A0A]/45">
            © {new Date().getFullYear()} Kinmel® · All rights reserved
          </p>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0A0A0A]/45">
            Kathmandu × Los Angeles
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E63946] mb-4">
        ◆ {title}
      </p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    'font-mono text-[11px] text-[#0A0A0A]/70 hover:text-[#E63946] transition-colors uppercase tracking-[0.16em]';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
