'use client';

import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { AnimatedSection } from '@/components/shared';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Chip } from '@/components/ui/chip';

const testimonials = [
  {
    name: 'Aarav Sharma',
    initials: 'AS',
    role: 'Daily customer',
    rating: 5,
    text: 'The layout feels sharp and professional. I can find products quickly without digging through clutter.',
    highlight: 'Clear product discovery',
  },
  {
    name: 'Priya Thapa',
    initials: 'PT',
    role: 'Repeat buyer',
    rating: 5,
    text: 'The product cards and sections feel much more organized than a typical online store. It looks intentional.',
    highlight: 'Stronger visual presentation',
  },
  {
    name: 'Rajesh Patel',
    initials: 'RP',
    role: 'New member',
    rating: 5,
    text: 'The browsing flow is simple, the calls to action are clear, and the whole storefront feels easier to use.',
    highlight: 'Simple buying flow',
  },
] as const;

const stats = [
  { value: '14k+', label: 'people already shopping with Kinmel' },
  { value: '96%', label: 'buyers return for another order' },
  { value: '4.9/5', label: 'average product satisfaction' },
] as const;

export function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-border/70 py-22 sm:py-24">
      <Container>
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Testimonials and stats
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              A storefront that feels considered from first scroll to checkout.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Stronger product presentation makes the experience feel more reliable before customers even reach the cart.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="surface-subtle px-5 py-5 text-center">
              <p className="text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="surface-panel flex h-full flex-col p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-0.5 text-verified">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <Chip variant="success">
                  <Sparkles className="size-3" />
                  favorite
                </Chip>
              </div>

              <p className="mt-5 flex-1 text-base leading-7 text-foreground">
                “{testimonial.text}”
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[1rem] border border-border/80 bg-accent/40 px-3 py-2 text-xs text-muted-foreground">
                Highlight: <span className="font-semibold text-foreground">{testimonial.highlight}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
