import 'dotenv/config';
import Stripe from 'stripe';

async function getStripeClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Replit connector environment variables not found');
  }

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', 'development');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error('Stripe connection not found');
  }

  return new Stripe(connectionSettings.settings.secret, {
    apiVersion: '2025-08-27.basil' as any,
  });
}

async function seedProducts() {
  console.log('Connecting to Stripe...');
  const stripe = await getStripeClient();
  
  console.log('Checking for existing products...');
  const existingProducts = await stripe.products.list({ limit: 100 });
  
  const standardProduct = existingProducts.data.find(p => 
    p.metadata?.wrife_tier === 'standard'
  );
  const fullProduct = existingProducts.data.find(p => 
    p.metadata?.wrife_tier === 'full'
  );

  if (standardProduct && fullProduct) {
    console.log('Products already exist:');
    console.log('- Standard Teacher:', standardProduct.id);
    console.log('- Full Teacher:', fullProduct.id);
    
    const prices = await stripe.prices.list({ limit: 100 });
    console.log('\nExisting prices:');
    prices.data.forEach(price => {
      console.log(`  ${price.id}: ${price.unit_amount! / 100} ${price.currency.toUpperCase()} ${price.recurring?.interval || 'one-time'}`);
    });
    return;
  }

  console.log('\nCreating Teacher Standard product...');
  const standardTeacher = await stripe.products.create({
    name: 'Teacher Standard',
    description: 'Full access to all lesson materials including support worksheets, progress trackers, and assessment materials.',
    metadata: {
      wrife_tier: 'standard',
      features: 'All lesson materials, worksheets, progress trackers'
    }
  });
  console.log('Created product:', standardTeacher.id);

  console.log('Creating Teacher Standard prices...');
  const standardMonthly = await stripe.prices.create({
    product: standardTeacher.id,
    unit_amount: 499,
    currency: 'gbp',
    recurring: { interval: 'month' },
    metadata: { billing_period: 'monthly' }
  });
  console.log('Created monthly price:', standardMonthly.id, '- £4.99/month');

  const standardYearly = await stripe.prices.create({
    product: standardTeacher.id,
    unit_amount: 4900,
    currency: 'gbp',
    recurring: { interval: 'year' },
    metadata: { billing_period: 'yearly' }
  });
  console.log('Created yearly price:', standardYearly.id, '- £49/year');

  console.log('\nCreating Teacher Full product...');
  const fullTeacher = await stripe.products.create({
    name: 'Teacher Full',
    description: 'Complete platform access including class management for up to 30 pupils, assignments, and AI-powered assessment.',
    metadata: {
      wrife_tier: 'full',
      features: 'All materials, class management, AI assessment, 30 pupils'
    }
  });
  console.log('Created product:', fullTeacher.id);

  console.log('Creating Teacher Full prices...');
  const fullMonthly = await stripe.prices.create({
    product: fullTeacher.id,
    unit_amount: 999,
    currency: 'gbp',
    recurring: { interval: 'month' },
    metadata: { billing_period: 'monthly' }
  });
  console.log('Created monthly price:', fullMonthly.id, '- £9.99/month');

  const fullYearly = await stripe.prices.create({
    product: fullTeacher.id,
    unit_amount: 9900,
    currency: 'gbp',
    recurring: { interval: 'year' },
    metadata: { billing_period: 'yearly' }
  });
  console.log('Created yearly price:', fullYearly.id, '- £99/year');

  console.log('\n✅ Products and prices created successfully!');
  console.log('\nProduct IDs:');
  console.log('  Teacher Standard:', standardTeacher.id);
  console.log('  Teacher Full:', fullTeacher.id);
  console.log('\nPrice IDs:');
  console.log('  Standard Monthly:', standardMonthly.id);
  console.log('  Standard Yearly:', standardYearly.id);
  console.log('  Full Monthly:', fullMonthly.id);
  console.log('  Full Yearly:', fullYearly.id);
}

seedProducts().catch(console.error);
