-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR (fixes policy conflicts)
-- Dashboard -> SQL Editor -> New Query -> Paste this and Run

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read writing_levels" ON writing_levels;
DROP POLICY IF EXISTS "Authenticated can manage dwp_assignments" ON dwp_assignments;
DROP POLICY IF EXISTS "Authenticated can read writing_attempts" ON writing_attempts;
DROP POLICY IF EXISTS "Authenticated can insert writing_attempts" ON writing_attempts;
DROP POLICY IF EXISTS "Authenticated can update writing_attempts" ON writing_attempts;
DROP POLICY IF EXISTS "Authenticated can read writing_progress" ON writing_progress;
DROP POLICY IF EXISTS "Authenticated can insert writing_progress" ON writing_progress;
DROP POLICY IF EXISTS "Authenticated can update writing_progress" ON writing_progress;

-- Recreate RLS Policies
CREATE POLICY "Anyone can read writing_levels" ON writing_levels FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage dwp_assignments" ON dwp_assignments FOR ALL USING (true);
CREATE POLICY "Authenticated can read writing_attempts" ON writing_attempts FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert writing_attempts" ON writing_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update writing_attempts" ON writing_attempts FOR UPDATE USING (true);
CREATE POLICY "Authenticated can read writing_progress" ON writing_progress FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert writing_progress" ON writing_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update writing_progress" ON writing_progress FOR UPDATE USING (true);

-- Check if writing levels are seeded
INSERT INTO writing_levels (level_number, tier_number, level_id, activity_name, activity_type, learning_objective, prompt_title, prompt_instructions, rubric, passing_threshold, display_order, expected_time_minutes)
VALUES 
(1, 1, 'writing_level_1', 'Word Sorting', 'word_sorting', 'Sort words into correct categories', 'Sort These Words', 'Sort the following words into two groups: naming words (nouns) and doing words (verbs).', '{"criteria": ["accuracy", "completion"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 1, 5),
(2, 1, 'writing_level_2', 'Sentence Completion', 'sentence_completion', 'Complete sentences with appropriate words', 'Finish the Sentence', 'Complete each sentence by choosing the best word from the word bank.', '{"criteria": ["accuracy", "sense"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 2, 5),
(3, 1, 'writing_level_3', 'Simple Sentences', 'sentence_writing', 'Write complete simple sentences', 'Write a Simple Sentence', 'Look at the picture. Write a simple sentence about what you see. Remember: capital letter at the start, full stop at the end.', '{"criteria": ["capital_letter", "full_stop", "makes_sense"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 3, 7),
(4, 1, 'writing_level_4', 'Adding Detail', 'sentence_expansion', 'Add adjectives to make sentences more interesting', 'Make It Better', 'Rewrite each sentence by adding a describing word (adjective) to make it more interesting.', '{"criteria": ["adjective_used", "makes_sense", "punctuation"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 4, 7),
(5, 1, 'writing_level_5', 'Tier 1 Challenge', 'paragraph_writing', 'Write a short paragraph using simple sentences', 'My Favourite Thing', 'Write 3-4 sentences about your favourite toy, food, or place. Use capital letters and full stops correctly.', '{"criteria": ["sentence_count", "capital_letters", "full_stops", "topic_focus"], "bands": {"mastery": 90, "secure": 80, "developing": 60, "emerging": 0}}', 80, 5, 10)
ON CONFLICT (level_id) DO NOTHING;

-- Verify: Check the levels were inserted
SELECT level_number, activity_name FROM writing_levels ORDER BY level_number;
