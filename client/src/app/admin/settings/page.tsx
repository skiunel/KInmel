'use client';

import { Bell, Palette, ShieldCheck, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/admin';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Store Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage brand, storefront copy, and customer-facing communication in one clean form layout.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Brand status" value="Live" icon={Store} variant="success" />
        <StatCard label="Theme preset" value="Midnight Red" icon={Palette} />
        <StatCard label="Trust line" value="Enabled" icon={ShieldCheck} variant="chain" />
        <StatCard label="Alerts" value="3 active" icon={Bell} variant="verified" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.9rem] border border-white/8 bg-card/92 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.34)] backdrop-blur-sm">
          <div>
            <p className="text-sm font-semibold text-foreground">Storefront settings</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Simple forms for the brand details that shape the public experience.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Store name</label>
              <Input className="mt-2" defaultValue="Kinmel" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Support email</label>
              <Input className="mt-2" defaultValue="hello@kinmel.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Theme preset</label>
              <Select defaultValue="midnight-red">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midnight-red">Midnight Red</SelectItem>
                  <SelectItem value="obsidian-crimson">Obsidian Crimson</SelectItem>
                  <SelectItem value="graphite-red">Graphite Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Default CTA label</label>
              <Input className="mt-2" defaultValue="Explore now" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground">Hero headline</label>
              <Textarea
                defaultValue="The power of clean wellness in every dose."
                className="mt-2 min-h-24 border-white/10 bg-white/[0.04] text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground">Footer trust note</label>
              <Textarea
                defaultValue="This store sells only products with signed reviews."
                className="mt-2 min-h-20 border-white/10 bg-white/[0.04] text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Save settings</Button>
            <Button variant="outline">Preview storefront</Button>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-white/8 bg-card/92 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.34)] backdrop-blur-sm">
          <p className="text-sm font-semibold text-foreground">Configuration summary</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Quick operational notes in the same clean admin design language.
          </p>

          <div className="mt-6 space-y-3">
            {[
              'Storefront uses the black-and-red premium commerce preset.',
              'Public hero, footer, and CTA copy are ready to update from one place.',
              'Blockchain trust note remains visible at the bottom of the public site.',
              'Support details and email messaging stay aligned with the same visual system.',
            ].map((item) => (
              <div key={item} className="surface-subtle px-4 py-4 text-sm leading-6 text-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
