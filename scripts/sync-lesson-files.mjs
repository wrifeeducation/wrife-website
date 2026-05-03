/**
 * sync-lesson-files.mjs
 * ─────────────────────
 * Uploads ALL lesson files from the "WriFe Lessons" folder to Supabase storage,
 * then repairs the lesson_files database to remove bad generic-type records and
 * replace them with correct typed records for all 68 lessons.
 *
 * Run from the wrife-website directory:
 *   node scripts/sync-lesson-files.mjs
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   PROD_DATABASE_URL  (or DATABASE_URL)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load .env.local (optional — falls back to existing process.env) ──────────
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  try {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
    console.log('✅  Loaded .env.local');
  } catch {
    console.log('ℹ️   No .env.local found — using environment variables already set.');
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
const BUCKET = 'lesson-files';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL in .env.local');
  process.exit(1);
}

// ── Supabase + Postgres clients ──────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 2 });

// ── WriFe Lessons folder (sibling of the "WriFe App Build" folder) ───────────
// Adjust this path if your Google Drive folder structure differs.
const LESSONS_BASE = join(ROOT, '..', '..', 'WriFe Lessons');

// ── Lesson number → DB id mapping ───────────────────────────────────────────
// L1-L26:  db_id = lesson_number
// L27a:    db_id = 27
// L27b:    db_id = 28
// L28+:    db_id = lesson_number + 1
function lessonNumToDbId(lessonNum, part) {
  if (lessonNum < 27) return lessonNum;
  if (lessonNum === 27) return part === 'b' ? 28 : 27;
  return lessonNum + 1;
}

// ── Filename → canonical file_type ──────────────────────────────────────────
function detectFileType(filename) {
  const n = filename.toLowerCase();
  if (n.includes('presentation') || n.includes('mini_lesson')) return 'presentation';
  if (n.includes('teacher_guide') || n.includes('teacher guide')) return 'teacher_guide';
  if (n.includes('interactive_practice') || n.includes('interactive practice')) return 'interactive_practice';
  if (n.includes('worksheet') && (n.includes('_challenge') || n.includes(' challenge'))) return 'worksheet_challenge';
  if (n.includes('worksheet') && (n.includes('_support') || n.includes(' support'))) return 'worksheet_support';
  if (n.includes('worksheet') && (n.includes('_core') || n.includes(' core'))) return 'worksheet_core';
  if (n.includes('worksheet')) return 'worksheet_core';
  if (n.includes('progress_tracker') || n.includes('progress tracker')) return 'progress_tracker';
  if (n.includes('assessment')) return 'assessment';
  return null; // skip unknown files
}

function getMimeType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt:  'application/vnd.ms-powerpoint',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc:  'application/msword',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls:  'application/vnd.ms-excel',
    pdf:  'application/pdf',
    html: 'text/html',
    htm:  'text/html',
  };
  return map[ext] || 'application/octet-stream';
}

// ── Ensure storage bucket is public ─────────────────────────────────────────
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true });
    console.log(`✅  Created bucket: ${BUCKET}`);
  }
}

// ── Upload a single file to Supabase storage ─────────────────────────────────
async function uploadFile(dbId, filename, fileBuffer, mimeType) {
  const storagePath = `lesson-${dbId}/${filename}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ── Upsert a lesson_files DB record ──────────────────────────────────────────
async function upsertFileRecord(dbId, fileType, filename, publicUrl, client) {
  // Remove any existing record with same lesson_id + file_type + file_name combination
  // (for presentations: also remove any existing record of type 'presentation' or 'pptx' to avoid duplicates)
  if (fileType === 'presentation') {
    await client.query(
      `DELETE FROM lesson_files WHERE lesson_id = $1 AND file_type IN ('presentation','pptx')`,
      [dbId]
    );
  } else {
    await client.query(
      `DELETE FROM lesson_files WHERE lesson_id = $1 AND file_type = $2`,
      [dbId, fileType]
    );
  }
  await client.query(
    `INSERT INTO lesson_files (lesson_id, file_type, file_name, file_url) VALUES ($1,$2,$3,$4)`,
    [dbId, fileType, filename, publicUrl]
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  WriFe Lesson File Sync');
  console.log('📁  Lessons folder:', LESSONS_BASE);
  console.log('');

  await ensureBucket();

  const client = await pool.connect();
  let processed = 0;
  let errors = 0;

  try {
    // Step 1: Remove all badly-typed generic records (pptx/docx/html/pdf/xlsx)
    // These were uploaded in bulk with wrong lesson numbers and wrong filenames.
    console.log('🧹  Removing bad generic-type records from DB…');
    const { rowCount } = await client.query(
      `DELETE FROM lesson_files WHERE file_type IN ('pptx','docx','html','pdf','xlsx')`
    );
    console.log(`    Removed ${rowCount} bad records.\n`);

    // Step 2: Read all lesson folders
    let lessonFolders;
    try {
      lessonFolders = readdirSync(LESSONS_BASE);
    } catch {
      console.error(`❌  Cannot read lessons folder at: ${LESSONS_BASE}`);
      console.error('    Adjust the LESSONS_BASE path in this script if needed.');
      process.exit(1);
    }

    // Only process Lesson_## folders
    const lessonDirs = lessonFolders
      .filter(f => /^Lesson_\d+/.test(f))
      .sort();

    console.log(`📚  Found ${lessonDirs.length} lesson folders.\n`);

    for (const dir of lessonDirs) {
      const lessonNumMatch = dir.match(/Lesson_(\d+)/);
      if (!lessonNumMatch) continue;
      const lessonNum = parseInt(lessonNumMatch[1]);
      const fullDir = join(LESSONS_BASE, dir);

      let files;
      try {
        files = readdirSync(fullDir).filter(f => statSync(join(fullDir, f)).isFile());
      } catch {
        console.warn(`  ⚠️  Cannot read folder: ${dir}`);
        continue;
      }

      for (const filename of files) {
        // Determine part from filename (L27a / L27b)
        const partMatch = filename.match(/L\d+([ab])_/i);
        const part = partMatch ? partMatch[1].toLowerCase() : null;
        const dbId = lessonNumToDbId(lessonNum, part || 'a');

        const fileType = detectFileType(filename);
        if (!fileType) {
          // Skip unrecognised files (e.g. .gsheet, .zip etc.)
          continue;
        }

        const mimeType = getMimeType(filename);
        const filePath = join(fullDir, filename);

        process.stdout.write(`  L${lessonNum}${part || ''} (db:${dbId})  ${fileType.padEnd(20)} ${filename} … `);

        try {
          const buffer = readFileSync(filePath);
          const publicUrl = await uploadFile(dbId, filename, buffer, mimeType);
          await upsertFileRecord(dbId, fileType, filename, publicUrl, client);
          console.log('✅');
          processed++;
        } catch (err) {
          console.log(`❌  ${err.message}`);
          errors++;
        }
      }
    }

    console.log('');
    console.log(`✅  Sync complete! ${processed} files processed, ${errors} errors.`);

    if (errors > 0) {
      console.log('   Some files failed — re-run the script to retry, or upload manually via the admin panel.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
