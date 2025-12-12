# WriFe Writing Activity Bank
## TIERS 3-4: COMPLETE IMPLEMENTATION (Levels 11-24)

**Simple Sentences & Sentence Expansion**

---

## TIER 3: SIMPLE SENTENCES (Levels 11-17)

### LEVEL 11: Copy Perfect Sentences

**Learning Objective:** Pupils can copy sentences accurately with correct punctuation

**Prompt for Pupils:**
```
📝 COPY THESE SENTENCES EXACTLY

Copy each sentence carefully. Make sure you include:
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

Check your work! Did you copy everything correctly?
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_11",
  "activity_name": "Copy Perfect Sentences",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "all_sentences_copied": 20
      }
    },
    "technical_accuracy": {
      "weight": 60,
      "criteria": {
        "capitals_correct": 15,
        "full_stops_correct": 15,
        "spelling_accurate": 25,
        "exact_copying": 5
      }
    },
    "presentation": {
      "weight": 20,
      "criteria": {
        "neat_writing": 10,
        "attention_to_detail": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Perfect Copier!",
      "feedback_template": "Perfect! You copied all 5 sentences exactly right - capitals, full stops, spelling! Excellent attention to detail!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Great Copier!",
      "feedback_template": "Excellent! {score} out of 5 sentences copied correctly! You're very careful with your work!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning to Copy!",
      "feedback_template": "Good! {score} sentences correct. Remember to check capitals, full stops, and spelling!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting to Copy!",
      "feedback_template": "You copied {score} sentences well. Let's practice capitals, full stops, and spelling together!"
    }
  },
  "error_patterns": {
    "missing_capitals": {
      "detection": "Sentences don't start with capital letters",
      "feedback": "Remember: ALL sentences start with a CAPITAL LETTER! Check the first letter of each sentence."
    },
    "missing_full_stops": {
      "detection": "Sentences don't end with full stops",
      "feedback": "Don't forget the full stop at the END of each sentence! It shows the sentence is finished."
    },
    "spelling_errors": {
      "detection": "Words misspelled when copying",
      "feedback": "Check each word carefully as you copy. Look at every letter to make sure it matches!"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Compare pupil's writing to model sentences. Check for exact match in spelling, capitals, full stops. Accept if minor visual differences but meaning/accuracy clear."
}
```

**Expected Time:** 7-10 minutes

---

### LEVEL 12: Fix the Sentences

**Learning Objective:** Pupils can add missing capitals and full stops

**Prompt for Pupils:**
```
📝 FIX THESE SENTENCES!

These sentences are missing capital letters and full stops.
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

Remember: Every sentence needs a capital letter at the START and a full stop at the END!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_12",
  "activity_name": "Fix the Sentences",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "all_sentences_attempted": 20
      }
    },
    "technical_accuracy": {
      "weight": 60,
      "criteria": {
        "capitals_added": 30,
        "full_stops_added": 30
      }
    },
    "understanding": {
      "weight": 20,
      "criteria": {
        "demonstrates_sentence_boundaries": 20
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Sentence Fixer!",
      "feedback_template": "Perfect! You fixed all 5 sentences correctly! You know exactly where capitals and full stops go!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Punctuation Pro!",
      "feedback_template": "Excellent! You fixed {score} out of 5 sentences! You understand sentence punctuation!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Punctuation!",
      "feedback_template": "Good work! {score} sentences fixed. Keep practicing capitals and full stops!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Punctuation!",
      "feedback_template": "You fixed {score} sentences. Let's learn more about capitals and full stops!"
    }
  },
  "error_patterns": {
    "forgets_capitals": {
      "detection": "Doesn't add capital letters",
      "feedback": "Every sentence STARTS with a capital letter! Change the first letter to a capital."
    },
    "forgets_full_stops": {
      "detection": "Doesn't add full stops",
      "feedback": "Every sentence ENDS with a full stop! Add a . at the end."
    },
    "capital_i_errors": {
      "detection": "Doesn't capitalize 'I'",
      "feedback": "The word 'I' (meaning me/myself) is ALWAYS a capital letter - even in the middle of a sentence!"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Capital letter added at start, (2) Full stop added at end, (3) Word 'I' capitalized if present. Accept if these rules are followed even with minor spelling variations."
}
```

**Expected Time:** 6-8 minutes

---

### LEVEL 13: Complete the Sentences

**Learning Objective:** Pupils can finish sentence stems with appropriate verbs and objects

**Prompt for Pupils:**
```
📝 FINISH THESE SENTENCES

Complete each sentence by adding what happens.
Don't forget your full stop!

1. My teacher _______________________________

2. The children _______________________________

3. My dog _______________________________

4. Birds _______________________________

5. I _______________________________

Think: What does this person or thing DO? Make it make sense!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_13",
  "activity_name": "Complete the Sentences",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_sentences_completed": 25
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "full_stops_added": 15,
        "verb_usage_correct": 20
      }
    },
    "content_quality": {
      "weight": 40,
      "criteria": {
        "logical_completions": 30,
        "creativity": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Sentence Completer!",
      "feedback_template": "Brilliant! All 5 sentences are complete and make perfect sense! You're writing real sentences!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Sentence Builder!",
      "feedback_template": "Excellent! {score} out of 5 sentences completed well! Your sentences make sense!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Sentences!",
      "feedback_template": "Good! {score} sentences work. Keep thinking about what makes sense!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Sentences!",
      "feedback_template": "You completed {score} sentences. Let's practice finishing sentences together!"
    }
  },
  "error_patterns": {
    "no_full_stops": {
      "detection": "Forgets full stops",
      "feedback": "Your ideas are great! Don't forget to end each sentence with a full stop!"
    },
    "illogical_completions": {
      "detection": "Completions don't make sense with subjects",
      "feedback": "Think carefully: Can a teacher really fly? What do teachers actually do?"
    },
    "incomplete_thoughts": {
      "detection": "Doesn't add enough to complete sentence",
      "feedback": "Add MORE! Tell us what they DO and maybe WHERE or WHEN. Make your sentence complete!"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Logical completion that makes sense with subject, (2) Full stop at end, (3) Complete thought expressed. Accept creative but plausible completions."
}
```

**Expected Time:** 7-9 minutes

---

### LEVEL 14: Write Your Own Sentences

**Learning Objective:** Pupils write complete independent sentences (FIRST TIME!)

**Prompt for Pupils:**
```
📝 WRITE YOUR OWN SENTENCES! ✨

This is special - you're writing your OWN sentences!

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

You're a real writer now! 🌟
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_14",
  "activity_name": "Write Your Own Sentences",
  "milestone": "first_independent_writing",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "three_sentences_written": 20,
        "about_self": 5
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "capitals_correct": 10,
        "full_stops_correct": 10,
        "complete_sentences": 15,
        "spelling_reasonable": 5
      }
    },
    "content_quality": {
      "weight": 35,
      "criteria": {
        "makes_sense": 20,
        "uses_required_words": 10,
        "personal_voice": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [3, 3],
      "badge": "🏆 Real Writer!",
      "feedback_template": "WOW! You wrote 3 perfect sentences all by yourself! You're a real writer now! This is amazing! 🎉"
    },
    "secure": {
      "range": [2, 2],
      "badge": "⭐ Super Writer!",
      "feedback_template": "Brilliant! You wrote {score} great sentences by yourself! You can write! 🌟"
    },
    "developing": {
      "range": [1, 1],
      "badge": "💪 Learning to Write!",
      "feedback_template": "Good! You wrote {score} sentence! Keep writing more - you can do this!"
    },
    "emerging": {
      "range": [0, 0],
      "badge": "🌱 Starting to Write!",
      "feedback_template": "You're beginning to write! Let's write your first sentence together!"
    }
  },
  "error_patterns": {
    "sentence_fragments": {
      "detection": "Writes incomplete sentences",
      "feedback": "You have great ideas! Now make sure each sentence has WHO and WHAT THEY DO. Try: 'I like...' or 'I play...'"
    },
    "missing_punctuation": {
      "detection": "Missing capitals or full stops",
      "feedback": "Your sentences are wonderful! Remember: Capital letter at the START, full stop at the END!"
    },
    "not_personal": {
      "detection": "Doesn't write about self",
      "feedback": "Write about YOU! Start your sentences with 'I' - I like... I play... I go..."
    }
  },
  "passing_threshold": 33,
  "celebration": "This is pupil's FIRST independent writing - celebrate enthusiastically even for minimal success!",
  "ai_prompt_guidance": "This is a milestone! Be very encouraging. Accept sentences that express complete thoughts even if technical accuracy isn't perfect. Celebrate the achievement of independent writing!"
}
```

**Expected Time:** 8-12 minutes

---

### LEVEL 15: Add a Where

**Learning Objective:** Pupils can expand sentences with place information

**Prompt for Pupils:**
```
📝 ADD WHERE IT HAPPENS

Make these sentences better by adding WHERE.

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
Examples: in the park, at school, in my room
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_15",
  "activity_name": "Add a Where",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_sentences_expanded": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "appropriate_prepositions": 15,
        "full_stops_maintained": 15
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "logical_places": 35,
        "adds_meaningful_detail": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Place Expert!",
      "feedback_template": "Perfect! All 5 places make perfect sense! Your sentences are so much more interesting now!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Place Adder!",
      "feedback_template": "Excellent! {score} out of 5 places work great! You're making your writing more detailed!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Places!",
      "feedback_template": "Good! {score} places added. Think about WHERE things really happen!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Places!",
      "feedback_template": "You added {score} places. Let's practice adding WHERE to sentences!"
    }
  },
  "error_patterns": {
    "illogical_places": {
      "detection": "Places don't match activities",
      "feedback": "Think carefully: Do you really play football in the kitchen? WHERE do you usually play football?"
    },
    "missing_prepositions": {
      "detection": "Doesn't use in/at/on appropriately",
      "feedback": "Remember to use 'in', 'at', or 'on' before the place! Try: 'in the park' or 'at school'."
    },
    "repeats_same_place": {
      "detection": "Uses same place for all sentences",
      "feedback": "You know good places! Now try different places for each sentence to show variety!"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Appropriate place added, (2) Logical connection to activity, (3) Preposition usage (in/at/on). Accept creative but plausible places."
}
```

**Expected Time:** 7-9 minutes

---

### LEVEL 16: Add a When

**Learning Objective:** Pupils can expand sentences with time information

**Prompt for Pupils:**
```
📝 ADD WHEN IT HAPPENS

Make these sentences better by adding WHEN.

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
Examples: in the morning, after school, at night, on Saturday
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_16",
  "activity_name": "Add a When",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_sentences_expanded": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "appropriate_time_expressions": 15,
        "full_stops_maintained": 15
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "logical_times": 35,
        "adds_meaningful_detail": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Time Expert!",
      "feedback_template": "Brilliant! All 5 times make perfect sense! You know exactly when things happen!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Time Adder!",
      "feedback_template": "Excellent! {score} out of 5 times work perfectly! Your sentences have great detail!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Times!",
      "feedback_template": "Good! {score} times added well. Think about WHEN things really happen!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Times!",
      "feedback_template": "You added {score} times. Let's practice adding WHEN to sentences!"
    }
  },
  "error_patterns": {
    "illogical_times": {
      "detection": "Times don't match activities",
      "feedback": "Think carefully: Do you really eat breakfast at night? WHEN do you usually eat breakfast?"
    },
    "vague_times": {
      "detection": "Uses 'sometimes' or 'always' without specific time",
      "feedback": "Be more specific! Instead of 'sometimes', try 'in the morning' or 'after school' or 'on Saturdays'."
    },
    "repeats_same_time": {
      "detection": "Uses same time for all sentences",
      "feedback": "You know good times! Now try different times for each sentence to show when different things happen!"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Appropriate time expression added, (2) Logical connection to activity, (3) Specific rather than vague. Accept all reasonable time expressions."
}
```

**Expected Time:** 7-9 minutes

---

### LEVEL 17: Sentence Building Challenge

**Learning Objective:** Pupils write complete sentences with WHO, WHAT, WHERE (TIER 3 FINALE)

**Prompt for Pupils:**
```
📝 TIER 3 FINAL CHALLENGE! 🏆

Write 5 COMPLETE sentences.
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

Make each sentence different and interesting!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_17",
  "activity_name": "Sentence Building Challenge",
  "tier_completion": true,
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "five_sentences_written": 20
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "capitals_correct": 10,
        "full_stops_correct": 10,
        "complete_sentences": 15,
        "spelling_reasonable": 5
      }
    },
    "content_quality": {
      "weight": 40,
      "criteria": {
        "has_who_what_where": 25,
        "logical_sentences": 10,
        "variety": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "percentage": "100%",
      "badge": "🏆 TIER 3 CHAMPION!",
      "certificate": "tier3_writing_completion_gold",
      "feedback_template": "AMAZING! All 5 sentences are perfect! You can write complete sentences! TIER 3 COMPLETE! 🎉",
      "unlock": "tier4_level18"
    },
    "secure": {
      "range": [4, 4],
      "percentage": "80%",
      "badge": "⭐ TIER 3 COMPLETE!",
      "certificate": "tier3_writing_completion_silver",
      "feedback_template": "Brilliant! {score} strong sentences! You can write! TIER 3 COMPLETE! Ready for Tier 4! 🌟",
      "unlock": "tier4_level18"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Almost There!",
      "feedback_template": "Good progress! {score} good sentences. Let's perfect WHO-WHAT-WHERE before Tier 4!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Keep Building!",
      "feedback_template": "You wrote {score} sentences! Let's practice more complete sentences together!"
    }
  },
  "error_patterns": {
    "missing_elements": {
      "detection": "Sentences don't have WHO, WHAT, and WHERE",
      "feedback": "Check each sentence: Do you have WHO (person/thing), WHAT (action), and WHERE (place)? Add what's missing!"
    },
    "sentence_fragments": {
      "detection": "Incomplete sentences",
      "feedback": "Make sure each sentence is COMPLETE. It needs a WHO (subject) and a WHAT (verb). Read it out loud - does it make sense?"
    },
    "no_variety": {
      "detection": "All sentences too similar",
      "feedback": "Your sentences are good! Now try different people, actions, and places to show your writing skills!"
    }
  },
  "passing_threshold": 80,
  "tier_progression": {
    "unlock_tier4": {
      "requirement": "score >= 4",
      "message": "🎉 TIER 4 UNLOCKED! You're ready to make your sentences even better!",
      "celebration": true
    }
  },
  "ai_prompt_guidance": "TIER 3 FINALE - major milestone! Check all sentences have: (1) Subject (WHO), (2) Verb (WHAT), (3) Location (WHERE). Celebrate enthusiastically if passed!"
}
```

**Expected Time:** 10-15 minutes

---

## TIER 4: SENTENCE EXPANSION (Levels 18-24)

### LEVEL 18: Add Adjectives

**Learning Objective:** Pupils enhance sentences with describing words

**Prompt for Pupils:**
```
📝 MAKE SENTENCES MORE INTERESTING!

Add at least 2 describing words to make each sentence better.

1. The dog ran.
   The _____________ , _____________ dog ran.

2. My friend plays games.
   My _____________ friend plays _____________ games.

3. The bird sings.
   The _____________ bird sings.

4. A cat sleeps.
   A _____________ , _____________ cat sleeps.

5. The children played.
   The _____________ children played.

Think: What does it look like? How does it act?
Examples: big, small, happy, friendly, loud, quiet, fast, slow
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_18",
  "activity_name": "Add Adjectives",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_sentences_enhanced": 20,
        "minimum_two_adjectives": 5
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "uses_adjectives_not_verbs": 15,
        "appropriate_placement": 10,
        "spelling_reasonable": 5
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "appropriate_adjectives": 30,
        "vocabulary_quality": 15
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Description Master!",
      "feedback_template": "Brilliant! All your describing words make the sentences so much better! You have wonderful vocabulary!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Great Describer!",
      "feedback_template": "Excellent! {score} out of 5 sentences enhanced beautifully! Your adjectives paint pictures!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Adjectives!",
      "feedback_template": "Good! {score} sentences improved. Keep building your describing word vocabulary!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Adjectives!",
      "feedback_template": "You enhanced {score} sentences. Let's learn more describing words together!"
    }
  },
  "error_patterns": {
    "uses_verbs_instead": {
      "detection": "Uses -ing words or actions instead of adjectives",
      "feedback": "Remember: DESCRIBING words tell us what something IS LIKE (big, happy, loud), not what it DOES (running, jumping)."
    },
    "illogical_adjectives": {
      "detection": "Adjectives don't match nouns",
      "feedback": "Think carefully: Does 'loud bird' make sense? What words really describe a bird - small? colorful?"
    },
    "only_one_adjective": {
      "detection": "Adds only one adjective per sentence",
      "feedback": "Good adjectives! Now try adding TWO describing words to make your sentences even more interesting!"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) At least 2 adjectives added per sentence, (2) Adjectives are appropriate descriptors, (3) Logical combinations. Celebrate vocabulary development!"
}
```

**Expected Time:** 8-10 minutes

---

### LEVEL 19: Use "And" to Join

**Learning Objective:** Pupils create compound sentences with coordination

**Prompt for Pupils:**
```
📝 JOIN SENTENCES WITH "AND"

Join these pairs of sentences using "and".
Make TWO sentences become ONE!

1. I like football. + I like swimming.
   _______________________________

2. My dog runs fast. + My dog jumps high.
   _______________________________

3. The teacher reads. + The teacher writes.
   _______________________________

4. Birds sing. + Birds fly.
   _______________________________

5. We play games. + We have fun.
   _______________________________

Example: I eat apples. + I eat bananas.
         I eat apples and bananas.
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_19",
  "activity_name": "Use And to Join",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_pairs_joined": 25
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "correct_and_usage": 25,
        "maintains_sense": 10,
        "punctuation_correct": 5
      }
    },
    "content_quality": {
      "weight": 35,
      "criteria": {
        "sentences_flow_well": 25,
        "avoids_repetition": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Joining Master!",
      "feedback_template": "Perfect! All 5 sentences joined beautifully! You're writing longer, better sentences!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Great Joiner!",
      "feedback_template": "Excellent! {score} out of 5 joined correctly! You understand how 'and' works!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning to Join!",
      "feedback_template": "Good! {score} sentences joined. Keep practicing with 'and'!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting to Join!",
      "feedback_template": "You joined {score} sentences. Let's practice more with 'and'!"
    }
  },
  "error_patterns": {
    "repeats_unnecessary_words": {
      "detection": "Doesn't eliminate repetition when joining",
      "feedback": "When joining with 'and', you can often remove repeated words! Instead of 'I like football and I like swimming', try 'I like football and swimming'."
    },
    "missing_and": {
      "detection": "Doesn't include 'and' in joined sentence",
      "feedback": "Don't forget the word 'and' to join your two ideas! Put 'and' between them."
    },
    "awkward_joining": {
      "detection": "Joined sentence doesn't flow well",
      "feedback": "Read your sentence out loud. Does it sound smooth? Make sure it flows nicely when you say it!"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Both ideas included, (2) 'and' used appropriately, (3) Sentence flows naturally. Accept if makes sense even if some words repeated."
}
```

**Expected Time:** 7-9 minutes

---

### LEVEL 20: Use "But" to Contrast

**Learning Objective:** Pupils create compound sentences with contrast

**Prompt for Pupils:**
```
📝 SHOW CONTRAST WITH "BUT"

Finish these sentences using "but" to show a difference or surprise.

1. I like football, but _______________________________

2. My dog is small, but _______________________________

3. The sun is shining, but _______________________________

4. I am tired, but _______________________________

5. My friend is quiet, but _______________________________

Think: What's the opposite or surprising? Use "but" to show the difference!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_20",
  "activity_name": "Use But to Contrast",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_sentences_completed": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "appropriate_comma_usage": 10,
        "complete_second_clause": 15,
        "punctuation_correct": 5
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "shows_genuine_contrast": 35,
        "makes_logical_sense": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Contrast Expert!",
      "feedback_template": "Brilliant! All 5 contrasts work perfectly! You really understand how 'but' shows differences!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Contrast Builder!",
      "feedback_template": "Excellent! {score} out of 5 contrasts are great! You're using 'but' cleverly!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Contrasts!",
      "feedback_template": "Good! {score} contrasts work. Think about what's opposite or surprising!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Contrasts!",
      "feedback_template": "You wrote {score} contrasts. Let's learn more about using 'but'!"
    }
  },
  "error_patterns": {
    "no_real_contrast": {
      "detection": "Second part doesn't contrast with first",
      "feedback": "'But' shows a DIFFERENCE or SURPRISE! After 'I like football', try something different like 'I don't like rugby' or 'I'm not very good at it'."
    },
    "incomplete_clause": {
      "detection": "Second part is not a complete thought",
      "feedback": "After 'but', add a COMPLETE idea! Make sure it has WHO and WHAT THEY DO."
    },
    "uses_and_instead": {
      "detection": "Ideas go together rather than contrast",
      "feedback": "Your ideas agree with each other! Use 'and' when ideas go together, 'but' when they're different or surprising."
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Genuine contrast or surprise in second clause, (2) Complete thought after 'but', (3) Logical relationship. Accept creative contrasts."
}
```

**Expected Time:** 8-10 minutes

---

### LEVEL 21: Add a "Because"

**Learning Objective:** Pupils use causal clauses to explain reasons

**Prompt for Pupils:**
```
📝 EXPLAIN WHY WITH "BECAUSE"

Add a reason to each sentence using "because".

1. I am happy because _______________________________

2. We stayed inside because _______________________________

3. My dog is tired because _______________________________

4. I like school because _______________________________

5. The flowers are growing because _______________________________

Think: WHY is this happening? What's the REASON?
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_21",
  "activity_name": "Add a Because",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_sentences_completed": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "complete_clause_after_because": 20,
        "punctuation_maintained": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "logical_reasons": 35,
        "shows_cause_effect_understanding": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Reason Expert!",
      "feedback_template": "Perfect! All 5 reasons make perfect sense! You understand cause and effect brilliantly!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Reason Giver!",
      "feedback_template": "Excellent! {score} out of 5 reasons are logical! You're explaining WHY really well!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Reasons!",
      "feedback_template": "Good! {score} reasons work. Think about what causes things to happen!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Reasons!",
      "feedback_template": "You gave {score} reasons. Let's practice explaining WHY things happen!"
    }
  },
  "error_patterns": {
    "illogical_reasons": {
      "detection": "Reason doesn't logically explain the statement",
      "feedback": "Think carefully: Does that reason really explain WHY? What would make someone happy? What makes flowers grow?"
    },
    "incomplete_clause": {
      "detection": "Incomplete thought after 'because'",
      "feedback": "After 'because', add a COMPLETE reason! Tell us WHAT happened or WHAT is true."
    },
    "circular_reasoning": {
      "detection": "Reason just repeats the statement",
      "feedback": "'I am happy because I am happy' doesn't explain WHY! Give a real REASON - what CAUSED your happiness?"
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Logical cause-effect relationship, (2) Complete clause after 'because', (3) Reason actually explains the statement. Accept all plausible explanations."
}
```

**Expected Time:** 7-9 minutes

---

### LEVEL 22: Use "When" for Time

**Learning Objective:** Pupils create temporal clauses

**Prompt for Pupils:**
```
📝 SHOW TIME WITH "WHEN"

Write 5 sentences using "when" to show WHEN something happens.

You can put "when" at the start OR in the middle:
• When I wake up, I eat breakfast.
• I eat breakfast when I wake up.

Write 5 sentences with "when":

1. _______________________________

2. _______________________________

3. _______________________________

4. _______________________________

5. _______________________________

Think about: What happens WHEN? When do you do things?
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_22",
  "activity_name": "Use When for Time",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "five_sentences_written": 25
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "correct_when_usage": 20,
        "appropriate_comma_if_needed": 10,
        "complete_clauses": 10
      }
    },
    "content_quality": {
      "weight": 35,
      "criteria": {
        "shows_temporal_relationship": 25,
        "makes_logical_sense": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Time Master!",
      "feedback_template": "Perfect! All 5 'when' sentences show time perfectly! You're writing complex sentences!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Time Builder!",
      "feedback_template": "Excellent! {score} out of 5 use 'when' correctly! You understand time relationships!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Time!",
      "feedback_template": "Good! {score} 'when' sentences work. Keep practicing showing WHEN things happen!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Time!",
      "feedback_template": "You wrote {score} 'when' sentences. Let's practice more with time words!"
    }
  },
  "error_patterns": {
    "no_time_relationship": {
      "detection": "Doesn't show temporal connection",
      "feedback": "'When' shows WHEN something happens in time. Connect two things that happen at the same time or one after another!"
    },
    "missing_comma": {
      "detection": "Starts with 'when' but no comma after first clause",
      "feedback": "When you start with 'when', add a comma after the first part: 'When I wake up, I brush my teeth.'"
    },
    "incomplete_clauses": {
      "detection": "One part is not a complete thought",
      "feedback": "Both parts need to be complete! Each part needs WHO and WHAT THEY DO."
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) Appropriate use of 'when', (2) Both clauses complete, (3) Temporal relationship makes sense. Accept comma variations."
}
```

**Expected Time:** 9-11 minutes

---

### LEVEL 23: Multiple Details

**Learning Objective:** Pupils write sentences with multiple expanding elements

**Prompt for Pupils:**
```
📝 ADD LOTS OF DETAILS!

Write 3 super-detailed sentences!
Each sentence must have:
✓ WHO/WHAT
✓ ACTION
✓ WHERE
✓ WHEN
✓ WHY (because...)

Example: I play football in the park after school because I love sports.

Write 3 detailed sentences:

1. _______________________________
   _______________________________

2. _______________________________
   _______________________________

3. _______________________________
   _______________________________

Pack in ALL the details!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_23",
  "activity_name": "Multiple Details",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "three_sentences_written": 20
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "capitals_and_full_stops": 10,
        "complete_sentences": 15,
        "spelling_reasonable": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "includes_all_five_elements": 30,
        "details_enhance_meaning": 10,
        "flows_naturally": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [3, 3],
      "badge": "🏆 Detail Champion!",
      "feedback_template": "WOW! All 3 sentences are packed with perfect details! You're writing like a real author!"
    },
    "secure": {
      "range": [2, 2],
      "badge": "⭐ Detail Builder!",
      "feedback_template": "Brilliant! {score} sentences have great details! You're adding so much information!"
    },
    "developing": {
      "range": [1, 1],
      "badge": "💪 Learning Details!",
      "feedback_template": "Good! {score} sentence has details. Try to add ALL five parts - WHO, WHAT, WHERE, WHEN, WHY!"
    },
    "emerging": {
      "range": [0, 0],
      "badge": "🌱 Starting Details!",
      "feedback_template": "Let's build detailed sentences together! Start with WHO, then add more parts!"
    }
  },
  "error_patterns": {
    "missing_elements": {
      "detection": "Doesn't include all 5 required elements",
      "feedback": "Count the parts! Make sure you have: WHO/WHAT does something (action), WHERE it happens, WHEN it happens, WHY (because...)."
    },
    "run_on_sentence": {
      "detection": "Too long without proper structure",
      "feedback": "Your sentence is very long! Make sure it still makes sense. Read it out loud - can you follow it?"
    },
    "details_dont_fit": {
      "detection": "Added details don't connect logically",
      "feedback": "Make sure all your details fit together! Does the WHERE match the WHAT? Does the WHY make sense?"
    }
  },
  "passing_threshold": 33,
  "ai_prompt_guidance": "This is challenging! Check for: (1) All 5 elements present (WHO/WHAT/action/WHERE/WHEN/WHY), (2) Sentence is still readable, (3) Details make sense together. Celebrate effort even if not perfect!"
}
```

**Expected Time:** 10-15 minutes

---

### LEVEL 24: Formula Sentence Practice

**Learning Objective:** Pupils follow specific sentence patterns (TIER 4 FINALE)

**Prompt for Pupils:**
```
📝 TIER 4 FINAL CHALLENGE! 🏆

Write 5 sentences following these exact patterns:

PATTERN 1: Adjective + Noun + Verb + Where
Example: The happy dog runs in the park.
Your turn: _______________________________

PATTERN 2: Noun + Verb + Where + When
Example: Children play outside after school.
Your turn: _______________________________

PATTERN 3: When + Sentence, + Sentence
Example: When it rains, I stay inside.
Your turn: _______________________________

PATTERN 4: Sentence + but + Sentence
Example: I like swimming but I don't like diving.
Your turn: _______________________________

PATTERN 5: Sentence + because + Reason
Example: The cat is happy because it caught a mouse.
Your turn: _______________________________

Follow each pattern exactly! Show your sentence-building skills!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_24",
  "activity_name": "Formula Sentence Practice",
  "tier_completion": true,
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_five_patterns_attempted": 25
      }
    },
    "technical_accuracy": {
      "weight": 45,
      "criteria": {
        "follows_patterns_correctly": 30,
        "punctuation_appropriate": 10,
        "grammar_correct": 5
      }
    },
    "content_quality": {
      "weight": 30,
      "criteria": {
        "sentences_make_sense": 20,
        "variety_in_content": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "percentage": "100%",
      "badge": "🏆 TIER 4 CHAMPION!",
      "certificate": "tier4_writing_completion_gold",
      "feedback_template": "INCREDIBLE! All 5 patterns perfect! You're a sentence-building master! TIER 4 COMPLETE! 🎉",
      "unlock": "tier5_level25"
    },
    "secure": {
      "range": [4, 4],
      "percentage": "80%",
      "badge": "⭐ TIER 4 COMPLETE!",
      "certificate": "tier4_writing_completion_silver",
      "feedback_template": "Brilliant! {score} patterns followed perfectly! TIER 4 COMPLETE! Ready for sequencing! 🌟",
      "unlock": "tier5_level25"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Almost There!",
      "feedback_template": "Good! {score} patterns correct. Let's master all five patterns before Tier 5!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Learning Patterns!",
      "feedback_template": "You tried {score} patterns. Let's practice following sentence formulas together!"
    }
  },
  "error_patterns": {
    "wrong_word_order": {
      "detection": "Doesn't follow specified pattern order",
      "feedback": "Follow the pattern EXACTLY! Check the example and make sure your sentence has the same word order."
    },
    "missing_pattern_elements": {
      "detection": "Skips required parts of pattern",
      "feedback": "Count the parts! Make sure you include EVERY part shown in the pattern - don't miss any!"
    },
    "pattern_confusion": {
      "detection": "Mixes up different patterns",
      "feedback": "Each pattern is different! Read the pattern carefully before writing that sentence."
    }
  },
  "passing_threshold": 80,
  "tier_progression": {
    "unlock_tier5": {
      "requirement": "score >= 4",
      "message": "🎉 TIER 5 UNLOCKED! You're ready to connect sentences into sequences!",
      "celebration": true
    }
  },
  "ai_prompt_guidance": "TIER 4 FINALE! This tests systematic sentence construction. Check each sentence matches its pattern exactly. Celebrate mastery of sentence formulas!"
}
```

**Expected Time:** 12-15 minutes

---

**TIERS 3-4 COMPLETE: 14 levels (11-24) fully specified with prompts and AI rubrics ready for implementation!**
