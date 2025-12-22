import { NextRequest, NextResponse } from 'next/server';
import { getStripeSync, getUncachableStripeClient } from '@/lib/stripe-client';
import { Pool } from 'pg';
import { runMigrations } from 'stripe-replit-sync';

const pool = new Pool({ connectionString: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL });

const tierMapping: Record<string, string> = {
  'standard': 'standard',
  'full': 'full',
};

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    await runMigrations({ 
      databaseUrl: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL!
    });

    const stripeSync = await getStripeSync();
    
    await stripeSync.processWebhook(Buffer.from(rawBody), signature);

    const bodyJson = JSON.parse(rawBody);
    const eventType = bodyJson.type;

    if (!eventType) {
      return NextResponse.json({ received: true });
    }

    const stripe = await getUncachableStripeClient();

    switch (eventType) {
      case 'checkout.session.completed': {
        const session = bodyJson.data?.object;
        const userId = session?.metadata?.userId;
        const subscriptionId = session?.subscription;

        if (userId && subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
            const priceId = subscription.items.data[0]?.price?.id;
            
            if (priceId) {
              const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
              const product = price.product as any;
              const wrifeTier = product.metadata?.wrife_tier;
              const membershipTier = tierMapping[wrifeTier] || 'standard';

              await pool.query(
                `UPDATE profiles 
                 SET stripe_subscription_id = $1, membership_tier = $2, updated_at = NOW() 
                 WHERE id = $3`,
                [subscriptionId, membershipTier, userId]
              );
              console.log(`Updated user ${userId} to tier: ${membershipTier}`);
            }
          } catch (err) {
            console.error('Error processing checkout.session.completed:', err);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = bodyJson.data?.object;
        const customerId = subscription?.customer;

        if (customerId) {
          try {
            const profileResult = await pool.query(
              'SELECT id FROM profiles WHERE stripe_customer_id = $1',
              [customerId]
            );
            const profile = profileResult.rows[0];

            if (profile) {
              const priceId = subscription.items?.data?.[0]?.price?.id;
              if (priceId) {
                const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
                const product = price.product as any;
                const wrifeTier = product.metadata?.wrife_tier;
                const membershipTier = tierMapping[wrifeTier] || 'standard';

                await pool.query(
                  `UPDATE profiles 
                   SET stripe_subscription_id = $1, membership_tier = $2, updated_at = NOW() 
                   WHERE id = $3`,
                  [subscription.id, membershipTier, profile.id]
                );
              }
            }
          } catch (err) {
            console.error('Error processing customer.subscription.updated:', err);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = bodyJson.data?.object;
        const customerId = subscription?.customer;

        if (customerId) {
          try {
            await pool.query(
              `UPDATE profiles 
               SET stripe_subscription_id = NULL, membership_tier = 'free', updated_at = NOW() 
               WHERE stripe_customer_id = $1`,
              [customerId]
            );
            console.log(`Subscription cancelled for customer: ${customerId}`);
          } catch (err) {
            console.error('Error processing customer.subscription.deleted:', err);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
