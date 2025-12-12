# WriFe Writing Activity Bank
## TIERS 1-2: COMPLETE IMPLEMENTATION (Levels 1-10)

**Word Awareness & Word Combinations**

---

## TIER 1: WORD AWARENESS (Levels 1-5)

### LEVEL 1: Sort Your Story Words

**Learning Objective:** Pupils can categorize words into PEOPLE, PLACES, THINGS

**Activity Type:** Written word sorting

**Prompt for Pupils:**
```
📝 WORD SORTING ACTIVITY

Copy these 10 words into three groups:

Words: grandmother, park, football, teacher, London, bicycle, doctor, school, book, friend

Write your answers below:

PEOPLE (who?):
_________________________________

PLACES (where?):
_________________________________

THINGS (what objects?):
_________________________________

Remember: Take your time and think carefully about each word!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_1",
  "activity_name": "Sort Your Story Words",
  "assessment_criteria": {
    "task_completion": {
      "weight": 30,
      "criteria": {
        "all_words_sorted": 15,
        "follows_format": 10,
        "neat_presentation": 5
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "correct_categorization": 35,
        "spelling_accuracy": 5
      }
    },
    "understanding": {
      "weight": 30,
      "criteria": {
        "demonstrates_category_concept": 30
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [9, 10],
      "percentage": "90-100%",
      "badge": "🏆 Word Sorting Champion!",
      "feedback_template": "Brilliant! You sorted {score} out of 10 words correctly! You really understand that people are WHO, places are WHERE, and things are WHAT objects."
    },
    "secure": {
      "range": [8, 8],
      "percentage": "80%",
      "badge": "⭐ Word Sorter!",
      "feedback_template": "Great work! You sorted {score} out of 10 correctly! You understand word groups well."
    },
    "developing": {
      "range": [6, 7],
      "percentage": "60-70%",
      "badge": "💪 Learning to Sort!",
      "feedback_template": "Good try! You sorted {score} out of 10. You're learning about word groups."
    },
    "emerging": {
      "range": [0, 5],
      "percentage": "0-50%",
      "badge": "🌱 Starting to Learn!",
      "feedback_template": "You sorted {score} out of 10. Let's learn more about word groups together!"
    }
  },
  "error_patterns": {
    "people_place_confusion": {
      "detection": "Marks people as places or vice versa",
      "feedback": "Remember: PEOPLE are WHO (teacher, grandmother). PLACES are WHERE we go (school, park)."
    },
    "thing_confusion": {
      "detection": "Marks people/places as things",
      "feedback": "THINGS are objects we can touch or hold - like football or book. People and places are different!"
    },
    "random_sorting": {
      "detection": "No clear pattern in sorting",
      "feedback": "Let's think about: WHO is this? (PEOPLE) WHERE is this? (PLACES) WHAT object is this? (THINGS)"
    }
  },
  "passing_threshold": 80,
  "ai_prompt_guidance": "Assess pupil's word categorization. Check for: (1) Correct category assignment for each word, (2) Understanding of category concepts, (3) Any systematic errors. Be encouraging and specific."
}
```

**Correct Answers:**
- PEOPLE: grandmother, teacher, doctor, friend
- PLACES: park, London, school
- THINGS: football, bicycle, book

**Expected Time:** 5-7 minutes

---

### LEVEL 2: Find the Action Words

**Learning Objective:** Pupils can identify verbs in sentences

**Prompt for Pupils:**
```
📝 FINDING ACTION WORDS

Read each sentence carefully.
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

Remember: The action word tells us what someone is DOING!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_2",
  "activity_name": "Find the Action Words",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "all_sentences_attempted": 20
      }
    },
    "technical_accuracy": {
      "weight": 50,
      "criteria": {
        "correct_verb_identification": 40,
        "spelling_accuracy": 10
      }
    },
    "understanding": {
      "weight": 30,
      "criteria": {
        "demonstrates_verb_concept": 30
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Action Word Detective!",
      "feedback_template": "Perfect! You found all 5 action words! You really understand what verbs are!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Verb Finder!",
      "feedback_template": "Excellent! You found {score} out of 5 action words! You understand verbs well!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Verbs!",
      "feedback_template": "Good work! You found {score} action words. Let's practice finding more!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting with Verbs!",
      "feedback_template": "You found {score} action words. Let's learn more about what verbs are!"
    }
  },
  "error_patterns": {
    "selects_nouns": {
      "detection": "Pupil writes subject noun instead of verb",
      "feedback": "Remember: The action word tells us what someone is DOING (jumps, reads), not WHO is doing it (girl, brother)."
    },
    "selects_objects": {
      "detection": "Pupil writes object noun instead of verb",
      "feedback": "The action word shows what is HAPPENING, not what thing is involved. Look for the DOING word!"
    },
    "spelling_issues": {
      "detection": "Correct verb identified but misspelled",
      "feedback": "Great! You found the action words! Let's work on spelling them correctly."
    }
  },
  "passing_threshold": 80,
  "ai_prompt_guidance": "Check if pupil correctly identifies verbs. Accept minor spelling errors if verb is clearly identified. Look for patterns: selecting nouns vs verbs."
}
```

**Correct Answers:**
1. jumps
2. reads
3. sing
4. sleeps
5. play

**Expected Time:** 5-6 minutes

---

### LEVEL 3: Write Word Pairs

**Learning Objective:** Pupils can create logical noun + verb combinations

**Prompt for Pupils:**
```
📝 MATCHING WORDS

Match each person or thing from Column A with an action from Column B that makes sense.
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

Think carefully: What can each person or thing really do?
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_3",
  "activity_name": "Write Word Pairs",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "five_pairs_written": 20
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "correct_spelling": 15,
        "proper_format": 15
      }
    },
    "content_quality": {
      "weight": 50,
      "criteria": {
        "logical_combinations": 45,
        "demonstrates_reasoning": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Perfect Matcher!",
      "feedback_template": "Brilliant! All 5 pairs make perfect sense! You understand what different things can do!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Great Matcher!",
      "feedback_template": "Excellent! {score} out of 5 pairs make sense! You're thinking logically!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning to Match!",
      "feedback_template": "Good! {score} pairs make sense. Let's think more about what each thing can really do."
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting to Match!",
      "feedback_template": "You wrote {score} good pairs. Let's learn about what different things can do!"
    }
  },
  "error_patterns": {
    "impossible_combinations": {
      "detection": "Pairs things with actions they cannot do",
      "feedback": "Think about what each thing can REALLY do. Can a fish teach? Can a bird bark? What makes sense in real life?"
    },
    "random_pairing": {
      "detection": "No logical pattern in pairing",
      "feedback": "Let's think carefully: What do birds do? What do teachers do? Match actions that make sense!"
    }
  },
  "passing_threshold": 80,
  "ai_prompt_guidance": "Evaluate if noun-verb combinations are logically possible in reality. Accept creative but plausible combinations."
}
```

**Logical Pairs:**
- birds + sing ✓
- children + play ✓
- dogs + bark ✓
- fish + swim ✓
- teachers + teach ✓

**Expected Time:** 6-8 minutes

---

### LEVEL 4: Capital Letters for Names

**Learning Objective:** Pupils can correctly capitalize proper nouns

**Prompt for Pupils:**
```
📝 CAPITAL LETTERS FOR SPECIAL NAMES

Some of these words need capital letters (special names).
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
✓ Ordinary words = lowercase letter
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_4",
  "activity_name": "Capital Letters for Names",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "all_words_written": 20
      }
    },
    "technical_accuracy": {
      "weight": 60,
      "criteria": {
        "correct_capitalization": 50,
        "correct_spelling": 10
      }
    },
    "understanding": {
      "weight": 20,
      "criteria": {
        "demonstrates_proper_noun_concept": 20
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [9, 10],
      "badge": "🏆 Capital Letter Expert!",
      "feedback_template": "Perfect! You got {score} out of 10 correct! You know exactly when to use capital letters!"
    },
    "secure": {
      "range": [8, 8],
      "badge": "⭐ Capital Letter Pro!",
      "feedback_template": "Excellent! {score} out of 10 correct! You understand special names well!"
    },
    "developing": {
      "range": [6, 7],
      "badge": "💪 Learning Capitals!",
      "feedback_template": "Good work! {score} correct. You're learning about special names and capital letters!"
    },
    "emerging": {
      "range": [0, 5],
      "badge": "🌱 Starting with Capitals!",
      "feedback_template": "You got {score} correct. Let's learn more about when to use capital letters!"
    }
  },
  "error_patterns": {
    "all_capitals": {
      "detection": "Capitalizes all words including common nouns",
      "feedback": "Remember: Only SPECIAL NAMES need capitals. Ordinary words like 'dog' or 'city' use lowercase letters."
    },
    "no_capitals": {
      "detection": "Doesn't capitalize proper nouns",
      "feedback": "Special names ALWAYS start with capital letters - like London (a specific city), Max (a specific dog's name), Tuesday (a specific day)."
    },
    "partial_understanding": {
      "detection": "Capitalizes some but not all proper nouns",
      "feedback": "You're getting there! Remember: ALL special names need capitals - names of people, places, days, and months."
    }
  },
  "passing_threshold": 80,
  "ai_prompt_guidance": "Check correct capitalization of proper nouns and lowercase for common nouns. Accept if meaning is clear even with minor spelling variations."
}
```

**Correct Answers:**
1. London (proper)
2. city (common)
3. Mrs. Brown (proper)
4. teacher (common)
5. England (proper)
6. country (common)
7. Max (proper)
8. dog (common)
9. Tuesday (proper)
10. day (common)

**Expected Time:** 7-9 minutes

---

### LEVEL 5: Complete Word Sort Challenge

**Learning Objective:** Pupils can classify words across four categories (TIER 1 FINALE)

**Prompt for Pupils:**
```
📝 FINAL WORD CHALLENGE! 🏆

Sort these 10 words into FOUR groups:
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

This is your Tier 1 challenge! Take your time and show what you've learned!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_5",
  "activity_name": "Complete Word Sort Challenge",
  "tier_completion": true,
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "all_words_sorted": 15,
        "all_categories_used": 5
      }
    },
    "technical_accuracy": {
      "weight": 50,
      "criteria": {
        "correct_categorization": 45,
        "spelling_accuracy": 5
      }
    },
    "understanding": {
      "weight": 30,
      "criteria": {
        "comprehensive_word_class_understanding": 30
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [9, 10],
      "percentage": "90-100%",
      "badge": "🏆 TIER 1 CHAMPION!",
      "certificate": "tier1_writing_completion_gold",
      "feedback_template": "INCREDIBLE! You got {score} out of 10! You are a word expert! You've mastered Tier 1! 🎉",
      "unlock": "tier2_level6"
    },
    "secure": {
      "range": [8, 8],
      "percentage": "80%",
      "badge": "⭐ TIER 1 COMPLETE!",
      "certificate": "tier1_writing_completion_silver",
      "feedback_template": "Brilliant! {score} out of 10! You've completed Tier 1! Ready for Tier 2! 🌟",
      "unlock": "tier2_level6"
    },
    "developing": {
      "range": [6, 7],
      "badge": "💪 Almost There!",
      "feedback_template": "Good work! {score} out of 10. Let's review word types before moving to Tier 2."
    },
    "emerging": {
      "range": [0, 5],
      "badge": "🌱 Keep Practicing!",
      "feedback_template": "You got {score} correct. Let's review the four word types together!"
    }
  },
  "error_patterns": {
    "noun_verb_confusion": {
      "detection": "Confuses nouns (people/things) with actions",
      "feedback": "Remember: 'teacher' is a PERSON (who), but 'teaching' is an ACTION (what they do). 'bicycle' is a THING, but 'cycling' is an ACTION."
    },
    "strong_nouns_weak_verbs": {
      "detection": "Correct with nouns, struggles with verbs",
      "feedback": "You're brilliant with PEOPLE, PLACES, and THINGS! Now remember: ACTIONS are words ending in -ing that show what someone is DOING!"
    },
    "inconsistent_pattern": {
      "detection": "No systematic approach to sorting",
      "feedback": "Let's be systematic: First find all PEOPLE, then PLACES, then THINGS, then ACTIONS. Check each word carefully!"
    }
  },
  "passing_threshold": 80,
  "tier_progression": {
    "unlock_tier2": {
      "requirement": "score >= 8",
      "message": "🎉 TIER 2 UNLOCKED! You're ready to combine words into phrases!",
      "celebration": true
    }
  },
  "ai_prompt_guidance": "This is Tier 1 finale - comprehensive assessment of word class understanding. Check for: (1) Correct categorization across all four types, (2) Consistent understanding, (3) Patterns indicating strong/weak areas. Celebrate completion enthusiastically if passed!"
}
```

**Correct Answers:**
- PEOPLE: teacher, doctor
- PLACES: playground, library
- THINGS: bicycle, computer
- ACTIONS: running, sleeping, jumping, singing

**Expected Time:** 8-10 minutes

---

## TIER 2: WORD COMBINATIONS (Levels 6-10)

### LEVEL 6: Add a Noun

**Learning Objective:** Pupils can complete phrases with appropriate nouns

**Prompt for Pupils:**
```
📝 COMPLETE THE PHRASES

Add a PERSON, PLACE, or THING to finish each phrase.
Make it make sense!

1. the big _________________

2. my happy _________________

3. a small _________________

4. the old _________________

5. our favorite _________________

6. a new _________________

Remember: Your word should fit with the describing word!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_6",
  "activity_name": "Add a Noun",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_phrases_completed": 25
      }
    },
    "technical_accuracy": {
      "weight": 25,
      "criteria": {
        "spelling_reasonable": 15,
        "uses_nouns": 10
      }
    },
    "content_quality": {
      "weight": 50,
      "criteria": {
        "logical_combinations": 35,
        "appropriate_vocabulary": 15
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [6, 6],
      "badge": "🏆 Phrase Master!",
      "feedback_template": "Perfect! All 6 phrases make sense and use great words! You have excellent vocabulary!"
    },
    "secure": {
      "range": [5, 5],
      "badge": "⭐ Phrase Builder!",
      "feedback_template": "Excellent! {score} out of 6 phrases work well! You're choosing words cleverly!"
    },
    "developing": {
      "range": [4, 4],
      "badge": "💪 Learning Phrases!",
      "feedback_template": "Good! {score} phrases make sense. Think about which words fit best together!"
    },
    "emerging": {
      "range": [0, 3],
      "badge": "🌱 Starting Phrases!",
      "feedback_template": "You completed {score} phrases. Let's practice choosing words that fit together!"
    }
  },
  "error_patterns": {
    "illogical_combinations": {
      "detection": "Nouns don't logically fit with adjectives",
      "feedback": "Think about what can be 'big', 'small', 'old', or 'new'. Does your word make sense with the describing word?"
    },
    "uses_verbs_instead": {
      "detection": "Uses actions instead of nouns",
      "feedback": "Remember: We need a PERSON, PLACE, or THING - not an action word! What noun fits here?"
    },
    "repetitive_choices": {
      "detection": "Uses same noun multiple times",
      "feedback": "Great thinking! Now try using different nouns for each phrase to show your vocabulary!"
    }
  },
  "passing_threshold": 67,
  "ai_prompt_guidance": "Evaluate if noun choices are logical with given adjectives. Accept creative choices if they make sense. Don't penalize for unusual but valid combinations (e.g., 'big ant' is acceptable)."
}
```

**Expected Time:** 6-8 minutes

---

### LEVEL 7: Add an Action

**Learning Objective:** Pupils can complete phrases with appropriate verbs

**Prompt for Pupils:**
```
📝 ADD THE ACTION

Add an action word to tell what each person or thing DOES.
Make sure it makes sense!

1. My dog _________________

2. The teacher _________________

3. Birds _________________

4. My friend _________________

5. The cat _________________

Remember: Your action word should be something they can really do!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_7",
  "activity_name": "Add an Action",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_phrases_completed": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "uses_verbs": 20,
        "verb_form_appropriate": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "logical_actions": 35,
        "creativity": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Action Expert!",
      "feedback_template": "Perfect! All 5 actions make sense! You understand what different things can do!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Action Builder!",
      "feedback_template": "Excellent! {score} out of 5 actions work perfectly! Great thinking!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Actions!",
      "feedback_template": "Good! {score} actions make sense. Think about what each thing can really do!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Actions!",
      "feedback_template": "You wrote {score} good actions. Let's practice more action words!"
    }
  },
  "error_patterns": {
    "impossible_actions": {
      "detection": "Assigns actions things cannot do",
      "feedback": "Think carefully: Can a bird really teach? What do birds actually do in real life?"
    },
    "uses_nouns_instead": {
      "detection": "Uses nouns instead of verbs",
      "feedback": "Remember: We need an ACTION word (what they DO), not a person or thing!"
    },
    "verb_form_issues": {
      "detection": "Wrong verb tense or form",
      "feedback": "You chose the right action! Now make sure the verb form matches: 'My dog runs' not 'My dog running'."
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Accept appropriate verbs even if tense isn't perfect (focus on concept). Verify actions are logically possible for subjects."
}
```

**Expected Time:** 5-7 minutes

---

### LEVEL 8: Build Three-Word Phrases

**Learning Objective:** Pupils can construct determiner + noun + verb patterns

**Prompt for Pupils:**
```
📝 BUILD WORD GROUPS

Use words from the boxes to make 5 word groups.
Pattern: THE or A + PERSON/THING + ACTION WORD

Box 1:          Box 2:           Box 3:
the             dog              runs
a               girl             jumps
                teacher          reads
                cat              sleeps
                bird             sings

Write 5 different word groups:

1. _______________________________

2. _______________________________

3. _______________________________

4. _______________________________

5. _______________________________

Example: the dog runs ✓
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_8",
  "activity_name": "Build Three-Word Phrases",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "five_phrases_written": 20
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "correct_pattern_used": 25,
        "grammar_appropriate": 15
      }
    },
    "content_quality": {
      "weight": 40,
      "criteria": {
        "logical_combinations": 30,
        "variety_in_choices": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Pattern Master!",
      "feedback_template": "Perfect! All 5 phrases follow the pattern and make sense! You're building sentences!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Pattern Builder!",
      "feedback_template": "Excellent! {score} out of 5 phrases are perfect! You understand the pattern!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Patterns!",
      "feedback_template": "Good work! {score} phrases follow the pattern. Keep practicing this formula!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Patterns!",
      "feedback_template": "You made {score} good phrases. Let's practice the pattern: THE/A + WHO/WHAT + ACTION!"
    }
  },
  "error_patterns": {
    "wrong_word_order": {
      "detection": "Words in incorrect sequence",
      "feedback": "Remember the pattern: First THE or A, then WHO/WHAT, then the ACTION. Try: 'the cat sleeps'."
    },
    "missing_determiner": {
      "detection": "Doesn't include the/a",
      "feedback": "Don't forget to start with THE or A! It makes your phrase complete."
    },
    "illogical_combinations": {
      "detection": "Word choices don't make sense together",
      "feedback": "Make sure your words make sense together. Can a teacher really sleep? What do teachers do?"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Correct word order (determiner-noun-verb), (2) Logical combinations, (3) Variety in choices. Focus on pattern understanding."
}
```

**Expected Time:** 7-9 minutes

---

### LEVEL 9: Add Describing Words

**Learning Objective:** Pupils can expand noun phrases with adjectives

**Prompt for Pupils:**
```
📝 MAKE IT MORE INTERESTING!

Add a DESCRIBING word before each person or thing.
Make your writing more interesting!

1. a _________________ dog

2. the _________________ girl

3. my _________________ teacher

4. a _________________ book

5. the _________________ park

Think about: What does it look like? How does it make you feel?
Examples: big, small, happy, old, beautiful, scary, funny
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_9",
  "activity_name": "Add Describing Words",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_phrases_completed": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "uses_adjectives": 20,
        "spelling_reasonable": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "appropriate_descriptions": 30,
        "vocabulary_quality": 15
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Description Champion!",
      "feedback_template": "Brilliant! All 5 describing words make your writing interesting! You have wonderful vocabulary!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Great Describer!",
      "feedback_template": "Excellent! {score} out of 5 descriptions work perfectly! Your words paint pictures!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning to Describe!",
      "feedback_template": "Good! {score} describing words work well. Keep building your vocabulary!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting to Describe!",
      "feedback_template": "You added {score} describing words. Let's learn more words to make writing interesting!"
    }
  },
  "error_patterns": {
    "uses_verbs_instead": {
      "detection": "Uses action words instead of adjectives",
      "feedback": "Remember: DESCRIBING words tell us WHAT SOMETHING IS LIKE - not what it does! Try: 'a happy dog' not 'a running dog'."
    },
    "illogical_adjectives": {
      "detection": "Adjectives don't match nouns logically",
      "feedback": "Think about whether your describing word makes sense. Can a park be 'loud'? What words describe a park better?"
    },
    "repetitive_choices": {
      "detection": "Uses same adjective multiple times",
      "feedback": "You know great describing words! Now try using a different one for each phrase to show your vocabulary!"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Accept appropriate adjectives. Don't penalize creative but plausible descriptions. Check for adjective usage (not verbs/nouns)."
}
```

**Expected Time:** 6-8 minutes

---

### LEVEL 10: Word Chain Challenge

**Learning Objective:** Pupils can build progressively longer phrases (TIER 2 FINALE)

**Prompt for Pupils:**
```
📝 TIER 2 FINAL CHALLENGE! 🏆

Build 3 word chains. Start with one word, then add one word each step!

CHAIN 1:
Step 1: dog
Step 2: big dog
Step 3: big dog runs
Step 4: the big dog runs

CHAIN 2:
Step 1: girl
Step 2: _________________
Step 3: _________________
Step 4: _________________

CHAIN 3:
Step 1: cat
Step 2: _________________
Step 3: _________________
Step 4: _________________

Make each chain tell a little story!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_10",
  "activity_name": "Word Chain Challenge",
  "tier_completion": true,
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "both_chains_attempted": 15,
        "all_steps_completed": 10
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "progressive_building": 20,
        "grammar_appropriate": 15
      }
    },
    "content_quality": {
      "weight": 40,
      "criteria": {
        "logical_progression": 25,
        "creativity": 15
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [6, 6],
      "percentage": "100%",
      "badge": "🏆 TIER 2 CHAMPION!",
      "certificate": "tier2_writing_completion_gold",
      "feedback_template": "AMAZING! Both chains are perfect! You're a phrase-building expert! Tier 2 complete! 🎉",
      "unlock": "tier3_level11"
    },
    "secure": {
      "range": [5, 5],
      "percentage": "83%",
      "badge": "⭐ TIER 2 COMPLETE!",
      "certificate": "tier2_writing_completion_silver",
      "feedback_template": "Brilliant! You built strong word chains! Tier 2 complete! Ready for sentences! 🌟",
      "unlock": "tier3_level11"
    },
    "developing": {
      "range": [4, 4],
      "badge": "💪 Almost There!",
      "feedback_template": "Good progress! You're building chains well. Let's perfect the pattern before Tier 3!"
    },
    "emerging": {
      "range": [0, 3],
      "badge": "🌱 Keep Building!",
      "feedback_template": "You're learning to build word chains! Let's practice the steps together!"
    }
  },
  "error_patterns": {
    "skips_steps": {
      "detection": "Doesn't build progressively",
      "feedback": "Remember: Add only ONE word each step! Step 2 should be 2 words, Step 3 should be 3 words, Step 4 should be 4 words."
    },
    "breaks_logic": {
      "detection": "Chains don't make sense",
      "feedback": "Make sure each new word you add fits with the words before it. Does your chain make sense when you read it?"
    },
    "incomplete_pattern": {
      "detection": "Doesn't reach 4-word phrase",
      "feedback": "Complete all 4 steps for each chain! Start with 1 word, add one at a time, until you have 4 words!"
    }
  },
  "passing_threshold": 67,
  "tier_progression": {
    "unlock_tier3": {
      "requirement": "score >= 5",
      "message": "🎉 TIER 3 UNLOCKED! You're ready to write complete sentences!",
      "celebration": true
    }
  },
  "ai_prompt_guidance": "This is Tier 2 finale. Check: (1) Progressive building (1→2→3→4 words), (2) Each addition is logical, (3) Final 4-word phrase makes sense. Celebrate enthusiastically if passed - big milestone!"
}
```

**Expected Time:** 10-12 minutes

---

## IMPLEMENTATION NOTES FOR TIERS 1-2

### Database Structure

Each level needs:
```javascript
{
  level_id: "writing_level_X",
  tier_number: X,
  level_number: X,
  activity_name: "...",
  activity_type: "open_writing",
  prompt_text: "...", // Full prompt as shown above
  word_banks: {...}, // If applicable
  success_criteria: {...},
  ai_rubric: {...}, // Full rubric as shown above
  passing_threshold: X,
  expected_time_minutes: X,
  tier_finale: boolean
}
```

### AI Assessment Integration

For each submission:
1. Retrieve level rubric from database
2. Send to Claude with pupil's writing
3. Claude returns structured assessment
4. Store in database
5. Update pupil progress if passed
6. Display feedback to pupil

### Teacher Dashboard Data

Track for each pupil:
- Completion rate per level
- Average score per tier
- Common error patterns
- Time spent writing
- Progress velocity
- Struggling areas

---

**TIERS 1-2 COMPLETE: 10 levels fully specified with prompts and AI rubrics ready for implementation!**
