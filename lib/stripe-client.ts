// This file is intentionally minimal — see app/pricing/page.tsx for price IDs
import Stripe from 'stripe';

/**
 * Returns a fresh Stripe client on every call (intentionally uncached)
 * so that key rotation takes effect immediately.
 *
 * Requires: STRIPE_SECRET_KEY environment variable.
 */
export async function getUncachableStripeClient(): Promise<Stripe> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil' as any,
  });
}

/**
 * Returns the publishable key for use in browser-side Stripe.js.
 *
 * Requires: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is not set.');
  }
  return key;
}

/**
 * Returns the Stripe secret key as a plain string.
 * Use getUncachableStripeClient() unless you specifically need the raw key.
 */
export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
  }
  return key;
}
