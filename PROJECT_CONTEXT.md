# WriFe Platform
*Last updated: 2026-05-03 · Session 11*

## Current state
Full-stack Next.js educational platform at wrife.co.uk, deployed on Vercel, using Supabase (`gzmgjkbtsvezfclmreru`) for auth and PostgreSQL for data. **Phase 4 complete** — teacher class page now has 🎮 Interactive Practice and ✏️ PWP Studio tabs showing per-pupil cross-app progress. Old scaffold PWP tab removed. New API routes serve data server-side via pg pool.

## Next steps
1. **Commit and push wrife-website** — `git add -A && git commit -m "feat: phase 4 — interactive practice + pwp studio tabs on class page"` then `git push`
2. **Live Stripe test** — sign up as a new parent, subscribe to Pro, verify tier updates in profiles table
3. **SITE_URL secret** — optionally set `SITE_URL=https://pwp-studio.wrife.co.uk` on Platform via Supabase secrets for cleaner email redirect URLs (functions already have correct fallback)
4. **Future Phase 5** — Deeper drill-down: click a pupil in the Interactive Practice tab to see their lesson-by-lesson breakdown

## Architecture decision (2026-05-02)
**PWP Studio (`nxhkpqngnxshgotvuujb`) is the canonical PWP app** — not the wrifeapp codebase, which is scaffolding only and will not progress further. The end state is three apps sharing one Supabase project:
- wrife.co.uk → teacher dashboard + admin (Platform DB)
- practice.wrife.co.uk → Interactive Practice (Platform DB ✅ done)
- pwp-studio.wrife.co.uk → PWP Studio (Platform DB ✅ done)

## Process — Post-phase smoke testing (adopted)
After every phase, run a full smoke test before moving on:
- Auth: login → session token has correct sub (auth.uid() === pupils.id)
- Data: world map loads from DB, lessons and activities load per tier
- Writes: submit an answer → row confirmed in `practice_pupil_responses` on Platform with correct pupil_id, is_correct, xp_awarded
- Verify: SELECT COUNT(*) on migrated tables to confirm expected row counts

## Phase 2 — Unified Auth (fully verified ✅)
- `pupils.auth_user_id` column added → links Platform pupils to Supabase auth users
- `practice_worlds`, `practice_lessons`, `practice_activities`, `practice_pupil_progress`, `practice_pupil_responses`, `practice_badges`, `practice_pupil_badges`, `practice_streaks` tables created on Platform DB with full RLS
- All seeded: 6 worlds, 62 lessons, **1,100 activities (all lessons, all tiers ✅)**, 81 badges (UUIDs preserved from Practice project)
- Compatibility views created for all 7 non-conflicting tables (worlds, activities, pupil_progress, pupil_responses, badges, pupil_badges, streaks) — only `lessons` has no view (conflicts with curriculum lessons table)
- `pupil-login` Edge Function v3 deployed to Platform (`gzmgjkbtsvezfclmreru`) — **CRITICAL FIX in v3**: `createUser` now passes `id: pupil.id` so `auth.uid() === pupils.id` everywhere. Without this, app's pupil_id FK writes were rejected (409) because the app uses `auth.uid()` as `pupil_id`.
- Platform Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...V6uTpnMjz9HYPBYWKnOMXo3VZBqnjB1BRq9S3c05L00`
- **Smoke test passed**: pupil `adadem03` (SIL42495 / PIN 8868) logs in → world map loads → Lesson 1 Bronze activities load → answer saves to `practice_pupil_responses` on Platform with correct `pupil_id`, `is_correct: true`, `xp_awarded: 10`

## Key decisions
- **Report format:** Hybrid — printable HTML page (browser Print → Save as PDF) + server-side Word document via `docx` npm package. No separate PDF library needed.
- **NC level mapping:** Y1=L1–10, Y2=L11–17, Y3=L18–24, Y4=L25–28, Y5=L29–33, Y6=L34–40. Judgement based on highest DWP level passed vs year-group expectation range.
- **No `submissions` table:** Written assignment submissions table does not exist in the DB. The "Written Assignments" pillar was removed from the report; only DWP and PWP are reported.
- **Report auth:** Uses `await createClient()` from `@/lib/supabase/server` (SSR-aware) — not raw Supabase client. All other API routes use the same pattern.
- **Supabase keep-alive:** Scheduled Cowork task runs every Monday 9am — pings `SELECT COUNT(*) FROM profiles` to prevent free-tier pause.
- **db.ts pool max:** Must stay at 2 or below in serverless. Never increase — each Vercel invocation creates its own pool, 10 concurrent users × old max:10 = 100 connections = free-tier exhausted.
- **Integration strategy:** Three separate apps should share the wrife.co.uk Supabase project. Interactive Practice migrates its data to `gzmgjkbtsvezfclmreru`. Teacher dashboard gets a new "Interactive Practice" tab showing cross-app progress.

## Files & locations
- `lib/presentationUtils.ts` — NEW: URL transformer for Google Drive + Supabase .pptx presentation URLs
- `components/PresentationPlayer.tsx` — NEW: In-page fullscreen presentation modal with iframe (ESC to close)
- `components/SmartBoardPresenter.tsx` — NEW: Full-viewport smart board page (no navbar), supports multi-presentation lessons (L66)
- `app/lesson/[id]/present/page.tsx` — NEW: Dedicated smart board route (/lesson/[id]/present)
- `app/admin/lessons/presentations/page.tsx` — NEW: Admin page showing all 68 lessons with ✅/❌ status, upload .pptx + link Google Drive
- `scripts/sync-lesson-files.mjs` — NEW: Bulk upload script — reads WriFe Lessons folder, uploads all files to Supabase, fixes DB records
- `lib/db.ts` — FIXED: Pool max reduced from 10 → 2 to prevent connection exhaustion
- `lib/auth-context.tsx` — FIXED: Added 6-second timeout + graceful degradation for Supabase network failures
- `app/auth/confirm/page.tsx` — handles all token-hash email links (signup, recovery, invite, magiclink)
- `app/signup/page.tsx` — "already registered" error shows friendly card with Sign in / Reset password links
- `app/api/stripe/webhook/route.ts` — `priceIdToTier` fallback map ensures Full Teacher resolves to `full` tier
- `app/classes/[id]/report/page.tsx` — printable NC progress report (HTML + Word download)
- `WriFe-Testing-Plan.md` — full test suite for free teacher, school admin, and pupil flows
- `PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md` — NEW: full architecture audit + 5-phase integration plan

## Open questions
- Stripe payment flow not yet live-tested (waiting on test signup)
- 2 pupils show "Below expectation" despite no DWP data — worth investigating their `year_group` values
- School domain matching (`@kafed.org.uk` → Elfrida Primary) not yet enforced on signup
- Supabase upgrade timing — see PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md Section 8 for advice

---

## Session log

| # | Date | Summary |
|---|------|---------|
| 11 | 2026-05-03 | Phase 4 complete. Removed old scaffold PWP tab from /classes/[id]/page.tsx (all PWPAssignment/PWPSubmission/pwpSessions state + fetch code gone). Added 🎮 Interactive Practice tab + ✏️ PWP Studio tab. New API routes: /api/teacher/interactive-practice (queries practice_pupil_progress + practice_streaks) and /api/teacher/pwp-studio (queries formula_sessions + writing_pieces via pupils.auth_user_id bridge). New components: InteractivePracticeTab.tsx + PWPStudioTab.tsx with class-level stats + per-pupil summary table. |
| 10 | 2026-05-03 | Phase 3 complete. Migrated all PWP Studio reference data to Platform: formula_levels (67 rows), word_banks (257 rows, all 67 levels). Deployed 12 Edge Functions to Platform (assess-formula/paragraph/writing, notify-teacher, stripe-checkout/webhook/portal, admin-action, send-password-reset with URL fix, invite-teacher, create-child-profile, generate-session-content). Switched PWP Studio Vercel env vars to Platform and redeployed. All smoke tests passed. Single-DB architecture now complete. |
| 9 | 2026-05-02 | Investigated Play → navigation bug — root cause was pre-Phase-2 code using `.from('lessons')` on Platform (wrong UUIDs), already fixed by commit 923a0d6. Fixed Profile.name → display_name mismatch across 7 files in InteractivePracticeApp; updated local .env to Platform. TypeScript 0 errors. Committed and pushed. |
| 8 | 2026-05-02 | Migrated all 1,100 activities from Practice (rxmitjrbrsqjeymsycoj) to Platform (gzmgjkbtsvezfclmreru) in 44 × 25-row batches via execute_sql. Platform practice_activities now has full dataset. Post-phase smoke testing formalised as standard process. |
| 7 | 2026-05-02 | Phase 2 smoke tests complete. Found and fixed critical bug: pupil-login Edge Function v2 didn't pass `id: pupil.id` to createUser, so auth.uid() ≠ pupils.id — app's pupil_id writes were rejected with FK violation (409). Fixed in v3. Smoke test passed: login → world map → Lesson 1 Bronze → activity response saved to practice_pupil_responses on Platform. |
| 6 | 2026-05-02 | Phase 2 unified auth: practice_* tables + RLS on Platform DB, seeded 6 worlds/62 lessons/81 badges, 7 compat views, auth_user_id on pupils, pupil-login Edge Function deployed to Platform (auto-provisions auth users on first login). Practice app just needs Vercel env var switch + one `.from('lessons')` rename. |
| 5 | 2026-05-02 | Presentation player system: PresentationPlayer modal, SmartBoardPresenter page, /lesson/[id]/present route, admin presentations manager, sync-lesson-files.mjs bulk upload script. Handles Google Drive and .pptx URLs for all 68 lessons. DB cleanup (bad pptx/docx/html/pdf/xlsx type records removed by sync script). |
| 4 | 2026-05-02 | Full 3-app architecture audit; fixed db.ts pool exhaustion (max:2) and auth-context timeout; produced PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md with 5-phase integration plan |
