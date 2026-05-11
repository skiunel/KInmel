'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#0B0B0D] border-t border-[#EDE7DA]/8">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        {/* Big mark */}
        <div className="mb-16">
          <p className="font-heading text-[clamp(3rem,12vw,10rem)] font-black uppercase tracking-tighter text-[#EDE7DA] leading-[0.85]">
            Kinmel.
          </p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <FooterColumn title="Shop">
            <FooterLink href="/products">All Products</FooterLink>
            <FooterLink href="/products?category=electronics">Electronics</FooterLink>
            <FooterLink href="/products?category=peripherals">Peripherals</FooterLink>
          </FooterColumn>
          <FooterColumn title="Trust">
            <FooterLink href="/verify">Verify Reviews</FooterLink>
            <FooterLink href="/about">How it Works</FooterLink>
            <FooterLink href="https://amoy.polygonscan.com" external>
              Polygonscan
            </FooterLink>
          </FooterColumn>
          <FooterColumn title="Company">
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/cookies">Cookies</FooterLink>
          </FooterColumn>
        </div>

        {/* Bottom */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-[#EDE7DA]/8">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[#EDE7DA]/40">
            © {new Date().getFullYear()} Kinmel — All Rights Reserved
          </p>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[#EDE7DA]/40">
            Made in Kathmandu × Los Angeles
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.32em] text-[#EDE7DA]/40 mb-5">
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
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
    'text-sm text-[#EDE7DA]/55 hover:text-[#FF3D00] transition-colors uppercase tracking-wider font-medium';
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
