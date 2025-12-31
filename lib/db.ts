import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.PROD_DATABASE_URL;
    
    if (!connectionString) {
      throw new Error(
        'PROD_DATABASE_URL environment variable is required. ' +
        'All environments must use the Supabase database for data consistency.'
      );
    }
    
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export function getConnectionString(): string {
  const connectionString = process.env.PROD_DATABASE_URL;
  if (!connectionString) {
    throw new Error('PROD_DATABASE_URL environment variable is required.');
  }
  return connectionString;
}
