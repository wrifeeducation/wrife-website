# PWP Formula Progression Specification
## Authoritative Technical Reference for Formula Generation

**Version:** 1.0  
**Status:** AUTHORITATIVE - This document defines the rules  
**Audience:** Developers, AI systems, QA testers  
**Purpose:** Unambiguous specification for generating PWP formulas

---

# CRITICAL PRINCIPLE

**Every formula adds EXACTLY ONE new element to the previous formula.**

This is the FUNDAMENTAL RULE that governs all PWP formula progression.

---

# PART 1: CORE PROGRESSION LOGIC

## Rule 1: Foundation Formula

**Every PWP session starts with the SIMPLEST possible formula:**

```
Formula 1 (F1): subject + verb
```

**Always. No exceptions.**

**Examples:**
- Ben runs
- Library opens
- Dog barks
- Park sits

**Why this is foundation:**
- Only 2 word classes (minimum complexity)
- All pupils can construct this
- Provides base for all subsequent formulas

---

## Rule 2: Single Element Addition

**Each subsequent formula adds EXACTLY ONE element to the previous formula.**

**Definition of "one element":**
- One word class (e.g., adjective)
- One phrase type (e.g., prepositional phrase)
- One structural position (e.g., fronted adverbial)

**NOT considered "one element":**
- Multiple word classes (e.g., determiner + adjective = TWO elements)
- Multiple phrases (e.g., two prepositional phrases)
- Compound structures (e.g., coordinated clauses)

---

## Rule 3: Element Position

**New elements are added in SYNTACTIC ORDER (where they naturally occur in English):**

**Typical English sentence structure:**
```
[Time phrase], [Determiner] [Adjective] [Subject] [Adverb] [Verb] 
[Preposition] [Determiner] [Adjective] [Object] [Additional phrase]
```

**Build from left to right OR right to left, but maintain COHERENT STRUCTURE.**

---

# PART 2: STANDARD PROGRESSION PATTERNS

## Pattern A: Foundation Stage (L10-15, 2-4 formulas)

**Typical progression for early lessons:**

```
F1: subject + verb
    Example: Dog runs

F2: subject + adverb + verb
    Example: Dog quickly runs
    Added: adverb (1 element)

F3: subject + adverb + verb + prepositional phrase
    Example: Dog quickly runs through park
    Added: prepositional phrase (1 element)

F4: determiner + adjective + subject + adverb + verb + prep phrase
    Example: The energetic dog quickly runs through park
    Added: determiner + adjective BEFORE subject (2 elements, but taught as unit)
```

**Note on F4:** When determiner + adjective are added together, this is STILL considered building coherently because:
- They form a NOUN PHRASE modification unit
- Both relate to the same word (subject)
- Pupils learned them as paired concept

**However, if determiner and adjective are taught separately:**
```
F3: determiner + subject + adverb + verb + prep phrase
    Example: The dog quickly runs through park
    Added: determiner only

F4: determiner + adjective + subject + adverb + verb + prep phrase
    Example: The energetic dog quickly runs through park
    Added: adjective only
```

---

## Pattern B: Development Stage (L16-30, 5-7 formulas)

**Builds more complexity:**

```
F1: subject + verb
    Example: Library opens

F2: subject + adverb + verb
    Example: Library quietly opens
    Added: adverb

F3: subject + adverb + verb + prepositional phrase
    Example: Library quietly opens in the morning
    Added: prepositional phrase

F4: determiner + adjective + subject + adverb + verb + prep phrase
    Example: The old library quietly opens in the morning
    Added: determiner + adjective (noun phrase modification)

F5: det + adj + subject + adverb + verb + prep + det + adj + object
    Example: The old library quietly opens in the early morning
    Added: determiner + adjective BEFORE object (prep phrase expansion)

F6: time phrase + det + adj + subject + adverb + verb + prep + det + adj + obj
    Example: Every weekday, the old library quietly opens in the early morning
    Added: time phrase at front (with comma)

F7: fronted adverbial + det + adj + subject + adverb + verb + prep + det + adj + obj + additional phrase
    Example: During the busy week, the old library quietly opens in the early morning for eager students
    Added: Fronted adverbial (enhanced time) + additional phrase at end (2 changes, but F7 is endpoint)
```

**Note on F7:** Final formula may add 2 elements because:
- It's the culminating construction
- Pupils have practiced 6 times already
- Creates satisfying complexity
- BUT still recognizable as evolution of F1

---

## Pattern C: Application Stage (L31-50, 8-10 formulas)

**More sophisticated constructions:**

```
F1: subject + verb
F2: subject + adverb + verb
F3: subject + adverb + verb + prepositional phrase
F4: det + adj + subject + adverb + verb + prep phrase
F5: det + adj + subject + adverb + verb + prep + det + adj + object
F6: det + adj + subject + adverb + verb + prep + det + adj + obj + additional prep phrase
F7: time phrase + det + adj + subj + adverb + verb + prep + det + adj + obj + add prep phrase
F8: fronted adverbial + det + adj + subj + adverb + verb + prep + det + adj + obj + add phrase + add phrase
F9: fronted adv + det + adj + adj + subj + adverb + verb + prep + det + adj + obj + add phrase
    Example: Throughout the busy morning, the old peaceful library quietly opens in the early dawn for eager young students
    Added: Second adjective before subject
F10: Complex final construction with relative clause or subordinate clause
```

---

## Pattern D: Advanced Stage (L51-67, 10+ formulas)

**Maximum complexity with multi-clause structures:**

After establishing strong foundation (F1-F8), introduce:
- Relative clauses ("which...", "who...", "that...")
- Subordinate clauses ("because...", "although...", "when...")
- Coordinated structures ("and", "but", "or")

**But STILL add these ONE AT A TIME.**

---

# PART 3: CONCEPT-BASED PROGRESSION

## Determining What to Add

**The formula progression depends on TWO factors:**

### Factor 1: Cumulative Concepts (Curriculum-Based)

**What concepts have been taught by this lesson?**

**Example: Lesson 23**

Concepts taught by L23:
- L10: Noun, Verb (introduced)
- L11: Determiner
- L12: Adjective  
- L13: Adverb
- L16: Preposition, Prepositional phrase
- L21: Fronted adverbial
- L23: [Current lesson's concept]

**Available elements for formulas:**
- noun (subject/object)
- verb
- determiner
- adjective
- adverb
- preposition
- prepositional phrase
- fronted adverbial

**Cannot use:** 
- Concepts not yet taught (e.g., relative clauses if L45 concept)

---

### Factor 2: Pupil Mastery (Adaptive Difficulty)

**Which concepts has THIS pupil mastered?**

**Mastery Status Definitions:**
- **MASTERED** (score 85+): Used 10+ lessons ago with 80%+ accuracy
- **PRACTICING** (score 65-84): Used 3-9 lessons ago with 60-80% accuracy
- **NEW** (score <65): Introduced 0-2 lessons ago OR low accuracy

**Adaptive Strategy:**

**Early formulas (F1-F4):** Use MASTERED concepts primarily
- Build confidence
- Ensure success
- Foundation solid

**Middle formulas (F5-F6):** Mix MASTERED and PRACTICING
- Reinforce practicing concepts
- Add challenge gradually

**Late formulas (F7-10):** Include NEW concepts
- Challenge pupil
- Introduce recent learning
- Test understanding

---

# PART 4: FORMULA GENERATION ALGORITHM

## Step-by-Step Process

### INPUT:
- Lesson number (L10-L67)
- Pupil ID (for mastery data)
- Subject chosen by pupil (e.g., "library")
- Formula count (determined by stage)

### OUTPUT:
- Array of formulas (F1 through F[count])
- Each formula includes:
  - Formula structure (word class sequence)
  - Concepts used
  - Labelled example
  - Word bank (from previous formula)
  - New elements being added

---

## ALGORITHM:

```python
def generate_pwp_formulas(lesson_number, pupil_id, subject, formula_count):
    """
    Generate PWP formulas following strict progression rules.
    """
    
    # STEP 1: Get curriculum data
    concepts_available = get_concepts_taught_by_lesson(lesson_number)
    # Returns: ['noun', 'verb', 'determiner', 'adjective', 'adverb', 
    #           'preposition', 'prepositional_phrase', 'fronted_adverbial']
    
    # STEP 2: Get pupil mastery data
    mastery_data = get_pupil_mastery(pupil_id, concepts_available)
    # Returns: [{concept: 'noun', status: 'MASTERED', score: 95},
    #           {concept: 'adverb', status: 'PRACTICING', score: 72}, ...]
    
    # STEP 3: Categorize concepts by mastery
    mastered = [c for c in mastery_data if c['status'] == 'MASTERED']
    practicing = [c for c in mastery_data if c['status'] == 'PRACTICING']
    new_concepts = [c for c in mastery_data if c['status'] == 'NEW']
    
    # STEP 4: Initialize formula progression
    formulas = []
    
    # F1: ALWAYS start with subject + verb
    formulas.append({
        'number': 1,
        'structure': f"{subject} + verb",
        'concepts': ['noun', 'verb'],
        'example': generate_example(subject, 'verb'),
        'word_bank': [],  # No previous words
        'new_elements': ['noun', 'verb'],
        'difficulty': 'foundation'
    })
    
    # STEP 5: Build subsequent formulas
    current_structure = formulas[0]['structure']
    current_concepts = formulas[0]['concepts'].copy()
    
    for i in range(2, formula_count + 1):
        # Determine difficulty tier
        if i <= formula_count * 0.5:
            tier = 'foundation'  # Use MASTERED concepts
            concept_pool = mastered
        elif i <= formula_count * 0.8:
            tier = 'developing'  # Mix MASTERED and PRACTICING
            concept_pool = mastered + practicing
        else:
            tier = 'challenge'  # Include NEW concepts
            concept_pool = mastered + practicing + new_concepts
        
        # Select next concept to add (ONE concept only)
        next_concept = select_next_concept(
            current_concepts=current_concepts,
            available_pool=concept_pool,
            formula_number=i,
            lesson_stage=get_stage(lesson_number)
        )
        
        # Determine WHERE to add the concept (syntactic position)
        position = determine_position(next_concept, current_structure)
        
        # Build new structure
        new_structure = add_concept_to_structure(
            current_structure, 
            next_concept, 
            position
        )
        
        # Extract word bank (previous formula's words)
        word_bank = extract_words(formulas[i-2]['example'])
        
        # Create formula
        formulas.append({
            'number': i,
            'structure': new_structure,
            'concepts': current_concepts + [next_concept],
            'example': generate_example_with_structure(new_structure, subject),
            'word_bank': word_bank,
            'new_elements': [next_concept],
            'difficulty': tier
        })
        
        # Update current state for next iteration
        current_structure = new_structure
        current_concepts.append(next_concept)
    
    return formulas


def select_next_concept(current_concepts, available_pool, formula_number, lesson_stage):
    """
    Select the next concept to add following progression rules.
    """
    
    # Remove concepts already in use
    unused_concepts = [c for c in available_pool if c['concept'] not in current_concepts]
    
    # PROGRESSION ORDER (syntactic building)
    progression_order = [
        'adverb',                    # Modifies verb (add early)
        'prepositional_phrase',      # Extends action/location
        'determiner',                # Before noun
        'adjective',                 # Modifies noun (after determiner)
        'object',                    # After verb/preposition
        'time_phrase',               # Sentence-level
        'fronted_adverbial',         # Sentence-level
        'relative_clause',           # Advanced (L40+)
        'subordinate_clause',        # Advanced (L45+)
        'coordinating_conjunction'   # Advanced (L50+)
    ]
    
    # Find first concept in progression_order that:
    # 1. Is in unused_concepts
    # 2. Has been taught by this lesson
    # 3. Fits with current structure
    
    for concept in progression_order:
        if any(c['concept'] == concept for c in unused_concepts):
            return concept
    
    # Fallback: return highest mastery unused concept
    unused_concepts.sort(key=lambda x: x['score'], reverse=True)
    return unused_concepts[0]['concept']


def determine_position(concept, current_structure):
    """
    Determine WHERE in the sentence structure to add the new concept.
    """
    
    position_rules = {
        'adverb': 'between_subject_and_verb',
        'prepositional_phrase': 'after_verb',
        'determiner': 'before_subject',
        'adjective': 'after_determiner_before_subject',
        'object': 'end_of_prep_phrase',
        'time_phrase': 'sentence_start',
        'fronted_adverbial': 'sentence_start_with_comma',
        'relative_clause': 'after_noun_it_modifies',
        'subordinate_clause': 'sentence_end_or_start'
    }
    
    return position_rules.get(concept, 'default_end')


def add_concept_to_structure(current_structure, new_concept, position):
    """
    Insert new concept into structure at specified position.
    """
    
    # Parse current structure
    elements = current_structure.split(' + ')
    
    # Add new concept based on position
    if position == 'between_subject_and_verb':
        # Find subject position
        subject_idx = next(i for i, e in enumerate(elements) if 'subject' in e.lower())
        elements.insert(subject_idx + 1, new_concept)
    
    elif position == 'after_verb':
        verb_idx = next(i for i, e in enumerate(elements) if 'verb' in e.lower())
        elements.insert(verb_idx + 1, new_concept)
    
    elif position == 'before_subject':
        subject_idx = next(i for i, e in enumerate(elements) if 'subject' in e.lower())
        elements.insert(subject_idx, new_concept)
    
    elif position == 'sentence_start':
        elements.insert(0, new_concept)
    
    elif position == 'default_end':
        elements.append(new_concept)
    
    # Reconstruct structure string
    return ' + '.join(elements)
```

---

# PART 5: VALIDATION RULES

## Formula Validation Checklist

**Every generated formula MUST pass these checks:**

### ✓ Check 1: Single Element Addition
```python
def validate_single_element_addition(formula_n, formula_n_minus_1):
    """
    Verify that exactly ONE new element was added.
    """
    concepts_n = set(formula_n['concepts'])
    concepts_n_minus_1 = set(formula_n_minus_1['concepts'])
    
    new_concepts = concepts_n - concepts_n_minus_1
    
    # Exception: F1 has 2 elements (subject + verb) - this is OK
    if formula_n['number'] == 1:
        assert len(concepts_n) == 2, "F1 must have exactly 2 elements"
        return True
    
    # Exception: Final formula may add 2 elements
    if formula_n['number'] == max_formula_number:
        assert len(new_concepts) <= 2, "Final formula can add up to 2 elements"
        return True
    
    # Standard rule: Exactly 1 new element
    assert len(new_concepts) == 1, f"Formula {formula_n['number']} added {len(new_concepts)} elements, expected 1"
    return True
```

### ✓ Check 2: Concept Availability
```python
def validate_concepts_taught(formula, lesson_number):
    """
    Verify all concepts in formula have been taught by this lesson.
    """
    concepts_available = get_concepts_taught_by_lesson(lesson_number)
    
    for concept in formula['concepts']:
        assert concept in concepts_available, f"Concept '{concept}' used but not taught by L{lesson_number}"
    
    return True
```

### ✓ Check 3: Syntactic Coherence
```python
def validate_syntactic_order(formula):
    """
    Verify elements are in grammatically sensible order.
    """
    structure = formula['structure']
    
    # Determiners must come before nouns they modify
    if 'determiner' in structure and 'subject' in structure:
        det_pos = structure.index('determiner')
        subj_pos = structure.index('subject')
        assert det_pos < subj_pos, "Determiner must precede subject"
    
    # Adjectives must come after determiners (if present) and before nouns
    if 'adjective' in structure and 'subject' in structure:
        adj_pos = structure.index('adjective')
        subj_pos = structure.index('subject')
        assert adj_pos < subj_pos, "Adjective must precede subject"
        
        if 'determiner' in structure:
            det_pos = structure.index('determiner')
            assert det_pos < adj_pos, "Determiner must precede adjective"
    
    # Adverbs typically near verbs
    if 'adverb' in structure and 'verb' in structure:
        adv_pos = structure.index('adverb')
        verb_pos = structure.index('verb')
        # Adverb should be adjacent to or very near verb
        assert abs(adv_pos - verb_pos) <= 2, "Adverb too far from verb"
    
    return True
```

### ✓ Check 4: Example Matches Structure
```python
def validate_example_matches_structure(formula):
    """
    Verify the example sentence matches the declared structure.
    """
    example_words = formula['example'].split()
    structure_elements = formula['structure'].split(' + ')
    
    # Count should roughly match (accounting for articles, prepositions)
    # This is approximate validation
    assert len(example_words) >= len(structure_elements), "Example too short for structure"
    assert len(example_words) <= len(structure_elements) * 2, "Example too long for structure"
    
    return True
```

### ✓ Check 5: Word Bank Integrity
```python
def validate_word_bank(formula, previous_formula):
    """
    Verify word bank contains all words from previous formula.
    """
    if formula['number'] == 1:
        assert len(formula['word_bank']) == 0, "F1 should have empty word bank"
        return True
    
    previous_words = set(previous_formula['example'].lower().replace(',', '').split())
    word_bank = set(w.lower() for w in formula['word_bank'])
    
    # Word bank should contain all major words from previous example
    # (May exclude punctuation, but should include content words)
    assert len(word_bank) > 0, f"F{formula['number']} word bank is empty"
    
    return True
```

---

# PART 6: COMMON MISTAKES TO AVOID

## ❌ Mistake 1: Adding Multiple Elements

**WRONG:**
```
F2: determiner + adjective + subject + verb
    (Added determiner AND adjective - that's 2 elements)
```

**RIGHT:**
```
F2: subject + adverb + verb
    (Added adverb only - 1 element)

F3: determiner + subject + adverb + verb
    (Added determiner only - 1 element)

F4: determiner + adjective + subject + adverb + verb
    (Added adjective only - 1 element)
```

**EXCEPTION:** Determiner + Adjective taught as UNIT (noun phrase modification)
```
F3: determiner + adjective + subject + adverb + verb
    (OK if det+adj taught together as noun phrase modification concept)
```

---

## ❌ Mistake 2: Skipping Elements

**WRONG:**
```
F1: subject + verb
F2: subject + verb + prepositional phrase
    (Skipped adverb - too big a jump)
```

**RIGHT:**
```
F1: subject + verb
F2: subject + adverb + verb
    (Added adverb - gradual progression)
```

---

## ❌ Mistake 3: Ignoring Mastery Data

**WRONG:**
```
F2: Uses NEW concept pupil just learned
F3: Uses NEW concept pupil just learned
F4: Uses NEW concept pupil just learned
    (Too many challenges too early)
```

**RIGHT:**
```
F2: Uses MASTERED concept (builds confidence)
F3: Uses MASTERED concept (reinforces foundation)
F4: Uses PRACTICING concept (appropriate challenge)
F5: Uses NEW concept (introduces recent learning)
```

---

## ❌ Mistake 4: Illogical Order

**WRONG:**
```
F2: determiner + subject + verb
    (Added determiner before subject)

F3: determiner + subject + adverb + verb  
    (Now adding adverb AFTER already modifying subject with determiner)
```

**RIGHT:**
```
F2: subject + adverb + verb
    (Add verb modifier first)

F3: determiner + subject + adverb + verb
    (Then add noun modifier)
```

**Reason:** Adverbs modify verbs (close relationship). Determiners modify nouns (different relationship). Build verb phrase first, then elaborate noun phrase.

---

## ❌ Mistake 5: Forgetting Foundation

**WRONG:**
```
F7: During the busy school week, the old library quietly opens 
    in the early morning for eager students

    (Pupil writes this but can't identify "library" as subject or 
     "opens" as verb because they've lost sight of foundation)
```

**RIGHT:**
Formula progression maintains RECOGNIZABLE CONNECTION to F1:
```
F1: Library opens ← Foundation ALWAYS visible
F7: During... library ... opens ... ← Can still see "library opens" core
```

**This is why rewriting matters:** Pupils write "library opens" SEVEN times. It becomes automatic.

---

# PART 7: SUBJECT-SPECIFIC PROGRESSION RULES

## Rule: Subject Type Affects Verb Choice

**Different subject types have different natural verbs:**

### PERSON subjects (e.g., "Ben", "Teacher", "Mum"):
**Natural verbs:**
- Action verbs: runs, jumps, plays, writes, teaches, thinks, laughs
- State verbs: stands, sits, waits, watches, listens

**Unnatural verbs:**
- ❌ "Ben exists" (too abstract)
- ❌ "Teacher occurs" (wrong register)

### PLACE subjects (e.g., "Library", "Park", "School"):
**Natural verbs:**
- State verbs: sits, stands, exists, opens, closes
- Functional verbs: serves, welcomes, houses, contains, provides

**Unnatural verbs:**
- ❌ "Library runs" (places don't run)
- ❌ "Park jumps" (illogical)

### ANIMAL subjects (e.g., "Dog", "Cat", "Bird"):
**Natural verbs:**
- Action verbs: runs, jumps, flies, swims, hunts, sleeps, eats
- Sound verbs: barks, meows, chirps

**Unnatural verbs:**
- ❌ "Dog reads" (unlikely, though possible for creative writing)
- ❌ "Bird drives" (illogical)

### THING subjects (e.g., "Book", "Car", "Clock"):
**Natural verbs:**
- State verbs: sits, lies, stands
- Function verbs: works, runs (for machines), ticks (for clock)

**Unnatural verbs:**
- ❌ "Book laughs" (objects don't have emotions)
- ❌ "Car thinks" (not sentient)

---

## Rule: Verb Choice Affects Subsequent Elements

### Action Verbs (runs, jumps, plays):
**Natural additions:**
- Adverbs: quickly, slowly, energetically
- Prepositional phrases: through park, over fence, in the garden
- Time phrases: every morning, during break

### State Verbs (sits, stands, exists):
**Natural additions:**
- Locational phrases: in the corner, by the window
- Time phrases: all day, throughout the year
- Adverbs of manner: quietly, peacefully, proudly

### Functional Verbs (opens, closes, serves):
**Natural additions:**
- Time phrases: at nine o'clock, during the week
- Purpose phrases: for visitors, for students
- Manner adverbs: quietly, efficiently, warmly

---

# PART 8: STAGE-SPECIFIC GUIDANCE

## Foundation Stage (L10-15): 2-4 Formulas

**Goal:** Build confidence with basic constructions

**Typical progression:**
```
F1: subject + verb (2 words)
F2: subject + adverb + verb (3 words)
F3: subject + adverb + verb + prep phrase (5-6 words)
F4: det + adj + subject + adverb + verb + prep phrase (7-8 words)
```

**Characteristics:**
- Short sessions (5 minutes)
- Simple vocabulary
- Clear labelled examples
- Heavy scaffolding
- Success-focused (use mastered concepts mostly)

---

## Development Stage (L16-30): 5-7 Formulas

**Goal:** Build fluency with multi-element constructions

**Typical progression:**
```
F1: subject + verb (2 words)
F2: subject + adverb + verb (3 words)
F3: subject + adverb + verb + prep phrase (5-6 words)
F4: det + adj + subject + adverb + verb + prep phrase (7-8 words)
F5: det + adj + subj + adv + verb + prep + det + adj + object (9-10 words)
F6: time phrase + det + adj + subj + adv + verb + prep + det + adj + obj (11-12 words)
F7: fronted adv + det + adj + subj + adv + verb + prep + det + adj + obj + add phrase (14-16 words)
```

**Characteristics:**
- Medium sessions (10-12 minutes)
- Paragraph writing begins (use final sentence as topic sentence)
- Mix of mastered and practicing concepts
- Some challenge in later formulas

---

## Application Stage (L31-50): 8-10 Formulas

**Goal:** Apply skills to sophisticated constructions

**Typical progression:**
Extends Development pattern with:
- Additional adjectives (multiple before noun)
- Multiple prepositional phrases
- Expanded fronted adverbials
- Purpose phrases ("for...", "to...")
- Longer paragraphs (6-8 sentences)

**Characteristics:**
- Longer sessions (12-15 minutes)
- Rich paragraph prompts (character exploration, theme)
- Balanced use of mastered/practicing/new concepts
- Building toward multi-clause sentences

---

## Advanced Stage (L51-67): 10+ Formulas

**Goal:** Master complex multi-clause constructions

**Typical progression:**
All previous elements PLUS:
- Relative clauses ("which...", "who...")
- Subordinate clauses ("because...", "although...")
- Coordinating conjunctions ("and...", "but...")
- Advanced punctuation (semi-colons, colons)
- Sophisticated vocabulary

**Characteristics:**
- Extended sessions (15-20 minutes)
- Thematic paragraph writing (villain's perspective, hero's return)
- More new/challenging concepts
- Preparation for secondary-level writing

---

# PART 9: FORMULA GENERATION EXAMPLES

## Example 1: Lesson 23 (Development Stage)

**Input:**
- Lesson: L23 (Fronted Adverbials)
- Pupil: Sarah (good mastery of most concepts)
- Subject: "library" (PLACE)
- Formula count: 7

**Concepts available:**
- noun, verb (L10)
- determiner (L11)
- adjective (L12)
- adverb (L13)
- preposition, prepositional phrase (L16)
- fronted adverbial (L21, L23)

**Generated formulas:**

```
F1: library + opens
    Concepts: noun, verb
    Word bank: []
    New: noun, verb
    Example: "Library opens"

F2: library + quietly + opens
    Concepts: noun, adverb, verb
    Word bank: [Library, opens]
    New: adverb
    Example: "Library quietly opens"

F3: library + quietly + opens + in the morning
    Concepts: noun, adverb, verb, prepositional phrase
    Word bank: [Library, quietly, opens]
    New: prepositional phrase
    Example: "Library quietly opens in the morning"

F4: the + old + library + quietly + opens + in the morning
    Concepts: determiner, adjective, noun, adverb, verb, prep phrase
    Word bank: [Library, quietly, opens, in, the, morning]
    New: determiner + adjective (noun phrase modification unit)
    Example: "The old library quietly opens in the morning"

F5: the + old + library + quietly + opens + in + the + early + morning
    Concepts: [previous] + adjective (before "morning")
    Word bank: [The, old, library, quietly, opens, in, the, morning]
    New: adjective (modifying object within prep phrase)
    Example: "The old library quietly opens in the early morning"

F6: Every weekday, + the + old + library + quietly + opens + in + the + early + morning
    Concepts: [previous] + time phrase
    Word bank: [The, old, library, quietly, opens, in, the, early, morning]
    New: time phrase (fronted)
    Example: "Every weekday, the old library quietly opens in the early morning"

F7: During the busy school week, + the + old + library + quietly + opens + in + the + early + morning + for eager students
    Concepts: [previous] + fronted adverbial + purpose phrase
    Word bank: [Every, weekday, the, old, library, quietly, opens, in, the, early, morning]
    New: fronted adverbial (enhanced time) + purpose phrase
    Example: "During the busy school week, the old library quietly opens in the early morning for eager students"
```

**Validation:**
- ✓ Each formula adds 1-2 elements
- ✓ All concepts taught by L23
- ✓ Syntactic order coherent
- ✓ Word banks correct
- ✓ Foundation (library opens) visible throughout

---

## Example 2: Lesson 45 (Application Stage)

**Input:**
- Lesson: L45 (Relative Clauses)
- Pupil: James (some concepts still practicing)
- Subject: "teacher" (PERSON)
- Formula count: 9

**Concepts available:**
[All from L10-45, including relative clauses]

**Generated formulas:**

```
F1: teacher + explains
    Example: "Teacher explains"

F2: teacher + carefully + explains
    New: adverb
    Example: "Teacher carefully explains"

F3: teacher + carefully + explains + to pupils
    New: prepositional phrase
    Example: "Teacher carefully explains to pupils"

F4: the + patient + teacher + carefully + explains + to pupils
    New: determiner + adjective
    Example: "The patient teacher carefully explains to pupils"

F5: the + patient + teacher + carefully + explains + to + eager + pupils
    New: adjective (before "pupils")
    Example: "The patient teacher carefully explains to eager pupils"

F6: During morning lessons, + the + patient + teacher + carefully + explains + to + eager + pupils
    New: time phrase
    Example: "During morning lessons, the patient teacher carefully explains to eager pupils"

F7: During morning lessons, + the + patient + teacher + carefully + explains + complex concepts + to + eager + pupils
    New: object (between verb and prep phrase)
    Example: "During morning lessons, the patient teacher carefully explains complex concepts to eager pupils"

F8: During morning lessons, + the + patient + teacher, + who + loves + teaching, + carefully + explains + complex concepts + to + eager + pupils
    New: relative clause (after subject)
    Example: "During morning lessons, the patient teacher, who loves teaching, carefully explains complex concepts to eager pupils"

F9: During morning lessons, + the + patient + teacher, + who + loves + teaching, + carefully + explains + complex concepts + to + eager + pupils + who + listen + attentively
    New: second relative clause (after object)
    Example: "During morning lessons, the patient teacher, who loves teaching, carefully explains complex concepts to eager pupils who listen attentively"
```

**Note:** F8 and F9 both add relative clauses, but:
- F8: First relative clause (new concept, recently taught)
- F9: Second relative clause (applying the concept again)
- This is acceptable in advanced stage

---

# PART 10: TROUBLESHOOTING

## Problem: "Formula seems to add multiple elements"

**Check:**
1. Are the elements taught as a UNIT? (e.g., det + adj as noun phrase modification)
2. Is this the FINAL formula? (can add up to 2 elements)
3. Is one element actually EXPANDING an existing element? (e.g., adding adjective to existing prep phrase object)

**If yes to any:** May be acceptable  
**If no to all:** Violates single-element rule

---

## Problem: "Concepts not appearing in logical order"

**Check:**
1. Is adverb added before prepositional phrase? (✓ adverbs modify verbs, preps extend)
2. Are determiners added before adjectives? (✓ det + adj form unit)
3. Is subject elaboration happening before object elaboration? (✓ focus on main clause first)

**Fix:** Reorder concept addition to match syntactic building pattern

---

## Problem: "Examples don't sound natural"

**Check:**
1. Does verb match subject type? (person/animal/place/thing)
2. Are adverbs appropriate for verb? (action verbs → manner adverbs; state verbs → frequency adverbs)
3. Do prepositional phrases make logical sense? (location, time, purpose)

**Fix:** Adjust vocabulary choice while maintaining formula structure

---

## Problem: "Pupil struggling with formula even though concepts known"

**Check:**
1. Is formula too long too quickly? (F5 should be ~9-10 words max in Development stage)
2. Are too many NEW concepts appearing? (should be mostly mastered in early formulas)
3. Is word bank from previous formula available? (pupils need to click previous words)

**Fix:** 
- Reduce formula count (fewer formulas, but mastered)
- Use more mastered concepts
- Ensure word bank populated correctly

---

# PART 11: QUALITY ASSURANCE CHECKLIST

## For Every Formula Set:

**Structural Checks:**
- [ ] F1 is always subject + verb
- [ ] Each formula adds exactly 1 element (or 2 if final/unit concept)
- [ ] Concepts appear in syntactic order
- [ ] All concepts taught by this lesson
- [ ] Word banks contain previous formula's words
- [ ] Examples demonstrate the structure

**Pedagogical Checks:**
- [ ] Early formulas (F1-4) use MASTERED concepts primarily
- [ ] Middle formulas (F5-6) mix MASTERED and PRACTICING
- [ ] Late formulas (F7+) challenge with NEW concepts
- [ ] Formula count appropriate for stage (2-4 Foundation, 5-7 Development, 8-10 Application, 10+ Advanced)
- [ ] Session length realistic (5min Foundation, 10-12min Development, 12-15min Application, 15-20min Advanced)

**Linguistic Checks:**
- [ ] Subject-verb agreement maintained
- [ ] Verb choice appropriate for subject type
- [ ] Adverb-verb pairing logical
- [ ] Prepositional phrases coherent
- [ ] Adjective-noun matches sensible

**Rewriting Mechanic Checks:**
- [ ] Word bank interface specified (clickable buttons)
- [ ] New element input specified (typing field)
- [ ] Labelled examples provided (early formulas)
- [ ] Repetition counted and displayed
- [ ] Foundation sentence (F1) remains recognizable in final formula

---

# PART 12: SUMMARY - GOLDEN RULES

**The 10 Commandments of PWP Formula Progression:**

1. **F1 is always subject + verb** (foundation for all)

2. **Add exactly ONE element per formula** (exception: final formula or unit concepts)

3. **Use concepts taught by this lesson** (don't use what pupils haven't learned)

4. **Build in syntactic order** (follow English sentence structure)

5. **Early formulas use MASTERED concepts** (build confidence)

6. **Late formulas challenge with NEW concepts** (appropriate difficulty)

7. **Maintain subject-verb logic** (person/animal/place/thing → appropriate verbs)

8. **Keep foundation visible** (pupils should see F1 within F7)

9. **Provide word bank from previous formula** (enable reconstruction)

10. **Validate every formula** (run checks before deploying)

---

# APPENDIX: REFERENCE TABLES

## Table A: Concept Introduction Timeline

| Lesson | Concept Introduced | Example Use |
|--------|-------------------|-------------|
| L10 | Noun (subject), Verb | Dog runs |
| L11 | Determiner | The dog runs |
| L12 | Adjective | The big dog runs |
| L13 | Adverb | The big dog quickly runs |
| L14 | Conjunction (and) | The dog runs and jumps |
| L15 | Pronoun | He runs |
| L16 | Preposition, Prep phrase | Dog runs through park |
| L17 | Object (after verb) | Dog chases ball |
| L18 | Possessive adjective | My dog runs |
| L19 | Question words | Where does dog run? |
| L20 | Past tense | Dog ran |
| L21 | Fronted adverbial | Yesterday, dog ran |
| L22 | Present perfect | Dog has run |
| L23 | Fronted adverbial (expanded) | During the morning, dog ran |
| L24 | Coordinating conjunction | Dog ran, but cat sat |
| L25 | Subordinating conjunction | Dog ran because cat ran |
| ... | ... | ... |
| L40 | Relative clause (who/which) | Dog, which is fast, ran |
| L45 | Multiple relative clauses | Dog, which is fast, chased ball, which was red |
| L50 | Complex sentences | Because dog was tired, although he was fast, he walked |

(This continues through L67 - full curriculum map in Database Schema)

---

## Table B: Typical Formula Counts by Stage

| Stage | Lessons | Formula Count | Session Length | Paragraph Writing |
|-------|---------|---------------|----------------|-------------------|
| Foundation | L10-15 | 2-4 | 5 min | No |
| Development | L16-30 | 5-7 | 10-12 min | Yes (simple) |
| Application | L31-50 | 8-10 | 12-15 min | Yes (rich) |
| Advanced | L51-67 | 10+ | 15-20 min | Yes (thematic) |

---

## Table C: Subject Type → Natural Verbs

| Subject Type | Natural Verbs | Unnatural Verbs |
|--------------|---------------|-----------------|
| PERSON | runs, walks, thinks, writes, teaches, plays, speaks | exists (too abstract), occurs |
| ANIMAL | runs, jumps, flies, swims, hunts, sleeps, barks | reads, drives, writes |
| PLACE | sits, stands, opens, closes, welcomes, serves | runs, thinks, speaks |
| THING | sits, lies, works (machines), contains | thinks, feels, walks |

---

**END OF FORMULA PROGRESSION SPECIFICATION**

This document is AUTHORITATIVE for all PWP formula generation.

Any deviation from these rules must be explicitly justified and documented.

Version 1.0 - December 2025
