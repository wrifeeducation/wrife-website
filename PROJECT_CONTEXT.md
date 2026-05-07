# WriFe Platform
*Last updated: 2026-05-07 · Session 27*

## Current state
All redesign phases (1–6) are live. Auto-submit of IP lesson completions to the teacher's Assignments tab is now working end-to-end — verified: Amadeo completes L1 → submission row created → teacher sees "1/25 submitted". Two Platform DB RLS bugs fixed (infinite recursion in `school_admins` and `pupils` policies). Three bugs remain before live school use.

## Next Steps
1. **Fix Bug #1 (CRITICAL)** — Set `ANTHROPIC_API_KEY` secret on Platform Supabase: `supabase secrets set ANTHROPIC_API_KEY=<key> --project-ref gzmgjkbtsvezfclmreru`. All PWP formula assessments currently return mock score of 70.
2. **Fix Bug #2 (HIGH)** — IP login label "YOUR FIRST NAME" → "YOUR USERNAME" in IP app login component. Causes pupil login failures. File: `InteractivePracticeApp/src/pages/AuthPage.tsx` (or equivalent login component).
3. **Fix Bug #5 (HIGH)** — Progress Report page "Could not load report data." — check `/api/report/[id]/route.ts` query against Platform DB schema, likely a column name mismatch.
4. **Fix Bug #3 (MEDIUM)** — World Map sidebar XP/lessons shows 0 after lesson completion — add DB re-fetch on `WorldMapPage` mount in Zustand `gameStore`.
5. **Build Route D** — independent teacher sign-up on sub-apps
6. **Wire learning_events** — IP and wrifeapp INSERT events on lesson/formula completion

## Key Decisions
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
