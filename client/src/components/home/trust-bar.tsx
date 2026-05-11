'use client';

import Image from 'next/image';
import { CheckCircle2, Sparkles, Users } from 'lucide-react';
import { Container } from '@/components/layout/container';

export function TrustBar() {
  return (
    <section className="relative -mt-16 pb-8 sm:-mt-20 sm:pb-12">
      <Container>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.86fr_0.94fr]">
          <div className="surface-panel flex min-h-[12rem] items-center gap-4 p-5 sm:p-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.5rem] bg-[#edf3df]">
              <Image
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
                alt="Premium wellness lifestyle image"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-foreground">
                Start your personalized path to better daily balance
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Elegant product storytelling, tighter spacing, and softer cards create the same premium feel as the Dribbble-style reference.
              </p>
            </div>
          </div>

          <div className="surface-panel flex min-h-[12rem] flex-col justify-between p-5 sm:p-6">
            <div className="inline-flex w-fit rounded-2xl bg-primary/10 p-3 text-primary">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                Experience our curated formula highlights
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Cleaner card structure and a brighter content rhythm help every section feel elevated.
              </p>
            </div>
          </div>

          <div className="rounded-[2.05rem] bg-[linear-gradient(180deg,#151518,#09090b)] p-5 text-white shadow-[0_28px_58px_rgba(0,0,0,0.34)] sm:p-6">
            <div className="flex items-center gap-3">
              {['AK', 'PT', 'RS'].map((initials, index) => (
                <div
                  key={initials}
                  className="-mr-2 inline-flex size-12 items-center justify-center rounded-full border-2 border-[#09090b] bg-[linear-gradient(135deg,#ffe4e6,#fb7185)] text-sm font-semibold text-[#09090b]"
                  style={{ zIndex: 4 - index }}
                >
                  {initials}
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              <Users className="size-3.5" />
              Store community
            </div>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-white">+14K</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              People have already explored collections, reordered favorites, and shared signed reviews.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/82">
              <Sparkles className="size-3.5" />
              Trusted premium flow
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
