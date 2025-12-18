import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const curriculumData = [
  { lesson_number: 10, lesson_name: 'Nouns and Verbs', concepts_introduced: ['noun', 'verb'], concepts_cumulative: ['noun', 'verb'], pwp_stage: 'foundation', pwp_duration_minutes: 5, pwp_formula_count_min: 2, pwp_formula_count_max: 2, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'lion', 'elephant', 'frog', 'butterfly', 'bear'] },
  { lesson_number: 11, lesson_name: 'Determiners', concepts_introduced: ['determiner'], concepts_cumulative: ['noun', 'verb', 'determiner'], pwp_stage: 'foundation', pwp_duration_minutes: 5, pwp_formula_count_min: 3, pwp_formula_count_max: 3, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'lion', 'elephant', 'frog', 'butterfly', 'bear'] },
  { lesson_number: 12, lesson_name: 'Adjectives', concepts_introduced: ['adjective'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective'], pwp_stage: 'foundation', pwp_duration_minutes: 5, pwp_formula_count_min: 3, pwp_formula_count_max: 3, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'lion', 'elephant', 'frog', 'butterfly', 'bear'] },
  { lesson_number: 13, lesson_name: 'Adverbs', concepts_introduced: ['adverb'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb'], pwp_stage: 'foundation', pwp_duration_minutes: 5, pwp_formula_count_min: 4, pwp_formula_count_max: 4, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'lion', 'elephant', 'frog', 'butterfly', 'bear'] },
  { lesson_number: 14, lesson_name: 'Conjunctions', concepts_introduced: ['review'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'conjunction'], pwp_stage: 'foundation', pwp_duration_minutes: 5, pwp_formula_count_min: 4, pwp_formula_count_max: 4, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'lion', 'elephant', 'frog', 'butterfly', 'bear'] },
  { lesson_number: 15, lesson_name: 'Pronouns', concepts_introduced: ['consolidation'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'conjunction', 'pronoun'], pwp_stage: 'foundation', pwp_duration_minutes: 5, pwp_formula_count_min: 4, pwp_formula_count_max: 4, paragraph_writing_enabled: false, subject_assignment_type: 'free_choice', subject_condition: null, subject_ideas: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'lion', 'elephant', 'frog', 'butterfly', 'bear'] },
  { lesson_number: 16, lesson_name: 'Retrieving Information', concepts_introduced: ['comprehension'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb'], pwp_stage: 'development', pwp_duration_minutes: 7, pwp_formula_count_min: 3, pwp_formula_count_max: 5, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['school', 'library', 'park', 'beach', 'forest', 'city', 'village', 'garden', 'museum', 'castle'] },
  { lesson_number: 17, lesson_name: 'Word Meaning in Context', concepts_introduced: ['vocabulary'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb'], pwp_stage: 'development', pwp_duration_minutes: 7, pwp_formula_count_min: 3, pwp_formula_count_max: 5, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['school', 'library', 'park', 'beach', 'forest', 'city', 'village', 'garden', 'museum', 'castle'] },
  { lesson_number: 18, lesson_name: 'Questions & Statements', concepts_introduced: ['sentence_types'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'sentence_types'], pwp_stage: 'development', pwp_duration_minutes: 7, pwp_formula_count_min: 3, pwp_formula_count_max: 5, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['teacher', 'student', 'doctor', 'chef', 'artist', 'farmer', 'scientist', 'pilot', 'dancer', 'writer'] },
  { lesson_number: 19, lesson_name: 'Commands & Exclamations', concepts_introduced: ['commands'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'sentence_types', 'commands'], pwp_stage: 'development', pwp_duration_minutes: 7, pwp_formula_count_min: 3, pwp_formula_count_max: 5, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['teacher', 'student', 'doctor', 'chef', 'artist', 'farmer', 'scientist', 'pilot', 'dancer', 'writer'] },
  { lesson_number: 20, lesson_name: 'Phrases', concepts_introduced: ['phrases'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases'], pwp_stage: 'development', pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 5, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['mountain', 'river', 'ocean', 'desert', 'island', 'valley', 'cave', 'waterfall', 'volcano', 'glacier'] },
  { lesson_number: 21, lesson_name: 'Clauses', concepts_introduced: ['clauses'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses'], pwp_stage: 'development', pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 5, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['mountain', 'river', 'ocean', 'desert', 'island', 'valley', 'cave', 'waterfall', 'volcano', 'glacier'] },
  { lesson_number: 22, lesson_name: 'Dependent and Independent Clauses', concepts_introduced: ['clause_types'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'clause_types'], pwp_stage: 'development', pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['hero', 'dragon', 'princess', 'wizard', 'knight', 'pirate', 'fairy', 'giant', 'elf', 'mermaid'] },
  { lesson_number: 23, lesson_name: 'What is a Sentence?', concepts_introduced: ['sentence_structure'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'sentence_structure'], pwp_stage: 'application', pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['hero', 'dragon', 'princess', 'wizard', 'knight', 'pirate', 'fairy', 'giant', 'elf', 'mermaid'] },
  { lesson_number: 24, lesson_name: 'Simple Sentences with Different Lengths', concepts_introduced: ['sentence_length'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'sentence_structure'], pwp_stage: 'application', pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['morning', 'evening', 'summer', 'winter', 'spring', 'autumn', 'sunrise', 'sunset', 'midnight', 'dawn'] },
  { lesson_number: 25, lesson_name: 'Different Ways of Forming Sentences', concepts_introduced: ['sentence_variation'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'sentence_structure', 'sentence_variation'], pwp_stage: 'application', pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['morning', 'evening', 'summer', 'winter', 'spring', 'autumn', 'sunrise', 'sunset', 'midnight', 'dawn'] },
  { lesson_number: 26, lesson_name: 'Active vs Passive Voice', concepts_introduced: ['voice'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'voice'], pwp_stage: 'application', pwp_duration_minutes: 10, pwp_formula_count_min: 4, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['invention', 'discovery', 'celebration', 'adventure', 'mystery', 'treasure', 'journey', 'challenge', 'competition', 'festival'] },
  { lesson_number: 27, lesson_name: 'What is a Paragraph?', concepts_introduced: ['paragraphs'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'paragraphs'], pwp_stage: 'application', pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['invention', 'discovery', 'celebration', 'adventure', 'mystery', 'treasure', 'journey', 'challenge', 'competition', 'festival'] },
  { lesson_number: 28, lesson_name: 'Using Paragraphs Effectively', concepts_introduced: ['paragraph_structure'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'paragraphs', 'paragraph_structure'], pwp_stage: 'application', pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['friendship', 'family', 'courage', 'kindness', 'wisdom', 'honesty', 'patience', 'creativity', 'determination', 'loyalty'] },
  { lesson_number: 29, lesson_name: 'Short Narratives', concepts_introduced: ['narrative'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'paragraphs', 'narrative'], pwp_stage: 'advanced', pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: true, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['friendship', 'family', 'courage', 'kindness', 'wisdom', 'honesty', 'patience', 'creativity', 'determination', 'loyalty'] },
  { lesson_number: 30, lesson_name: 'Compound and Complex Sentences', concepts_introduced: ['compound_complex'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'compound_complex'], pwp_stage: 'advanced', pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['storm', 'rainbow', 'thunder', 'lightning', 'earthquake', 'tornado', 'flood', 'drought', 'blizzard', 'hurricane'] },
  { lesson_number: 31, lesson_name: '7 Basic Story Types', concepts_introduced: ['story_types'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'clauses', 'story_types'], pwp_stage: 'advanced', pwp_duration_minutes: 12, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: true, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['storm', 'rainbow', 'thunder', 'lightning', 'earthquake', 'tornado', 'flood', 'drought', 'blizzard', 'hurricane'] },
  { lesson_number: 32, lesson_name: 'Noun, Adjective and Adverbial Phrases', concepts_introduced: ['phrase_types'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'phrase_types'], pwp_stage: 'advanced', pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['ancient', 'modern', 'mysterious', 'magical', 'peaceful', 'dangerous', 'beautiful', 'strange', 'wonderful', 'secret'] },
  { lesson_number: 33, lesson_name: 'Direct Speech', concepts_introduced: ['dialogue'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'phrases', 'dialogue'], pwp_stage: 'advanced', pwp_duration_minutes: 12, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: true, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['ancient', 'modern', 'mysterious', 'magical', 'peaceful', 'dangerous', 'beautiful', 'strange', 'wonderful', 'secret'] },
  { lesson_number: 34, lesson_name: 'Personal Pronouns', concepts_introduced: ['pronouns'], concepts_cumulative: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 'pronouns'], pwp_stage: 'advanced', pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: false, subject_assignment_type: 'given', subject_condition: null, subject_ideas: ['memory', 'dream', 'hope', 'fear', 'joy', 'sadness', 'anger', 'surprise', 'excitement', 'wonder'] },
];

async function seedCurriculum() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const existingCount = await pool.query('SELECT COUNT(*) FROM curriculum_map');
    console.log(`Found ${existingCount.rows[0].count} existing curriculum records`);

    for (const lesson of curriculumData) {
      const existing = await pool.query(
        'SELECT id FROM curriculum_map WHERE lesson_number = $1',
        [lesson.lesson_number]
      );

      if (existing.rows.length > 0) {
        await pool.query(`
          UPDATE curriculum_map SET
            lesson_name = $2,
            concepts_introduced = $3,
            concepts_cumulative = $4,
            pwp_stage = $5,
            pwp_duration_minutes = $6,
            pwp_formula_count_min = $7,
            pwp_formula_count_max = $8,
            paragraph_writing_enabled = $9,
            subject_assignment_type = $10,
            subject_condition = $11,
            subject_ideas = $12
          WHERE lesson_number = $1
        `, [
          lesson.lesson_number,
          lesson.lesson_name,
          lesson.concepts_introduced,
          lesson.concepts_cumulative,
          lesson.pwp_stage,
          lesson.pwp_duration_minutes,
          lesson.pwp_formula_count_min,
          lesson.pwp_formula_count_max,
          lesson.paragraph_writing_enabled,
          lesson.subject_assignment_type,
          lesson.subject_condition,
          lesson.subject_ideas,
        ]);
        console.log(`Updated lesson ${lesson.lesson_number}: ${lesson.lesson_name}`);
      } else {
        await pool.query(`
          INSERT INTO curriculum_map (
            lesson_number, lesson_name, concepts_introduced, concepts_cumulative,
            pwp_stage, pwp_duration_minutes, pwp_formula_count_min, pwp_formula_count_max,
            paragraph_writing_enabled, subject_assignment_type, subject_condition, subject_ideas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          lesson.lesson_number,
          lesson.lesson_name,
          lesson.concepts_introduced,
          lesson.concepts_cumulative,
          lesson.pwp_stage,
          lesson.pwp_duration_minutes,
          lesson.pwp_formula_count_min,
          lesson.pwp_formula_count_max,
          lesson.paragraph_writing_enabled,
          lesson.subject_assignment_type,
          lesson.subject_condition,
          lesson.subject_ideas,
        ]);
        console.log(`Inserted lesson ${lesson.lesson_number}: ${lesson.lesson_name}`);
      }
    }

    const finalCount = await pool.query('SELECT COUNT(*) FROM curriculum_map');
    console.log(`\nSeeding complete! Total curriculum records: ${finalCount.rows[0].count}`);
  } catch (error) {
    console.error('Error seeding curriculum:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedCurriculum();
