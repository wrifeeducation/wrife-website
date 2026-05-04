# WriFe Platform
*Last updated: 2026-05-04 · Session 19*

## Current state
Full-stack Next.js educational platform at wrife.co.uk. The `feat/redesign` branch has completed Phases 1–5 of the "Chromatic Momentum" redesign. Landing page (Phases 1–3), teacher dashboard (Phase 4, DashboardShell + new overview), and pupil dashboard (Phase 5, slim nav + XP bar + 6-app grid + Today's Tasks) are all committed and live on the Vercel preview. Awaiting user approval before merging to `main`.

## Next Steps
1. **Review Phase 5 on preview:** https://wrife-website-pmy7-qa2d3td0a-wrifeeducations-projects.vercel.app/pupil/dashboard (login: SIL42495 / amab04 / 9543)
2. **Phase 6:** Lesson screen redesign in the Interactive Practice repo (separate Vite SPA at practice.wrife.co.uk)
3. **Merge feat/redesign → main** once all phases approved on preview

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
| 19 | 2026-05-04 | Phase 5 pupil dashboard: slim purple nav, XP bar, 4 stat cards, 6-app grid, Today's Tasks section; verified on Vercel preview as Amadeo B |
| 18 | 2026-05-04 | Phase 4 teacher dashboard: DashboardShell (purple sidebar + white top bar), overview with stat cards and class cards committed and verified |
| 17 | 2026-05-04 | Chromatic Momentum redesign: Navbar, Hero, DemoSection, both login pages rebuilt; scale fixed; landing page approved at 100% zoom |
| 16 | 2026-05-03 | E2E test fixed 3 missing DB tables; font sizes improved platform-wide; password management streamlined |
| 15 | 2026-05-03 | PWP Phase C complete: chain streak, level distribution chart, weekly theme wired to Free Practice |
