export interface WritingLevel {
  level_number: number;
  tier_number: number;
  level_id: string;
  activity_name: string;
  activity_type: string;
  learning_objective: string;
  prompt_title: string;
  prompt_instructions: string;
  prompt_example?: string;
  word_bank?: string[];
  rubric: Record<string, unknown>;
  passing_threshold: number;
  expected_time_minutes: number;
  difficulty_level: string;
  age_range: string;
  tier_finale: boolean;
  programme_finale: boolean;
  milestone: boolean;
  display_order: number;
}

export const DWP_LEVELS: WritingLevel[] = [
  {
    level_number: 1,
    tier_number: 1,
    level_id: 'writing_level_1',
    activity_name: 'Sort Your Story Words',
    activity_type: 'word_sorting',
    learning_objective: 'Pupils can categorize words into PEOPLE, PLACES, THINGS',
    prompt_title: 'Word Sorting Activity',
    prompt_instructions: `Copy these 10 words into three groups:

Words: grandmother, park, football, teacher, London, bicycle, doctor, school, book, friend

Write your answers below:

PEOPLE (who?):
_________________________________

PLACES (where?):
_________________________________

THINGS (what objects?):
_________________________________

Remember: Take your time and think carefully about each word!`,
    word_bank: ['grandmother', 'park', 'football', 'teacher', 'London', 'bicycle', 'doctor', 'school', 'book', 'friend'],
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 30 },
        technical_accuracy: { weight: 40 },
        understanding: { weight: 30 }
      },
      scoring_bands: {
        mastery: { range: [9, 10], badge: '🏆 Word Sorting Champion!' },
        secure: { range: [8, 8], badge: '⭐ Word Sorter!' },
        developing: { range: [6, 7], badge: '💪 Learning to Sort!' },
        emerging: { range: [0, 5], badge: '🌱 Starting to Learn!' }
      },
      correct_answers: {
        people: ['grandmother', 'teacher', 'doctor', 'friend'],
        places: ['park', 'London', 'school'],
        things: ['football', 'bicycle', 'book']
      }
    },
    passing_threshold: 80,
    expected_time_minutes: 7,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 1
  },
  {
    level_number: 2,
    tier_number: 1,
    level_id: 'writing_level_2',
    activity_name: 'Find the Action Words',
    activity_type: 'verb_identification',
    learning_objective: 'Pupils can identify verbs in sentences',
    prompt_title: 'Finding Action Words',
    prompt_instructions: `Read each sentence carefully.
Write ONLY the action word (what someone is DOING) for each sentence.

1. The girl jumps over the puddle.
   Action word: _______________

2. My brother reads every night.
   Action word: _______________

3. Birds sing in the morning.
   Action word: _______________

4. The cat sleeps on the sofa.
   Action word: _______________

5. Children play in the park.
   Action word: _______________

Remember: The action word tells us what someone is DOING!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 50 },
        understanding: { weight: 30 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Action Word Detective!' },
        secure: { range: [4, 4], badge: '⭐ Verb Finder!' },
        developing: { range: [3, 3], badge: '💪 Learning Verbs!' },
        emerging: { range: [0, 2], badge: '🌱 Starting with Verbs!' }
      },
      correct_answers: ['jumps', 'reads', 'sing', 'sleeps', 'play']
    },
    passing_threshold: 80,
    expected_time_minutes: 6,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 2
  },
  {
    level_number: 3,
    tier_number: 1,
    level_id: 'writing_level_3',
    activity_name: 'Write Word Pairs',
    activity_type: 'noun_verb_matching',
    learning_objective: 'Pupils can create logical noun + verb combinations',
    prompt_title: 'Matching Words',
    prompt_instructions: `Match each person or thing from Column A with an action from Column B that makes sense.
Write 5 pairs below.

Column A (Who/What):          Column B (Actions):
birds                         swim
children                      bark
dogs                         sing
fish                         teach
teachers                     play

Write your word pairs:
1. _________________ + _________________
2. _________________ + _________________
3. _________________ + _________________
4. _________________ + _________________
5. _________________ + _________________

Think carefully: What can each person or thing really do?`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 50 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Perfect Matcher!' },
        secure: { range: [4, 4], badge: '⭐ Great Matcher!' },
        developing: { range: [3, 3], badge: '💪 Learning to Match!' },
        emerging: { range: [0, 2], badge: '🌱 Starting to Match!' }
      },
      correct_pairs: [
        { noun: 'birds', verb: 'sing' },
        { noun: 'children', verb: 'play' },
        { noun: 'dogs', verb: 'bark' },
        { noun: 'fish', verb: 'swim' },
        { noun: 'teachers', verb: 'teach' }
      ]
    },
    passing_threshold: 80,
    expected_time_minutes: 8,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 3
  },
  {
    level_number: 4,
    tier_number: 1,
    level_id: 'writing_level_4',
    activity_name: 'Capital Letters for Names',
    activity_type: 'capitalization',
    learning_objective: 'Pupils can correctly capitalize proper nouns',
    prompt_title: 'Capital Letters for Special Names',
    prompt_instructions: `Some of these words need capital letters (special names).
Some need lowercase letters (ordinary words).

Copy each word correctly:

1. london ➜ _______________
2. city ➜ _______________
3. mrs. brown ➜ _______________
4. teacher ➜ _______________
5. england ➜ _______________
6. country ➜ _______________
7. max ➜ _______________
8. dog ➜ _______________
9. tuesday ➜ _______________
10. day ➜ _______________

Remember:
✓ Special names (people, places, days) = CAPITAL letter
✓ Ordinary words = lowercase letter`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 60 },
        understanding: { weight: 20 }
      },
      scoring_bands: {
        mastery: { range: [9, 10], badge: '🏆 Capital Letter Expert!' },
        secure: { range: [8, 8], badge: '⭐ Capital Letter Pro!' },
        developing: { range: [6, 7], badge: '💪 Learning Capitals!' },
        emerging: { range: [0, 5], badge: '🌱 Starting with Capitals!' }
      },
      correct_answers: [
        { word: 'London', is_proper: true },
        { word: 'city', is_proper: false },
        { word: 'Mrs. Brown', is_proper: true },
        { word: 'teacher', is_proper: false },
        { word: 'England', is_proper: true },
        { word: 'country', is_proper: false },
        { word: 'Max', is_proper: true },
        { word: 'dog', is_proper: false },
        { word: 'Tuesday', is_proper: true },
        { word: 'day', is_proper: false }
      ]
    },
    passing_threshold: 80,
    expected_time_minutes: 9,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 4
  },
  {
    level_number: 5,
    tier_number: 1,
    level_id: 'writing_level_5',
    activity_name: 'Complete Word Sort Challenge',
    activity_type: 'word_sorting_advanced',
    learning_objective: 'Pupils can classify words across four categories (TIER 1 FINALE)',
    prompt_title: 'Final Word Challenge',
    prompt_instructions: `Sort these 10 words into FOUR groups:
- PEOPLE (who?)
- PLACES (where?)
- THINGS (what objects?)
- ACTIONS (what people do?)

Words: running, teacher, bicycle, playground, sleeping, doctor, computer, jumping, library, singing

Write your groups:

PEOPLE:
_________________________________

PLACES:
_________________________________

THINGS:
_________________________________

ACTIONS:
_________________________________

This is your Tier 1 challenge! Take your time and show what you've learned!`,
    word_bank: ['running', 'teacher', 'bicycle', 'playground', 'sleeping', 'doctor', 'computer', 'jumping', 'library', 'singing'],
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 50 },
        understanding: { weight: 30 }
      },
      scoring_bands: {
        mastery: { range: [9, 10], badge: '🏆 TIER 1 CHAMPION!' },
        secure: { range: [8, 8], badge: '⭐ TIER 1 COMPLETE!' },
        developing: { range: [6, 7], badge: '💪 Almost There!' },
        emerging: { range: [0, 5], badge: '🌱 Keep Practicing!' }
      },
      correct_answers: {
        people: ['teacher', 'doctor'],
        places: ['playground', 'library'],
        things: ['bicycle', 'computer'],
        actions: ['running', 'sleeping', 'jumping', 'singing']
      }
    },
    passing_threshold: 80,
    expected_time_minutes: 10,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: true,
    programme_finale: false,
    milestone: false,
    display_order: 5
  },
  {
    level_number: 6,
    tier_number: 2,
    level_id: 'writing_level_6',
    activity_name: 'Add a Noun',
    activity_type: 'phrase_completion',
    learning_objective: 'Pupils can complete phrases with appropriate nouns',
    prompt_title: 'Complete the Phrases',
    prompt_instructions: `Add a PERSON, PLACE, or THING to finish each phrase.
Make it make sense!

1. the big _________________

2. my happy _________________

3. a small _________________

4. the old _________________

5. our favorite _________________

6. a new _________________

Remember: Your word should fit with the describing word!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 25 },
        content_quality: { weight: 50 }
      },
      scoring_bands: {
        mastery: { range: [6, 6], badge: '🏆 Phrase Master!' },
        secure: { range: [5, 5], badge: '⭐ Phrase Builder!' },
        developing: { range: [4, 4], badge: '💪 Learning Phrases!' },
        emerging: { range: [0, 3], badge: '🌱 Starting Phrases!' }
      }
    },
    passing_threshold: 67,
    expected_time_minutes: 8,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 6
  },
  {
    level_number: 7,
    tier_number: 2,
    level_id: 'writing_level_7',
    activity_name: 'Add an Action',
    activity_type: 'verb_completion',
    learning_objective: 'Pupils can complete phrases with appropriate verbs',
    prompt_title: 'Add the Action',
    prompt_instructions: `Add an action word to tell what each person or thing DOES.
Make sure it makes sense!

1. My dog _________________

2. The teacher _________________

3. Birds _________________

4. My friend _________________

5. The cat _________________

Remember: Your action word should be something they can really do!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Action Expert!' },
        secure: { range: [4, 4], badge: '⭐ Action Builder!' },
        developing: { range: [3, 3], badge: '💪 Learning Actions!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Actions!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 7,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 7
  },
  {
    level_number: 8,
    tier_number: 2,
    level_id: 'writing_level_8',
    activity_name: 'Build Word Chains',
    activity_type: 'phrase_building',
    learning_objective: 'Pupils can build determiner + noun + verb patterns',
    prompt_title: 'Build Word Chains',
    prompt_instructions: `Build word chains using: THE/A + NOUN + VERB
Each chain must have 3 words that make sense together.

Example: The dog barks.

Now you build 5 chains:

1. The _________ _________

2. A _________ _________

3. The _________ _________

4. A _________ _________

5. The _________ _________

Make each chain different and interesting!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Chain Builder!' },
        secure: { range: [4, 4], badge: '⭐ Good Builder!' },
        developing: { range: [3, 3], badge: '💪 Learning Chains!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Chains!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 8,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 8
  },
  {
    level_number: 9,
    tier_number: 2,
    level_id: 'writing_level_9',
    activity_name: 'Add Adjectives',
    activity_type: 'adjective_insertion',
    learning_objective: 'Pupils can add adjectives to noun phrases',
    prompt_title: 'Make It More Interesting',
    prompt_instructions: `Add a describing word (adjective) to each phrase.

Example: the _______ dog → the fluffy dog

1. the _________ cat

2. a _________ house

3. my _________ friend

4. the _________ tree

5. a _________ book

6. the _________ park

Choose words that help us picture what it looks like!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 25 },
        content_quality: { weight: 50 }
      },
      scoring_bands: {
        mastery: { range: [6, 6], badge: '🏆 Description Expert!' },
        secure: { range: [5, 5], badge: '⭐ Good Describer!' },
        developing: { range: [4, 4], badge: '💪 Learning to Describe!' },
        emerging: { range: [0, 3], badge: '🌱 Starting to Describe!' }
      }
    },
    passing_threshold: 67,
    expected_time_minutes: 8,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 9
  },
  {
    level_number: 10,
    tier_number: 2,
    level_id: 'writing_level_10',
    activity_name: 'Progressive Word Chains',
    activity_type: 'phrase_building_advanced',
    learning_objective: 'Pupils can create progressive word chains (TIER 2 FINALE)',
    prompt_title: 'Tier 2 Final Challenge',
    prompt_instructions: `Build complete word chains with 4-5 words each.
Pattern: DETERMINER + ADJECTIVE + NOUN + VERB

Example: The happy children play.

Now build 5 complete chains:

1. ________________________________

2. ________________________________

3. ________________________________

4. ________________________________

5. ________________________________

Show what you've learned in Tier 2!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 40 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 TIER 2 CHAMPION!' },
        secure: { range: [4, 4], badge: '⭐ TIER 2 COMPLETE!' },
        developing: { range: [3, 3], badge: '💪 Almost There!' },
        emerging: { range: [0, 2], badge: '🌱 Keep Practicing!' }
      }
    },
    passing_threshold: 80,
    expected_time_minutes: 10,
    difficulty_level: 'foundation',
    age_range: '6-7',
    tier_finale: true,
    programme_finale: false,
    milestone: false,
    display_order: 10
  },
  {
    level_number: 11,
    tier_number: 3,
    level_id: 'writing_level_11',
    activity_name: 'Copy Perfect Sentences',
    activity_type: 'sentence_copying',
    learning_objective: 'Pupils can copy sentences accurately with correct punctuation',
    prompt_title: 'Copy These Sentences Exactly',
    prompt_instructions: `Copy each sentence carefully. Make sure you include:
✓ Capital letter at the start
✓ Full stop at the end
✓ Correct spelling

1. The dog runs in the park.
   _______________________________

2. My sister reads her book.
   _______________________________

3. Birds sing in the morning.
   _______________________________

4. I like to play football.
   _______________________________

5. The teacher helps the children.
   _______________________________

Check your work! Did you copy everything correctly?`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 60 },
        presentation: { weight: 20 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Perfect Copier!' },
        secure: { range: [4, 4], badge: '⭐ Great Copier!' },
        developing: { range: [3, 3], badge: '💪 Learning to Copy!' },
        emerging: { range: [0, 2], badge: '🌱 Starting to Copy!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 10,
    difficulty_level: 'developing',
    age_range: '7-8',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 11
  },
  {
    level_number: 12,
    tier_number: 3,
    level_id: 'writing_level_12',
    activity_name: 'Fix the Sentences',
    activity_type: 'punctuation_correction',
    learning_objective: 'Pupils can add missing capitals and full stops',
    prompt_title: 'Fix These Sentences',
    prompt_instructions: `These sentences are missing capital letters and full stops.
Write them correctly!

1. the dog runs in the park
   _______________________________

2. my sister reads her book
   _______________________________

3. birds sing in the morning
   _______________________________

4. i like to play football
   _______________________________

5. the teacher helps the children
   _______________________________

Remember: Every sentence needs a capital letter at the START and a full stop at the END!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 60 },
        understanding: { weight: 20 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Sentence Fixer!' },
        secure: { range: [4, 4], badge: '⭐ Punctuation Pro!' },
        developing: { range: [3, 3], badge: '💪 Learning Punctuation!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Punctuation!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 8,
    difficulty_level: 'developing',
    age_range: '7-8',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 12
  },
  {
    level_number: 13,
    tier_number: 3,
    level_id: 'writing_level_13',
    activity_name: 'Complete the Sentences',
    activity_type: 'sentence_completion',
    learning_objective: 'Pupils can finish sentence stems with appropriate verbs and objects',
    prompt_title: 'Finish These Sentences',
    prompt_instructions: `Complete each sentence by adding what happens.
Don't forget your full stop!

1. My teacher _______________________________

2. The children _______________________________

3. My dog _______________________________

4. Birds _______________________________

5. I _______________________________

Think: What does this person or thing DO? Make it make sense!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Sentence Completer!' },
        secure: { range: [4, 4], badge: '⭐ Sentence Builder!' },
        developing: { range: [3, 3], badge: '💪 Learning Sentences!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Sentences!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 9,
    difficulty_level: 'developing',
    age_range: '7-8',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 13
  },
  {
    level_number: 14,
    tier_number: 3,
    level_id: 'writing_level_14',
    activity_name: 'Write Your Own Sentences',
    activity_type: 'independent_sentences',
    learning_objective: 'Pupils write complete independent sentences (FIRST TIME!)',
    prompt_title: 'Write Your Own Sentences',
    prompt_instructions: `This is special - you're writing your OWN sentences!

Write 3 sentences about YOURSELF.
Use one of these action words in each sentence:
like • play • go • eat • have

Remember:
✓ Start with a capital letter
✓ End with a full stop
✓ Make it about YOU!

1. _______________________________

2. _______________________________

3. _______________________________

You're a real writer now! 🌟`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 40 },
        content_quality: { weight: 35 }
      },
      scoring_bands: {
        mastery: { range: [3, 3], badge: '🏆 Real Writer!' },
        secure: { range: [2, 2], badge: '⭐ Super Writer!' },
        developing: { range: [1, 1], badge: '💪 Learning to Write!' },
        emerging: { range: [0, 0], badge: '🌱 Starting to Write!' }
      }
    },
    passing_threshold: 33,
    expected_time_minutes: 12,
    difficulty_level: 'developing',
    age_range: '7-8',
    tier_finale: false,
    programme_finale: false,
    milestone: true,
    display_order: 14
  },
  {
    level_number: 15,
    tier_number: 3,
    level_id: 'writing_level_15',
    activity_name: 'Add a Where',
    activity_type: 'sentence_expansion_place',
    learning_objective: 'Pupils can expand sentences with place information',
    prompt_title: 'Add Where It Happens',
    prompt_instructions: `Make these sentences better by adding WHERE.

1. I play football
   I play football _______________________________

2. My dog runs
   My dog runs _______________________________

3. We eat lunch
   We eat lunch _______________________________

4. The birds sing
   The birds sing _______________________________

5. I read books
   I read books _______________________________

Think: WHERE does this happen? Add a place!
Examples: in the park, at school, in my room`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Place Expert!' },
        secure: { range: [4, 4], badge: '⭐ Place Adder!' },
        developing: { range: [3, 3], badge: '💪 Learning Places!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Places!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 9,
    difficulty_level: 'developing',
    age_range: '7-8',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 15
  },
  {
    level_number: 16,
    tier_number: 3,
    level_id: 'writing_level_16',
    activity_name: 'Add a When',
    activity_type: 'sentence_expansion_time',
    learning_objective: 'Pupils can expand sentences with time information',
    prompt_title: 'Add When It Happens',
    prompt_instructions: `Make these sentences better by adding WHEN.

1. I eat breakfast
   I eat breakfast _______________________________

2. We go to school
   We go to school _______________________________

3. The sun shines
   The sun shines _______________________________

4. I play games
   I play games _______________________________

5. My family watches TV
   My family watches TV _______________________________

Think: WHEN does this happen? Add a time!
Examples: in the morning, after school, at night, on Saturday`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Time Expert!' },
        secure: { range: [4, 4], badge: '⭐ Time Adder!' },
        developing: { range: [3, 3], badge: '💪 Learning Times!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Times!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 9,
    difficulty_level: 'developing',
    age_range: '7-8',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 16
  },
  {
    level_number: 17,
    tier_number: 3,
    level_id: 'writing_level_17',
    activity_name: 'Sentence Building Challenge',
    activity_type: 'complete_sentences',
    learning_objective: 'Pupils write complete sentences with WHO, WHAT, WHERE (TIER 3 FINALE)',
    prompt_title: 'Tier 3 Final Challenge',
    prompt_instructions: `Write 5 COMPLETE sentences.
Each sentence must have:
✓ WHO (person or thing)
✓ WHAT (action)
✓ WHERE (place)

Example: My dog runs in the park.
         (WHO)  (WHAT)  (WHERE)

Now you write 5:

1. _______________________________

2. _______________________________

3. _______________________________

4. _______________________________

5. _______________________________

Make each sentence different and interesting!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 40 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 TIER 3 CHAMPION!' },
        secure: { range: [4, 4], badge: '⭐ TIER 3 COMPLETE!' },
        developing: { range: [3, 3], badge: '💪 Almost There!' },
        emerging: { range: [0, 2], badge: '🌱 Keep Building!' }
      }
    },
    passing_threshold: 80,
    expected_time_minutes: 15,
    difficulty_level: 'developing',
    age_range: '7-8',
    tier_finale: true,
    programme_finale: false,
    milestone: false,
    display_order: 17
  },
  {
    level_number: 18,
    tier_number: 4,
    level_id: 'writing_level_18',
    activity_name: 'Add Describing Words',
    activity_type: 'adjective_enhancement',
    learning_objective: 'Pupils enhance sentences with describing words',
    prompt_title: 'Make Sentences More Interesting',
    prompt_instructions: `Add TWO describing words to each sentence to make it more interesting.

Example: The dog runs.  →  The fluffy, brown dog runs.

1. The cat sleeps on the sofa.
   _______________________________

2. A bird sings in the tree.
   _______________________________

3. My friend plays in the garden.
   _______________________________

4. The car drives down the road.
   _______________________________

5. A girl reads her book.
   _______________________________

Use describing words that help us picture what you mean!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Description Master!' },
        secure: { range: [4, 4], badge: '⭐ Good Describer!' },
        developing: { range: [3, 3], badge: '💪 Learning Description!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Description!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 10,
    difficulty_level: 'developing',
    age_range: '7-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 18
  },
  {
    level_number: 19,
    tier_number: 4,
    level_id: 'writing_level_19',
    activity_name: 'Join with AND',
    activity_type: 'conjunction_and',
    learning_objective: 'Pupils can join sentences using "and"',
    prompt_title: 'Join Sentences with AND',
    prompt_instructions: `Join each pair of sentences using "and" to make one longer sentence.

Example: I like apples. I like bananas.
         → I like apples and bananas.

1. Tom plays football. He scores a goal.
   _______________________________

2. The sun is shining. The birds are singing.
   _______________________________

3. Mum makes dinner. Dad sets the table.
   _______________________________

4. I finished my homework. I watched TV.
   _______________________________

5. The dog ran fast. It caught the ball.
   _______________________________

Remember: Use "and" to join two ideas that go together!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 40 },
        content_quality: { weight: 35 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Sentence Joiner!' },
        secure: { range: [4, 4], badge: '⭐ Good Connector!' },
        developing: { range: [3, 3], badge: '💪 Learning to Join!' },
        emerging: { range: [0, 2], badge: '🌱 Starting to Join!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 10,
    difficulty_level: 'developing',
    age_range: '7-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 19
  },
  {
    level_number: 20,
    tier_number: 4,
    level_id: 'writing_level_20',
    activity_name: 'Join with BUT',
    activity_type: 'conjunction_but',
    learning_objective: 'Pupils can use "but" to show contrast',
    prompt_title: 'Join Sentences with BUT',
    prompt_instructions: `Join each pair of sentences using "but" to show a difference or surprise.

Example: I wanted to play outside. It was raining.
         → I wanted to play outside but it was raining.

1. The dog was tired. It kept running.
   _______________________________

2. I like pizza. I don't like mushrooms on it.
   _______________________________

3. Tom tried hard. He couldn't finish the race.
   _______________________________

4. The book was long. It was very interesting.
   _______________________________

5. It was cold outside. We went swimming anyway.
   _______________________________

Use "but" when the second part is different or surprising!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 40 },
        content_quality: { weight: 35 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Contrast Master!' },
        secure: { range: [4, 4], badge: '⭐ Good at BUT!' },
        developing: { range: [3, 3], badge: '💪 Learning BUT!' },
        emerging: { range: [0, 2], badge: '🌱 Starting BUT!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 10,
    difficulty_level: 'developing',
    age_range: '7-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 20
  },
  {
    level_number: 21,
    tier_number: 4,
    level_id: 'writing_level_21',
    activity_name: 'Add BECAUSE',
    activity_type: 'conjunction_because',
    learning_objective: 'Pupils can add "because" clauses to explain reasons',
    prompt_title: 'Add a Reason with BECAUSE',
    prompt_instructions: `Complete each sentence by adding "because" and a reason.

Example: I was happy because I got a new toy.

1. Tom ran home because _______________________________

2. The dog was barking because _______________________________

3. We couldn't go to the park because _______________________________

4. I was tired because _______________________________

5. Mum was smiling because _______________________________

Think: WHY did this happen? Give a good reason!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Reason Expert!' },
        secure: { range: [4, 4], badge: '⭐ Good Reasoner!' },
        developing: { range: [3, 3], badge: '💪 Learning Reasons!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Reasons!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 10,
    difficulty_level: 'developing',
    age_range: '7-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 21
  },
  {
    level_number: 22,
    tier_number: 4,
    level_id: 'writing_level_22',
    activity_name: 'Use WHEN for Time',
    activity_type: 'conjunction_when',
    learning_objective: 'Pupils can use "when" for time clauses',
    prompt_title: 'Add Time with WHEN',
    prompt_instructions: `Complete each sentence using "when" to show time.

Example: I was happy when my friend arrived.

1. The bell rang when _______________________________

2. I felt scared when _______________________________

3. Everyone cheered when _______________________________

4. The lights went out when _______________________________

5. I smiled when _______________________________

Think: WHEN did this happen? What was happening at that moment?`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Time Master!' },
        secure: { range: [4, 4], badge: '⭐ Good with WHEN!' },
        developing: { range: [3, 3], badge: '💪 Learning WHEN!' },
        emerging: { range: [0, 2], badge: '🌱 Starting WHEN!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 10,
    difficulty_level: 'developing',
    age_range: '7-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 22
  },
  {
    level_number: 23,
    tier_number: 4,
    level_id: 'writing_level_23',
    activity_name: 'Sentences with Multiple Details',
    activity_type: 'detailed_sentences',
    learning_objective: 'Pupils can write sentences with multiple details',
    prompt_title: 'Add Lots of Detail',
    prompt_instructions: `Write 5 sentences. Each sentence must include:
✓ WHO
✓ WHAT they did
✓ WHERE
✓ WHEN
✓ WHY or HOW

Example: My brother ran quickly to school in the morning because he was late.

1. _______________________________

2. _______________________________

3. _______________________________

4. _______________________________

5. _______________________________

Pack as much detail as you can into each sentence!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 Detail Master!' },
        secure: { range: [4, 4], badge: '⭐ Good Details!' },
        developing: { range: [3, 3], badge: '💪 Learning Details!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Details!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 12,
    difficulty_level: 'developing',
    age_range: '7-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 23
  },
  {
    level_number: 24,
    tier_number: 4,
    level_id: 'writing_level_24',
    activity_name: 'Follow Sentence Formulas',
    activity_type: 'sentence_formulas',
    learning_objective: 'Pupils can follow sentence formulas (TIER 4 FINALE)',
    prompt_title: 'Tier 4 Final Challenge',
    prompt_instructions: `Write sentences following these exact patterns:

Pattern 1: WHO + DID WHAT + WHERE + WHEN
Example: The children played football in the park after school.
Your sentence: _______________________________

Pattern 2: WHEN + WHO + DID WHAT + BECAUSE + REASON
Example: Yesterday, I stayed home because I felt ill.
Your sentence: _______________________________

Pattern 3: WHO + DID WHAT + AND + DID WHAT + BUT + CONTRAST
Example: Tom ate his lunch and drank his juice but forgot his apple.
Your sentence: _______________________________

Pattern 4: ALTHOUGH + CONTRAST + WHO + STILL + DID WHAT
Example: Although it was raining, Sarah still walked to the shop.
Your sentence: _______________________________

Pattern 5: Create your own complex sentence with at least 3 connectives!
Your sentence: _______________________________

Show what you've learned about building sentences!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 40 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 TIER 4 CHAMPION!' },
        secure: { range: [4, 4], badge: '⭐ TIER 4 COMPLETE!' },
        developing: { range: [3, 3], badge: '💪 Almost There!' },
        emerging: { range: [0, 2], badge: '🌱 Keep Practicing!' }
      }
    },
    passing_threshold: 80,
    expected_time_minutes: 15,
    difficulty_level: 'developing',
    age_range: '7-9',
    tier_finale: true,
    programme_finale: false,
    milestone: false,
    display_order: 24
  },
  {
    level_number: 25,
    tier_number: 5,
    level_id: 'writing_level_25',
    activity_name: 'First, Next, Then, Last',
    activity_type: 'sequencing_basic',
    learning_objective: 'Pupils write 4 sequenced sentences with connectives',
    prompt_title: 'Write in Order',
    prompt_instructions: `Write 4 sentences about MAKING A SANDWICH.
Use these time words to show the order:
• First,
• Next,
• Then,
• Last,

First, _______________________________

Next, _______________________________

Then, _______________________________

Last, _______________________________

Tell the story step by step!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [4, 4], badge: '🏆 Sequence Master!' },
        secure: { range: [3, 3], badge: '⭐ Good Sequencer!' },
        developing: { range: [2, 2], badge: '💪 Learning Sequence!' },
        emerging: { range: [0, 1], badge: '🌱 Starting Sequence!' }
      }
    },
    passing_threshold: 50,
    expected_time_minutes: 10,
    difficulty_level: 'advanced',
    age_range: '8-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 25
  },
  {
    level_number: 26,
    tier_number: 5,
    level_id: 'writing_level_26',
    activity_name: 'Write 3 Connected Sentences',
    activity_type: 'connected_writing',
    learning_objective: 'Pupils write cohesive short sequences without frames',
    prompt_title: 'Sentences That Go Together',
    prompt_instructions: `Write 3 sentences about ONE of these topics:
• Playing your favorite game
• Walking to school
• Eating dinner with your family

Choose one topic: _______________________________

Write 3 sentences that tell what happens:

1. _______________________________

2. _______________________________

3. _______________________________

Make sure your sentences go together and tell a little story!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [3, 3], badge: '🏆 Story Teller!' },
        secure: { range: [2, 2], badge: '⭐ Good Connector!' },
        developing: { range: [1, 1], badge: '💪 Learning Connection!' },
        emerging: { range: [0, 0], badge: '🌱 Starting Stories!' }
      }
    },
    passing_threshold: 33,
    expected_time_minutes: 12,
    difficulty_level: 'advanced',
    age_range: '8-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 26
  },
  {
    level_number: 27,
    tier_number: 5,
    level_id: 'writing_level_27',
    activity_name: 'Before and After',
    activity_type: 'temporal_sequences',
    learning_objective: 'Pupils write temporal sequences around central events',
    prompt_title: 'What Happened Before and After?',
    prompt_instructions: `For each event, write what happened BEFORE and what happened AFTER.

EVENT 1: I scored a goal!
Before: _______________________________
After: _______________________________

EVENT 2: The bell rang for lunch.
Before: _______________________________
After: _______________________________

EVENT 3: My friend arrived at my house.
Before: _______________________________
After: _______________________________

Think: What led to this? What happened next?`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [6, 6], badge: '🏆 Time Master!' },
        secure: { range: [5, 5], badge: '⭐ Time Builder!' },
        developing: { range: [4, 4], badge: '💪 Learning Time!' },
        emerging: { range: [0, 3], badge: '🌱 Starting Time!' }
      }
    },
    passing_threshold: 67,
    expected_time_minutes: 12,
    difficulty_level: 'advanced',
    age_range: '8-9',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 27
  },
  {
    level_number: 28,
    tier_number: 5,
    level_id: 'writing_level_28',
    activity_name: 'Tell What Happened',
    activity_type: 'recount_writing',
    learning_objective: 'Pupils write 5-sentence recount in chronological order (TIER 5 FINALE)',
    prompt_title: 'Tier 5 Final Challenge',
    prompt_instructions: `Write 5 sentences about something you did YESTERDAY.
Tell what happened in the right order, from start to finish.

What I did yesterday:

1. _______________________________

2. _______________________________

3. _______________________________

4. _______________________________

5. _______________________________

Tell the story in order! What happened first? Then what? How did it end?`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 TIER 5 CHAMPION!' },
        secure: { range: [4, 4], badge: '⭐ TIER 5 COMPLETE!' },
        developing: { range: [3, 3], badge: '💪 Almost There!' },
        emerging: { range: [0, 2], badge: '🌱 Keep Sequencing!' }
      }
    },
    passing_threshold: 80,
    expected_time_minutes: 15,
    difficulty_level: 'advanced',
    age_range: '8-9',
    tier_finale: true,
    programme_finale: false,
    milestone: false,
    display_order: 28
  },
  {
    level_number: 29,
    tier_number: 6,
    level_id: 'writing_level_29',
    activity_name: 'Beginning Sentences',
    activity_type: 'story_beginnings',
    learning_objective: 'Pupils craft effective story openings',
    prompt_title: 'Write Story Beginnings',
    prompt_instructions: `Write a BEGINNING sentence for each story.
Your sentence should tell WHO and WHERE.

Story 1: The Lost Ball
Beginning: _______________________________

Story 2: A Surprise Visit
Beginning: _______________________________

Story 3: The Big Storm
Beginning: _______________________________

Remember: A good beginning introduces the character and setting!
Examples:
• One sunny day, Tom was playing in his garden.
• My grandmother came to visit us at home.`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [3, 3], badge: '🏆 Beginning Master!' },
        secure: { range: [2, 2], badge: '⭐ Good Opener!' },
        developing: { range: [1, 1], badge: '💪 Learning Beginnings!' },
        emerging: { range: [0, 0], badge: '🌱 Starting Beginnings!' }
      }
    },
    passing_threshold: 33,
    expected_time_minutes: 10,
    difficulty_level: 'advanced',
    age_range: '8-10',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 29
  },
  {
    level_number: 30,
    tier_number: 6,
    level_id: 'writing_level_30',
    activity_name: 'Middle Sentences',
    activity_type: 'story_middles',
    learning_objective: 'Pupils develop story conflict/action',
    prompt_title: 'Write Story Middles',
    prompt_instructions: `For each beginning, write 2 MIDDLE sentences.
The middle should tell what PROBLEM or ACTION happens.

Story 1: One sunny day, Emma was playing in the park.
Middle 1: _______________________________
Middle 2: _______________________________

Story 2: Jack and his dog went for a walk in the woods.
Middle 1: _______________________________
Middle 2: _______________________________

Story 3: It was a quiet evening when Mia heard a strange noise.
Middle 1: _______________________________
Middle 2: _______________________________

The MIDDLE is where something happens! Make it interesting!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [6, 6], badge: '🏆 Middle Master!' },
        secure: { range: [5, 5], badge: '⭐ Action Builder!' },
        developing: { range: [4, 4], badge: '💪 Learning Middles!' },
        emerging: { range: [0, 3], badge: '🌱 Starting Middles!' }
      }
    },
    passing_threshold: 67,
    expected_time_minutes: 12,
    difficulty_level: 'advanced',
    age_range: '8-10',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 30
  },
  {
    level_number: 31,
    tier_number: 6,
    level_id: 'writing_level_31',
    activity_name: 'Ending Sentences',
    activity_type: 'story_endings',
    learning_objective: 'Pupils craft effective resolutions',
    prompt_title: 'Write Story Endings',
    prompt_instructions: `For each story beginning and middle, write an ENDING sentence.
The ending should tell how the problem was solved or how the story finished.

Story 1:
Beginning: Tom found a strange map in his attic.
Middle: He followed the map to an old tree in his garden. He started digging beneath it.
Ending: _______________________________

Story 2:
Beginning: The school fair was tomorrow and Lucy hadn't finished her project.
Middle: She worked all evening, painting and gluing. Her family helped her.
Ending: _______________________________

Story 3:
Beginning: Max the dog saw a squirrel in the park.
Middle: He chased it across the grass and through the bushes. The squirrel was very fast.
Ending: _______________________________

The ENDING wraps everything up! How does it finish?`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [3, 3], badge: '🏆 Ending Expert!' },
        secure: { range: [2, 2], badge: '⭐ Good Finisher!' },
        developing: { range: [1, 1], badge: '💪 Learning Endings!' },
        emerging: { range: [0, 0], badge: '🌱 Starting Endings!' }
      }
    },
    passing_threshold: 33,
    expected_time_minutes: 11,
    difficulty_level: 'advanced',
    age_range: '8-10',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 31
  },
  {
    level_number: 32,
    tier_number: 6,
    level_id: 'writing_level_32',
    activity_name: 'Plan a Complete Story',
    activity_type: 'story_planning',
    learning_objective: 'Pupils plan complete BME structure',
    prompt_title: 'Plan Your Story',
    prompt_instructions: `Plan a story called "The Amazing Discovery"

Write your plan:

BEGINNING (Who? Where? When?):
_______________________________
_______________________________

MIDDLE (What happens? What problem?):
_______________________________
_______________________________
_______________________________

ENDING (How is it solved? How do they feel?):
_______________________________
_______________________________

Now you have a plan for a complete story!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 25 },
        content_quality: { weight: 50 }
      },
      scoring_bands: {
        mastery: { range: [7, 7], badge: '🏆 Story Planner!' },
        secure: { range: [5, 6], badge: '⭐ Good Planner!' },
        developing: { range: [3, 4], badge: '💪 Learning Planning!' },
        emerging: { range: [0, 2], badge: '🌱 Starting Planning!' }
      }
    },
    passing_threshold: 57,
    expected_time_minutes: 12,
    difficulty_level: 'advanced',
    age_range: '8-10',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 32
  },
  {
    level_number: 33,
    tier_number: 6,
    level_id: 'writing_level_33',
    activity_name: 'Write Your First Complete Story',
    activity_type: 'complete_story',
    learning_objective: 'Pupils write first complete story with 5+ sentences (TIER 6 FINALE)',
    prompt_title: 'Tier 6 Final Challenge - Your First Story!',
    prompt_instructions: `Write a COMPLETE story with at least 5 sentences.

Your story should have:
✓ A BEGINNING that introduces WHO and WHERE
✓ A MIDDLE with action or a problem (2-3 sentences)
✓ An ENDING that wraps it up

Choose your own title: _______________________________

Write your story:
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________

This is your first complete story! Make it amazing! 📚`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 50 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 TIER 6 CHAMPION! 📚' },
        secure: { range: [4, 4], badge: '⭐ TIER 6 COMPLETE!' },
        developing: { range: [3, 3], badge: '💪 Almost There!' },
        emerging: { range: [0, 2], badge: '🌱 Keep Writing!' }
      }
    },
    passing_threshold: 80,
    expected_time_minutes: 20,
    difficulty_level: 'advanced',
    age_range: '8-10',
    tier_finale: true,
    programme_finale: false,
    milestone: true,
    display_order: 33
  },
  {
    level_number: 34,
    tier_number: 7,
    level_id: 'writing_level_34',
    activity_name: 'Start with WHEN',
    activity_type: 'sentence_starters_when',
    learning_objective: 'Pupils start sentences with "When" clauses',
    prompt_title: 'Start Sentences with WHEN',
    prompt_instructions: `Write 5 sentences that START with "When..."

Example: When the sun set, the stars began to appear.

1. When _______________________________

2. When _______________________________

3. When _______________________________

4. When _______________________________

5. When _______________________________

Remember: After "When...", add a comma, then tell what happened!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 40 },
        content_quality: { weight: 35 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 WHEN Expert!' },
        secure: { range: [4, 4], badge: '⭐ Good with WHEN!' },
        developing: { range: [3, 3], badge: '💪 Learning WHEN!' },
        emerging: { range: [0, 2], badge: '🌱 Starting WHEN!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 10,
    difficulty_level: 'advanced',
    age_range: '9-10',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 34
  },
  {
    level_number: 35,
    tier_number: 7,
    level_id: 'writing_level_35',
    activity_name: 'Start with ALTHOUGH',
    activity_type: 'sentence_starters_although',
    learning_objective: 'Pupils start sentences with "Although" clauses',
    prompt_title: 'Start Sentences with ALTHOUGH',
    prompt_instructions: `Write 5 sentences that START with "Although..."
(Although shows something surprising or opposite)

Example: Although it was raining, we still had fun at the fair.

1. Although _______________________________

2. Although _______________________________

3. Although _______________________________

4. Although _______________________________

5. Although _______________________________

Remember: "Although" shows that something surprising happened!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 40 },
        content_quality: { weight: 35 }
      },
      scoring_bands: {
        mastery: { range: [5, 5], badge: '🏆 ALTHOUGH Expert!' },
        secure: { range: [4, 4], badge: '⭐ Good with ALTHOUGH!' },
        developing: { range: [3, 3], badge: '💪 Learning ALTHOUGH!' },
        emerging: { range: [0, 2], badge: '🌱 Starting ALTHOUGH!' }
      }
    },
    passing_threshold: 60,
    expected_time_minutes: 10,
    difficulty_level: 'advanced',
    age_range: '9-10',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 35
  },
  {
    level_number: 36,
    tier_number: 7,
    level_id: 'writing_level_36',
    activity_name: 'Different Sentence Starters',
    activity_type: 'varied_starters',
    learning_objective: 'Pupils use different sentence starters',
    prompt_title: 'Use Different Starters',
    prompt_instructions: `Write 6 sentences about a trip to the zoo.
Start each sentence DIFFERENTLY using these starters:

1. (Start with a time word) _______________________________

2. (Start with "Although...") _______________________________

3. (Start with "When...") _______________________________

4. (Start with a describing word) _______________________________

5. (Start with a name) _______________________________

6. (Start with "Because...") _______________________________

Variety makes your writing more interesting!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 25 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 40 }
      },
      scoring_bands: {
        mastery: { range: [6, 6], badge: '🏆 Variety Master!' },
        secure: { range: [5, 5], badge: '⭐ Good Variety!' },
        developing: { range: [4, 4], badge: '💪 Learning Variety!' },
        emerging: { range: [0, 3], badge: '🌱 Starting Variety!' }
      }
    },
    passing_threshold: 67,
    expected_time_minutes: 12,
    difficulty_level: 'advanced',
    age_range: '9-10',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 36
  },
  {
    level_number: 37,
    tier_number: 7,
    level_id: 'writing_level_37',
    activity_name: 'Mix Simple and Complex',
    activity_type: 'sentence_variety',
    learning_objective: 'Pupils mix simple, compound and complex sentences (TIER 7 FINALE)',
    prompt_title: 'Tier 7 Final Challenge - Sentence Variety',
    prompt_instructions: `Write a paragraph (5-6 sentences) about "My Perfect Day"

Your paragraph must include:
✓ At least ONE simple sentence (one idea)
✓ At least ONE compound sentence (using and/but/or)
✓ At least ONE complex sentence (using when/although/because)

My Perfect Day:
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________

Show your sentence-building skills!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 35 },
        content_quality: { weight: 45 }
      },
      scoring_bands: {
        mastery: { range: [6, 6], badge: '🏆 TIER 7 CHAMPION!' },
        secure: { range: [5, 5], badge: '⭐ TIER 7 COMPLETE!' },
        developing: { range: [4, 4], badge: '💪 Almost There!' },
        emerging: { range: [0, 3], badge: '🌱 Keep Practicing!' }
      }
    },
    passing_threshold: 83,
    expected_time_minutes: 15,
    difficulty_level: 'advanced',
    age_range: '9-10',
    tier_finale: true,
    programme_finale: false,
    milestone: false,
    display_order: 37
  },
  {
    level_number: 38,
    tier_number: 8,
    level_id: 'writing_level_38',
    activity_name: 'Story with Detailed Beginning',
    activity_type: 'narrative_beginning',
    learning_objective: 'Pupils write stories with detailed beginnings (7 sentences)',
    prompt_title: 'Write a Story with a Great Beginning',
    prompt_instructions: `Write a story of AT LEAST 7 sentences.

Your story needs an EXCELLENT beginning that:
✓ Introduces the main character
✓ Describes the setting (where and when)
✓ Creates a mood or atmosphere
✓ Makes the reader want to read more!

Title: The Secret Door

Write your story:
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________

Focus on making your beginning really draw the reader in!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 30 },
        content_quality: { weight: 50 }
      },
      scoring_bands: {
        mastery: { range: [7, 7], badge: '🏆 Narrative Expert!' },
        secure: { range: [5, 6], badge: '⭐ Good Narrative!' },
        developing: { range: [4, 4], badge: '💪 Learning Narratives!' },
        emerging: { range: [0, 3], badge: '🌱 Starting Narratives!' }
      }
    },
    passing_threshold: 57,
    expected_time_minutes: 18,
    difficulty_level: 'advanced',
    age_range: '9-11',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 38
  },
  {
    level_number: 39,
    tier_number: 8,
    level_id: 'writing_level_39',
    activity_name: 'Story with Enhanced Details',
    activity_type: 'narrative_enhanced',
    learning_objective: 'Pupils write stories with enhanced details (8 sentences)',
    prompt_title: 'Write a Story with Rich Details',
    prompt_instructions: `Write a story of AT LEAST 8 sentences.

Your story must include:
✓ Interesting adjectives and adverbs
✓ At least one simile (like... or as...as...)
✓ Character feelings and thoughts
✓ A clear beginning, middle, and end

Title: The Unexpected Adventure

Write your story:
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________

Make your story come alive with rich details!`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 20 },
        technical_accuracy: { weight: 25 },
        content_quality: { weight: 55 }
      },
      scoring_bands: {
        mastery: { range: [8, 8], badge: '🏆 Detail Expert!' },
        secure: { range: [6, 7], badge: '⭐ Good Details!' },
        developing: { range: [4, 5], badge: '💪 Learning Details!' },
        emerging: { range: [0, 3], badge: '🌱 Starting Details!' }
      }
    },
    passing_threshold: 63,
    expected_time_minutes: 20,
    difficulty_level: 'advanced',
    age_range: '9-11',
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 39
  },
  {
    level_number: 40,
    tier_number: 8,
    level_id: 'writing_level_40',
    activity_name: 'Your Best Short Narrative',
    activity_type: 'final_narrative',
    learning_objective: 'Pupils write their best short narrative (PROGRAMME FINALE)',
    prompt_title: 'FINAL CHALLENGE - Your Best Story! 🏆📚',
    prompt_instructions: `Write your BEST story ever! (10-12 sentences)

This is your final challenge! Show everything you've learned:
✓ An engaging beginning that hooks the reader
✓ A developed middle with action and tension
✓ A satisfying ending
✓ Varied sentence structures
✓ Rich vocabulary and descriptions
✓ Character thoughts and feelings
✓ Correct spelling and punctuation

Choose your own title: _______________________________

Write your best story:
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________

Congratulations on reaching the final level! Show us what you can do! 🎉`,
    rubric: {
      assessment_criteria: {
        task_completion: { weight: 15 },
        technical_accuracy: { weight: 25 },
        content_quality: { weight: 60 }
      },
      scoring_bands: {
        mastery: { range: [10, 12], badge: '🏆📚 WRIFE WRITING MASTER!' },
        secure: { range: [8, 9], badge: '⭐ PROGRAMME COMPLETE!' },
        developing: { range: [6, 7], badge: '💪 Almost There!' },
        emerging: { range: [0, 5], badge: '🌱 Keep Practicing!' }
      }
    },
    passing_threshold: 80,
    expected_time_minutes: 25,
    difficulty_level: 'advanced',
    age_range: '9-11',
    tier_finale: true,
    programme_finale: true,
    milestone: true,
    display_order: 40
  }
];

export const TIER_NAMES: Record<number, string> = {
  1: 'Word Awareness',
  2: 'Word Combinations',
  3: 'Simple Sentences',
  4: 'Sentence Expansion',
  5: 'Basic Sequencing',
  6: 'BME Structure',
  7: 'Enhanced Sentences',
  8: 'Short Narratives'
};

export const TIER_DESCRIPTIONS: Record<number, string> = {
  1: 'Foundation skills: Sorting and identifying word classes',
  2: 'Building phrases: Pairing words logically',
  3: 'Complete sentences: Structure and punctuation',
  4: 'Adding detail: Clauses and complexity',
  5: 'Connecting sentences: Order and flow',
  6: 'Story framework: Beginning-Middle-End',
  7: 'Sentence variety: Complex structures',
  8: 'Polished writing: Complete narratives'
};
