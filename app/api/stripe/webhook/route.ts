import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUncachableStripeClient } from '@/lib/stripe-client';
import { getPool } from '@/lib/db';

/**
 * Maps Stripe product metadata (wrife_tier) to the membership_tier
 * values stored in the profiles table.
 */
const tierMapping: Record<string, string> = {
  standard: 'standard',
  full: 'full',
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify the webhook signature — this replaces stripe-replit-sync.processWebhook()
  let event: Stripe.Event;
  try {
    const stripe = await getUncachableStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const stripe = await getUncachableStripeClient();
  const pool = getPool();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id;

          if (priceId) {
            const price = await stripe.prices.retrieve(priceId, {
              expand: ['product'],
            });
            const product = price.product as Stripe.Product;
            const wrifeTier = product.metadata?.wrife_tier;
            const membershipTier = tierMapping[wrifeTier] || 'standard';

            await pool.query(
              `UPDATE profiles
               SET stripe_subscription_id = $1,
                   membership_tier        = $2,
                   updated_at             = NOW()
               WHERE id = $3`,
              [subscriptionId, membershipTier, userId]
            );
            console.log(`[stripe/webhook] User ${userId} upgraded to tier: ${membershipTier}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        const profileResult = await pool.query(
          'SELECT id FROM profiles WHERE stripe_customer_id = $1',
          [customerId]
        );
        const profile = profileResult.rows[0];

        if (profile) {
          const priceId = subscription.items.data[0]?.price?.id;
          if (priceId) {
            const price = await stripe.prices.retrieve(priceId, {
              expand: ['product'],
            });
            const product = price.product as Stripe.Product;
            const wrifeTier = product.metadata?.wrife_tier;
            const membershipTier = tierMapping[wrifeTier] || 'standard';

            await pool.query(
              `UPDATE profiles
               SET stripe_subscription_id = $1,
                   membership_tier        = $2,
                   updated_at             = NOW()
               WHERE id = $3`,
              [subscription.id, membershipTier, profile.id]
            );
            console.log(`[stripe/webhook] Subscription updated for customer: ${customerId} → ${membershipTier}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        await pool.query(
          `UPDATE profiles
           SET stripe_subscription_id = NULL,
               membership_tier        = 'free',
               updated_at             = NOW()
           WHERE stripe_customer_id = $1`,
          [customerId]
        );
        console.log(`[stripe/webhook] Subscription cancelled for customer: ${customerId}`);
        break;
      }

      default:
        // Unhandled event types — acknowledge receipt without acting
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error('[stripe/webhook] Error processing event:', error);
    // Return 200 so Stripe doesn't retry — log the error for investigation
    return NextResponse.json({ received: true, error: error.message });
  }

  return NextResponse.json({ received: true });
}
