/**
 * One-time migration: create the resource_assignments table.
 * Run with: npx tsx db/create-resource-assignments.ts
 */
import { getPool } from '../lib/db';

async function main() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS resource_assignments (
      id              SERIAL PRIMARY KEY,
      lesson_file_id  INTEGER NOT NULL,
      lesson_id       INTEGER NOT NULL,
      class_id        INTEGER NOT NULL,
      teacher_id      UUID    NOT NULL,
      title           VARCHAR NOT NULL,
      file_type       VARCHAR NOT NULL,
      file_url        TEXT    NOT NULL,
      message         TEXT,
      due_date        DATE,
      status          VARCHAR NOT NULL DEFAULT 'active',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_resource_assignments_class_id   ON resource_assignments (class_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_resource_assignments_teacher_id ON resource_assignments (teacher_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_resource_assignments_lesson_id  ON resource_assignments (lesson_id)`);

  console.log('✅ resource_assignments table created (or already existed)');
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
