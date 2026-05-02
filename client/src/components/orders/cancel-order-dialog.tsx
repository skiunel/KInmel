'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCancelOrder } from '@/hooks/use-orders';

interface CancelOrderDialogProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onClose: () => void;
}

export function CancelOrderDialog({
  orderId,
  orderNumber,
  open,
  onClose,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');
  const cancelMutation = useCancelOrder();

  if (!open) return null;

  async function handleCancel() {
    if (reason.length < 5) return;
    await cancelMutation.mutateAsync({ id: orderId, reason });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Cancel Order</h3>
            <p className="text-xs text-muted-foreground font-mono">{orderNumber}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          This action cannot be undone. Stock will be restored and any pending
          payment will be cancelled.
        </p>

        <Textarea
          placeholder="Please tell us why you're cancelling (min. 5 characters)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {reason.length}/500
        </p>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} disabled={cancelMutation.isPending}>
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={reason.length < 5 || cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel Order'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
