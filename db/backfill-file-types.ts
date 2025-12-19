import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const FILE_TYPE_MAPPING: Record<string, string> = {
  'pdf': 'teacher_guide',
  'docx': 'worksheet_support',
  'doc': 'worksheet_support',
  'xlsx': 'progress_tracker',
  'xls': 'progress_tracker',
  'html': 'interactive_practice',
  'htm': 'interactive_practice',
  'pptx': 'presentation',
  'ppt': 'presentation',
};

async function backfillFileTypes() {
  console.log('Starting lesson_files file_type backfill...');
  
  try {
    const result = await pool.query(
      'SELECT id, file_type, file_name, file_url FROM lesson_files'
    );
    
    console.log(`Found ${result.rows.length} records to process`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const row of result.rows) {
      const currentType = row.file_type;
      
      const canonicalTypes = [
        'teacher_guide', 'presentation', 'interactive_practice',
        'worksheet_support', 'worksheet_core', 'worksheet_challenge',
        'progress_tracker', 'assessment'
      ];
      
      if (canonicalTypes.includes(currentType)) {
        console.log(`  Skipping ID ${row.id}: already canonical (${currentType})`);
        skipped++;
        continue;
      }
      
      let newType = FILE_TYPE_MAPPING[currentType];
      
      if (!newType) {
        const fileName = (row.file_name || '').toLowerCase();
        const fileUrl = (row.file_url || '').toLowerCase();
        
        if (fileName.includes('guide') || fileName.includes('teacher')) {
          newType = 'teacher_guide';
        } else if (fileName.includes('practice') || fileName.includes('interactive') || fileUrl.endsWith('.html')) {
          newType = 'interactive_practice';
        } else if (fileName.includes('presentation') || fileName.includes('ppt')) {
          newType = 'presentation';
        } else if (fileName.includes('worksheet')) {
          newType = 'worksheet_support';
        } else if (fileName.includes('tracker') || fileName.includes('progress')) {
          newType = 'progress_tracker';
        } else if (fileName.includes('assessment') || fileName.includes('test')) {
          newType = 'assessment';
        } else {
          newType = 'worksheet_support';
        }
      }
      
      console.log(`  Updating ID ${row.id}: ${currentType} -> ${newType}`);
      
      await pool.query(
        'UPDATE lesson_files SET file_type = $1 WHERE id = $2',
        [newType, row.id]
      );
      updated++;
    }
    
    console.log(`\nBackfill complete!`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
    
  } catch (error) {
    console.error('Backfill error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

backfillFileTypes()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
