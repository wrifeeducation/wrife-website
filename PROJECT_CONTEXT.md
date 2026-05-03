# WriFe Platform
*Last updated: 2026-05-03 · Session 12*

## Current state
Full-stack Next.js educational platform at wrife.co.uk and PWP Studio at pwp.studio.wrife.co.uk. Both deployed on Vercel, sharing Supabase Platform (`gzmgjkbtsvezfclmreru`).

**Phase A of PWP Daily Chain Practice is built and ready to deploy.**

### What was built in this session (Phase A):
1. **DB migration applied** — 4 new tables live on Platform DB:
   - `pwp_pupil_levels` — one row per pupil × class, tracks current_level + mastery_points
   - `pwp_chain_sessions` — one daily session record per pupil (UNIQUE pupil_id, session_date)
   - `pwp_chain_sentences` — individual sentence submissions within a session
   - `pwp_class_themes` — optional weekly theme set by teacher

2. **PWP Studio (wrifeapp)** — new files:
   - `src/lib/chain/formulaDefinitions.ts` — L1–L10 patterns, hints, examples
   - `src/lib/chain/parseSentence.ts` — rule-based POS tagger
   - `src/lib/chain/validateChainSentence.ts` — sentence validator against formula pattern
   - `src/components/chain/SubjectPicker.tsx` — subject noun input with theme hints
   - `src/components/chain/ChainBuilder.tsx` — orchestrates chain L1→Ln
   - `src/components/chain/ChainRow.tsx` — one level row (input, tick, hint, error)
   - `src/components/chain/SessionComplete.tsx` — celebration screen (25 XP, streak, summary)
   - `src/pages/DailyPracticePage.tsx` — `/daily-practice` route (picks subject → chains → saves)
   - `src/App.tsx` — added `/daily-practice` route (ProtectedRoute, Role.PUPIL)
   - `src/types/index.ts` — added ChainRowState, ChainSessionSave, ChainSentenceSave, PupilChainLevel

3. **wrife.co.uk** — new/changed files:
   - `components/PWPChainTab.tsx` — teacher completion grid (today's status per pupil)
   - `app/api/teacher/pwp/class-summary/route.ts` — GET endpoint for completion grid
   - `app/classes/[id]/page.tsx` — added "🔗 PWP Chain" tab

### Decisions made (open questions now resolved):
- One daily chain session per day (UNIQUE constraint kept)
- L1 unlocked by default — no minimum level gate
- 25 XP flat per completed chain session

### Free Practice / differentiation (scoped for Phase C):
- Unlimited additional "free practice" sessions — different subjects, lighter XP (5 XP/sentence)
- Help mode: word class colour bands visible in free practice only
- Challenge preview: L(n+1) sentence offered at end of free practice (bonus 10 XP)
- Separate `pwp_free_practice_sentences` table (no UNIQUE constraint)

## Next steps
1. **Commit and push both repos**:
   - wrifeapp: `git add -A && git commit -m "feat(chain): Phase A PWP daily chain practice" && git push`
   - wrife-website: `git add -A && git commit -m "feat(chain): Phase A teacher PWP chain tab + DB migration" && git push`
2. **Add "Daily Practice" CTA button** to the pupil dashboard in wrifeapp (DashboardPage.tsx)
3. **Seed L1 pwp_pupil_levels** — new pupils start at L1 automatically once they open /daily-practice, but an explicit "Set PWP level" UI in teacher class page would help for classes already in progress
4. **Phase B** — mastery signal display + "Advance to L(n+1)" button, extend formula hints to L11–L30
5. **Phase C** — weekly theme setter, streak on pupil dashboard, free practice mode

## Architecture decision (2026-05-02)
**wrifeapp** is the PWP Studio codebase (`pwp.studio.wrife.co.uk`). The three apps share one Supabase Platform project:
- wrife.co.uk → teacher dashboard + admin (Platform DB)
- practice.wrife.co.uk → Interactive Practice (Platform DB ✅)
- pwp.studio.wrife.co.uk → PWP Studio (Platform DB ✅)

## Session collision fix (deployed 2026-05-03, commit 959ed30)
Pupil SSO tokens are stored in `localStorage` under `pupilSSOTokens` only — never via `supabase.auth.setSession()`. This prevents the teacher's auth cookie on wrife.co.uk from being overwritten.
`lib/pupil-sso.ts` reads from `localStorage.pupilSSOTokens` to build cross-domain hash URLs.

## Process — Post-phase smoke testing
After every phase: teacher login → class page → new tab → assign something → pupil login → pupil dashboard → complete activity → check it saved.
