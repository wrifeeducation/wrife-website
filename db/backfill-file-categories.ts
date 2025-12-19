import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function detectFileCategoryFromName(filename: string): string {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('challenge')) {
    return 'worksheet_challenge';
  }
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('support')) {
    return 'worksheet_support';
  }
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('core')) {
    return 'worksheet_core';
  }
  if (lowerFilename.includes('worksheet')) {
    return 'worksheet_core';
  }
  
  if (lowerFilename.includes('presentation')) {
    return 'presentation';
  }
  
  if (lowerFilename.includes('assessment')) {
    return 'assessment';
  }
  
  if (lowerFilename.includes('progress') && lowerFilename.includes('tracker')) {
    return 'progress_tracker';
  }
  if (lowerFilename.includes('progress_tracker')) {
    return 'progress_tracker';
  }
  
  if (lowerFilename.includes('teacher') && lowerFilename.includes('guide')) {
    return 'teacher_guide';
  }
  if (lowerFilename.includes('teaching') && lowerFilename.includes('guide')) {
    return 'teacher_guide';
  }
  
  if (lowerFilename.endsWith('.html') || lowerFilename.endsWith('.htm')) {
    return 'interactive_practice';
  }
  
  return 'teacher_guide';
}

async function backfillFileCategories() {
  console.log('Starting file category backfill...\n');
  
  try {
    const { rows: files } = await pool.query(
      'SELECT id, lesson_id, file_name, file_type FROM lesson_files ORDER BY lesson_id, file_name'
    );
    
    console.log(`Found ${files.length} files to process.\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const file of files) {
      const detectedCategory = detectFileCategoryFromName(file.file_name);
      
      if (file.file_type !== detectedCategory) {
        console.log(`Updating: ${file.file_name}`);
        console.log(`  Old: ${file.file_type} -> New: ${detectedCategory}`);
        
        await pool.query(
          'UPDATE lesson_files SET file_type = $1 WHERE id = $2',
          [detectedCategory, file.id]
        );
        updated++;
      } else {
        skipped++;
      }
    }
    
    console.log(`\nBackfill complete!`);
    console.log(`  Updated: ${updated} files`);
    console.log(`  Skipped (already correct): ${skipped} files`);
    
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

backfillFileCategories();
