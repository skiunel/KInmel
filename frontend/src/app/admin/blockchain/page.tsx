'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Box,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Pause,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { adminService } from '@/services/admin.service';
import { shortenAddress } from '@/lib/runtime-config';
import { cn } from '@/lib/utils';

function formatTimestamp(ts: number) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
}

export default function AdminBlockchainPage() {
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['admin-blockchain-status'],
    queryFn: () => adminService.getBlockchainStatus(),
    refetchInterval: 15000,
  });

  const { data: feed = [], isLoading: feedLoading } = useQuery({
    queryKey: ['admin-blockchain-feed'],
    queryFn: () => adminService.getBlockchainFeed(25),
    refetchInterval: 20000,
  });

  if (statusLoading) {
    return (
      <div className="border border-[#0A0A0A]/10 bg-white p-12 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#E63946]" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="border border-[#0A0A0A]/10 bg-white p-12 text-center text-[#0A0A0A]/60">
        Failed to load blockchain status.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="border border-[#0A0A0A]/10 bg-white p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'size-3 rounded-full',
                status.connected ? 'bg-[#0A0A0A]' : 'bg-[#E63946]'
              )}
              style={{
                boxShadow: status.connected
                  ? '0 0 16px rgba(0,255,136,0.6)'
                  : '0 0 16px rgba(255,107,107,0.6)',
                animation: status.connected ? 'pulse-glow 2s ease-in-out infinite' : undefined,
              }}
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/50">
                Network Status
              </p>
              <p className="font-heading text-xl font-black text-[#0A0A0A]">
                {status.connected
                  ? `Connected — ${status.network?.name ?? 'Unknown'}`
                  : 'Disconnected'}
              </p>
            </div>
          </div>
          {status.paused && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E63946]/30 bg-[#E63946]/[0.08] text-[#E63946] text-xs font-semibold">
              <Pause className="size-3.5" />
              CONTRACT PAUSED
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          icon={Box}
          label="Total Proofs"
          value={status.proofCount.toString()}
          color="#E63946"
        />
        <KPI
          icon={Activity}
          label="Network"
          value={status.network?.name ?? '—'}
          color="#E63946"
        />
        <KPI
          icon={Wallet}
          label="Signer Balance"
          value={
            status.signerBalance
              ? `${parseFloat(status.signerBalance).toFixed(4)} POL`
              : '—'
          }
          color="#0A0A0A"
        />
        <KPI
          icon={ShieldCheck}
          label="Contract Status"
          value={status.paused ? 'Paused' : 'Active'}
          color={status.paused ? '#E63946' : '#0A0A0A'}
        />
      </div>

      {/* Contract details */}
      <div className="border border-[#0A0A0A]/10 bg-white p-6">
        <h3 className="font-heading text-xl font-black text-[#0A0A0A] mb-5">
          Contract Configuration
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <DetailRow
            label="Contract Address"
            value={status.contractAddress}
            href={
              status.contractAddress && status.network?.explorerUrl
                ? `${status.network.explorerUrl}/address/${status.contractAddress}`
                : null
            }
            copyable
          />
          <DetailRow
            label="Signer Address"
            value={status.signerAddress}
            href={
              status.signerAddress && status.network?.explorerUrl
                ? `${status.network.explorerUrl}/address/${status.signerAddress}`
                : null
            }
            copyable
          />
          <DetailRow label="Chain ID" value={status.network?.chainId.toString() ?? '—'} />
          <DetailRow label="RPC URL" value={status.network?.rpcUrl ?? '—'} />
        </div>
      </div>

      {/* Live feed */}
      <div className="border border-[#0A0A0A]/10 bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading text-xl font-black text-[#0A0A0A]">
              Live Anchor Feed
            </h3>
            <p className="text-xs text-[#0A0A0A]/50 mt-1">
              Recent on-chain review anchors. Updates every 20s.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#0A0A0A]">
            <span
              className="size-2 rounded-full bg-[#0A0A0A] animate-pulse"
              style={{ boxShadow: '0 0 8px rgba(0,255,136,0.8)' }}
            />
            LIVE
          </div>
        </div>

        {feedLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-[#E63946]" />
          </div>
        ) : feed.length === 0 ? (
          <div className="py-12 text-center text-[#0A0A0A]/40">
            No anchored reviews yet. They&apos;ll appear here as they happen.
          </div>
        ) : (
          <div className="space-y-2">
            {feed.map((ev) => (
              <a
                key={ev.txHash}
                href={ev.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-[#0A0A0A]/10 bg-[#F4F4F4] hover:border-[#E63946]/40 hover:bg-white transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-chain">⛓ ANCHORED</span>
                    <span className="font-mono text-xs text-[#0A0A0A]/50">
                      Block #{ev.blockNumber}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#0A0A0A]/70 truncate">
                    tx: {shortenAddress(ev.txHash, 8)} → review:{' '}
                    {shortenAddress(ev.reviewIdHash, 6)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">
                      {formatTimestamp(ev.timestamp)}
                    </p>
                    <p className="text-xs text-[#0A0A0A]/40 mt-0.5">
                      <Clock className="size-3 inline mr-1" />
                      on Polygonscan
                    </p>
                  </div>
                  <ExternalLink className="size-4 text-[#0A0A0A]/40 group-hover:text-[#E63946] transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Box;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="border border-[#0A0A0A]/10 bg-white p-5 float">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/50">
            {label}
          </p>
          <p
            className="mt-2 font-heading text-2xl font-black truncate"
            style={{ color }}
          >
            {value}
          </p>
        </div>
        <div
          className="rounded-2xl p-3 border shrink-0"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}30`,
            boxShadow: `0 0 24px ${color}30`,
          }}
        >
          <Icon className="size-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
  copyable,
}: {
  label: string;
  value: string | null;
  href?: string | null;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div className="rounded-xl border border-[#0A0A0A]/10 bg-[#F4F4F4] p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">
          {label}
        </p>
        <p className="text-sm text-[#0A0A0A]/40 mt-1">Not configured</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const display =
    value.length > 24 && value.startsWith('0x') ? shortenAddress(value, 8) : value;

  return (
    <div className="rounded-xl border border-[#0A0A0A]/10 bg-[#F4F4F4] p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40 mb-1">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[#E63946] hover:text-[#E63946] transition-colors inline-flex items-center gap-1 truncate"
          >
            {display}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : (
          <span className="font-mono text-sm text-[#0A0A0A] truncate">{display}</span>
        )}
        {copyable && (
          <button
            onClick={handleCopy}
            className="h-7 w-7 inline-flex items-center justify-center rounded-full text-[#0A0A0A]/40 hover:text-[#0A0A0A] hover:bg-white transition-colors shrink-0"
          >
            {copied ? (
              <span className="text-[#0A0A0A] text-xs">✓</span>
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
