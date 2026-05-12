'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, CheckCircle2, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/use-wallet';
import { buildExplorerTxUrl } from '@/lib/runtime-config';

interface ReviewSubmitModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  orderId: string;
  onSubmit: (data: {
    rating: number;
    title: string;
    content: string;
    signature: string;
    walletAddress: string;
    contentHash: string;
  }) => Promise<{ txHash?: string; reviewId?: string }>;
}

type Step = 1 | 2 | 3 | 4 | 5;

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function ReviewSubmitModal({
  open,
  onClose,
  productName,
  productId,
  orderId,
  onSubmit,
}: ReviewSubmitModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setRating(0);
    setTitle('');
    setContent('');
    setContentHash('');
    setTxHash(null);
    setError(null);
    setBusy(false);
  }, [open]);

  useEffect(() => {
    if (step === 3 && rating > 0 && content) {
      const payload = JSON.stringify({ productId, orderId, rating, title, content });
      sha256(payload).then(setContentHash);
    }
  }, [step, productId, orderId, rating, title, content]);

  const nextStep = () => setStep((s) => Math.min(5, s + 1) as Step);
  const prevStep = () => setStep((s) => Math.max(1, s - 1) as Step);

  const handleSign = async () => {
    setError(null);
    setBusy(true);
    try {
      if (!wallet.isConnected) {
        const addr = await wallet.connect();
        if (!addr) {
          setError('Wallet connection cancelled');
          return;
        }
      }

      const message = `Kinmel Review\nProduct: ${productId}\nOrder: ${orderId}\nRating: ${rating}\nHash: ${contentHash}`;
      const signature = await wallet.signMessage(message);
      if (!signature) {
        setError('Signature cancelled');
        return;
      }

      const result = await onSubmit({
        rating,
        title,
        content,
        signature,
        walletAddress: wallet.address!,
        contentHash,
      });

      if (result.txHash) setTxHash(result.txHash);
      setStep(5);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-xl glass-card p-8 backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 hover:text-white hover:border-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="pr-12 mb-6">
            <p className="font-mono text-xs uppercase tracking-widest text-[#E63946] mb-2">
              Step {step} of 5
            </p>
            <h2 className="font-heading text-2xl font-black text-white">
              {step === 1 && 'Rate your purchase'}
              {step === 2 && 'Share your experience'}
              {step === 3 && 'Preview & confirm'}
              {step === 4 && 'Sign with MetaMask'}
              {step === 5 && 'Review published!'}
            </h2>
            <p className="mt-1 text-sm text-white/50 truncate">{productName}</p>
          </div>

          {/* Progress */}
          <div className="mb-8 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={cn(
                  'flex-1 h-1 rounded-full transition-all duration-500',
                  s <= step ? '' : 'bg-white/10'
                )}
                style={
                  s <= step
                    ? {
                        background: 'linear-gradient(90deg, #E63946, #E63946)',
                      }
                    : undefined
                }
              />
            ))}
          </div>

          {/* Step content */}
          <div className="min-h-[200px]">
            {step === 1 && (
              <div className="flex flex-col items-center py-8">
                <p className="text-sm text-white/60 mb-6">How would you rate this product?</p>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const filled = (hoverRating || rating) >= v;
                    return (
                      <button
                        key={v}
                        onClick={() => setRating(v)}
                        onMouseEnter={() => setHoverRating(v)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={cn(
                          'transition-all duration-200',
                          filled ? 'scale-110' : 'scale-100 hover:scale-105'
                        )}
                      >
                        <Star
                          className={cn(
                            'w-12 h-12 transition-all',
                            filled
                              ? 'fill-[#FFD700] text-[#FFD700] drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]'
                              : 'text-white/20'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                {rating > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 font-heading text-2xl font-black text-[#FFD700]"
                  >
                    {rating}.0
                  </motion.p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/60 mb-2 block">
                    Title (optional)
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Solid build, fast shipping"
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/60 mb-2 block">
                    Your review
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell other buyers what you think..."
                    rows={5}
                    className="glass-input w-full resize-none"
                  />
                  <p className="mt-2 text-xs text-white/40">{content.length} / 1000</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="glass-card p-5 bg-white/[0.02]">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4',
                          i < rating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-white/20'
                        )}
                      />
                    ))}
                  </div>
                  {title && <h4 className="font-semibold text-white mb-2">{title}</h4>}
                  <p className="text-sm text-white/70 whitespace-pre-wrap">{content}</p>
                </div>
                <div className="rounded-xl border border-[#E63946]/20 bg-[#E63946]/[0.05] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946] mb-2">
                    SHA-256 Content Hash
                  </p>
                  <p className="font-mono text-xs text-white/70 break-all">
                    {contentHash || 'computing...'}
                  </p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center py-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-6 drop-shadow-[0_0_24px_rgba(230,57,70,0.6)]"
                >
                  🦊
                </motion.div>
                <p className="text-sm text-white/70 text-center mb-6 max-w-sm">
                  Open MetaMask to sign this review with your wallet. Your signature proves you wrote it — and it cannot be forged.
                </p>
                {error && (
                  <p className="text-sm text-[#FF6B6B] mb-4 text-center">{error}</p>
                )}
                <button
                  onClick={handleSign}
                  disabled={busy}
                  className="btn-primary pulse-glow"
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Awaiting signature...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🦊</span>
                      Confirm in MetaMask
                    </>
                  )}
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col items-center py-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="mb-4"
                >
                  <CheckCircle2 className="w-20 h-20 text-[#00FF88] drop-shadow-[0_0_24px_rgba(0,255,136,0.5)]" />
                </motion.div>
                <h3 className="font-heading text-2xl font-black mb-2">
                  <span style={{ color: '#00FF88' }}>Review Published On-Chain!</span>
                </h3>
                <p className="text-sm text-white/60 mb-6 max-w-sm">
                  Your review has been anchored to Polygon Amoy. It&apos;s now permanent and verifiable by anyone.
                </p>
                {txHash && (
                  <a
                    href={buildExplorerTxUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/[0.08] text-sm text-[#FFD700] hover:bg-[#FFD700]/15 transition-all"
                  >
                    View on Polygonscan
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="btn-ghost mt-6"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Footer navigation */}
          {step < 4 && (
            <div className="mt-8 flex items-center justify-between">
              {step > 1 ? (
                <button onClick={prevStep} className="btn-ghost !py-2 !px-5 !text-xs">
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={step === 3 ? () => setStep(4) : nextStep}
                disabled={
                  (step === 1 && rating === 0) || (step === 2 && content.length < 10)
                }
                className="btn-primary !py-2 !px-5 !text-xs"
              >
                {step === 3 ? 'Sign Review' : 'Next'}
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
