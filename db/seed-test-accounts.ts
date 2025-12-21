import { Pool } from 'pg';
import * as dotenv from 'dotenv';

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local' });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set.');
  console.error('Either set DATABASE_URL in your environment or ensure .env.local exists.');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

interface TestAccount {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'school_admin' | 'teacher' | 'pupil';
  membership_tier: 'free' | 'standard' | 'full' | 'school';
  school_id?: number | null;
}

const testAccounts: TestAccount[] = [
  {
    id: 'e33e0fae-f7ab-4506-b295-8bc4203aa0d1',
    email: 'wrife.education@gmail.com',
    display_name: 'Michael Ankrah',
    role: 'admin',
    membership_tier: 'full',
    school_id: null,
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'teacher@test.wrife.co.uk',
    display_name: 'Test Teacher (Full)',
    role: 'teacher',
    membership_tier: 'full',
    school_id: null,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'teacher.free@test.wrife.co.uk',
    display_name: 'Test Teacher (Free)',
    role: 'teacher',
    membership_tier: 'free',
    school_id: null,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'teacher.standard@test.wrife.co.uk',
    display_name: 'Test Teacher (Standard)',
    role: 'teacher',
    membership_tier: 'standard',
    school_id: null,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'pupil@test.wrife.co.uk',
    display_name: 'Test Pupil',
    role: 'pupil',
    membership_tier: 'free',
    school_id: null,
  },
];

async function seedTestAccounts() {
  console.log('Seeding test accounts to development database...\n');

  const client = await pool.connect();

  try {
    for (const account of testAccounts) {
      const result = await client.query(
        `INSERT INTO profiles (id, email, display_name, role, membership_tier, school_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           display_name = EXCLUDED.display_name,
           role = EXCLUDED.role,
           membership_tier = EXCLUDED.membership_tier,
           school_id = EXCLUDED.school_id,
           updated_at = NOW()
         RETURNING id, email, role, membership_tier`,
        [account.id, account.email, account.display_name, account.role, account.membership_tier, account.school_id]
      );

      const row = result.rows[0];
      console.log(`✓ ${row.email} (${row.role}, ${row.membership_tier})`);
    }

    console.log('\n✅ Test accounts seeded successfully!');
    console.log('\nNote: These profiles are linked to Supabase auth accounts.');
    console.log('For test accounts to work, you need to create matching Supabase users.');
    console.log('The admin account (wrife.education@gmail.com) already exists in Supabase.');
  } catch (error) {
    console.error('Error seeding test accounts:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedTestAccounts().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
