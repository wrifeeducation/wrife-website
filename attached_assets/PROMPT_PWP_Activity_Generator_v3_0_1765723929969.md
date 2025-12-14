# PWP Activity Generator Prompt v3.0
## Comprehensive Content Generation System for Lessons 10-67

**Version:** 3.0  
**Created:** December 2025  
**Purpose:** Generate complete PWP activities for any lesson L10-67  
**Output:** Digital platform specifications + Physical booklet layouts + Teacher guidance

---

# INSTRUCTIONS FOR USE

**Input:** Lesson number (L10-L67) + Concepts learned up to that lesson

**Output:** Complete PWP activity including:
1. Subject selection parameters
2. Formula progression (with complete rewriting mechanic)
3. Digital platform interface specifications
4. Physical booklet page layout
5. AI feedback parameters (Socratic)
6. Paragraph writing prompts (if applicable)
7. Teacher dashboard guidance
8. Mastery criteria

---

# CORE PRINCIPLES (CRITICAL - READ FIRST)

## 1. Complete Sentence Rewriting

**NEVER show gap-filling:**
```
❌ WRONG: [library quietly opens] [_____]
```

**ALWAYS show complete rewriting:**
```
✓ CORRECT: 
Your words: [Library] [quietly] [opens]
Rebuild: Click previous words + type new phrase
Result: Complete new sentence
```

**Pupils rewrite the ENTIRE sentence each formula.**

## 2. Systematic Evolution

Each formula adds ONE new element to previous formula.

**Example:**
```
F1: Dog runs (write complete)
F2: Dog quickly runs (REWRITE: dog, runs + NEW: quickly)
F3: Dog quickly runs through park (REWRITE: dog, quickly, runs + NEW: through park)
```

## 3. Single Subject Throughout

ONE subject used across ALL formulas in a session.

NOT different subjects per formula.

## 4. Labelled Examples

Early stages: Show word class labels

```
Park    quietly    sits
(subject) (adverb)   (verb)
```

## 5. Stage-Appropriate Duration

- L10-15: 5 min, 2-4 formulas
- L16-30: 10-12 min, 5-7 formulas, paragraph writing begins
- L31-50: 12-15 min, 8-10 formulas, richer paragraph prompts
- L51-67: 15-20 min, 10+ formulas, thematic paragraph conditions

## 6. Paragraph Writing Timeline

- L10-15: None (single-clause sentences)
- L16+: Paragraph writing starts when multi-clause possible
- Early: "What happened before/after?"
- Middle: "What do you see/hear/feel?"
- Advanced: "Write from villain's perspective" / "Theme: Rags to riches"

---

# INPUT REQUIREMENTS

When generating PWP activity, you need:

**1. Lesson Number:** L10 through L67

**2. Concepts Learned:** List of word classes/structures learned up to this lesson

Example for L23:
```
Concepts learned by L23:
- Noun (L1-9 recognition, L10 construction)
- Verb (L1-9 recognition, L10 construction)
- Determiner (L11)
- Adjective (L12)
- Adverb (L13)
- Preposition (L16)
- Prepositional phrase (L16)
- Fronted adverbial (L21)
```

**3. Stage Indicators:**
- Foundation (L10-15)
- Development (L16-30)
- Application (L31-50)
- Advanced (L51-67)

---

# OUTPUT TEMPLATE

## SECTION 1: METADATA

```
LESSON: [Number]
STAGE: [Foundation/Development/Application/Advanced]
DURATION: [5/10/15/20 minutes]
FORMULA COUNT: [2-4 / 5-7 / 8-10 / 10+ formulas]
PARAGRAPH WRITING: [Yes/No]
```

---

## SECTION 2: SUBJECT SELECTION

### Subject Assignment Strategy

**First 5 PWP sessions (L10-14):**
```
SUBJECT GIVEN: [Specific subject assigned]
Example: "Your subject today: Ben"

Purpose: Pupils focus on formula learning, not subject choice
```

**After L15:**
```
SUBJECT CHOICE: Free choice (pupil selects)

Early conditions (L16-30):
- "Choose a person"
- "Choose a place (not person/animal)"
- "Choose an animal"
- "Choose a thing"

Middle conditions (L31-50):
- "Choose a place and use past tense"
- "Write about weather"
- "Choose a thing and describe its movement"

Advanced conditions (L51-67):
- "Write from villain's perspective"
- "Theme: Hero's return"
- "Theme: Rags to riches"
```

### Subject Type Reference

**For each lesson, specify acceptable subjects:**

**PERSON subjects:**
- Family: mum, dad, sister, brother, grandma, grandad, aunt, uncle, cousin
- School: teacher, friend, pupil, headteacher, caretaker
- Community: doctor, nurse, chef, builder, police, firefighter
- General: child, adult, person, student, worker

**ANIMAL subjects:**
- Pets: dog, cat, rabbit, hamster, guinea pig, fish, bird
- Farm: cow, horse, sheep, pig, chicken, duck, goat
- Wild: lion, tiger, elephant, monkey, bear, wolf, fox
- Small: butterfly, bee, spider, ant, frog, snail

**PLACE subjects:**
- Buildings: school, library, shop, museum, hospital, house, church
- Outdoor: park, beach, forest, playground, garden, field, street
- Rooms: kitchen, classroom, bedroom, hall, office, bathroom

**THING subjects:**
- School items: pencil, book, ruler, desk, chair, board, bag
- Home items: table, lamp, door, window, clock, mirror, toy
- Technology: computer, phone, tablet, screen, keyboard
- Transport: car, bike, bus, train, boat, plane

---

## SECTION 3: FORMULA PROGRESSION

### Formula Generation Rules

**Starting point:** Always noun + verb (simplest)

**Each subsequent formula:** Add ONE element

**Typical progression pattern:**
```
F1: noun + verb
F2: noun + adverb + verb
F3: noun + adverb + verb + prep phrase
F4: det + adj + noun + adverb + verb + prep phrase
F5: det + adj + noun + adverb + verb + prep + det + adj + object
F6: time phrase + det + adj + noun + adverb + verb + prep + det + adj + object
F7: fronted adverbial + det + adj + noun + adverb + verb + prep + det + adj + object + additional phrase
```

**Customize based on concepts learned by this lesson.**

### Formula Count by Stage

**Foundation (L10-15):** 2-4 formulas
- Keep simple, build confidence
- Focus on basic construction

**Development (L16-30):** 5-7 formulas
- Increase complexity gradually
- Introduce paragraph writing

**Application (L31-50):** 8-10 formulas
- Sophisticated constructions
- Richer paragraph work

**Advanced (L51-67):** 10+ formulas
- Maximum complexity
- Thematic paragraph writing

---

## SECTION 4: DIGITAL PLATFORM SPECIFICATIONS

### For Each Formula:

**Interface Structure:**

```
┌─────────────────────────────────────────────────────┐
│ L[#] PWP - Formula [#] of [#]                       │
│─────────────────────────────────────────────────────│
│                                                     │
│ Formula [#]: [word class formula]                  │
│                                                     │
│ LABELLED EXAMPLE:                                  │
│ [Example sentence with word classes marked]        │
│                                                     │
│ EVOLVE your Formula [#-1] sentence:                │
│ Formula [#-1] was: [previous sentence]             │
│         ↓                                           │
│ Formula [#]: [What to add]                         │
│                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
│ RECONSTRUCT YOUR SENTENCE:                         │
│                                                     │
│ Your words from before: [word buttons]             │
│                                                     │
│ Build your sentence:                               │
│ Click previous words + type new element            │
│                                                     │
│ Sentence builder:                                  │
│ ┌───────────────────────────────────────────────┐  │
│ │ [Click or type here...]                       │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ [Guidance on what to click and what to type]       │
│                                                     │
│ 💡 [Relevant help for this formula]               │
│                                                     │
│             [CHECK SENTENCE]                       │
│                                                     │
│ Progress: [●●●○○○○] ([#]/[#] formulas)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Success Response:

```
✅ [Positive feedback specific to achievement]

Formula [#-1]: [previous sentence] ([#] words)
Formula [#]: [current sentence] ([#] words)

[If applicable: Repetition count]
You've now written "[word]" [#] times ✓✓✓

[Motivational message about memory building]

Your words saved: [all words in current sentence]

[NEXT FORMULA]
```

### Word Bank Interface:

**Display previous words as clickable buttons:**
```
Your words: [Library] [quietly] [opens] [in] [the] [morning]
```

**New element input:**
```
Type new [word class]: [___________]
```

**Reconstruction happens by:**
1. Clicking each previous word in order
2. Typing new element at appropriate position
3. System assembles complete sentence

---

## SECTION 5: PHYSICAL BOOKLET LAYOUT

### Page Structure:

```
┌──────────────────────────────────────────────────────┐
│ LESSON [#] - PROGRESSIVE WRITING PRACTICE            │
│                                                      │
│ Time: [#] minutes                                    │
│                                                      │
│ 🎯 [Subject condition if applicable]                │
│                                                      │
│ Your subject: ___________________                   │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│ FOUNDATION FORMULAS (All pupils complete)           │
│                                                      │
│ Formula [#]: [word class formula]                   │
│                                                      │
│ LABELLED EXAMPLE:                                   │
│ [Example with word classes marked]                  │
│                                                      │
│ YOUR TURN - [Write/REWRITE] your complete sentence: │
│ ___________________________________________________ │
│                                                      │
│ 💡 [Helpful hints for this formula]                │
│                                                      │
│ ──────────────────────────────────────────────────  │
│                                                      │
│ [Repeat for each Foundation formula]                │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│ DEVELOPING FORMULAS (Continue if confident)         │
│                                                      │
│ [Same structure as Foundation, medium difficulty]   │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│ CHALLENGE FORMULAS (For advanced writers)           │
│                                                      │
│ [Same structure, highest complexity]                │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│ [If paragraph writing applicable:]                  │
│                                                      │
│ PARAGRAPH WRITING                                    │
│                                                      │
│ Your last sentence becomes TOPIC SENTENCE.          │
│ REWRITE it here first:                              │
│ ___________________________________________________ │
│                                                      │
│ 🤔 Think about:                                     │
│ [Context-appropriate questions]                     │
│                                                      │
│ Write 5-7 sentences:                                │
│ [Multiple lines for writing]                        │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│ SELF-CHECK:                                          │
│ ☐ [Checklist items specific to this lesson]        │
│                                                      │
│ 💪 THE POWER OF REWRITING:                          │
│ By Formula [#], you have written your subject       │
│ [#] times! Building long-term memory! 🧠            │
│                                                      │
│ Teacher signature: __________ Date: ________        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Tier Breakdown:

**Foundation tier:** First 3-4 formulas (ALL pupils complete)

**Developing tier:** Next 2-3 formulas (if confident)

**Challenge tier:** Final 1-3 formulas (advanced writers)

---

## SECTION 6: AI FEEDBACK PARAMETERS

### Socratic Feedback System

**For each potential error type, generate:**

#### Error Type 1: Wrong Word Class

```
Error: Pupil uses adjective instead of adverb

AI Response Template:
❌ Check [word] in your sentence

🤔 Think about:
• You're describing HOW the [action] happens, right?
• When we describe how an action is done, do we use adjectives or adverbs?
• "[word]" is an adjective (describes nouns)
• What word class do we need to describe verbs?
• Can you change "[word]" to its adverb form?

💡 Hint: Most adverbs end in "-ly"

[Try again]
```

#### Error Type 2: Missing Element

```
Error: Formula requires determiner but pupil omitted it

AI Response Template:
❌ Something's missing at the [beginning/middle/end]

🤔 Think about:
• The formula needs: [complete formula]
• You have: [what pupil wrote]
• What's missing?
• A [word class] tells us [function]
• Which [word class] fits your sentence?

[Try again]
```

#### Error Type 3: Incorrect Structure

```
Error: Elements in wrong order

AI Response Template:
❌ The word order isn't quite right

🤔 Think about:
• Look at the formula: [correct formula]
• Look at your sentence: [pupil sentence]
• Which word is in the wrong position?
• Where should [word] go instead?

💡 Hint: Compare to the labelled example

[Try again]
```

#### Error Type 4: Subject Type Mismatch (if conditional)

```
Error: Pupil used person subject when condition requires place

AI Response Template:
🤔 Check the subject type...

Your sentence: [pupil sentence]

✓ Formula is correct!
✗ BUT... "[subject]" is a [PERSON/ANIMAL/THING]

Today's condition: [PLACE] subjects

Can you write about a PLACE instead?

Ideas: [relevant place suggestions]

[Try again]
```

#### Error Type 5: Tense Mismatch

```
Error: Time phrase doesn't match verb tense

AI Response Template:
❌ Something doesn't match in this sentence

🤔 Think about:
• Look at "[time phrase]" - what time does this tell us about?
• Look at "[verb]" - is that past or present tense?
• If something happened [yesterday/tomorrow], should we use past or present tense?
• What is the [past/present] tense form of "[verb]"?

💡 Hint: You only need to change ONE word

[Try again]
```

### Progressive Feedback

**Attempt 1:** Full Socratic questioning

**Attempt 2:** More direct hints
```
"Still stuck? Let's focus on just this: [specific guidance]"
```

**Attempt 3:** Near-answer
```
"Very close! Try changing [word] to [hint at correct form]"
```

**Maximum attempts:** 3, then flag for teacher review

---

## SECTION 7: PARAGRAPH WRITING SPECIFICATIONS

### When Paragraph Writing Applies:

**L10-15:** None (single-clause only)

**L16-25:** Simple prompts
```
Final sentence: [pupil's sentence]

🤔 Think about:
• What happened before [this event]?
• Why did [this action] happen?
• What happened after [this event]?

Write 4-5 sentences telling the story.
```

**L26-40:** Sensory/descriptive prompts
```
Final sentence: [pupil's sentence]

🤔 Think about this moment:
• What do you see?
• What do you hear?
• What do you feel?
• Who is there? What are they doing?

Write 5-6 sentences describing the scene.
```

**L41-50:** Emotional/character prompts
```
Final sentence: [pupil's sentence]

🤔 Explore this character:
• How is [character] feeling in this moment?
• Why are they feeling this way?
• What are they thinking about?
• What might they do next?

Write 5-7 sentences exploring the character.
```

**L51-67:** Thematic/perspective prompts
```
Final sentence: [pupil's sentence]

🎭 Condition: [Theme/Perspective]

Examples:
• "Write this from the villain's perspective"
• "Theme: Hero's return - how has this character changed?"
• "Theme: Rags to riches - show the transformation"
• "Write as if this is a memory from childhood"

Write 6-8 sentences applying this theme.
```

### Contextual Question Generation

**AI must analyze pupil's sentence semantically to generate relevant questions.**

**Example algorithms:**

```
IF sentence contains action verb (fought, ran, danced):
    → Questions about: where before, why acted, what happened after

IF sentence contains place subject (library, park, school):
    → Questions about: appearance, sounds, who visits, what happens there

IF sentence contains character trait (shy, brave, tired):
    → Questions about: why this trait, how it affects actions, how others react

IF sentence contains time marker (yesterday, morning, once):
    → Questions about: lead-up, the moment itself, aftermath

IF sentence is descriptive (old library, busy street):
    → Questions about: sensory details, atmosphere, who/what is there
```

---

## SECTION 8: TEACHER DASHBOARD GUIDANCE

### Live Monitoring Display

**For each PWP session, teacher sees:**

```
LIVE PWP - L[#] ([#] pupils active)

Pupil Name   Progress        Accuracy    Notes
─────────────────────────────────────────────────
Sarah T.     ●●●●●●○ (F6/7)  ✓✓✓✓✓✓  100%
James K.     ●●●●○○○ (F4/7)  ✓✓✓✗    75%  ⚠️
Maya P.      ●●●●●●● (Done)  ✓✓✓✓✓✓✓ 100%
Ben L.       ●●○○○○○ (F2/7)  ✓✗       50%  🚨
```

**Legend:**
- ● = Formula complete
- ○ = Not started
- ✓ = Correct
- ✗ = Error
- ⚠️ = Struggling
- 🚨 = Needs attention

### Pattern Alerts

```
⚠️ Alert: [#] pupils showing errors on Formula [#]
   Common error: [description]
   
   Affected: [pupil names]
   
   AI Action: [what AI is doing]
   Recommendation: [teacher action if pattern persists]
   
   [View Details] [Dismiss]
```

### Individual Drill-Down

```
PUPIL NAME - L[#] PWP - Formula [#] (Current)

Subject: [chosen subject]

F1: [✓/✗] [sentence]
F2: [✓/✗] [sentence]
    [If ✗: AI Feedback shown]
F3: [Current - in progress]

Historical Context:
- Current PWP Level: L[#]
- Recent Accuracy: [%]
- Common Issues: [pattern description]

Recommendation:
[Suggested teacher action if needed]

[Close] [Flag for Follow-up]
```

---

## SECTION 9: MASTERY CRITERIA

### Session Completion Criteria

**Minimum completion:**
- Foundation tier formulas (first 3-4)
- At least 60% accuracy on completed formulas

**Optimal completion:**
- All formulas in pupil's tier (foundation/developing/challenge)
- 80%+ accuracy
- Paragraph writing completed (if applicable)

### Concept Mastery Algorithm

```python
def assess_mastery(pupil_id, concept, lesson_number):
    """
    Determine if concept is mastered based on:
    - Time since introduction (PRIMARY factor)
    - Accuracy percentage (SECONDARY)
    - Consistency trend (TERTIARY)
    """
    lessons_since_intro = lesson_number - concept.introduced_at
    overall_accuracy = get_accuracy(pupil_id, concept)
    recent_trend = get_recent_trend(pupil_id, concept, sessions=5)
    
    # PRIMARY: Time-based
    if lessons_since_intro >= 10:
        time_weight = 60  # Heavy weight for long-term retention
    elif lessons_since_intro >= 5:
        time_weight = 40
    else:
        time_weight = 20
    
    # SECONDARY: Accuracy-based
    if overall_accuracy >= 80:
        accuracy_weight = 30
    elif overall_accuracy >= 60:
        accuracy_weight = 20
    else:
        accuracy_weight = 10
    
    # TERTIARY: Trend-based
    if recent_trend == "improving":
        trend_weight = 10
    elif recent_trend == "stable":
        trend_weight = 7
    else:
        trend_weight = 3
    
    mastery_score = time_weight + accuracy_weight + trend_weight
    
    if mastery_score >= 85:
        return "MASTERED"
    elif mastery_score >= 65:
        return "PRACTICING"
    else:
        return "NEEDS_SUPPORT"
```

### Progression Decision

**Advance to next PWP level when:**
- Completed current lesson's PWP with 80%+ accuracy
- Mastery score ≥85 for concepts tested
- OR: Completed 2 attempts at current level with 70%+ average

**Repeat current PWP level when:**
- Accuracy <60%
- Multiple concept mastery scores <65
- Teacher flagged for additional practice

**Trigger remediation when:**
- Accuracy <50%
- Persistent confusion on fundamental concepts
- No improvement over 2 attempts

---

## SECTION 10: QUALITY ASSURANCE CHECKLIST

**For every generated PWP activity:**

### Content Accuracy:
☐ Formulas match concepts learned by this lesson  
☐ Progression is systematic (adds ONE element each time)  
☐ Formula count appropriate for stage  
☐ Examples use appropriate subjects for level

### Rewriting Mechanic:
☐ NO gap-filling anywhere  
☐ Labelled examples provided  
☐ Digital: word bank + typing specified  
☐ Physical: "REWRITE complete sentence" instructions  
☐ Repetition emphasized as learning tool

### Scaffolding:
☐ Appropriate hints for difficulty level  
☐ AI feedback is Socratic (questions, not answers)  
☐ Paragraph prompts contextually appropriate  
☐ Subject type guidance included if needed

### Technical Specs:
☐ Digital interface fully specified  
☐ Physical booklet layout complete  
☐ Teacher dashboard guidance clear  
☐ Mastery criteria defined

### Differentiation:
☐ Foundation/Developing/Challenge tiers clear  
☐ Optional extensions specified  
☐ Support mechanisms in place

---

# EXAMPLE GENERATION REQUEST

**Input:**
```
Lesson: L18
Concepts learned: noun, verb, determiner, adjective, adverb, preposition, 
                  prepositional phrase
Stage: Development
Subject assignment: Free choice with condition "Choose a place"
```

**Expected Output:**
- Complete L18 PWP activity specification
- 6-7 formulas with systematic progression
- Digital interface mockups showing rewriting mechanic
- Physical booklet page layout
- Socratic AI feedback for likely errors
- Paragraph writing prompts (simple level)
- Teacher dashboard notes
- Mastery criteria for L18

---

# FINAL NOTES

**This prompt generates the CONTENT SPECIFICATION for PWP activities.**

**Separate development work required for:**
- AI natural language processing (error detection)
- Frontend interface coding
- Database schema implementation
- Teacher dashboard visualizations

**But this prompt provides the complete BLUEPRINT for what to build.**

---

**END OF PWP ACTIVITY GENERATOR PROMPT v3.0**
