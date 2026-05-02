'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#e4e4e7] bg-white pt-16 pb-8">
      <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-6 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center">
            <span className="font-heading text-xl font-black tracking-tighter text-[#18181B]">
              kinmel<span className="text-[#16a34a]">.</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-[#71717a] max-w-xs leading-relaxed">
            The first e-commerce platform with blockchain-verified reviews. Every rating is real.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#16a34a] font-medium">
            <Shield className="w-3.5 h-3.5" /> Blockchain verified
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1">Company</span>
          <Link href="#" className="text-sm text-[#71717a] hover:text-[#18181B] transition-colors">About</Link>
          <Link href="#" className="text-sm text-[#71717a] hover:text-[#18181B] transition-colors">Contact</Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1">Legal</span>
          <Link href="#" className="text-sm text-[#71717a] hover:text-[#18181B] transition-colors">Terms</Link>
          <Link href="#" className="text-sm text-[#71717a] hover:text-[#18181B] transition-colors">Privacy</Link>
        </div>
      </div>
      <div className="mt-14 px-6 md:px-12 flex items-center justify-between text-xs text-[#a1a1aa]">
        <p>© {new Date().getFullYear()} Kinmel. All rights reserved.</p>
        <p className="font-mono tracking-wider">Built with trust ✦</p>
      </div>
    </footer>
  );
}
