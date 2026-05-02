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
    
    // Strip any ?sslmode from the connection string to avoid conflicts,
    // then apply SSL via the config object instead (required for Supabase on Vercel)
    const cleanConnectionString = connectionString.replace(/\?.*$/, '');

    // IMPORTANT: In serverless environments (Vercel), each function invocation
    // can create its own pool. Keep max very low (2) to avoid exhausting
    // Supabase's connection limit (~100 on free tier, ~200 on pro).
    // Use a short idle timeout so connections are released quickly.
    pool = new Pool({
      connectionString: cleanConnectionString,
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
      ssl: {
        rejectUnauthorized: false,
      },
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
