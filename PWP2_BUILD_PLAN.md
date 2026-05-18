# WriFe PWP2 — 35-Level Programme Build Plan
*Living document — update as each phase completes*
*Last updated: 2026-05-13*

---

## Key Folders & Files

| What | Path |
|---|---|
| Pages | `app/pwp/` |
| API routes | `app/api/pwp2/` |
| UI components | `components/pwp2/` |
| Phase writing components | `components/pwp2/phases/` |
| TypeScript types | `types/pwp2.ts` |
| Supabase client | `lib/pwpSupabase.ts` |
| CSS tokens | `styles/globals.css` (search `--pwp-`) |
| Env vars | `.env.local` (also add to Vercel dashboard) |

## Supabase Projects

| Project | ID | Used for |
|---|---|---|
| Platform DB | `gzmgjkbtsvezfclmreru` | wrife.co.uk auth, teacher data |
| PWP DB | `nxhkpqngnxshgotvuujb` | All 35-level programme data |

PWP DB anon key is in `.env.local` as `NEXT_PUBLIC_PWP_SUPABASE_ANON_KEY`.
RLS open policies exist for: `pwp_levels`, `pwp_steps`, `pwp_mastery_quizzes`, `pwp_step_attempts`, `pwp_user_progress`.

---

## Phase Status

### ✅ Phase 1 — Database Seed
**Complete.** All curriculum data seeded to PWP DB.

| Table | Rows |
|---|---|
| `pwp_levels` | 35 |
| `pwp_steps` | 196 |
| `pwp_mastery_quizzes` | 13 |
| `pwp_audio_assets` | 153 (placeholder paths) |

Word bank phases assigned:
- Levels 1–6: `build`
- Levels 7–19: `gap`
- Levels 20–25: `anchor`
- Levels 26–35: `free` (paragraph mode from L29)

---

### ✅ Phase 2 — Core Session UI
**Complete.** Deployable. Needs test + Vercel env vars.

**Routes built:**
- `GET /api/pwp2/level/[levelId]` → returns `LevelWithSteps`
- `POST /api/pwp2/attempt` → AI assessment, logs attempt, upserts progress, returns `AttemptResponse`
- `/pwp` → level map (all 35 levels, phase-colour-coded)
- `/pwp/level/[id]` → level welcome screen
- `/pwp/level/[id]/step/[n]` → step session (Server shell + Client StepSession)

**Writing modes (MVP simplification):**
- Phase A (build) → `PhaseCanchorMode` with example banner shown
- Phase B (gap) → `PhaseCanchorMode` with GuidancePanel (example hidden)
- Phase C (anchor) → `PhaseCanchorMode`
- Phase D (free) → `PhaseDFreeMode` (paragraph mode for L29–35)

**Assessment:** AI judges formula compliance via `lib/llm-provider.ts`. Lenient for L1–6, strict for L26+. Fallback to word-count check if no LLM key configured.

**XP:** 10 on first correct attempt, 5 on retry. Tracked in `pwp_user_progress.xp_total` and localStorage.

**User identity:** anonymous UUID in `localStorage` key `pwp2_user_id`. No auth required.

**To deploy Phase 2:**
```bash
# 1. Add to Vercel project env vars:
NEXT_PUBLIC_PWP_SUPABASE_URL=https://nxhkpqngnxshgotvuujb.supabase.co
NEXT_PUBLIC_PWP_SUPABASE_ANON_KEY=<from .env.local>

# 2. Commit and push
cd wrife-website
git add -A
git commit -m "feat: PWP2 session UI (Phase 2)"
git push
```

---

### 🔜 Phase 3 — Level Map & Progress Dashboard
**Goal:** Replace plain list at `/pwp` with a visual node-path map. Show unlocked/locked state. Add XP ring + streak counter.

**Tasks:**
- [ ] Read `pwp_user_progress` on page load (by localStorage user ID)
- [ ] Show locked levels (id > current_level_id) with a lock icon
- [ ] Add XP ring (circular progress, e.g. Recharts `RadialBarChart`)
- [ ] Add streak counter (days in a row, from `streak_current`)
- [ ] Style as a vertical path map with level nodes (phase colours)

**DB:** `pwp_user_progress` already has `current_level_id`, `xp_total`, `streak_current`.

---

### 🔜 Phase 4 — Audio Playback
**Goal:** Each step can play an Alistair/Amelia voiceover of the formula sentence.

**Tasks:**
- [ ] Generate audio files via ElevenLabs API (separate script, not in Next.js)
- [ ] Upload MP3s to Supabase Storage bucket `pwp-audio`
- [ ] Update `pwp_audio_assets` rows with real `file_path` values
- [ ] Add `<AudioButton>` component in StepSession (reads path from audio_assets table)
- [ ] Add `audio_play` tracking to attempt metadata

**Note:** `pwp_audio_assets` schema has `voice` (alistair/amelia), `script`, `file_path`, `duration_seconds`.

---

### 🔜 Phase 5 — Mastery Quizzes
**Goal:** After completing levels with `quiz_after = true`, show a full-screen quiz checkpoint.

**Tasks:**
- [ ] After level complete screen, check `level.quiz_after`
- [ ] If true, route to `/pwp/quiz/[quizId]`
- [ ] Build quiz page: shows `sample_prompts`, pupil writes free response
- [ ] AI assesses against `pass_criteria` from `pwp_mastery_quizzes`
- [ ] On pass: update `pwp_user_progress.quizzes_passed`, award badge
- [ ] On fail: allow retry (max 2 attempts before auto-pass with encouragement)

**DB:** `pwp_mastery_quizzes` has `title`, `description`, `prompt_count`, `sample_prompts[]`, `pass_criteria`.

---

### 🔜 Phase 6 — Paragraph Phase Polish
**Goal:** Levels 29–35 have `paragraph_phase = true`. Lead/Support/Close structure needs a clear visual flow.

**Tasks:**
- [ ] In StepSession, detect paragraph steps more reliably (not just mod 3)
- [ ] Add `leadSentence` state that persists across support + close steps in the same paragraph group
- [ ] Show a paragraph assembly panel (lead + support + close building up as a block)
- [ ] Allow pupil to review assembled paragraph before advancing

**Note:** `PhaseDFreeMode` already accepts `paragraphPart` and `leadSentence` props — just needs better orchestration in StepSession.

---

### 🔜 Phase 7 — Teacher Live View
**Goal:** Teachers can see per-pupil PWP progress and override the word bank phase.

**Tasks:**
- [ ] Add PWP tab to teacher class view (wrife.co.uk dashboard)
- [ ] Query `pwp_user_progress` by user_id (linked to pupil profile)
- [ ] Show: current level, XP, streak, levels completed
- [ ] Allow teacher to set `word_bank_override` on `pwp_user_progress`
- [ ] Traffic-light: green (on track), amber (stuck), red (not started)

**Note:** Requires linking PWP anonymous user IDs to platform pupil IDs — needs a join table or storing Supabase Auth UID in `pwp_user_progress.user_id` when pupil is logged in.

---

### 🔜 Phase 8 — Proper Chip Bank (PhaseA/B)
**Goal:** Wire `PhaseABuildMode` and `PhaseBGapMode` with real word bank data.

**Tasks:**
- [ ] Add `step_config_json` column to `pwp_steps`
- [ ] Seed config for all 196 steps (bankWords[], gapSlots[])
- [ ] Update level API to return `step_config_json` alongside each step
- [ ] In StepSession, detect phase and pass bankWords + gapSlots to PhaseABuildMode / PhaseBGapMode
- [ ] Update assessment: Phase A uses exact normalized match (not AI)

**Note:** `PhaseABuildMode` and `PhaseBGapMode` components are complete and tested — they just need structured data.

---

## CSS Token Reference

```css
/* Word class colours */
--pwp-wc-determiner / --pwp-wc-determiner-soft
--pwp-wc-noun / --pwp-wc-noun-soft
--pwp-wc-verb / --pwp-wc-verb-soft
--pwp-wc-adjective / --pwp-wc-adjective-soft
--pwp-wc-adverb / --pwp-wc-adverb-soft
--pwp-wc-pronoun / --pwp-wc-pronoun-soft
--pwp-wc-preposition / --pwp-wc-preposition-soft
--pwp-wc-conjunction / --pwp-wc-conjunction-soft

/* Subject chip */
--pwp-subject-chip / --pwp-subject-chip-soft

/* Tray */
--pwp-tray-bg / --pwp-tray-border

/* New element highlight */
--pwp-new-element
```

---

## TypeScript Types Quick Reference

All types in `types/pwp2.ts`:

- `WordClass` — union of 9 word class strings
- `WordBankPhase` — `'build' | 'gap' | 'anchor' | 'free'`
- `StepType` — `'new' | 'consolidation' | 'applied' | 'paragraph'`
- `PwpLevel`, `PwpStep`, `PwpMasteryQuiz` — DB row shapes
- `PwpUserProgress`, `PwpStepAttempt` — progress/attempt rows
- `BankWord`, `TraySlot`, `GapSlotData`, `TrayToken` — chip bank UI shapes
- `FeedbackResult`, `FeedbackState` — assessment result shapes
- `LevelWithSteps`, `AttemptRequest`, `AttemptResponse` — API shapes
