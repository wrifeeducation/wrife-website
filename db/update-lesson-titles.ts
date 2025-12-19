import { Pool } from 'pg';
import * as fs from 'fs';

function loadEnvFile(path: string): Record<string, string> {
  const content = fs.readFileSync(path, 'utf-8');
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      vars[match[1]] = match[2];
    }
  }
  return vars;
}

const envVars = loadEnvFile('.env.local');
const databaseUrlFromEnv = envVars.DATABASE_URL;

const curriculumLessons = [
  { lesson_number: 1, part: null, title: 'Developing Awareness of Personal Stories' },
  { lesson_number: 2, part: null, title: 'Telling Our Story' },
  { lesson_number: 3, part: null, title: 'Learning Other Stories' },
  { lesson_number: 4, part: null, title: 'Basic Story Structure' },
  { lesson_number: 5, part: null, title: 'Five-Part Story Structure' },
  { lesson_number: 6, part: null, title: 'Basic Story Types' },
  { lesson_number: 7, part: null, title: 'Nouns and Their Determiners' },
  { lesson_number: 8, part: null, title: 'Common and Proper Nouns (Singular or Plural)' },
  { lesson_number: 9, part: null, title: 'Main and Helping Verbs' },
  { lesson_number: 10, part: null, title: 'Present or Past Tense' },
  { lesson_number: 11, part: null, title: 'Subject, Main Verb and Object' },
  { lesson_number: 12, part: null, title: 'Adjectives' },
  { lesson_number: 13, part: null, title: 'Adverbs (When, Where, Why, How)' },
  { lesson_number: 14, part: null, title: 'Pronouns' },
  { lesson_number: 15, part: null, title: 'Prepositions' },
  { lesson_number: 16, part: null, title: 'Retrieving Information from Text' },
  { lesson_number: 17, part: null, title: 'Identifying Meaning and Usage of Words' },
  { lesson_number: 18, part: null, title: 'Sentence Types: Questions and Statements (Full Stops/Question Marks)' },
  { lesson_number: 19, part: null, title: 'Commands and Exclamation' },
  { lesson_number: 20, part: null, title: 'Phrases' },
  { lesson_number: 21, part: null, title: 'Clauses' },
  { lesson_number: 22, part: null, title: 'Dependent and Independent Clauses' },
  { lesson_number: 23, part: null, title: 'What is a Sentence' },
  { lesson_number: 24, part: null, title: 'Simple Sentences with Different Lengths' },
  { lesson_number: 25, part: null, title: 'Different ways of forming simple sentences' },
  { lesson_number: 26, part: null, title: 'Active versus Passive Voice' },
  { lesson_number: 27, part: 'a', title: 'What is a paragraph?' },
  { lesson_number: 27, part: 'b', title: 'Introduction to the Connect Grid' },
  { lesson_number: 28, part: null, title: 'Using Paragraphs Effectively' },
  { lesson_number: 29, part: null, title: 'Short Narratives' },
  { lesson_number: 30, part: null, title: 'Compound and Complex Sentences' },
  { lesson_number: 31, part: null, title: '7 Basic Story Types' },
  { lesson_number: 32, part: null, title: 'Noun, Adjective and Adverbial Phrases' },
  { lesson_number: 33, part: null, title: 'Direct Speech' },
  { lesson_number: 34, part: null, title: 'Personal Pronouns' },
  { lesson_number: 35, part: null, title: 'Developing a Storyline' },
  { lesson_number: 36, part: null, title: 'Deconstructing a Text - Using the Connect Grid' },
  { lesson_number: 37, part: null, title: 'Adaptation' },
  { lesson_number: 38, part: null, title: 'Writing a New Story After Adaptation' },
  { lesson_number: 39, part: null, title: 'Plan a New Piece of Writing on a Connect Grid' },
  { lesson_number: 40, part: null, title: 'Telling My Story (After Planning)' },
  { lesson_number: 41, part: null, title: 'Writing My First Draft' },
  { lesson_number: 42, part: null, title: 'Checking Sentences and Punctuation (1st Edit)' },
  { lesson_number: 43, part: null, title: 'My Story Timeline (Second Edit)' },
  { lesson_number: 44, part: null, title: 'Shaping Our Contents (Restructuring Paragraphs and Sections)' },
  { lesson_number: 45, part: null, title: 'Similes, Metaphors and Personification' },
  { lesson_number: 46, part: null, title: 'Show Don\'t Tell (Edit for Description)' },
  { lesson_number: 47, part: null, title: 'Reading Aloud and Giving Editorial Feedback' },
  { lesson_number: 48, part: null, title: 'Transitions (Cohesion in Storyline)' },
  { lesson_number: 49, part: null, title: 'Cohesion (Within Paragraphs)' },
  { lesson_number: 50, part: null, title: 'Cohesion Between Sentences' },
  { lesson_number: 51, part: null, title: 'Final Draft' },
  { lesson_number: 52, part: null, title: 'Writing a News Report' },
  { lesson_number: 53, part: null, title: 'Report Writing' },
  { lesson_number: 54, part: null, title: 'Diaries and Journals' },
  { lesson_number: 55, part: null, title: 'Argument (One-Sided and Balanced)' },
  { lesson_number: 56, part: null, title: 'Letters (Formal and Informal)' },
  { lesson_number: 57, part: null, title: 'Explanations and Instructions (Including Recipes)' },
  { lesson_number: 58, part: null, title: 'Biography' },
  { lesson_number: 59, part: null, title: 'Posters and Advertising' },
  { lesson_number: 60, part: null, title: 'Speech Writing and Presentation' },
  { lesson_number: 61, part: null, title: 'Descriptions (Characters, Setting and Thoughts)' },
  { lesson_number: 62, part: null, title: 'Poetry' },
  { lesson_number: 63, part: null, title: 'Choosing a Project - Where and How to Find Inspiration' },
  { lesson_number: 64, part: null, title: 'Project Planning and Research' },
  { lesson_number: 65, part: null, title: 'Beginning Project Work' },
  { lesson_number: 66, part: null, title: 'Group and Individual tutorial sessions' },
  { lesson_number: 67, part: null, title: 'Celebrating the End Results' },
];

async function updateLessonTitles() {
  const databaseUrl = databaseUrlFromEnv || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env.local or environment');
    process.exit(1);
  }

  console.log('Connecting to database host:', databaseUrl.split('@')[1]?.split('/')[0]);
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('\n=== Current Lessons in Database ===\n');
    const currentLessons = await pool.query(
      'SELECT id, lesson_number, part, title FROM lessons ORDER BY lesson_number, part'
    );
    
    for (const row of currentLessons.rows) {
      console.log(`ID ${row.id}: Lesson ${row.lesson_number}${row.part || ''} - ${row.title}`);
    }

    console.log('\n=== Updating Lesson Titles ===\n');
    
    let updatedCount = 0;
    let skippedCount = 0;
    const issues: string[] = [];

    for (const lesson of curriculumLessons) {
      const whereClause = lesson.part 
        ? 'lesson_number = $1 AND part = $2'
        : 'lesson_number = $1 AND (part IS NULL OR part = \'\')';
      
      const params = lesson.part 
        ? [lesson.lesson_number, lesson.part]
        : [lesson.lesson_number];

      const existing = await pool.query(
        `SELECT id, title FROM lessons WHERE ${whereClause}`,
        params
      );

      if (existing.rows.length === 0) {
        issues.push(`MISSING: Lesson ${lesson.lesson_number}${lesson.part || ''} not found in database`);
        continue;
      }

      const currentTitle = existing.rows[0].title;
      const lessonId = existing.rows[0].id;

      if (currentTitle === lesson.title) {
        skippedCount++;
        continue;
      }

      await pool.query(
        'UPDATE lessons SET title = $1 WHERE id = $2',
        [lesson.title, lessonId]
      );

      console.log(`Updated Lesson ${lesson.lesson_number}${lesson.part || ''}:`);
      console.log(`  Old: "${currentTitle}"`);
      console.log(`  New: "${lesson.title}"`);
      updatedCount++;
    }

    const extraLessons = await pool.query(
      'SELECT id, lesson_number, part, title FROM lessons WHERE lesson_number > 67 ORDER BY lesson_number'
    );
    
    if (extraLessons.rows.length > 0) {
      console.log('\n=== Extra Lessons Found (lesson_number > 67) ===\n');
      for (const row of extraLessons.rows) {
        console.log(`ID ${row.id}: Lesson ${row.lesson_number}${row.part || ''} - ${row.title}`);
        issues.push(`EXTRA: Lesson ${row.lesson_number}${row.part || ''} "${row.title}" exists but not in curriculum`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total lessons in curriculum: ${curriculumLessons.length}`);
    console.log(`Titles updated: ${updatedCount}`);
    console.log(`Titles already correct: ${skippedCount}`);
    
    if (issues.length > 0) {
      console.log(`\n=== Issues Found (${issues.length}) ===`);
      for (const issue of issues) {
        console.log(`  - ${issue}`);
      }
    }

    console.log('\n=== Final Lesson List ===\n');
    const finalLessons = await pool.query(
      'SELECT id, lesson_number, part, title FROM lessons ORDER BY lesson_number, part'
    );
    
    for (const row of finalLessons.rows) {
      console.log(`ID ${row.id}: Lesson ${row.lesson_number}${row.part || ''} - ${row.title}`);
    }

  } catch (error) {
    console.error('Error updating lessons:', error);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

updateLessonTitles();
