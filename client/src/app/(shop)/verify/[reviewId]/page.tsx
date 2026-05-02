'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Database,
  FileText,
  Lock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  User,
  Clock,
  Fingerprint,
  Blocks,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Container } from '@/components/layout';
import { cn, truncateHash, timeAgo } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import {
  verificationService,
  type OnChainVerification,
} from '@/services/verification.service';

// ─── Types ───

interface CheckItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Shield;
  passed: boolean | null; // null = pending/unknown
}

// ─── Clipboard hook ───

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return { copied, copy };
}

// ─── Copyable Hash Row ───

function HashRow({
  label,
  value,
  icon: Icon,
  copyKey,
  copied,
  onCopy,
  truncateLen,
  href,
}: {
  label: string;
  value: string;
  icon: typeof Shield;
  copyKey: string;
  copied: string | null;
  onCopy: (key: string, value: string) => void;
  truncateLen?: number;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chain/10">
        <Icon className="size-4 text-chain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <code className="text-sm font-mono text-foreground break-all">
            {truncateLen ? truncateHash(value, truncateLen, 6) : value}
          </code>
          <button
            onClick={() => onCopy(copyKey, value)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied === copyKey ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-chain transition-colors"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Verification Check Row ───

function CheckRow({ check, index }: { check: CheckItem; index: number }) {
  const Icon = check.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.12 }}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 transition-colors',
        check.passed === true && 'border-success/30 bg-success/[0.03]',
        check.passed === false && 'border-destructive/30 bg-destructive/[0.03]',
        check.passed === null && 'border-border bg-muted/30'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          check.passed === true && 'bg-success/10',
          check.passed === false && 'bg-destructive/10',
          check.passed === null && 'bg-muted'
        )}
      >
        {check.passed === true ? (
          <CheckCircle2 className="size-4 text-success" />
        ) : check.passed === false ? (
          <XCircle className="size-4 text-destructive" />
        ) : (
          <Icon className="size-4 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{check.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {check.description}
        </p>
      </div>
      <div className="ml-auto shrink-0">
        {check.passed === true && (
          <Chip variant="success" className="text-[10px]">
            Passed
          </Chip>
        )}
        {check.passed === false && (
          <Chip variant="destructive" className="text-[10px]">
            Failed
          </Chip>
        )}
        {check.passed === null && (
          <Chip variant="muted" className="text-[10px]">
            N/A
          </Chip>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ───

export default function VerifyReviewPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = use(params);
  const [verification, setVerification] =
    useState<OnChainVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopy();

  useEffect(() => {
    async function load() {
      try {
        const result = await verificationService.verifyOnChain(reviewId);
        setVerification(result);
      } catch (err) {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Review not found or verification failed'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reviewId]);

  // ─── Loading State ───
  if (loading) {
    return (
      <Container size="narrow" className="py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-xl text-center"
        >
          <div className="relative mx-auto h-20 w-20">
            {/* Spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-chain/20 border-t-chain"
            />
            <div className="absolute inset-3 flex items-center justify-center rounded-full bg-chain/10">
              <Shield className="size-7 text-chain" />
            </div>
          </div>
          <h2 className="mt-6 text-lg font-bold font-heading">
            Verifying Review
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Checking IPFS storage and blockchain proof...
          </p>
          <div className="mt-8 space-y-3 text-left mx-auto max-w-xs">
            {['Fetching review metadata', 'Querying IPFS storage', 'Checking blockchain proof'].map(
              (step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.5 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <Loader2 className="size-3.5 animate-spin text-chain" />
                  <span className="text-muted-foreground">{step}</span>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </Container>
    );
  }

  // ─── Error State ───
  if (error || !verification) {
    return (
      <Container size="narrow" className="py-20 text-center">
        <ShieldAlert className="mx-auto size-14 text-destructive" />
        <h1 className="mt-5 text-2xl font-bold">Verification Failed</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          {error || 'Could not verify this review. It may not exist or may have been removed.'}
        </p>
        <Button className="mt-6" variant="outline" render={<Link href={ROUTES.home} />}>
          <ArrowLeft className="size-4" />
          Return Home
        </Button>
      </Container>
    );
  }

  // ─── Build verification checks ───
  const v = verification;
  const isFullyVerified =
    v.buyerVerified && v.ipfsStored && v.ipfsAccessible && v.ipfsContentVerified === true && v.onChain && v.contentVerified;
  const isPartial = v.buyerVerified && (v.ipfsStored || v.onChain);

  const checks: CheckItem[] = [
    {
      id: 'buyer',
      label: 'Verified Buyer',
      description:
        'Review was submitted by a customer with a delivered order for this product',
      icon: User,
      passed: v.buyerVerified,
    },
    {
      id: 'ipfs',
      label: 'IPFS Storage',
      description: v.ipfsStored && v.ipfsHash
        ? `Record pinned with CID ${truncateHash(v.ipfsHash, 10, 4)}`
        : 'No real IPFS record is attached to this review yet',
      icon: Database,
      passed: v.ipfsStored,
    },
    {
      id: 'ipfs-access',
      label: 'IPFS Gateway Access',
      description: v.ipfsStored
        ? v.ipfsAccessible
          ? 'The pinned review document can be fetched from the configured public gateway.'
          : 'A CID exists, but the gateway could not return the document right now.'
        : 'Gateway access cannot be checked until the review is pinned.',
      icon: ExternalLink,
      passed: v.ipfsStored ? v.ipfsAccessible : null,
    },
    {
      id: 'content',
      label: 'Content Integrity',
      description: v.ipfsContentVerified === true
        ? 'The fetched IPFS document matches the review content shown in Kinmel.'
        : v.ipfsContentVerified === false
          ? 'Mismatch detected between the IPFS document and the current review content.'
          : 'Content integrity can be checked after the IPFS document becomes accessible.',
      icon: FileText,
      passed: v.ipfsContentVerified,
    },
    {
      id: 'proof',
      label: 'Blockchain Proof',
      description: v.onChain
        ? `Proof anchored on-chain at block ${v.blockNumber ?? '—'}`
        : 'Review proof has not been anchored to the blockchain yet',
      icon: Lock,
      passed: v.onChain,
    },
    {
      id: 'timestamp',
      label: 'Timestamp Validation',
      description: v.proof
        ? `Anchored at ${new Date(v.proof.timestamp * 1000).toISOString()}`
        : 'No on-chain timestamp available',
      icon: Clock,
      passed: v.proof ? v.proof.timestamp > 0 : null,
    },
  ];

  const passedCount = checks.filter((c) => c.passed === true).length;

  return (
    <Container size="narrow" className="py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Status icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mx-auto mb-6"
          >
            {isFullyVerified ? (
              <div className="relative mx-auto h-24 w-24">
                {/* Glowing ring */}
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-2 rounded-full bg-gradient-to-r from-chain/30 via-success/20 to-chain/30 blur-md"
                />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-chain/20 to-success/20 border-2 border-chain/30">
                  <ShieldCheck className="size-12 text-chain" />
                </div>
              </div>
            ) : isPartial ? (
              <div className="relative mx-auto h-24 w-24">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-verified/10 border-2 border-verified/30">
                  <Shield className="size-12 text-verified" />
                </div>
              </div>
            ) : (
              <div className="relative mx-auto h-24 w-24">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted border-2 border-border">
                  <ShieldAlert className="size-12 text-muted-foreground" />
                </div>
              </div>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              'text-3xl font-bold font-heading',
              isFullyVerified && 'bg-gradient-to-r from-chain to-success bg-clip-text text-transparent',
              isPartial && 'text-verified',
              !isFullyVerified && !isPartial && 'text-muted-foreground'
            )}
          >
            {isFullyVerified
              ? 'Proof Confirmed'
              : isPartial
                ? 'Record Published'
                : 'Proof Pending'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto"
          >
            {isFullyVerified
              ? 'The buyer relationship, IPFS document, and blockchain proof all line up.'
              : v.reason || 'This review is still missing one or more public proof layers.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mx-auto mt-6 max-w-xl rounded-2xl border bg-card/70 p-4 text-left shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {v.review.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {v.review.product?.name || 'Product unavailable'} by {v.review.user?.name || 'Unknown buyer'}
                </p>
              </div>
              <Chip variant={isFullyVerified ? 'success' : isPartial ? 'verified' : 'warning'}>
                {v.verificationStatus}
              </Chip>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {v.review.content}
            </p>
            {v.verificationMessage ? (
              <p className="mt-3 text-xs text-amber-700">
                {v.verificationMessage}
              </p>
            ) : null}
          </motion.div>

          {/* Score badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2"
          >
            <span className="text-sm font-medium text-muted-foreground">
              Trust Score
            </span>
            <span
              className={cn(
                'text-lg font-bold',
                passedCount >= 4
                  ? 'text-chain'
                  : passedCount >= 2
                    ? 'text-verified'
                    : 'text-muted-foreground'
              )}
            >
              {passedCount}/{checks.length}
            </span>
          </motion.div>
        </motion.div>

        {/* Verification Checks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-base font-bold font-heading mb-4 flex items-center gap-2">
            <Fingerprint className="size-4 text-chain" />
            Verification Checks
          </h2>
          <div className="space-y-3">
            {checks.map((check, i) => (
              <CheckRow key={check.id} check={check} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Cryptographic Proof Details */}
        {(v.ipfsHash || v.blockchainTxHash || v.proof) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="rounded-2xl border bg-card overflow-hidden"
          >
            <div className="border-b bg-gradient-to-r from-chain/5 to-transparent px-6 py-4">
              <h2 className="text-base font-bold font-heading flex items-center gap-2">
                <Blocks className="size-4 text-chain" />
                Cryptographic Proof
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cross-check the independent record layers attached to this review
              </p>
            </div>

            <div className="px-6 py-2 divide-y divide-border">
              {v.ipfsHash && (
                <HashRow
                  label="IPFS Content Identifier (CID)"
                  value={v.ipfsHash}
                  icon={Database}
                  copyKey="ipfs"
                  copied={copied}
                  onCopy={copy}
                  href={v.gatewayUrl ?? undefined}
                />
              )}

              {v.blockchainTxHash && (
                <HashRow
                  label="Blockchain Transaction Hash"
                  value={v.blockchainTxHash}
                  icon={Lock}
                  copyKey="tx"
                  copied={copied}
                  onCopy={copy}
                  truncateLen={14}
                />
              )}

              {v.blockNumber && (
                <div className="flex items-start gap-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chain/10">
                    <Blocks className="size-4 text-chain" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Block Number</p>
                    <code className="text-sm font-mono text-foreground mt-0.5">
                      #{v.blockNumber.toLocaleString()}
                    </code>
                  </div>
                </div>
              )}

              {v.proof?.contentHash && (
                <HashRow
                  label="On-Chain Content Hash (bytes32)"
                  value={v.proof.contentHash}
                  icon={FileText}
                  copyKey="content"
                  copied={copied}
                  onCopy={copy}
                  truncateLen={14}
                />
              )}

              {v.proof && v.proof.timestamp > 0 && (
                <div className="flex items-start gap-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chain/10">
                    <Clock className="size-4 text-chain" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Anchored Timestamp
                    </p>
                    <p className="text-sm text-foreground mt-0.5">
                      {new Date(v.proof.timestamp * 1000).toISOString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(new Date(v.proof.timestamp * 1000).toISOString())}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="rounded-2xl border bg-muted/30 p-6"
        >
          <h2 className="text-base font-bold font-heading mb-4">
            How Kinmel Verification Works
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: User,
                title: '1. Purchase Verified',
                desc: 'Only customers who bought and received the product can submit reviews.',
              },
              {
                icon: Database,
                title: '2. External Record',
                desc: 'A SHA-256 fingerprint and optional IPFS record make quiet tampering easier to detect.',
              },
              {
                icon: Lock,
                title: '3. Blockchain Proof',
                desc: 'If chain services are configured, the fingerprint is anchored on-chain for an extra public timestamp.',
              },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-chain/10 mb-3">
                  <step.icon className="size-5 text-chain" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Back button */}
        <div className="text-center pb-4">
          <Button variant="outline" render={<Link href={ROUTES.home} />}>
            <ArrowLeft className="size-4" />
            Back to Kinmel
          </Button>
        </div>
      </div>
    </Container>
  );
}
