import { getUncachableStripeClient } from '../lib/stripe-client';

async function setupStripeProducts() {
  console.log('Setting up Stripe products and prices...\n');
  
  const stripe = await getUncachableStripeClient();

  try {
    const standardProduct = await stripe.products.create({
      name: 'Standard Teacher',
      description: 'Full access to all lesson materials including Support & Challenge Worksheets, Progress Trackers, Assessment Materials, and Interactive Practice Activities.',
      metadata: {
        wrife_tier: 'standard',
      },
    });
    console.log('Created Standard Teacher product:', standardProduct.id);

    const standardMonthlyPrice = await stripe.prices.create({
      product: standardProduct.id,
      unit_amount: 499,
      currency: 'gbp',
      recurring: { interval: 'month' },
      metadata: { plan: 'standard', billing: 'monthly' },
    });
    console.log('Created Standard Monthly price:', standardMonthlyPrice.id);

    const standardYearlyPrice = await stripe.prices.create({
      product: standardProduct.id,
      unit_amount: 4900,
      currency: 'gbp',
      recurring: { interval: 'year' },
      metadata: { plan: 'standard', billing: 'yearly' },
    });
    console.log('Created Standard Yearly price:', standardYearlyPrice.id);

    const fullProduct = await stripe.products.create({
      name: 'Full Teacher',
      description: 'Complete platform access including Class Management, Pupil Assignments, and AI-Powered Assessment.',
      metadata: {
        wrife_tier: 'full',
      },
    });
    console.log('\nCreated Full Teacher product:', fullProduct.id);

    const fullMonthlyPrice = await stripe.prices.create({
      product: fullProduct.id,
      unit_amount: 999,
      currency: 'gbp',
      recurring: { interval: 'month' },
      metadata: { plan: 'full', billing: 'monthly' },
    });
    console.log('Created Full Monthly price:', fullMonthlyPrice.id);

    const fullYearlyPrice = await stripe.prices.create({
      product: fullProduct.id,
      unit_amount: 9900,
      currency: 'gbp',
      recurring: { interval: 'year' },
      metadata: { plan: 'full', billing: 'yearly' },
    });
    console.log('Created Full Yearly price:', fullYearlyPrice.id);

    console.log('\n========================================');
    console.log('STRIPE PRODUCTS CREATED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('Update your pricing page with these price IDs:\n');
    console.log('Standard Teacher:');
    console.log(`  monthlyPriceId: '${standardMonthlyPrice.id}'`);
    console.log(`  yearlyPriceId: '${standardYearlyPrice.id}'`);
    console.log('\nFull Teacher:');
    console.log(`  monthlyPriceId: '${fullMonthlyPrice.id}'`);
    console.log(`  yearlyPriceId: '${fullYearlyPrice.id}'`);

    return {
      standardMonthlyPriceId: standardMonthlyPrice.id,
      standardYearlyPriceId: standardYearlyPrice.id,
      fullMonthlyPriceId: fullMonthlyPrice.id,
      fullYearlyPriceId: fullYearlyPrice.id,
    };
  } catch (error: any) {
    console.error('Error setting up Stripe products:', error.message);
    throw error;
  }
}

setupStripeProducts()
  .then((priceIds) => {
    console.log('\nPrice IDs for programmatic use:', JSON.stringify(priceIds, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
