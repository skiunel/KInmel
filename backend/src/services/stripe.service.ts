import crypto from 'crypto';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ─── Stripe REST API client (no SDK dependency required) ───
// Uses fetch + form-encoded body — matches Stripe's REST contract.
// Adding the `stripe` SDK is recommended for production; this works without it.

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export interface StripeLineItem {
  name: string;
  amount: number; // in smallest currency unit (e.g., paisa or cents)
  currency: string;
  quantity: number;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

function isConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}

function encodeForm(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

async function stripeRequest<T>(
  path: string,
  body: Record<string, string | number>
): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured — set STRIPE_SECRET_KEY');
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-12-18.acacia',
    },
    body: encodeForm(body),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error(`Stripe API error (${response.status})`, text);
    throw new Error(`Stripe API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

/**
 * Creates a Stripe Checkout Session and returns its URL.
 * Caller redirects the browser to this URL to complete payment.
 */
export async function createCheckoutSession(input: {
  orderId: string;
  totalAmount: number; // in major currency units (e.g., dollars/rupees)
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  items: { name: string; amount: number; quantity: number }[];
}): Promise<StripeCheckoutSession> {
  const currency = input.currency ?? 'usd';
  const successUrlSeparator = input.successUrl.includes('?') ? '&' : '?';
  const successUrl = `${input.successUrl}${successUrlSeparator}session_id={CHECKOUT_SESSION_ID}`;
  const body: Record<string, string | number> = {
    mode: 'payment',
    success_url: successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.orderId,
    'metadata[orderId]': input.orderId,
  };

  if (input.customerEmail) {
    body.customer_email = input.customerEmail;
  }

  input.items.forEach((item, idx) => {
    body[`line_items[${idx}][price_data][currency]`] = currency;
    body[`line_items[${idx}][price_data][product_data][name]`] = item.name;
    body[`line_items[${idx}][price_data][unit_amount]`] = Math.round(item.amount * 100);
    body[`line_items[${idx}][quantity]`] = item.quantity;
  });

  const session = await stripeRequest<StripeCheckoutSession>('/checkout/sessions', body);
  return { id: session.id, url: session.url };
}

/**
 * Verifies a Stripe webhook signature using HMAC-SHA256.
 * Returns parsed event on success, null on failure.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined
): { type: string; data: { object: Record<string, unknown> } } | null {
  if (!env.STRIPE_WEBHOOK_SECRET || !signatureHeader) return null;

  const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

  // Parse signature header (format: t=timestamp,v1=signature)
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k, v];
    })
  );

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return null;

  const eventTime = Number.parseInt(timestamp, 10) * 1000;
  if (!Number.isFinite(eventTime)) return null;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', env.STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');
  if (signatureBuffer.length !== expectedBuffer.length) {
    logger.warn('Stripe webhook signature length mismatch');
    return null;
  }

  const valid = crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

  if (!valid) {
    logger.warn('Stripe webhook signature mismatch');
    return null;
  }

  // Reject events older than 5 minutes
  if (Date.now() - eventTime > 5 * 60 * 1000) {
    logger.warn('Stripe webhook event too old');
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function isStripeConfigured(): boolean {
  return isConfigured();
}
