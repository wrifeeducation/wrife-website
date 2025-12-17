import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const curriculumData = [
  { lesson_number: 10, lesson_name: "Simple Sentences: Noun + Verb", concepts_introduced: ["noun", "verb"], concepts_cumulative: ["noun", "verb"], pwp_stage: "foundation", pwp_duration_minutes: 5, pwp_formula_count_min: 2, pwp_formula_count_max: 3, subject_ideas: ["dog", "cat", "bird", "fish", "rabbit", "lion", "elephant", "frog", "butterfly", "bear"] },
  { lesson_number: 11, lesson_name: "Adding Determiners", concepts_introduced: ["determiner"], concepts_cumulative: ["noun", "verb", "determiner"], pwp_stage: "foundation", pwp_duration_minutes: 5, pwp_formula_count_min: 2, pwp_formula_count_max: 3, subject_ideas: ["dog", "cat", "bird", "fish", "rabbit", "lion", "elephant", "frog", "butterfly", "bear"] },
  { lesson_number: 12, lesson_name: "Describing with Adjectives", concepts_introduced: ["adjective"], concepts_cumulative: ["noun", "verb", "determiner", "adjective"], pwp_stage: "foundation", pwp_duration_minutes: 5, pwp_formula_count_min: 2, pwp_formula_count_max: 4, subject_ideas: ["dog", "cat", "bird", "fish", "rabbit", "lion", "elephant", "frog", "butterfly", "bear"] },
  { lesson_number: 13, lesson_name: "Adding Adverbs", concepts_introduced: ["adverb"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb"], pwp_stage: "foundation", pwp_duration_minutes: 5, pwp_formula_count_min: 3, pwp_formula_count_max: 4, subject_ideas: ["dog", "cat", "bird", "fish", "rabbit", "lion", "elephant", "frog", "butterfly", "bear"] },
  { lesson_number: 14, lesson_name: "Building Complete Sentences", concepts_introduced: ["review"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb"], pwp_stage: "foundation", pwp_duration_minutes: 5, pwp_formula_count_min: 3, pwp_formula_count_max: 4, subject_ideas: ["dog", "cat", "bird", "fish", "rabbit", "lion", "elephant", "frog", "butterfly", "bear"] },
  { lesson_number: 15, lesson_name: "Foundation Consolidation", concepts_introduced: ["consolidation"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb"], pwp_stage: "foundation", pwp_duration_minutes: 5, pwp_formula_count_min: 3, pwp_formula_count_max: 4, subject_ideas: ["dog", "cat", "bird", "fish", "rabbit", "lion", "elephant", "frog", "butterfly", "bear"] },
  { lesson_number: 16, lesson_name: "Retrieving Information", concepts_introduced: ["comprehension"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb"], pwp_stage: "developing", pwp_duration_minutes: 7, pwp_formula_count_min: 3, pwp_formula_count_max: 5, subject_ideas: ["school", "library", "park", "beach", "forest", "city", "village", "garden", "museum", "castle"] },
  { lesson_number: 17, lesson_name: "Word Meaning in Context", concepts_introduced: ["vocabulary"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb"], pwp_stage: "developing", pwp_duration_minutes: 7, pwp_formula_count_min: 3, pwp_formula_count_max: 5, subject_ideas: ["school", "library", "park", "beach", "forest", "city", "village", "garden", "museum", "castle"] },
  { lesson_number: 18, lesson_name: "Questions & Statements", concepts_introduced: ["sentence_types"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "sentence_types"], pwp_stage: "developing", pwp_duration_minutes: 7, pwp_formula_count_min: 3, pwp_formula_count_max: 5, subject_ideas: ["teacher", "student", "doctor", "chef", "artist", "farmer", "scientist", "pilot", "dancer", "writer"] },
  { lesson_number: 19, lesson_name: "Commands & Exclamations", concepts_introduced: ["commands"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "sentence_types", "commands"], pwp_stage: "developing", pwp_duration_minutes: 7, pwp_formula_count_min: 3, pwp_formula_count_max: 5, subject_ideas: ["teacher", "student", "doctor", "chef", "artist", "farmer", "scientist", "pilot", "dancer", "writer"] },
  { lesson_number: 20, lesson_name: "Phrases", concepts_introduced: ["phrases"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases"], pwp_stage: "developing", pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 5, subject_ideas: ["mountain", "river", "ocean", "desert", "island", "valley", "cave", "waterfall", "volcano", "glacier"] },
  { lesson_number: 21, lesson_name: "Clauses", concepts_introduced: ["clauses"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses"], pwp_stage: "developing", pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 5, subject_ideas: ["mountain", "river", "ocean", "desert", "island", "valley", "cave", "waterfall", "volcano", "glacier"] },
  { lesson_number: 22, lesson_name: "Dependent and Independent Clauses", concepts_introduced: ["clause_types"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "clause_types"], pwp_stage: "developing", pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 6, subject_ideas: ["hero", "dragon", "princess", "wizard", "knight", "pirate", "fairy", "giant", "elf", "mermaid"] },
  { lesson_number: 23, lesson_name: "What is a Sentence?", concepts_introduced: ["sentence_structure"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "sentence_structure"], pwp_stage: "intermediate", pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 6, subject_ideas: ["hero", "dragon", "princess", "wizard", "knight", "pirate", "fairy", "giant", "elf", "mermaid"] },
  { lesson_number: 24, lesson_name: "Simple Sentences with Different Lengths", concepts_introduced: ["sentence_length"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "sentence_structure"], pwp_stage: "intermediate", pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 6, subject_ideas: ["morning", "evening", "summer", "winter", "spring", "autumn", "sunrise", "sunset", "midnight", "dawn"] },
  { lesson_number: 25, lesson_name: "Different Ways of Forming Sentences", concepts_introduced: ["sentence_variation"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "sentence_structure", "sentence_variation"], pwp_stage: "intermediate", pwp_duration_minutes: 8, pwp_formula_count_min: 4, pwp_formula_count_max: 6, subject_ideas: ["morning", "evening", "summer", "winter", "spring", "autumn", "sunrise", "sunset", "midnight", "dawn"] },
  { lesson_number: 26, lesson_name: "Active vs Passive Voice", concepts_introduced: ["voice"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "voice"], pwp_stage: "intermediate", pwp_duration_minutes: 10, pwp_formula_count_min: 4, pwp_formula_count_max: 6, subject_ideas: ["invention", "discovery", "celebration", "adventure", "mystery", "treasure", "journey", "challenge", "competition", "festival"] },
  { lesson_number: 27, lesson_name: "What is a Paragraph?", concepts_introduced: ["paragraphs"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "paragraphs"], pwp_stage: "intermediate", pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, subject_ideas: ["invention", "discovery", "celebration", "adventure", "mystery", "treasure", "journey", "challenge", "competition", "festival"] },
  { lesson_number: 28, lesson_name: "Using Paragraphs Effectively", concepts_introduced: ["paragraph_structure"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "paragraphs", "paragraph_structure"], pwp_stage: "intermediate", pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, subject_ideas: ["friendship", "family", "courage", "kindness", "wisdom", "honesty", "patience", "creativity", "determination", "loyalty"] },
  { lesson_number: 29, lesson_name: "Short Narratives", concepts_introduced: ["narrative"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "paragraphs", "narrative"], pwp_stage: "advanced", pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: true, subject_ideas: ["friendship", "family", "courage", "kindness", "wisdom", "honesty", "patience", "creativity", "determination", "loyalty"] },
  { lesson_number: 30, lesson_name: "Compound and Complex Sentences", concepts_introduced: ["compound_complex"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "compound_complex"], pwp_stage: "advanced", pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, subject_ideas: ["storm", "rainbow", "thunder", "lightning", "earthquake", "tornado", "flood", "drought", "blizzard", "hurricane"] },
  { lesson_number: 31, lesson_name: "7 Basic Story Types", concepts_introduced: ["story_types"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "clauses", "story_types"], pwp_stage: "advanced", pwp_duration_minutes: 12, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: true, subject_ideas: ["storm", "rainbow", "thunder", "lightning", "earthquake", "tornado", "flood", "drought", "blizzard", "hurricane"] },
  { lesson_number: 32, lesson_name: "Noun, Adjective and Adverbial Phrases", concepts_introduced: ["phrase_types"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "phrase_types"], pwp_stage: "advanced", pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, subject_ideas: ["ancient", "modern", "mysterious", "magical", "peaceful", "dangerous", "beautiful", "strange", "wonderful", "secret"] },
  { lesson_number: 33, lesson_name: "Direct Speech", concepts_introduced: ["dialogue"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "phrases", "dialogue"], pwp_stage: "advanced", pwp_duration_minutes: 12, pwp_formula_count_min: 5, pwp_formula_count_max: 6, paragraph_writing_enabled: true, subject_ideas: ["ancient", "modern", "mysterious", "magical", "peaceful", "dangerous", "beautiful", "strange", "wonderful", "secret"] },
  { lesson_number: 34, lesson_name: "Personal Pronouns", concepts_introduced: ["pronouns"], concepts_cumulative: ["noun", "verb", "determiner", "adjective", "adverb", "pronouns"], pwp_stage: "advanced", pwp_duration_minutes: 10, pwp_formula_count_min: 5, pwp_formula_count_max: 6, subject_ideas: ["memory", "dream", "hope", "fear", "joy", "sadness", "anger", "surprise", "excitement", "wonder"] },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existingData, error: checkError } = await supabase
      .from('curriculum_map')
      .select('lesson_number')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS curriculum_map (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            lesson_number INTEGER NOT NULL UNIQUE,
            lesson_name VARCHAR NOT NULL,
            concepts_introduced TEXT[] NOT NULL DEFAULT '{}',
            concepts_cumulative TEXT[] NOT NULL DEFAULT '{}',
            pwp_stage VARCHAR NOT NULL DEFAULT 'foundation',
            pwp_duration_minutes INTEGER NOT NULL DEFAULT 5,
            pwp_formula_count_min INTEGER NOT NULL DEFAULT 2,
            pwp_formula_count_max INTEGER NOT NULL DEFAULT 4,
            paragraph_writing_enabled BOOLEAN DEFAULT false,
            subject_assignment_type VARCHAR DEFAULT 'given',
            subject_condition VARCHAR,
            subject_ideas TEXT[] DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT now()
          );
        `
      });

      if (createError) {
        console.error('Failed to create table:', createError);
      }
    }

    const { error: deleteError } = await supabase
      .from('curriculum_map')
      .delete()
      .gte('lesson_number', 0);

    if (deleteError && deleteError.code !== '42P01') {
      console.error('Delete error:', deleteError);
    }

    const recordsToInsert = curriculumData.map(item => ({
      ...item,
      paragraph_writing_enabled: item.paragraph_writing_enabled || false,
      subject_assignment_type: 'given',
      subject_condition: null
    }));

    const { data, error } = await supabase
      .from('curriculum_map')
      .insert(recordsToInsert)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${data.length} curriculum lessons`,
      lessons: data.map(d => ({ lesson_number: d.lesson_number, lesson_name: d.lesson_name }))
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed curriculum' }, { status: 500 });
  }
}
