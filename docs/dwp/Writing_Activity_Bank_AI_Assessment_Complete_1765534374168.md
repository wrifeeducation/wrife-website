# WriFe Writing Activity Bank
## COMPLETE AI ASSESSMENT SYSTEM

**Comprehensive AI Assessment Architecture for 40 Progressive Writing Levels**

---

## SYSTEM OVERVIEW

The WriFe Writing Activity Bank uses Claude AI (Anthropic) to assess pupil writing across 40 progressive levels, providing personalized feedback that is:
- Age-appropriate (Years 2-6, ages 6-11)
- Encouraging and constructive
- Specific and actionable
- Pattern-detecting (identifies systematic errors)
- Progress-tracking (builds on previous learning)

---

## CORE ASSESSMENT PRINCIPLES

### 1. Developmental Appropriateness

**Age-Based Language Scales:**
- **Levels 1-10 (Ages 6-7):** Very simple language, short feedback, heavy encouragement
- **Levels 11-20 (Ages 7-9):** Clear explanations, specific examples, balanced feedback
- **Levels 21-30 (Ages 8-10):** More detailed analysis, introduce terminology, constructive criticism
- **Levels 31-40 (Ages 9-11):** Sophisticated feedback, literary terminology, detailed improvement guidance

### 2. Progressive Expectations

Assessment criteria evolve with pupil development:
- **Early Levels (1-10):** Focus on task completion and effort
- **Middle Levels (11-30):** Balance technical accuracy with content
- **Advanced Levels (31-40):** Emphasis on quality, creativity, sophistication

### 3. Error Pattern Recognition

AI identifies systematic misunderstandings:
- **Single Errors:** Noted but not emphasized
- **Pattern Errors:** Highlighted with teaching guidance
- **Conceptual Gaps:** Trigger teacher alerts and intervention suggestions

---

## ASSESSMENT FRAMEWORK

### Four Assessment Categories (Weighted)

**1. Task Completion (15-30% depending on level)**
- Did pupil complete required elements?
- Followed instructions?
- Attempted all parts?

**2. Technical Accuracy (30-40%)**
- Spelling (age-appropriate expectations)
- Punctuation (capitals, full stops, commas where taught)
- Grammar (subject-verb agreement, tense consistency)
- Sentence structure

**3. Content Quality (25-50%)**
- Does writing make sense?
- Logical and coherent?
- Vocabulary appropriate and varied?
- Ideas developed sufficiently?

**4. Structural Understanding (5-30%)**
- Demonstrates understanding of taught concept?
- Patterns followed correctly?
- Story/sentence structure appropriate?
- Progressive improvement shown?

### Scoring Bands (Consistent Across All Levels)

**MASTERY (90-100%)**
- Perfect or near-perfect understanding
- Badge: 🏆 + Specific achievement
- Message: Enthusiastic celebration
- Action: Unlock next level immediately

**SECURE (80-89%)**
- Solid understanding, ready to progress
- Badge: ⭐ + Encouraging achievement
- Message: Warm congratulations
- Action: Unlock next level

**DEVELOPING (60-79%)**
- Partial understanding, needs practice
- Badge: 💪 + Growth message
- Message: Encouraging with teaching point
- Action: Retry current level

**EMERGING (0-59%)**
- Beginning to learn, needs support
- Badge: 🌱 + Growth imagery
- Message: Very gentle, supportive
- Action: Retry + possible teacher intervention

---

## AI SYSTEM PROMPT (Master Template)

```
You are an expert primary school writing teacher assessing young pupils' written work. Your role is to provide encouraging, specific, age-appropriate feedback that helps pupils improve.

# ASSESSMENT CONTEXT
- Level: [level_id]
- Activity: [activity_name]
- Pupil Age Range: [age_range]
- Learning Objective: [objective]

# RUBRIC
[Full JSON rubric for level]

# PUPIL'S WORK
[Pupil's written responses]

# YOUR TASK
Assess this pupil's work using the rubric provided. Return a JSON assessment with:

1. PERFORMANCE SUMMARY
   - Score (raw and percentage)
   - Performance band (mastery/secure/developing/emerging)
   - Badge to award
   - Pass/fail determination

2. DETAILED ANALYSIS
   - What they did correctly
   - What needs improvement
   - Error patterns detected
   - Specific examples from their work

3. FEEDBACK (4 components - ALWAYS include all 4)
   - Main Message: Score + emotion
   - Specific Praise: 1-2 things done well
   - Growth Area: ONE thing to improve (if applicable)
   - Encouragement: Positive forward-looking statement

4. PROGRESSION DECISION
   - Unlock next level / retry current / needs teacher support
   - Recommendation for next steps

5. TEACHER NOTES
   - Summary for teacher dashboard
   - Intervention suggestions if needed
   - Strengths and areas of concern

# CRITICAL RULES

AGE-APPROPRIATE LANGUAGE:
- Use simple words pupils can understand
- Explain concepts in child-friendly terms
- Avoid jargon or overly technical language
- Match complexity to pupil age

ENCOURAGING TONE:
- ALWAYS be positive and encouraging
- Focus on growth, not just correction
- Celebrate effort and progress
- Never use harsh or discouraging language
- Even low scores get supportive feedback

SPECIFIC FEEDBACK:
- Quote or reference specific parts of pupil's work
- Give concrete examples, not generic praise
- Explain WHY something is good or needs work
- Provide actionable next steps

ONE TEACHING POINT:
- Growth Area focuses on ONE concept only
- Too many corrections overwhelm pupils
- Pick the most important improvement area
- Save other points for later levels

PATTERN DETECTION:
- Look for systematic errors, not random mistakes
- If pupil makes same error multiple times, address pattern
- Distinguish between careless errors and misunderstandings
- Alert teacher to conceptual gaps

PROGRESSION GUIDANCE:
- Pass threshold strictly enforced
- Clear criteria for advancement
- Specific recommendations for practice
- Teacher intervention flags when needed

RESPONSE FORMAT:
Return valid JSON with this exact structure:
{
  "assessment_id": "unique_id",
  "pupil_performance": {
    "score": number,
    "total": number,
    "percentage": number,
    "band": "mastery|secure|developing|emerging",
    "badge": "emoji + text",
    "passed": boolean
  },
  "detailed_analysis": {
    "correct_elements": [],
    "incorrect_elements": [],
    "error_patterns": [],
    "primary_strength": "string",
    "primary_growth_area": "string"
  },
  "feedback": {
    "main_message": "string",
    "specific_praise": "string or null",
    "growth_area": "string or null",
    "encouragement": "string"
  },
  "progression": {
    "decision": "unlock_next|retry_current|needs_support",
    "next_level": "string or null",
    "ready_for_advancement": boolean,
    "recommendation": "string"
  },
  "teacher_notes": {
    "summary": "string",
    "concerns": "string or null",
    "strengths": "string",
    "suggested_focus": "string",
    "intervention_needed": boolean
  }
}
```

---

## LEVEL-SPECIFIC ADAPTATIONS

### Tier 1-2 (Levels 1-10): Foundation Skills

**Assessment Focus:**
- Task completion paramount
- Effort and engagement valued
- Technical accuracy expectations minimal
- Heavy encouragement

**Feedback Style:**
- Very short and simple
- Lots of encouragement
- Concrete examples
- Visual cues (emojis)

**Example Feedback:**
> "Brilliant! You sorted 8 out of 10 words correctly! You really understand that people are WHO and places are WHERE. Remember: cities like London are PLACES. You've passed this level! Ready for Level 2! 🌟"

### Tier 3-4 (Levels 11-24): Sentence Building

**Assessment Focus:**
- Technical accuracy increases importance
- Sentence structure key
- Introduces grammar concepts
- Balance effort and accuracy

**Feedback Style:**
- Clear teaching moments
- Specific grammar guidance
- Examples from their work
- Constructive corrections

**Example Feedback:**
> "Excellent work! You wrote 4 out of 5 sentences correctly! Your sentences about playing football and going to school make perfect sense. For your sentence 'i like pizza', remember to use a capital letter for 'I' - the word 'I' is always a capital letter! You're writing real sentences now! 🎉"

### Tier 5-6 (Levels 25-33): Narrative Structure

**Assessment Focus:**
- Coherence and flow
- BME structure
- Sequencing logic
- Creative content valued

**Feedback Style:**
- Story-focused language
- Narrative terminology introduced
- Praise for creativity
- Structural guidance

**Example Feedback:**
> "Brilliant story! Your beginning introduces Tom and the garden perfectly. Your middle develops the action well - we can really picture Tom searching for the lost ball. Your ending wraps it up nicely! To make it even better, add more describing words in your middle section - tell us what the garden looked like, how Tom felt. You're becoming a real storyteller! 📚"

### Tier 7-8 (Levels 34-40): Advanced Writing

**Assessment Focus:**
- Sentence variety
- Sophisticated vocabulary
- Literary techniques
- Overall quality

**Feedback Style:**
- Literary terminology used
- Detailed constructive feedback
- High expectations communicated
- Author language ("your narrative", "your prose")

**Example Feedback:**
> "Excellent narrative! Your use of varied sentence starters creates engaging rhythm. Starting with 'Although' and 'When' shows sophisticated sentence control. Your descriptive language paints vivid pictures - 'the ancient, creaking door' is wonderful imagery. To elevate your writing further, develop your ending more - give us insight into how your character changed. You're writing with real literary skill now! 🏆📚"

---

## ERROR PATTERN LIBRARY

### Common Patterns by Category

**CAPITALIZATION ERRORS:**
- `no_sentence_capitals`: Doesn't start sentences with capitals
- `no_proper_noun_capitals`: Doesn't capitalize names
- `lowercase_i`: Doesn't capitalize pronoun "I"
- `random_capitals`: Capitalizes common nouns incorrectly

**PUNCTUATION ERRORS:**
- `missing_full_stops`: Sentences run together
- `missing_commas`: No commas in complex sentences
- `comma_in_wrong_place`: Incorrect comma usage
- `no_punctuation`: Complete absence of punctuation

**GRAMMAR ERRORS:**
- `subject_verb_agreement`: "He run" instead of "He runs"
- `tense_inconsistency`: Switches between past and present
- `sentence_fragments`: Incomplete thoughts
- `run_on_sentences`: Multiple sentences run together

**WORD CLASS ERRORS:**
- `noun_verb_confusion`: Uses nouns where verbs needed
- `adjective_verb_confusion`: Confuses describing and action words
- `people_place_confusion`: Mixes up people and places
- `action_object_confusion`: Confuses actions with objects

**STRUCTURAL ERRORS:**
- `no_BME_structure`: Story lacks clear beginning/middle/end
- `illogical_sequence`: Events out of order
- `missing_beginning`: Jumps straight to action
- `missing_ending`: Story stops abruptly
- `no_development`: Middle lacks action/problem

**CONTENT ERRORS:**
- `off_topic`: Doesn't relate to given topic
- `illogical_content`: Content doesn't make sense
- `repetitive_ideas`: Same idea repeated
- `insufficient_detail`: Too brief/vague
- `unconnected_sentences`: Sentences don't flow

---

## FEEDBACK TEMPLATE SYSTEM

### Component 1: Main Message (REQUIRED)

**Formula:** [Emotion]! [Score statement]. [Achievement recognition].

**Emotion Words by Band:**
- Mastery: Brilliant, Amazing, Incredible, Perfect, Wow, Fantastic
- Secure: Excellent, Great work, Well done, Super, Brilliant
- Developing: Good try, Good work, Nice effort, Good progress
- Emerging: You tried, You're learning, You're starting, Let's learn

**Examples:**
- "Brilliant! You got 10 out of 10! You're a word sorting champion!"
- "Great work! You got 8 out of 10! You understand word groups!"
- "Good try! You got 6 out of 10! You're learning about sentences!"
- "You got 3 out of 10! Let's learn about capital letters together!"

### Component 2: Specific Praise (When score ≥ 60%)

**Formula:** [Specific achievement] + [Why it matters]

**What to Praise:**
- Correct technical elements: "Your capital letters are perfect!"
- Good vocabulary choices: "You used excellent describing words!"
- Creative content: "Your story idea is so imaginative!"
- Structural understanding: "You followed the pattern brilliantly!"
- Effort/improvement: "You worked really hard on this!"

**Examples:**
- "You sorted PEOPLE and THINGS perfectly! That shows you really understand word groups."
- "All your sentences have capital letters and full stops! You're using punctuation like a pro."
- "Your beginning introduces the character and setting beautifully! That's how real authors start stories."

### Component 3: Growth Area (When errors present)

**Formula:** [Gentle prompt] + [Specific teaching point] + [Example if helpful]

**Gentle Prompts:**
- "Remember:"
- "Let's review:"
- "Think about:"
- "Next time, try:"
- "To make it even better:"

**Teaching Points:**
- ONE concept only
- Specific and clear
- With example from their work or general example
- Constructive, not critical

**Examples:**
- "Remember: Cities are PLACES (where we go), not THINGS (objects we hold)."
- "Let's review: Every sentence needs a capital letter at the START and a full stop at the END."
- "Think about: Can a table really run? What CAN tables do?"
- "To make your story even better, add a proper ending that tells us how Tom felt at the end."

### Component 4: Encouragement (REQUIRED)

**Formula:** [Forward-looking positive statement]

**Purpose:**
- End on upbeat note
- Build confidence
- Create momentum
- Celebrate progress

**By Band:**
- Mastery: "You've mastered this! Ready for [next level]! 🎉"
- Secure: "You're ready to move on! Great progress! 🌟"
- Developing: "Keep practicing and you'll get it! You're getting stronger!"
- Emerging: "We'll work on this together! Every practice helps you learn!"

**Examples:**
- "You've mastered word sorting! You're ready for Level 2! 🎉"
- "You can write complete sentences! Well done! Ready for the next challenge! 🌟"
- "Practice a bit more and you'll have it! You're making progress!"
- "We'll keep practicing together! You're learning and growing! 🌱"

---

## TEACHER DASHBOARD INTEGRATION

### Data Collected Per Attempt

**Stored in Database:**
```json
{
  "attempt_id": "uuid",
  "pupil_id": "uuid",
  "level_id": "string",
  "attempt_number": integer,
  "timestamp": "datetime",
  "score": integer,
  "total_items": integer,
  "percentage": integer,
  "passed": boolean,
  "time_elapsed_seconds": integer,
  "performance_band": "string",
  "badge_earned": "string",
  "error_patterns_detected": ["array"],
  "ai_feedback": {full JSON object},
  "intervention_flagged": boolean
}
```

### Teacher Dashboard Views

**Individual Pupil Progress:**
- Attempts history graph (scores over time)
- Current level and progress
- Badges earned collection
- Error pattern trends
- Time spent per level
- Intervention alerts

**Class Overview:**
- Distribution across levels histogram
- Average scores per tier
- Pass rates per level
- Common error patterns (class-wide)
- Pupils needing support list
- Celebration board (recent completions)

**Reports Generated:**
- Weekly progress summary
- Individual pupil reports (for parents)
- Error pattern analysis (for planning)
- Time-on-task metrics
- Comparison to expected progression

---

## COST MANAGEMENT

### Token Usage per Assessment

**Typical Assessment:**
- System prompt: ~2,500 tokens
- Level rubric: ~500-800 tokens
- Pupil work: ~100-500 tokens (varies by level)
- AI response: ~800-1,200 tokens
- **Total: ~4,000-5,000 tokens per assessment**

**Cost Calculation:**
- Using Claude Sonnet 4.5
- Input: $3 per million tokens
- Output: $15 per million tokens
- Average assessment: ~£0.015-0.025

### Budget Projections

**Single Pupil (40 levels × 2 average attempts):**
- Total assessments: 80
- Cost: £1.20-2.00 per pupil per programme

**Class of 30:**
- Total: £36-60 for entire programme

**School of 500 pupils:**
- Total: £600-1,000 for entire programme

**Very affordable for the personalized feedback provided!**

---

## QUALITY ASSURANCE

### Monitoring AI Performance

**Regular Checks:**
1. Random sample review (10% of assessments weekly)
2. Teacher flagging system (teachers mark questionable feedback)
3. Pupil appeals process (teacher reviews if pupil disputes)
4. Calibration studies (compare AI to teacher assessments)

**Quality Metrics:**
- Agreement rate with teacher judgments (target: 85%+)
- Feedback appropriateness (age-level, tone)
- Error pattern detection accuracy
- Progression decision accuracy
- No inappropriate language (100%)

### Feedback Refinement Process

**When AI feedback is problematic:**
1. Teacher flags in dashboard
2. Review team examines case
3. Rubric adjusted if needed
4. System prompt refined if pattern emerges
5. Re-assessment triggered for affected pupils

---

## IMPLEMENTATION CHECKLIST

### Database Setup
☐ Create `writing_levels` table with all 40 levels
☐ Insert complete rubrics for each level
☐ Create `writing_attempts` table
☐ Set up `writing_progress` table
☐ Configure row-level security

### API Integration
☐ Claude API key obtained and secured
☐ Assessment endpoint created (`/api/assess-writing`)
☐ System prompt template configured
☐ Error handling implemented
☐ Rate limiting configured

### Frontend Implementation
☐ Writing text box component built
☐ Submission flow working
☐ Results display component
☐ Badge display system
☐ Progress visualization

### Teacher Dashboard
☐ Individual pupil view
☐ Class overview
☐ Reports generation
☐ Intervention alerts
☐ Feedback review system

### Testing
☐ All 40 levels tested with sample responses
☐ AI feedback quality verified
☐ Edge cases handled
☐ Performance acceptable
☐ Costs monitored

---

## BETA TESTING PRIORITIES

### Phase 1: Foundation Testing (Levels 1-10)
- Verify assessment accuracy
- Check feedback appropriateness
- Monitor costs
- Gather teacher feedback
- Refine rubrics

### Phase 2: Sentence Testing (Levels 11-24)
- Test grammar assessment
- Verify sentence structure detection
- Check teaching guidance quality
- Refine error patterns

### Phase 3: Narrative Testing (Levels 25-40)
- Test story structure assessment
- Verify creativity recognition
- Check advanced feedback quality
- Final rubric tuning

---

**AI ASSESSMENT SYSTEM COMPLETE: Ready for implementation and beta testing!**
