import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
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
  return process.env.PROD_DATABASE_URL || process.env.DATABASE_URL || '';
}
