# PWP Daily Chain Practice — Feature Specification

**Version:** 1.0  
**Date:** 2026-05-03  
**Status:** Scoping  
**Target app:** PWP Studio (`pwp.studio.wrife.co.uk`) + wrife.co.uk teacher dashboard

---

## 1. Purpose

The Programmable Word Pattern (PWP) method embeds grammatical knowledge through **cumulative daily repetition**. Each day a pupil writes a chain of sentences — one per formula level, from L1 up to their current level — using a subject they choose that day. The chain grows by one sentence each time a new formula level is introduced.

The result after several weeks is a pupil who can produce grammatically precise sentences of increasing complexity *without thinking* — because they have written each formula dozens of times. The subject changing daily reinforces cross-curricular vocabulary; the formula chain reinforces structural mastery.

**What the current app is missing:** There is no session type that asks a pupil to write the full cumulative chain. Formula practice exists in isolation, with no sense of progression or context.

---

## 2. Core Concepts

| Term | Definition |
|---|---|
| **Formula level** | One of L1–L67, each defining a sentence structure (e.g. L3: `DET + NOUN + VERB`) |
| **Chain** | The sequence of sentences from L1 up to the pupil's current level |
| **Session subject** | A noun the pupil picks at the start of each session (changes daily) |
| **Current level** | The highest formula level this pupil is actively practising |
| **Mastery signal** | System-generated flag indicating the pupil may be ready to progress |
| **Progression** | Teacher-confirmed advancement from current level Ln to L(n+1) |

---

## 3. Pedagogical Principles (Must Not Be Compromised)

1. **Full chain, every day.** The pupil writes all sentences from L1 to Ln in every session, not just today's new formula. Earlier formulas are never dropped.
2. **Subject is daily, not permanent.** The pupil chooses a subject each session. It can be a cross-curricular topic, a personal interest, or a teacher-suggested theme. Variety here is desirable.
3. **Subject is consistent within a session.** All sentences in one session use the same subject noun. Singular/plural variation is allowed — the pupil decides.
4. **Strict formula validation.** Each sentence must match its formula before the pupil moves to the next. Wrong word class = try again. This is non-negotiable for fluency-building.
5. **Progression is teacher-controlled.** The system surfaces a mastery signal; the teacher decides when the pupil advances. This respects classroom context the system cannot see.

---

## 4. User Journeys

### 4A. Pupil — Daily Session

```
1. Pupil opens PWP Studio → lands on Dashboard
2. Taps "Daily Practice" button
3. Sees: subject input + teacher theme hint (if set)
4. Types their subject noun (e.g. "dolphins")
5. Chain builder appears, starting at L1:

   ┌─────────────────────────────────────────────┐
   │  Today's subject: dolphins                  │
   │                                             │
   │  L1  [noun + verb]                          │
   │  Type your sentence: ________________       │
   └─────────────────────────────────────────────┘

6. Pupil types "Dolphins swim."
   → Formula validator checks: noun ✓ + verb ✓ → accepts
   → L1 card turns green with tick

7. L2 appears immediately below:
   ┌─────────────────────────────────────────────┐
   │  ✓  L1  Dolphins swim.                      │
   │                                             │
   │  L2  [noun + verb + adverb]                 │
   │  Type your sentence: ________________       │
   └─────────────────────────────────────────────┘

8. Pupil continues through the chain until Ln (their current level)
9. On completing Ln: celebration animation + XP awarded
10. Session saved. Pupil sees their streak count.
```

### 4B. Pupil — Encountering a Formula Error

```
Pupil at L3 [det + noun + verb] types: "Dolphins swim fast."
→ Validator detects adverb "fast" — not part of L3 formula
→ Sentence shakes, word "fast" highlighted
→ Hint: "Your L3 formula is: determiner + noun + verb. 
         Try again — one word of each type."
→ Pupil corrects to "The dolphins swim." → accepted → green
```

### 4C. Teacher — Setting a Session Theme

```
wrife.co.uk → Classes → Silver Birch → PWP tab
→ "Set this week's theme (optional)"
→ Teacher types: "Ancient Egypt"
→ Pupils see a hint on the subject picker: 
  "This week's theme: Ancient Egypt — try: pharaoh, pyramid, Nile..."
```

### 4D. Teacher — Monitoring Daily Completion

```
wrife.co.uk → Classes → Silver Birch → PWP tab
→ Today's completion grid:
  Adama Dembe     ✓  L5   first-attempt on new formula
  Sofia Tanaka    ✓  L5   2 attempts on new formula
  James Obi       ✗  Not completed today
  Priya Sharma    ✓  L5   🏆 Mastery signal — ready to advance?
```

### 4E. Teacher — Advancing a Pupil

```
wrife.co.uk → Silver Birch → PWP tab → Priya Sharma → "⬆ Advance to L6"
→ Confirmation: "Priya will now practise L6 (det + adj + noun + verb + adv)"
→ Confirm → Priya's current level updated to L6
→ Tomorrow Priya's chain will include L6 for the first time
```

---

## 5. Mastery Signal System

### Criteria for triggering a mastery signal on level Ln:

| Signal condition | Points |
|---|---|
| New formula sentence correct on **first attempt** | 3 |
| Correct on **second attempt** | 1 |
| Correct on **third+ attempt** | 0 |
| All **earlier chain sentences** correct first-attempt | +1 bonus |

**Signal fires when:** Pupil accumulates ≥ 12 points over the last 5 sessions at their current level (i.e. roughly 4+ first-attempt sessions out of 5).

**What happens:**
- Teacher sees a 🏆 badge next to the pupil's name on the class PWP tab
- Teacher receives a notification (dashboard alert, not email — at this stage)
- Teacher clicks "Advance to L(n+1)" to promote the pupil
- If teacher does nothing, the pupil continues practising Ln — no auto-advance

**Why teacher-controlled:** A pupil might hit the signal mid-term when introducing the next formula would be confusing, or might need more time for other reasons. The system advises; the teacher decides.

---

## 6. Database Schema (Platform Supabase — `gzmgjkbtsvezfclmreru`)

### New tables

```sql
-- Tracks each pupil's current PWP level
-- (One row per pupil — upserted on advance)
CREATE TABLE pwp_pupil_levels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id        uuid NOT NULL REFERENCES auth.users(id),
  class_id        uuid NOT NULL REFERENCES classes(id),
  current_level   integer NOT NULL DEFAULT 1,  -- 1–67
  mastery_points  integer NOT NULL DEFAULT 0,
  mastery_signal  boolean NOT NULL DEFAULT false,
  advanced_at     timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (pupil_id, class_id)
);

-- Records each daily chain practice session
CREATE TABLE pwp_chain_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id        uuid NOT NULL REFERENCES auth.users(id),
  class_id        uuid NOT NULL REFERENCES classes(id),
  session_date    date NOT NULL DEFAULT CURRENT_DATE,
  subject_noun    text NOT NULL,             -- e.g. "dolphins"
  level_reached   integer NOT NULL,         -- highest level completed
  chain_complete  boolean NOT NULL DEFAULT false,
  total_attempts  integer NOT NULL DEFAULT 0,
  new_formula_attempts integer NOT NULL DEFAULT 1,  -- attempts on Ln
  duration_seconds integer,
  xp_earned       integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (pupil_id, session_date)            -- one session per day
);

-- Individual sentence submissions within a session
CREATE TABLE pwp_chain_sentences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES pwp_chain_sessions(id),
  formula_level   integer NOT NULL,          -- 1–67
  sentence        text NOT NULL,
  attempt_number  integer NOT NULL DEFAULT 1,
  accepted        boolean NOT NULL DEFAULT false,
  validation_result jsonb,                   -- {word_classes: [...], errors: [...]}
  created_at      timestamptz DEFAULT now()
);

-- Optional: teacher-set weekly theme per class
CREATE TABLE pwp_class_themes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES classes(id),
  theme       text NOT NULL,                 -- e.g. "Ancient Egypt"
  suggestions text[],                        -- ["pharaoh","pyramid","Nile"]
  week_start  date NOT NULL,
  created_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (class_id, week_start)
);
```

### RLS policies (summary)
- `pwp_pupil_levels`: pupil can SELECT own row; teacher can SELECT/UPDATE for their class pupils
- `pwp_chain_sessions`: pupil can SELECT/INSERT own rows; teacher can SELECT for their class
- `pwp_chain_sentences`: pupil can SELECT/INSERT own; teacher can SELECT for their class
- `pwp_class_themes`: teacher can INSERT/UPDATE for own classes; pupils can SELECT for their class

---

## 7. Formula Validation

Each formula level has a defined word-class sequence stored in the formula engine (`packages/formula-engine`). Validation runs client-side first (instant feedback), with optional AI-assisted checking for ambiguous cases.

### Client-side validation (strict)
1. Tokenise the pupil's sentence
2. POS-tag each token (using the existing `parseSentence` utility)
3. Compare the tag sequence against the formula pattern for this level
4. If sequence matches → accept
5. If not → highlight the offending token(s) + show hint

### Error messages (formula-specific)
Each formula level should have a plain-English hint:
```
L1 [noun + verb]: "Your sentence needs a doing word (verb). 
                   Example: Dogs run."

L3 [det + noun + verb]: "Start with a word like 'the' or 'a', 
                         then a noun, then a verb."
```

### Edge cases
- **Plural subjects:** "Dolphins swim" = noun(plural) + verb(plural) = valid for L1 ✓  
- **Proper nouns:** "London stands" = noun + verb = valid ✓  
- **Contractions:** Discouraged at early levels, flagged as a hint rather than an error

---

## 8. PWP Studio Changes

### 8A. New route: `/daily-practice`

New page, accessible from the pupil dashboard "Daily Practice" CTA button.

**Components needed:**
- `SubjectPicker` — text input with optional theme hint badge, autofocus on load
- `ChainBuilder` — renders the sentence list from L1 to current level
- `ChainRow` — one row per level: level badge + formula hint + sentence input (or ticked completed sentence)
- `FormulaHint` — collapsed by default, expands to show formula structure + example
- `ValidationFeedback` — inline, appears on wrong answer with highlighted error + hint text
- `SessionComplete` — celebration screen with XP, streak count, and mastery signal if triggered

### 8B. Updated Dashboard
- Replace or supplement existing formula practice entry point with "Daily Practice" as the primary CTA
- Add streak counter to the dashboard header (🔥 12-day streak)
- Add "Today complete ✓" status once session is done

### 8C. Formula engine addition
Each formula level needs a `hint` field added to its definition:
```ts
interface Formula {
  id: number
  name: string
  pattern: WordClass[]
  hint: string          // NEW: plain-English description for pupil
  example: string       // NEW: model sentence using generic subject
}
```

---

## 9. Wrife.co.uk Teacher Dashboard Changes

### 9A. Class page → new "PWP" tab (or extend existing)

Sections:
1. **Today's completion** — grid of pupils with status (✓ complete / ✗ not yet / — not enrolled)
2. **Mastery signals** — pupils with 🏆 badge, "Advance to Ln+1" button per pupil
3. **Level distribution** — bar chart showing how many pupils are at each formula level
4. **This week's theme** — input to set optional theme + word suggestions
5. **Pupil detail** — click any pupil to see their last 7 sessions (subject, chain complete, new formula attempts)

### 9B. API routes needed (wrife.co.uk)

```
GET  /api/teacher/pwp/class-summary?classId=  → today's completion grid
POST /api/teacher/pwp/advance-pupil            → promote pupil to next level  
GET  /api/teacher/pwp/pupil-sessions?pupilId=  → last 7 sessions detail
POST /api/teacher/pwp/set-theme                → set weekly theme for class
```

---

## 10. Build Phases

### Phase A — Foundation (MVP)
*Goal: The daily chain practice works. Teachers can monitor.*

1. DB migration: create 4 new tables with RLS
2. Formula engine: add `hint` and `example` fields to all L1–L10 definitions initially
3. PWP Studio: `SubjectPicker` + `ChainBuilder` + `ChainRow` + `ValidationFeedback`
4. PWP Studio: `/daily-practice` route with session save on completion
5. wrife.co.uk: Today's completion grid on class PWP tab
6. Mastery points calculation on session save (server-side)

**Deliverable:** Pupils can do a daily chain session. Teachers can see who completed today.

---

### Phase B — Mastery & Progression
*Goal: Teacher can see mastery signals and advance pupils.*

1. Mastery signal logic: calculate points, set `mastery_signal = true` when threshold hit
2. wrife.co.uk: Mastery signal display + "Advance to L(n+1)" button
3. Advance API route + confirmation modal
4. Extend formula hints to L11–L30

**Deliverable:** Full teacher-controlled progression system working.

---

### Phase C — Theme, Enrichment & Free Practice
*Goal: Cross-curricular context, pupil engagement features, and differentiated practice.*

1. wrife.co.uk: Weekly theme setter + word suggestion input
2. PWP Studio: Theme hint on subject picker
3. Streak tracking on pupil dashboard (daily streak counter)
4. Session history view for pupils ("Your last 7 sessions")
5. Extend formula hints to L31–L67
6. **Free Practice mode** — unlimited additional sessions beyond the daily chain; pupil picks any subject, writes sentences at their current level, earns 5 XP per accepted sentence; no mastery points; does not affect streak. Sentences stored in a lightweight `pwp_free_practice_sentences` table.
7. **Differentiation scaffolding** — Free Practice offers an optional "help mode" toggle that displays word class colour bands beneath the input field (visual scaffold). The official daily chain always stays strict.
8. **Challenge preview sentence** — At the end of Free Practice, the app shows the L(n+1) formula and invites the pupil to attempt it (bonus 10 XP, no penalty for failure). Signals to the teacher if a pupil is already comfortable with the next level.

**Deliverable:** Full feature set. Ready for classroom pilot.

---

## 11. Open Questions

| # | Question | Decision |
|---|---|---|
| 1 | Should a pupil be able to do a second session in one day (e.g. morning + afternoon practice)? Current schema has `UNIQUE (pupil_id, session_date)`. | **One session per day.** Keep the UNIQUE constraint. Reflects classroom method; keeps streak logic clean. |
| 2 | Is there a minimum level requirement before the Daily Practice route is available? | **L1 unlocked by default.** Any pupil can start from day one; their chain is just one sentence (L1) until they advance. |
| 3 | Should the teacher be able to set a class-wide current level for whole-class teaching, overriding individual levels? | **Deferred to Phase B.** No decision needed before Phase A. |
| 4 | XP for chain sessions: same as formula practice, or a different amount to reflect the longer effort? | **25 XP flat** per completed chain session, regardless of chain length. Simple and predictable. |

---

## 12. Files to Create / Modify

### PWP Studio (`wrifeapp/apps/web/`)
| File | Action |
|---|---|
| `src/pages/DailyPracticePage.tsx` | Create |
| `src/components/chain/SubjectPicker.tsx` | Create |
| `src/components/chain/ChainBuilder.tsx` | Create |
| `src/components/chain/ChainRow.tsx` | Create |
| `src/components/chain/SessionComplete.tsx` | Create |
| `packages/formula-engine/src/formula.ts` | Extend (add hint, example) |
| `src/types/index.ts` | Extend (ChainSession, ChainSentence types) |

### Platform (wrife.co.uk `wrife-website/`)
| File | Action |
|---|---|
| `supabase/migrations/YYYYMMDD_pwp_chain_tables.sql` | Create |
| `app/api/teacher/pwp/class-summary/route.ts` | Create |
| `app/api/teacher/pwp/advance-pupil/route.ts` | Create |
| `app/api/teacher/pwp/set-theme/route.ts` | Create |
| `app/classes/[id]/page.tsx` | Extend (add PWP tab sections) |
