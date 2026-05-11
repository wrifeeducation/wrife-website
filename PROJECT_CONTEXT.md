# WriFe Platform
*Last updated: 2026-05-09 · Session 31*

## Current state
All auth routes (A, B, C, D) are live and verified. The `learning_events` bridge is now fully wired in both sub-apps. PWP Studio dashboard is live and loading correctly after a `coins` column was added to `formula_progress` and a defensive null-guard fix was deployed to `DashboardPage.tsx`.

## Next Steps
1. **Retire Route B for school pupils** — Sub-app direct login forms (pwp-studio + IP `/login`) should reject school pupils and redirect to wrife.co.uk. Only home learners (Route C) and independent teacher pupils (Route D) should log in directly on sub-apps.
2. **Clarify `pwp_pupil_progress` vs `formula_progress`** — Both tables track overlapping PWP progress data. `formula_progress` is what the PWP dashboard queries; `pwp_pupil_progress` exists but is not yet wired to the UI. Decide whether to consolidate or keep them separate.
3. **Stripe + Route C backend** — Parent home sign-up collects child info and redirects to `/pricing`, but the Stripe webhook that provisions pupil credentials after payment is not yet built.
4. **Route C for IP** — `practice.wrife.co.uk/home-signup` page exists but the home-learner PIN login path through the `pupil-login` Edge Function needs testing with a real home class.
5. **Consume learning_events on wrife.co.uk** — Teacher class view should query `learning_events` to show IP lesson completions and PWP session counts alongside the existing assignment submission data.
6. **First paying school onboarding** — Upgrade WriFe Platform Supabase to Pro (£22/month) to prevent auto-pause.

## Key Decisions
- **Login routing rule (2026-05-09):** wrife.co.uk is the sole login point for school pupils. Sub-apps (PWP Studio, Interactive Practice) handle sign-up and login ONLY for their own direct users — home learners (Route C) and independent teachers (Route D). Route B for school pupils is being retired to eliminate session confusion and stale localStorage issues.
- **formula_progress is the PWP dashboard's progress table:** `DashboardPage.tsx` queries `formula_progress` (not `pwp_pupil_progress`). When adding new gamification columns (e.g. `coins`), add them to `formula_progress` with a `DEFAULT` value so all existing and future pupils are covered automatically.
- **Separate login pages:** Teacher = professional split-screen; Pupil = game entry screen. Unified page rejected as unsuitable for primary-age users.
- **DashboardShell:** Purple sidebar (w-48) + white top bar wrapper used for teacher dashboard; lazy-loaded.
- **Pupil dashboard nav:** Slim 52px purple nav (no full Navbar) — WriFe logo left, streak + sentences pills right, log out link.
- **XP bar proxy:** `totalSentences % 100` used as XP-within-level progress. 100 sentences = 1 level.
- **Base font 16px:** Correct value — 17px caused oversized appearance at 100% zoom.
- **Hero sizing:** `xl:text-7xl`, mascot container `lg:460×520px`, central circle 260px, `pt-20` desktop padding — matches prototype at 100% zoom.
- **Demo section:** 4 cards only (`InteractivePracticeDemo`, `TeacherGuideDemo`, `PWPDemo`, `DWPAIDemo`) — 5th card (Presentation) removed to avoid row wrap in Safari.

## Key Decisions
- **Separate login pages:** Teacher = professional split-screen; Pupil = game entry screen. Unified page rejected as unsuitable for primary-age users.
- **DashboardShell:** Purple sidebar (w-48) + white top bar wrapper used for teacher dashboard; lazy-loaded.
- **Pupil dashboard nav:** Slim 52px purple nav (no full Navbar) — WriFe logo left, streak + sentences pills right, log out link.
- **XP bar proxy:** `totalSentences % 100` used as XP-within-level progress. 100 sentences = 1 level.
- **PWP Level display:** Derived from `Math.max(...pwpAssignments.map(a => a.level_to))` — highest assigned level.
- **feat/redesign branch:** All redesign work isolated; production (`main`) untouched until all phases approved.
- **CSS auto-fill grid:** `minmax(240px, 1fr)` for 6-app card grid, robust at all viewports.
- **Base font 16px:** Changed from 17px — 17px caused oversized appearance at 100% zoom.

## Files & Locations (Redesign)
- `components/Navbar.tsx` — Purple sticky nav (landing page / teacher views)
- `components/HeroSection.tsx` — Typewriter + mascot constellation + portal cards
- `components/landing/DemoSection.tsx` — 4-card grid, brand-aligned
- `components/dashboard/DashboardShell.tsx` — Teacher dashboard sidebar + top bar shell
- `app/page.tsx` — Landing page (DemoSection restored)
- `app/dashboard/page.tsx` — Teacher dashboard (Phase 4 rewrite, uses DashboardShell)
- `app/pupil/dashboard/page.tsx` — Pupil dashboard (Phase 5 rewrite, slim nav + new layout)
- `app/pupil/login/page.tsx` — Playful game-entry login redesign
- `app/login/page.tsx` — Split-screen professional login redesign
- `styles/globals.css` — 16px base font, float animation keyframes, typewriter cursor

## Architecture
- wrife.co.uk → teacher dashboard + admin (Platform DB `gzmgjkbtsvezfclmreru`)
- practice.wrife.co.uk → Interactive Practice (Platform DB ✅)
- pwp.studio.wrife.co.uk → PWP Studio (Platform DB ✅)
- Pool: `max: 2` in `lib/db.ts` — critical for free-tier Supabase connections
- Pupil auth: `localStorage` `pupilSession` key only (no Supabase cookie)
- SSO links: `buildSSOUrl()` from `lib/pupil-sso.ts`

## Test Credentials
- **Pupil:** Amadeo B · Silver Birch Y4 · SIL42495 / amab04 / 9543 (47 tasks, PWP L15)
- **Teacher:** mankrah@kafed.org.uk / niiotin99

## Open Questions / Future Architecture

### B2C Individual Plan (parent/teacher buys for one child)
The current architecture is school/class-centric — pupils MUST belong to a class to log in (the `pupil-login` Edge Function joins on `class_members`). This means the individual plan model is not yet supported. What needs building:

- **Parent → child provisioning:** When a parent completes Stripe checkout, a webhook should create a "home class" (or class-free pupil record) and return credentials to the parent
- **Class-free login path:** Either remove the class code requirement for home-use pupils, or auto-assign them to a virtual home class on signup
- **Parent dashboard:** A view where the parent logs in and can see their child's progress (the parent auth form exists in wrifeapp but the backend is not wired up)
- **Stripe webhook integration:** The parent sign-up flow in wrifeapp already collects child name/year group and redirects to `/pricing` — the missing piece is the Stripe webhook that fires after payment and provisions the account

**Decision needed:** Should home-use pupils log in with class code + username + PIN (same as school pupils, with a generated class code), or should there be a separate parent-launches-child-session model where the parent authenticates and hands off to the child?

---

## Session Log

| # | Date | Summary |
|---|------|---------|
| 32 | 2026-05-09 | wrife-brand-ecosystem skill updated: Route B retired for school pupils; `formula_progress` documented as primary PWP progress table; `NOT NULL DEFAULT` rule added for gamification columns; cross-app checklist updated. |
| 31 | 2026-05-09 | PWP dashboard crash fixed: added `coins INTEGER DEFAULT 0` to `formula_progress`; added null guards to `DashboardPage.tsx` stats fields; deployed to Vercel. Diagnosed 3x pupil-login 500 errors (transient, self-resolved). Architectural decision: wrife.co.uk is sole login for school pupils; sub-apps handle direct sign-up only. |
| 30 | 2026-05-07 | Formula Practice 3-bug fix: (1) DefinitionUnlock voice overlap removed — gated to screen !== 'intro'; (2) TTS default changed to off; (3) ConceptCard now shows technical definition first (e.g. "A noun is...") with plain-English alias second; (4) assess-formula Edge Function v5 deployed — model changed from claude-haiku-4-5-20251001 (502) to claude-3-5-haiku-20241022 |
| 29 | 2026-05-07 | learning_events wired in both sub-apps: IP inserts lesson_completed + world_completed; PWP inserts formula_completed, chain_session_completed, free_practice_session; new insertLearningEvent helpers in progress.ts (IP) and learningEvents.ts (PWP) |
| 28 | 2026-05-07 | Full E2E auth test (#140) passed: Route A hub SSO (wrife.co.uk → IP + PWP with JWT hash), Route B direct login on both sub-apps, Route D teacher sign-up, teacher SSO deep-links — all verified; one minor bug (← WriFe shows unconditionally in PWP Studio) |
| 27 | 2026-05-07 | Auto-submit E2E verified: fixed 2 recursive RLS policies (school_admins + pupils) that caused autoSubmitAssignment to silently fail; Assignments tab now shows 1/25 submitted after pupil completes lesson |
| 26 | 2026-05-07 | Full cross-app E2E test completed: teacher assigns PWP+IP, pupil completes via SSO, teacher sees progress — core flow confirmed working; 4 bugs documented in docs/e2e-test-2026-05-07.md |
| 25 | 2026-05-07 | Route C live on both apps: /home-signup on wrifeapp + IP app (cross-origin handoff via ?nc= param); PLATFORM_STATUS.md created and mirrored in all 3 repos |
| 24 | 2026-05-07 | Direct sign-up framework: home_accounts, learning_events, pupil_parent_links tables live on Platform DB; classes+pupils extended; wrife-brand-ecosystem plugin installed globally |
| 23 | 2026-05-04 | Fixed direct pupil login on pwp-studio: replaced PIN-only form with 3-field (class code + username + PIN) calling pupil-login Edge Function; deployed |
| 22 | 2026-05-04 | Formula Practice fixed: created formula_progress table, renamed 30 queries across 17 files, seeded existing pupils, added formula_levels RLS read policy — verified working |
| 21 | 2026-05-04 | Homepage redirect added; all 6 teacher dashboard tabs audited; Progress Report 500 fixed (PWP schema mismatch); duplicate PWP assignment cleaned up |
| 20 | 2026-05-04 | Phase 6 IP + PWP redesign deployed; wrife.co.uk feat/redesign merged to main; hero sizing restored to prototype spec; demo section fixed to 4 cards |
| 19 | 2026-05-04 | Phase 5 pupil dashboard: slim purple nav, XP bar, 4 stat cards, 6-app grid, Today's Tasks section; verified on Vercel preview as Amadeo B |
| 18 | 2026-05-04 | Phase 4 teacher dashboard: DashboardShell (purple sidebar + white top bar), overview with stat cards and class cards committed and verified |
| 17 | 2026-05-04 | Chromatic Momentum redesign: Navbar, Hero, DemoSection, both login pages rebuilt; scale fixed; landing page approved at 100% zoom |
| 16 | 2026-05-03 | E2E test fixed 3 missing DB tables; font sizes improved platform-wide; password management streamlined |
| 15 | 2026-05-03 | PWP Phase C complete: chain streak, level distribution chart, weekly theme wired to Free Practice |
