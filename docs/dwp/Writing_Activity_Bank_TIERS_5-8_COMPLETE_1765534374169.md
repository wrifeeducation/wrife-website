# WriFe Writing Activity Bank
## TIERS 5-8: COMPLETE IMPLEMENTATION (Levels 25-40)

**Basic Sequencing, BME Structure, Enhanced Sentences & Short Narratives**

---

## TIER 5: BASIC SEQUENCING (Levels 25-28)

### LEVEL 25: First, Next, Then, Last

**Learning Objective:** Pupils write 4 sequenced sentences with connectives

**Prompt for Pupils:**
```
📝 WRITE IN ORDER!

Write 4 sentences about MAKING A SANDWICH.
Use these time words to show the order:
• First,
• Next,
• Then,
• Last,

First, _______________________________

Next, _______________________________

Then, _______________________________

Last, _______________________________

Tell the story step by step!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_25",
  "activity_name": "First Next Then Last",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "four_sentences_written": 20,
        "uses_all_connectives": 5
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "capitals_and_punctuation": 15,
        "connectives_used_correctly": 15,
        "complete_sentences": 5
      }
    },
    "content_quality": {
      "weight": 40,
      "criteria": {
        "logical_sequence": 30,
        "relates_to_topic": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [4, 4],
      "badge": "🏆 Sequence Master!",
      "feedback_template": "Perfect! All 4 steps in perfect order! You can tell a story step by step brilliantly!"
    },
    "secure": {
      "range": [3, 3],
      "badge": "⭐ Good Sequencer!",
      "feedback_template": "Excellent! {score} steps are clear and in order! You're sequencing well!"
    },
    "developing": {
      "range": [2, 2],
      "badge": "💪 Learning Sequence!",
      "feedback_template": "Good! {score} steps make sense. Think about the right order for all steps!"
    },
    "emerging": {
      "range": [0, 1],
      "badge": "🌱 Starting Sequence!",
      "feedback_template": "You wrote {score} step(s). Let's learn to write things in order!"
    }
  },
  "error_patterns": {
    "illogical_order": {
      "detection": "Steps out of logical sequence",
      "feedback": "Think about the ORDER! What happens FIRST? Then what? Check if your steps make sense in real life."
    },
    "repeats_connectives": {
      "detection": "Uses same connective multiple times",
      "feedback": "Use all four different time words: First, Next, Then, Last - one for each sentence!"
    },
    "unrelated_sentences": {
      "detection": "Sentences don't relate to topic",
      "feedback": "All four sentences should be about making a sandwich! Tell the whole story from start to finish."
    }
  },
  "passing_threshold": 50,
  "ai_prompt_guidance": "Check for: (1) Uses all 4 connectives correctly, (2) Logical sequence of actions, (3) Relates to given topic. This introduces sequencing!"
}
```

**Expected Time:** 8-10 minutes

---

### LEVEL 26: Write 3 Connected Sentences

**Learning Objective:** Pupils write cohesive short sequences without frames

**Prompt for Pupils:**
```
📝 WRITE SENTENCES THAT GO TOGETHER

Write 3 sentences about ONE of these topics:
• Playing your favorite game
• Walking to school
• Eating dinner with your family

Choose one topic: _______________________________

Write 3 sentences that tell what happens:

1. _______________________________

2. _______________________________

3. _______________________________

Make sure your sentences go together and tell a little story!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_26",
  "activity_name": "Write 3 Connected Sentences",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "three_sentences_written": 20,
        "topic_identified": 5
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "capitals_and_full_stops": 15,
        "complete_sentences": 15,
        "spelling_reasonable": 5
      }
    },
    "content_quality": {
      "weight": 40,
      "criteria": {
        "sentences_connected": 25,
        "stays_on_topic": 10,
        "coherent_sequence": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [3, 3],
      "badge": "🏆 Story Teller!",
      "feedback_template": "Brilliant! All 3 sentences go together perfectly! You told a complete little story!"
    },
    "secure": {
      "range": [2, 2],
      "badge": "⭐ Good Connector!",
      "feedback_template": "Excellent! {score} sentences connect well! You're building stories!"
    },
    "developing": {
      "range": [1, 1],
      "badge": "💪 Learning Connection!",
      "feedback_template": "Good! {score} sentence works. Now write more sentences that go together!"
    },
    "emerging": {
      "range": [0, 0],
      "badge": "🌱 Starting Stories!",
      "feedback_template": "Let's write sentences that go together! Start with what happens first..."
    }
  },
  "error_patterns": {
    "unconnected_sentences": {
      "detection": "Sentences don't relate to each other",
      "feedback": "Make your sentences go together! Each sentence should continue the story from the one before."
    },
    "changes_topic": {
      "detection": "Switches to different topic",
      "feedback": "Stay on ONE topic! If you chose 'playing a game', ALL three sentences should be about playing that game."
    },
    "no_progression": {
      "detection": "Sentences don't show sequence or development",
      "feedback": "Show what happens! Start with the beginning, then tell what happens next, then how it ends."
    }
  },
  "passing_threshold": 33,
  "ai_prompt_guidance": "This is first attempt at connected writing without frames. Check for: (1) Sentences relate to each other, (2) Stays on chosen topic, (3) Shows some progression. Be encouraging!"
}
```

**Expected Time:** 9-12 minutes

---

### LEVEL 27: Before and After

**Learning Objective:** Pupils write temporal sequences around central events

**Prompt for Pupils:**
```
📝 WHAT HAPPENED BEFORE AND AFTER?

For each event, write what happened BEFORE and what happened AFTER.

EVENT 1: I scored a goal!
Before: _______________________________
After: _______________________________

EVENT 2: The bell rang for lunch.
Before: _______________________________
After: _______________________________

EVENT 3: My friend arrived at my house.
Before: _______________________________
After: _______________________________

Think: What led to this? What happened next?
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_27",
  "activity_name": "Before and After",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_six_sentences_written": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "complete_sentences": 20,
        "punctuation_correct": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "logical_before_events": 20,
        "logical_after_events": 20,
        "shows_cause_effect": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [6, 6],
      "badge": "🏆 Time Master!",
      "feedback_template": "Perfect! All your BEFORE and AFTER sentences make perfect sense! You understand time order brilliantly!"
    },
    "secure": {
      "range": [5, 5],
      "badge": "⭐ Time Builder!",
      "feedback_template": "Excellent! {score} out of 6 sentences show good time order! You're thinking about sequences!"
    },
    "developing": {
      "range": [4, 4],
      "badge": "💪 Learning Time!",
      "feedback_template": "Good! {score} sentences work. Think about what really happens before and after events!"
    },
    "emerging": {
      "range": [0, 3],
      "badge": "🌱 Starting Time!",
      "feedback_template": "You wrote {score} sentences. Let's practice what happens before and after things!"
    }
  },
  "error_patterns": {
    "illogical_before": {
      "detection": "Before sentence doesn't logically lead to event",
      "feedback": "Think: What would happen BEFORE scoring a goal? Maybe 'I kicked the ball' or 'I ran towards the goal'?"
    },
    "illogical_after": {
      "detection": "After sentence doesn't logically follow event",
      "feedback": "Think: What would happen AFTER scoring a goal? Maybe your team celebrated or you felt happy?"
    },
    "confuses_before_after": {
      "detection": "Writes 'after' event in 'before' position or vice versa",
      "feedback": "Check carefully! BEFORE means EARLIER (what happened first). AFTER means LATER (what happened next)."
    }
  },
  "passing_threshold": 67,
  "ai_prompt_guidance": "Check for: (1) Before sentences logically precede events, (2) After sentences logically follow events, (3) Understanding of temporal relationships. Accept plausible scenarios."
}
```

**Expected Time:** 10-12 minutes

---

### LEVEL 28: Tell What Happened

**Learning Objective:** Pupils write 5-sentence recount in chronological order (TIER 5 FINALE)

**Prompt for Pupils:**
```
📝 TIER 5 FINAL CHALLENGE! 🏆

Write 5 sentences about something you did YESTERDAY.
Tell what happened in the right order, from start to finish.

What I did yesterday:

1. _______________________________

2. _______________________________

3. _______________________________

4. _______________________________

5. _______________________________

Tell the story in order! What happened first? Then what? How did it end?
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_28",
  "activity_name": "Tell What Happened",
  "tier_completion": true,
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "five_sentences_written": 20
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "capitals_and_punctuation": 15,
        "complete_sentences": 15,
        "past_tense_appropriate": 5
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "chronological_order": 25,
        "coherent_narrative": 15,
        "stays_on_topic": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "percentage": "100%",
      "badge": "🏆 TIER 5 CHAMPION!",
      "certificate": "tier5_writing_completion_gold",
      "feedback_template": "AMAZING! All 5 sentences tell a perfect story in order! You can recount events! TIER 5 COMPLETE! 🎉",
      "unlock": "tier6_level29"
    },
    "secure": {
      "range": [4, 4],
      "percentage": "80%",
      "badge": "⭐ TIER 5 COMPLETE!",
      "certificate": "tier5_writing_completion_silver",
      "feedback_template": "Brilliant! Your story flows in good order! TIER 5 COMPLETE! Ready for story structure! 🌟",
      "unlock": "tier6_level29"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Almost There!",
      "feedback_template": "Good! {score} sentences work. Let's perfect the order before Tier 6!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Keep Sequencing!",
      "feedback_template": "You wrote {score} sentences. Let's practice telling stories in order!"
    }
  },
  "error_patterns": {
    "out_of_order": {
      "detection": "Events not in chronological sequence",
      "feedback": "Check the order! Did that really happen in that order? Start with what happened FIRST, then tell what happened NEXT."
    },
    "jumps_around": {
      "detection": "Narrative lacks cohesion between sentences",
      "feedback": "Connect your sentences! Each one should follow on from the one before. Tell the story smoothly from start to end."
    },
    "incomplete_story": {
      "detection": "Doesn't form complete narrative arc",
      "feedback": "Tell the WHOLE story! Start at the beginning, tell what happened in the middle, and finish with the end."
    }
  },
  "passing_threshold": 80,
  "tier_progression": {
    "unlock_tier6": {
      "requirement": "score >= 4",
      "message": "🎉 TIER 6 UNLOCKED! You're ready to learn Beginning-Middle-End story structure!",
      "celebration": true
    }
  },
  "ai_prompt_guidance": "TIER 5 FINALE! Check: (1) 5 sentences form coherent recount, (2) Chronological order maintained, (3) Complete narrative. This is foundation for formal story structure!"
}
```

**Expected Time:** 12-15 minutes

---

## TIER 6: BME STRUCTURE (Levels 29-33)

### LEVEL 29: Beginning Sentences

**Learning Objective:** Pupils craft effective story openings

**Prompt for Pupils:**
```
📝 WRITE STORY BEGINNINGS

Write a BEGINNING sentence for each story.
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
• My grandmother came to visit us at home.
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_29",
  "activity_name": "Beginning Sentences",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "three_beginnings_written": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "capitals_and_punctuation": 15,
        "complete_sentences": 15
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "introduces_who": 20,
        "introduces_where": 15,
        "appropriate_for_title": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [3, 3],
      "badge": "🏆 Beginning Master!",
      "feedback_template": "Perfect! All 3 beginnings introduce WHO and WHERE brilliantly! You know how to start stories!"
    },
    "secure": {
      "range": [2, 2],
      "badge": "⭐ Good Opener!",
      "feedback_template": "Excellent! {score} beginnings work really well! You're starting stories effectively!"
    },
    "developing": {
      "range": [1, 1],
      "badge": "💪 Learning Beginnings!",
      "feedback_template": "Good! {score} beginning works. Remember to tell WHO and WHERE in your opening!"
    },
    "emerging": {
      "range": [0, 0],
      "badge": "🌱 Starting Beginnings!",
      "feedback_template": "Let's learn to write story openings! Start by telling WHO and WHERE..."
    }
  },
  "error_patterns": {
    "missing_who": {
      "detection": "Doesn't introduce a character",
      "feedback": "Every story needs a character! Tell us WHO the story is about - give them a name or describe them."
    },
    "missing_where": {
      "detection": "Doesn't establish setting",
      "feedback": "Tell us WHERE the story happens! Is it at school? In a park? At home? Set the scene!"
    },
    "jumps_to_action": {
      "detection": "Starts with middle action instead of setup",
      "feedback": "That's more like the MIDDLE! A beginning should INTRODUCE the character and place. Save the exciting action for later!"
    }
  },
  "passing_threshold": 33,
  "ai_prompt_guidance": "Check for: (1) Character introduced (WHO), (2) Setting established (WHERE), (3) Appropriate tone for story title. This teaches story structure fundamentals!"
}
```

**Expected Time:** 8-10 minutes

---

### LEVEL 30: Middle Sentences (The Problem)

**Learning Objective:** Pupils develop story conflict/action

**Prompt for Pupils:**
```
📝 WRITE STORY MIDDLES

For each beginning, write 2 MIDDLE sentences.
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

The MIDDLE is where something happens! Make it interesting!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_30",
  "activity_name": "Middle Sentences",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "six_middle_sentences_written": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "complete_sentences": 20,
        "punctuation_correct": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "develops_action_or_problem": 25,
        "connects_to_beginning": 15,
        "interesting_content": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [6, 6],
      "badge": "🏆 Middle Master!",
      "feedback_template": "Brilliant! All your middles develop the stories perfectly! You know how to build tension and action!"
    },
    "secure": {
      "range": [5, 5],
      "badge": "⭐ Action Builder!",
      "feedback_template": "Excellent! {score} out of 6 middle sentences develop stories well! Great story-building!"
    },
    "developing": {
      "range": [4, 4],
      "badge": "💪 Learning Middles!",
      "feedback_template": "Good! {score} middle sentences work. Remember the middle is where things HAPPEN!"
    },
    "emerging": {
      "range": [0, 3],
      "badge": "🌱 Starting Middles!",
      "feedback_template": "You wrote {score} sentences. Let's learn to develop story action!"
    }
  },
  "error_patterns": {
    "no_development": {
      "detection": "Middle doesn't add action or problem",
      "feedback": "The MIDDLE is where things HAPPEN! Add a problem, a challenge, or an exciting event. What goes wrong? What does the character do?"
    },
    "doesnt_connect": {
      "detection": "Middle doesn't follow from beginning",
      "feedback": "Make sure your middle follows on from the beginning! The story should flow naturally."
    },
    "resolves_too_soon": {
      "detection": "Solves problem in middle instead of ending",
      "feedback": "Save the solution for the END! The middle should show the problem or action, not solve it yet."
    }
  },
  "passing_threshold": 67,
  "ai_prompt_guidance": "Check for: (1) Action/problem developed, (2) Connects logically to beginning, (3) Doesn't resolve conflict yet. Accept creative developments!"
}
```

**Expected Time:** 10-12 minutes

---

### LEVEL 31: Ending Sentences

**Learning Objective:** Pupils craft effective resolutions

**Prompt for Pupils:**
```
📝 WRITE STORY ENDINGS

For each story beginning and middle, write an ENDING sentence.
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

The ENDING wraps everything up! How does it finish?
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_31",
  "activity_name": "Ending Sentences",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "three_endings_written": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "complete_sentences": 20,
        "punctuation_correct": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "provides_resolution": 25,
        "connects_to_story": 15,
        "satisfying_closure": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [3, 3],
      "badge": "🏆 Ending Expert!",
      "feedback_template": "Perfect! All 3 endings wrap up the stories brilliantly! You know how to finish stories well!"
    },
    "secure": {
      "range": [2, 2],
      "badge": "⭐ Good Finisher!",
      "feedback_template": "Excellent! {score} endings work really well! You're completing stories effectively!"
    },
    "developing": {
      "range": [1, 1],
      "badge": "💪 Learning Endings!",
      "feedback_template": "Good! {score} ending works. Remember the ending should solve the problem or finish the story!"
    },
    "emerging": {
      "range": [0, 0],
      "badge": "🌱 Starting Endings!",
      "feedback_template": "Let's learn to write story endings! The ending should tell how things turn out..."
    }
  },
  "error_patterns": {
    "no_resolution": {
      "detection": "Doesn't resolve the problem/action",
      "feedback": "The ENDING should tell us how it all turned out! What happened to the character? Was the problem solved?"
    },
    "introduces_new_problem": {
      "detection": "Adds new conflict instead of resolving",
      "feedback": "The ending should FINISH the story, not start a new problem! Wrap things up - how does it end?"
    },
    "abrupt_ending": {
      "detection": "Too sudden without proper closure",
      "feedback": "Your ending is a bit sudden! Add a bit more - how did the character feel? What was the final outcome?"
    }
  },
  "passing_threshold": 33,
  "ai_prompt_guidance": "Check for: (1) Provides resolution to story, (2) Connects to beginning and middle, (3) Gives sense of closure. Accept creative endings if they complete the story!"
}
```

**Expected Time:** 9-11 minutes

---

### LEVEL 32: Complete BME Plan

**Learning Objective:** Pupils plan all three story parts

**Prompt for Pupils:**
```
📝 PLAN YOUR OWN STORY!

Plan a story called "A Special Day"

BEGINNING (WHO and WHERE - write 1 sentence):
Tell us who the story is about and where it happens.

_______________________________

MIDDLE (WHAT HAPPENED - write 2 sentences):
Tell us what happened. What was special about the day?

1. _______________________________

2. _______________________________

ENDING (HOW IT FINISHED - write 1 sentence):
How did the day end?

_______________________________

This is your complete story plan!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_32",
  "activity_name": "Complete BME Plan",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "all_four_sentences_written": 25
      }
    },
    "technical_accuracy": {
      "weight": 30,
      "criteria": {
        "complete_sentences": 20,
        "punctuation_correct": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "clear_BME_structure": 25,
        "coherent_story": 15,
        "appropriate_for_title": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [4, 4],
      "badge": "🏆 Story Planner!",
      "feedback_template": "Brilliant! Your story plan has a perfect Beginning, Middle, and End! This will make a great story!"
    },
    "secure": {
      "range": [3, 3],
      "badge": "⭐ Good Planner!",
      "feedback_template": "Excellent! Your story plan has good structure! You understand Beginning-Middle-End!"
    },
    "developing": {
      "range": [2, 2],
      "badge": "💪 Learning Planning!",
      "feedback_template": "Good! {score} parts work. Make sure you have all three parts: Beginning, Middle, End!"
    },
    "emerging": {
      "range": [0, 1],
      "badge": "🌱 Starting Planning!",
      "feedback_template": "You wrote {score} part(s). Let's plan all three parts together!"
    }
  },
  "error_patterns": {
    "wrong_content_in_sections": {
      "detection": "Puts beginning content in middle, etc.",
      "feedback": "Check each part! BEGINNING introduces WHO and WHERE. MIDDLE tells what happens. ENDING tells how it finishes."
    },
    "no_connection_between_parts": {
      "detection": "Parts don't connect to form coherent story",
      "feedback": "Make sure your parts connect! The middle should follow from the beginning, and the ending should finish what happened in the middle."
    },
    "too_vague": {
      "detection": "Content too general, no specific details",
      "feedback": "Add more detail! Tell us specific things - WHO exactly? WHERE exactly? WHAT exactly happened?"
    }
  },
  "passing_threshold": 50,
  "ai_prompt_guidance": "Check for: (1) Beginning introduces character/setting, (2) Middle develops action, (3) Ending provides closure, (4) All parts connect logically. This is planning practice before full story!"
}
```

**Expected Time:** 10-12 minutes

---

### LEVEL 33: Write Your First Story

**Learning Objective:** Pupils write complete 5+ sentence story (TIER 6 FINALE)

**Prompt for Pupils:**
```
📝 TIER 6 FINAL CHALLENGE - YOUR FIRST COMPLETE STORY! 🏆

Write a short story with Beginning, Middle, and End.
Choose ONE topic:
• My Best Friend
• A Fun Day Out
• Learning Something New

I choose: _______________________________

Write your story (at least 5 sentences):

BEGINNING (1-2 sentences):
_______________________________
_______________________________

MIDDLE (2-3 sentences):
_______________________________
_______________________________
_______________________________

ENDING (1 sentence):
_______________________________

This is YOUR story! Make it interesting!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_33",
  "activity_name": "Write Your First Story",
  "tier_completion": true,
  "milestone": "first_complete_story",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "minimum_five_sentences": 15,
        "topic_chosen": 5
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "capitals_and_punctuation": 15,
        "complete_sentences": 15,
        "spelling_reasonable": 5
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "clear_BME_structure": 25,
        "coherent_narrative": 15,
        "creative_content": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "percentage": "100%",
      "badge": "🏆 TIER 6 CHAMPION - STORY WRITER!",
      "certificate": "tier6_writing_completion_gold",
      "feedback_template": "WOW! You wrote a COMPLETE STORY with perfect Beginning, Middle, and End! You're an author! TIER 6 COMPLETE! 🎉📚",
      "unlock": "tier7_level34"
    },
    "secure": {
      "range": [4, 4],
      "percentage": "80%",
      "badge": "⭐ TIER 6 COMPLETE - STORY WRITER!",
      "certificate": "tier6_writing_completion_silver",
      "feedback_template": "Brilliant! You wrote a complete story with good structure! You can write stories! TIER 6 COMPLETE! 🌟📚",
      "unlock": "tier7_level34"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Almost a Story Writer!",
      "feedback_template": "Good story! Let's perfect your Beginning-Middle-End structure before Tier 7!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Learning Stories!",
      "feedback_template": "You're learning to write stories! Let's work on Beginning-Middle-End together!"
    }
  },
  "error_patterns": {
    "missing_beginning": {
      "detection": "Jumps straight to action without setup",
      "feedback": "Start with a BEGINNING! Introduce WHO your story is about and WHERE it happens before diving into the action."
    },
    "missing_middle": {
      "detection": "Goes from beginning straight to ending",
      "feedback": "Add a MIDDLE! Tell us what HAPPENED - what did the character do? What was interesting or exciting?"
    },
    "missing_ending": {
      "detection": "Story stops abruptly without closure",
      "feedback": "Finish with an ENDING! Tell us how the story ended - what happened in the end? How did the character feel?"
    },
    "too_short": {
      "detection": "Fewer than 5 sentences",
      "feedback": "Your story needs to be longer! Try to write at least 5 sentences - give us more details about what happened!"
    }
  },
  "passing_threshold": 80,
  "celebration": "MAJOR MILESTONE - First complete story! Celebrate enthusiastically!",
  "tier_progression": {
    "unlock_tier7": {
      "requirement": "score >= 4",
      "message": "🎉 TIER 7 UNLOCKED! You're ready to write with complex sentences!",
      "celebration": true
    }
  },
  "ai_prompt_guidance": "HUGE MILESTONE - First complete story! Check: (1) Has Beginning (intro), Middle (action), End (closure), (2) At least 5 sentences, (3) Forms coherent narrative. BE VERY ENCOURAGING - this is a major achievement!"
}
```

**Expected Time:** 15-20 minutes

---

## TIER 7: ENHANCED SENTENCES (Levels 34-37)

### LEVEL 34: Start with "When"

**Learning Objective:** Pupils use subordinate clauses at sentence start

**Prompt for Pupils:**
```
📝 START SENTENCES WITH "WHEN"

Write 5 sentences that start with "When".
Make your story about "A Rainy Day".

1. When _______________________________

2. When _______________________________

3. When _______________________________

4. When _______________________________

5. When _______________________________

Remember: When you start with "When", add a comma after the first part!
Example: When it started raining, I ran inside.
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_34",
  "activity_name": "Start with When",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "five_sentences_written": 20,
        "relates_to_topic": 5
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "correct_when_clause_structure": 20,
        "comma_after_when_clause": 10,
        "complete_both_clauses": 10
      }
    },
    "content_quality": {
      "weight": 35,
      "criteria": {
        "logical_sentences": 25,
        "forms_coherent_text": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [5, 5],
      "badge": "🏆 Complex Sentence Master!",
      "feedback_template": "Perfect! All 5 'when' sentences are structured brilliantly! You're writing complex sentences!"
    },
    "secure": {
      "range": [4, 4],
      "badge": "⭐ Clause Builder!",
      "feedback_template": "Excellent! {score} out of 5 complex sentences work perfectly! Great sentence variety!"
    },
    "developing": {
      "range": [3, 3],
      "badge": "💪 Learning Complex Sentences!",
      "feedback_template": "Good! {score} sentences work. Remember the comma after the 'when' part!"
    },
    "emerging": {
      "range": [0, 2],
      "badge": "🌱 Starting Complex Sentences!",
      "feedback_template": "You wrote {score} sentences. Let's practice sentences that start with 'When'!"
    }
  },
  "error_patterns": {
    "missing_comma": {
      "detection": "No comma after when clause",
      "feedback": "When you start with 'When', add a comma after the first part! Example: 'When it rained, I went inside.'"
    },
    "incomplete_main_clause": {
      "detection": "Second part isn't complete",
      "feedback": "After the comma, you need a COMPLETE sentence! It needs WHO and WHAT THEY DID."
    },
    "doesnt_relate_to_topic": {
      "detection": "Sentences don't relate to rainy day theme",
      "feedback": "All your sentences should be about a rainy day! Keep to the topic throughout."
    }
  },
  "passing_threshold": 60,
  "ai_prompt_guidance": "Check for: (1) 'When' at sentence start, (2) Comma placement, (3) Both clauses complete, (4) Relates to topic. This introduces fronted subordinate clauses!"
}
```

**Expected Time:** 10-12 minutes

---

### LEVEL 35: Start with "Although"

**Learning Objective:** Pupils use contrastive clauses

**Prompt for Pupils:**
```
📝 START SENTENCES WITH "ALTHOUGH"

Write 4 sentences that start with "Although" to show contrast or surprise.
Make your story about "Sports Day".

1. Although _______________________________

2. Although _______________________________

3. Although _______________________________

4. Although _______________________________

"Although" shows something SURPRISING or UNEXPECTED!
Example: Although it was raining, we still had fun.
         Although I was tired, I kept running.

Remember the comma!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_35",
  "activity_name": "Start with Although",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "four_sentences_written": 20,
        "relates_to_topic": 5
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "correct_although_structure": 20,
        "comma_placement": 10,
        "complete_both_clauses": 10
      }
    },
    "content_quality": {
      "weight": 35,
      "criteria": {
        "shows_genuine_contrast": 25,
        "logical_content": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [4, 4],
      "badge": "🏆 Contrast Expert!",
      "feedback_template": "Brilliant! All 4 'although' sentences show perfect contrasts! You're using complex sentences expertly!"
    },
    "secure": {
      "range": [3, 3],
      "badge": "⭐ Contrast Builder!",
      "feedback_template": "Excellent! {score} sentences show good contrasts! You understand 'although' well!"
    },
    "developing": {
      "range": [2, 2],
      "badge": "💪 Learning Contrasts!",
      "feedback_template": "Good! {score} sentences work. Remember 'although' shows something SURPRISING!"
    },
    "emerging": {
      "range": [0, 1],
      "badge": "🌱 Starting Contrasts!",
      "feedback_template": "You wrote {score} sentence(s). Let's learn how 'although' shows contrast!"
    }
  },
  "error_patterns": {
    "no_real_contrast": {
      "detection": "Second clause doesn't contrast with first",
      "feedback": "'Although' shows SURPRISE or CONTRAST! The two parts should be unexpected together. Example: 'Although I was scared, I tried it anyway.'"
    },
    "uses_but_logic": {
      "detection": "Uses 'although' like 'but' incorrectly",
      "feedback": "'Although' goes at the START and shows surprise. After the comma, tell us what happened DESPITE the first part!"
    },
    "missing_comma": {
      "detection": "No comma after although clause",
      "feedback": "Don't forget the comma after the 'although' part! It separates the two parts of your sentence."
    }
  },
  "passing_threshold": 50,
  "ai_prompt_guidance": "Check for: (1) Genuine contrast/surprise shown, (2) Correct structure with comma, (3) Both clauses complete. Accept creative contrasts!"
}
```

**Expected Time:** 10-12 minutes

---

### LEVEL 36: Use Different Sentence Starters

**Learning Objective:** Pupils vary sentence openings

**Prompt for Pupils:**
```
📝 VARY YOUR SENTENCE STARTERS

Write 6 sentences about "A School Trip".
Each sentence must start with a DIFFERENT word from this list:
• When
• Although
• After
• If
• Because
• While

Use each starter ONCE:

When _______________________________

Although _______________________________

After _______________________________

If _______________________________

Because _______________________________

While _______________________________

Make your sentences tell a story about the school trip!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_36",
  "activity_name": "Use Different Sentence Starters",
  "assessment_criteria": {
    "task_completion": {
      "weight": 25,
      "criteria": {
        "six_sentences_written": 15,
        "uses_all_six_starters": 10
      }
    },
    "technical_accuracy": {
      "weight": 40,
      "criteria": {
        "correct_structures": 20,
        "appropriate_comma_usage": 10,
        "complete_clauses": 10
      }
    },
    "content_quality": {
      "weight": 35,
      "criteria": {
        "forms_cohesive_narrative": 20,
        "logical_sentences": 10,
        "relates_to_topic": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [6, 6],
      "badge": "🏆 Variety Master!",
      "feedback_template": "Amazing! All 6 different sentence starters used perfectly! Your writing has excellent variety!"
    },
    "secure": {
      "range": [5, 5],
      "badge": "⭐ Variety Builder!",
      "feedback_template": "Brilliant! {score} out of 6 sentence types work well! You're varying your writing expertly!"
    },
    "developing": {
      "range": [4, 4],
      "badge": "💪 Learning Variety!",
      "feedback_template": "Good! {score} sentences work. Keep practicing with different sentence starters!"
    },
    "emerging": {
      "range": [0, 3],
      "badge": "🌱 Starting Variety!",
      "feedback_template": "You wrote {score} sentences. Let's practice starting sentences in different ways!"
    }
  },
  "error_patterns": {
    "repeats_starters": {
      "detection": "Uses same starter more than once",
      "feedback": "Use each starter only ONCE! Check you've used: When, Although, After, If, Because, While - each one different!"
    },
    "sentences_dont_connect": {
      "detection": "Sentences don't form cohesive text",
      "feedback": "Make your sentences tell a story together! Each sentence should connect to tell about the school trip."
    },
    "wrong_structures": {
      "detection": "Doesn't use starters correctly",
      "feedback": "Check each starter is used correctly! Some need commas, some don't. Each has its own rules!"
    }
  },
  "passing_threshold": 67,
  "ai_prompt_guidance": "Check for: (1) All 6 different starters used, (2) Correct structure for each type, (3) Forms cohesive text about topic. Accept if sentences make sense!"
}
```

**Expected Time:** 12-15 minutes

---

### LEVEL 37: Sentence Variety Practice

**Learning Objective:** Pupils mix simple, compound, and complex sentences (TIER 7 FINALE)

**Prompt for Pupils:**
```
📝 TIER 7 FINAL CHALLENGE! 🏆

Write 6 sentences about "My Hobby".
You need:
• 2 simple sentences (one idea)
• 2 compound sentences (two ideas with and/but/or)
• 2 complex sentences (start with When/Although/Because/If)

Write your 6 sentences:

Simple 1: _______________________________

Simple 2: _______________________________

Compound 1: _______________________________

Compound 2: _______________________________

Complex 1: _______________________________

Complex 2: _______________________________

Show your sentence-building skills!
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_37",
  "activity_name": "Sentence Variety Practice",
  "tier_completion": true,
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "six_sentences_written": 20
      }
    },
    "technical_accuracy": {
      "weight": 50,
      "criteria": {
        "correct_simple_structure": 10,
        "correct_compound_structure": 20,
        "correct_complex_structure": 20
      }
    },
    "content_quality": {
      "weight": 30,
      "criteria": {
        "all_relate_to_topic": 15,
        "forms_cohesive_text": 10,
        "interesting_content": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [6, 6],
      "percentage": "100%",
      "badge": "🏆 TIER 7 CHAMPION - SENTENCE EXPERT!",
      "certificate": "tier7_writing_completion_gold",
      "feedback_template": "INCREDIBLE! You can write all three sentence types perfectly! You're a sentence expert! TIER 7 COMPLETE! 🎉",
      "unlock": "tier8_level38"
    },
    "secure": {
      "range": [5, 5],
      "percentage": "83%",
      "badge": "⭐ TIER 7 COMPLETE - SENTENCE BUILDER!",
      "certificate": "tier7_writing_completion_silver",
      "feedback_template": "Brilliant! You write with excellent sentence variety! TIER 7 COMPLETE! Ready for final tier! 🌟",
      "unlock": "tier8_level38"
    },
    "developing": {
      "range": [4, 4],
      "badge": "💪 Almost There!",
      "feedback_template": "Good variety! Let's perfect all three sentence types before Tier 8!"
    },
    "emerging": {
      "range": [0, 3],
      "badge": "🌱 Learning Variety!",
      "feedback_template": "You're learning sentence types! Let's practice simple, compound, and complex!"
    }
  },
  "error_patterns": {
    "wrong_sentence_types": {
      "detection": "Sentence types don't match labels",
      "feedback": "Check your sentence types! Simple = one idea. Compound = two ideas joined with and/but/or. Complex = starts with When/Although/Because/If."
    },
    "all_same_type": {
      "detection": "Uses same structure for multiple sentences",
      "feedback": "You need DIFFERENT types! Make sure you have 2 simple, 2 compound, and 2 complex sentences - all different!"
    },
    "compound_errors": {
      "detection": "Compound sentences missing connectors",
      "feedback": "Compound sentences need 'and', 'but', or 'or' to join two ideas! Don't forget the joining word!"
    }
  },
  "passing_threshold": 83,
  "tier_progression": {
    "unlock_tier8": {
      "requirement": "score >= 5",
      "message": "🎉 TIER 8 UNLOCKED! You're ready to write complete narratives!",
      "celebration": true
    }
  },
  "ai_prompt_guidance": "TIER 7 FINALE! Check: (1) 2 simple (one clause), (2) 2 compound (two clauses with and/but/or), (3) 2 complex (subordinating conjunction). This is sophisticated sentence control!"
}
```

**Expected Time:** 15-18 minutes

---

## TIER 8: SHORT NARRATIVES (Levels 38-40)

### LEVEL 38: Story with Detailed Beginning

**Learning Objective:** Pupils write 7-sentence narrative with expanded opening

**Prompt for Pupils:**
```
📝 WRITE A STORY WITH A DETAILED BEGINNING

Write a 7-sentence story about "An Unexpected Friend".

Requirements:
• BEGINNING: 3 sentences (WHO, WHERE, WHEN, and set the scene)
• MIDDLE: 3 sentences (what happens)
• ENDING: 1 sentence (how it finishes)

Use interesting describing words!
Use different sentence starters!

Write your story:

_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_38",
  "activity_name": "Story with Detailed Beginning",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "minimum_seven_sentences": 15,
        "has_BME_structure": 5
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "capitals_and_punctuation": 15,
        "complete_sentences": 15,
        "spelling_reasonable": 5
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "detailed_three_sentence_beginning": 15,
        "developed_middle": 15,
        "satisfying_ending": 5,
        "cohesive_narrative": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [7, 7],
      "badge": "🏆 Story Master!",
      "feedback_template": "WOW! Your 7-sentence story is brilliant! Your detailed beginning really sets the scene! Excellent narrative writing!"
    },
    "secure": {
      "range": [6, 6],
      "badge": "⭐ Story Writer!",
      "feedback_template": "Brilliant story! Your beginning has great detail! You're writing strong narratives!"
    },
    "developing": {
      "range": [5, 5],
      "badge": "💪 Developing Writer!",
      "feedback_template": "Good story! Add more detail to your beginning - really set the scene!"
    },
    "emerging": {
      "range": [0, 4],
      "badge": "🌱 Growing Writer!",
      "feedback_template": "You're writing stories! Let's work on longer, more detailed narratives!"
    }
  },
  "error_patterns": {
    "beginning_too_brief": {
      "detection": "Beginning is only 1-2 sentences",
      "feedback": "Your beginning needs 3 sentences! Really set the scene - tell us WHO, WHERE, WHEN, and what it was like. Paint a picture with words!"
    },
    "weak_description": {
      "detection": "Lacks describing words",
      "feedback": "Add more describing words (adjectives)! Instead of 'the dog', try 'the small, friendly dog'. Make your writing colorful!"
    },
    "middle_too_short": {
      "detection": "Middle doesn't develop action sufficiently",
      "feedback": "Develop your middle more! Use 3 sentences to really tell us what happened - add details and action!"
    }
  },
  "passing_threshold": 71,
  "ai_prompt_guidance": "Check for: (1) 3-sentence detailed beginning, (2) 3-sentence developed middle, (3) 1-sentence ending, (4) Uses description. This combines all previous learning!"
}
```

**Expected Time:** 15-20 minutes

---

### LEVEL 39: Story with Enhanced Details

**Learning Objective:** Pupils write 8+ sentence narrative with sentence variety

**Prompt for Pupils:**
```
📝 WRITE A DETAILED STORY

Write an 8-sentence story.
Choose ONE topic:
• A Brave Moment
• Something I Discovered
• A Problem Solved

I choose: _______________________________

Requirements:
✓ Clear Beginning, Middle, End
✓ At least 3 different sentence starters (When, Although, Because, After, If, While)
✓ Describing words (adjectives)
✓ Make it interesting!

Write your story:

_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
_______________________________
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_39",
  "activity_name": "Story with Enhanced Details",
  "assessment_criteria": {
    "task_completion": {
      "weight": 20,
      "criteria": {
        "minimum_eight_sentences": 15,
        "topic_chosen": 5
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "sentence_variety_shown": 15,
        "capitals_and_punctuation": 10,
        "grammar_generally_correct": 10
      }
    },
    "content_quality": {
      "weight": 45,
      "criteria": {
        "clear_BME_structure": 15,
        "uses_description": 10,
        "engaging_content": 10,
        "cohesive_flow": 10
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [8, 8],
      "badge": "🏆 Expert Writer!",
      "feedback_template": "AMAZING! Your 8-sentence story is rich with detail and variety! You're writing like an author!"
    },
    "secure": {
      "range": [7, 7],
      "badge": "⭐ Strong Writer!",
      "feedback_template": "Brilliant! Your story has excellent detail and sentence variety! You're a confident writer!"
    },
    "developing": {
      "range": [6, 6],
      "badge": "💪 Improving Writer!",
      "feedback_template": "Good story! Add more sentence variety and description to take it to the next level!"
    },
    "emerging": {
      "range": [0, 5],
      "badge": "🌱 Developing Writer!",
      "feedback_template": "You're writing longer stories! Let's work on adding variety and detail!"
    }
  },
  "error_patterns": {
    "no_sentence_variety": {
      "detection": "All sentences start the same way",
      "feedback": "Vary your sentence starters! Use at least 3 different starters from: When, Although, Because, After, If, While. It makes writing more interesting!"
    },
    "lacks_description": {
      "detection": "Few or no adjectives",
      "feedback": "Add describing words! Tell us what things looked like, sounded like, felt like. Paint pictures with your words!"
    },
    "weak_structure": {
      "detection": "BME structure unclear",
      "feedback": "Make sure you have a clear BEGINNING (introduce), MIDDLE (action/problem), and END (conclusion). Structure your story clearly!"
    }
  },
  "passing_threshold": 75,
  "ai_prompt_guidance": "Check for: (1) 8+ sentences, (2) 3+ different sentence starters, (3) Adjectives used, (4) Clear BME, (5) Engaging content. Nearly at final level!"
}
```

**Expected Time:** 18-22 minutes

---

### LEVEL 40: Your Best Short Narrative

**Learning Objective:** Pupils write polished 10-12 sentence narrative (FINAL LEVEL!)

**Prompt for Pupils:**
```
📝 FINAL CHALLENGE - YOUR BEST STORY! 🏆📚

This is it - show me your BEST writing!

Write your best short story (10-12 sentences).
Choose any topic you want, or use one of these:
• An Adventure
• A Special Memory
• Something Amazing

Your story MUST have:
✓ Clear Beginning, Middle, End
✓ At least 2 complex sentences (When/Although/Because...)
✓ Describing words (adjectives) throughout
✓ Different sentence starters
✓ Interesting vocabulary
✓ Capital letters and full stops

This is YOUR chance to shine! Write the best story you can!

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

You've got this! Show me what an amazing writer you've become! 🌟
```

**AI Assessment Rubric:**
```json
{
  "level_id": "writing_level_40",
  "activity_name": "Your Best Short Narrative",
  "tier_completion": true,
  "programme_completion": true,
  "milestone": "complete_writing_programme",
  "assessment_criteria": {
    "task_completion": {
      "weight": 15,
      "criteria": {
        "minimum_ten_sentences": 15
      }
    },
    "technical_accuracy": {
      "weight": 35,
      "criteria": {
        "complex_sentences_used": 10,
        "sentence_variety": 10,
        "capitals_and_punctuation": 10,
        "grammar_correct": 5
      }
    },
    "content_quality": {
      "weight": 50,
      "criteria": {
        "clear_BME_structure": 15,
        "descriptive_language": 10,
        "engaging_narrative": 10,
        "cohesive_flow": 10,
        "vocabulary_quality": 5
      }
    }
  },
  "scoring_bands": {
    "mastery": {
      "range": [10, 12],
      "percentage": "83-100%",
      "badge": "🏆 WRIFE WRITING MASTER! 📚",
      "certificate": "wrife_writing_programme_completion_gold",
      "feedback_template": "INCREDIBLE! This is BRILLIANT writing! You've mastered storytelling from word sorting to complete narratives! You're a true author! CONGRATULATIONS - PROGRAMME COMPLETE! 🎉📚⭐",
      "special_recognition": "Completed all 40 levels!"
    },
    "secure": {
      "range": [8, 9],
      "percentage": "67-75%",
      "badge": "⭐ WRIFE WRITER! 📚",
      "certificate": "wrife_writing_programme_completion_silver",
      "feedback_template": "BRILLIANT! You can write excellent stories! You've completed the WriFe Writing Programme! You're a confident writer! CONGRATULATIONS! 🌟📚",
      "special_recognition": "Completed all 40 levels!"
    },
    "developing": {
      "range": [6, 7],
      "badge": "💪 Strong Writer!",
      "feedback_template": "Great story! You've come so far! Let's polish a few things to reach mastery!"
    },
    "emerging": {
      "range": [0, 5],
      "badge": "🌱 Developing Writer!",
      "feedback_template": "You're writing well! Let's work on adding more detail and variety!"
    }
  },
  "error_patterns": {
    "too_short": {
      "detection": "Fewer than 10 sentences",
      "feedback": "Your story is good but too short! Add more detail - describe the setting, tell us more about what happened, develop your characters!"
    },
    "missing_requirements": {
      "detection": "Doesn't meet all requirements",
      "feedback": "Check you have EVERYTHING: BME structure, 2 complex sentences, adjectives, varied starters, good vocabulary. Show all your skills!"
    },
    "weak_ending": {
      "detection": "Ending too abrupt or unsatisfying",
      "feedback": "Your story needs a stronger ending! Wrap it up properly - how did it all turn out? How did the character feel? Give us closure!"
    },
    "technical_errors": {
      "detection": "Multiple punctuation/grammar errors",
      "feedback": "Your ideas are great! Now polish your technical skills - check every capital letter, full stop, and spelling. Make it perfect!"
    }
  },
  "passing_threshold": 67,
  "programme_progression": {
    "complete_programme": {
      "requirement": "score >= 8",
      "message": "🎉🏆 CONGRATULATIONS! You have completed the ENTIRE WriFe Writing Programme! From sorting words to writing stories - you've mastered it all! You are a WRITER! 📚⭐",
      "celebration": true,
      "master_certificate": "wrife_complete_writing_master"
    }
  },
  "ai_prompt_guidance": "FINAL LEVEL - PROGRAMME COMPLETION! This is the culmination of all 40 levels. Check comprehensively: (1) 10-12 sentences, (2) Clear BME, (3) 2+ complex sentences, (4) Adjectives throughout, (5) Sentence variety, (6) Good vocabulary, (7) Correct punctuation, (8) Engaging, cohesive narrative. BE EXTREMELY CELEBRATORY if they meet requirements - this is a MAJOR achievement! They've progressed from word sorting to narrative writing!"
}
```

**Expected Time:** 20-25 minutes

---

## PROGRAMME COMPLETION CELEBRATION

When a pupil completes Level 40 with passing grade:

**Certificate Awarded:** "WriFe Writing Master"

**Achievement Summary:**
- 40 levels completed
- 8 tiers mastered
- Progression: Word sorting → Phrases → Sentences → Sequences → Stories → Narratives
- Skills mastered: Grammar, punctuation, sentence structure, narrative structure, descriptive writing

**Teacher Dashboard Notification:**
"🎉 [Pupil Name] has completed the entire WriFe Writing Programme! They have progressed from basic word classification to writing complete narratives. Review their final story and celebrate this major achievement!"

---

**TIERS 5-8 COMPLETE: All 16 final levels (25-40) fully specified!**

**ENTIRE 40-LEVEL PROGRAMME COMPLETE AND READY FOR BETA TESTING!**
