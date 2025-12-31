import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUncachableStripeClient } from '@/lib/stripe-client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const stripe = await getUncachableStripeClient();

    const profileResult = await pool.query(
      'SELECT id, email, stripe_customer_id, display_name FROM profiles WHERE id = $1',
      [user.id]
    );
    const profile = profileResult.rows[0];

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        name: profile.display_name || undefined,
        metadata: { userId: user.id }
      });
      customerId = customer.id;

      await pool.query(
        'UPDATE profiles SET stripe_customer_id = $1, updated_at = NOW() WHERE id = $2',
        [customerId, user.id]
      );
    }

    const host = request.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/pricing/success`,
      cancel_url: `${baseUrl}/pricing?subscription=cancelled`,
      metadata: { userId: user.id }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
