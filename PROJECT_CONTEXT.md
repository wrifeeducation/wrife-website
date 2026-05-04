# WriFe Platform
*Last updated: 2026-05-04 · Session 20*

## Current state
Chromatic Momentum redesign (Phases 1–6) is fully merged to `main` and live on wrife.co.uk. Landing page, teacher dashboard, pupil dashboard, and login pages are all deployed. Interactive Practice (Phase 6 lesson nav bar + HUD + World Map headers) and PWP Studio (brand token alignment + branded nav bars) are also deployed. One known cosmetic quirk: the homepage shows the compact authenticated nav when logged in — a redirect fix is pending.

## Next Steps
1. **Add logged-in redirect:** `app/page.tsx` — redirect teachers to `/dashboard` when authenticated, so they never see the homepage with the compact nav
2. **Smoke test all three apps** as Amadeo B end-to-end (pupil login → IP lesson → PWP daily practice)
3. **Next feature work** — TBD

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

---

## Session Log

| # | Date | Summary |
|---|------|---------|
| 20 | 2026-05-04 | Phase 6 IP + PWP redesign deployed; wrife.co.uk feat/redesign merged to main; hero sizing restored to prototype spec; demo section fixed to 4 cards |
| 19 | 2026-05-04 | Phase 5 pupil dashboard: slim purple nav, XP bar, 4 stat cards, 6-app grid, Today's Tasks section; verified on Vercel preview as Amadeo B |
| 18 | 2026-05-04 | Phase 4 teacher dashboard: DashboardShell (purple sidebar + white top bar), overview with stat cards and class cards committed and verified |
| 17 | 2026-05-04 | Chromatic Momentum redesign: Navbar, Hero, DemoSection, both login pages rebuilt; scale fixed; landing page approved at 100% zoom |
| 16 | 2026-05-03 | E2E test fixed 3 missing DB tables; font sizes improved platform-wide; password management streamlined |
| 15 | 2026-05-03 | PWP Phase C complete: chain streak, level distribution chart, weekly theme wired to Free Practice |
