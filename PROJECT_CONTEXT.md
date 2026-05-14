# WriFe Platform
*Last updated: 2026-05-14 · Session 35*

---

## ⚠️ CRITICAL ARCHITECTURAL RULE — READ BEFORE TOUCHING ANYTHING

**PWP Studio (`pwp-studio.wrife.co.uk`) does NOT live in this repo.**

This repo (`wrife-website`) is for **wrife.co.uk only** — the teacher dashboard, admin panel, and marketing site. It is a Next.js app.

PWP Studio is a **separate Vite/React SPA** in the `wrifeapp` repository. It is deployed independently at `pwp-studio.wrife.co.uk`.

**What this means in practice:**
- Do NOT create `app/pwp/` routes here. They will be deleted.
- Do NOT create `components/pwp2/` here. They will be deleted.
- The `components/pwp/` folder that exists here contains teacher-dashboard display components only (review modals, chain tabs). It is NOT the PWP app.
- The `app/api/pwp/` folder here contains teacher-facing API routes only. It is NOT the PWP app backend.
- If asked to work on the PWP pupil experience, the writing steps, the world map, or the level system — **stop and ask the user to connect the `wrifeapp` folder instead.**

This rule exists because a previous session built an entire `app/pwp/` implementation inside wrife-website by mistake. It wasted a full day and had to be surgically removed (git reset to `375d29d`, 2026-05-13).

---

## Current state
Five issues addressed this session: admin user creation now supports teachers (via invite-teacher flow); the Presentations tab was broken due to a fresh Supabase client being created instead of using the shared `adminFetch` helper (now fixed); the landing page product tiles updated to link to the actual sub-apps with correct CTAs; PWP progress was silently failing on `.update()` when no `formula_progress` row existed for new pupils (changed to `.upsert()`); and a full school registration flow was built (public form, admin review panel, bulk CSV teacher import).

## Next Steps
1. **Apply DB migration** — run `supabase/migrations/20260511_school_registrations.sql` against `gzmgjkbtsvezfclmreru` to create the `school_registrations` table
2. **Apply Supabase migration** — `20260511000001_ai_attempts.sql` still needs to be pushed: `npx supabase db push --project-id gzmgjkbtsvezfclmreru`
3. **Deploy assess-formula Edge Function** — `npx supabase functions deploy assess-formula --project-id gzmgjkbtsvezfclmreru`
4. **Stripe + Route C backend** — parent home sign-up redirects to `/pricing` but the Stripe webhook that provisions pupil credentials after payment is not yet built
5. **Consume learning_events on wrife.co.uk** — teacher class view should query `learning_events` to show IP + PWP completions alongside assignment data
6. **First paying school onboarding** — upgrade WriFe Platform Supabase to Pro (£22/month) to prevent auto-pause

## Key Decisions
- **difficulty_profile is a rolling window of 5 scores** stored on `formula_progress`; `ready_to_advance = true` when last 3 scores all > 95.
- **formula_progress uses upsert, not update** — changed in FormulaPage.tsx (both handleSubmit and handleLensLabSubmit) to handle new pupils with no existing row.
- **Admin user creation** now routes teacher creation through `/api/admin/invite-teacher` (sends welcome email). Pupil management stays per-class in the school detail pages.
- **School registrations** stored in `school_registrations` table; reviewed by admin at `/admin/registrations`; public form at `/school-register`.
- **Bulk teacher import** — CSV upload on school users page (First Name, Last Name, Email); invites each teacher via the existing invite-teacher API.
- **ai_attempts table** (wrifeapp migration) logs every assess-formula call with `difficulty_level INTEGER`.
- **Ready to Advance badge** rendered in `PWPStudioTab` — green pill, sourced from `formula_progress.ready_to_advance`.
- **Share links** served via SECURITY DEFINER RPC `get_portfolio_by_share_token`.
- **Login routing rule:** wrife.co.uk is the sole login point for school pupils.

## Files & Locations
- `app/admin/lessons/presentations/page.tsx` — fixed broken auth header (now uses `adminFetch`)
- `app/admin/users/page.tsx` — added teacher role to create form, routed to invite-teacher API, bulk link added
- `app/admin/page.tsx` — added Registrations button linking to `/admin/registrations`
- `app/admin/registrations/page.tsx` — NEW: admin review panel for school registrations
- `app/admin/schools/[id]/users/page.tsx` — added bulk CSV teacher import with progress display
- `app/school-register/page.tsx` — NEW: public school registration webform
- `app/api/school-register/route.ts` — NEW: public API for registration submissions
- `app/api/admin/registrations/route.ts` — NEW: admin CRUD for school registrations
- `supabase/migrations/20260511_school_registrations.sql` — NEW: table + RLS for school_registrations
- `components/landing/ProductTilesSection.tsx` — updated tiles to link to sub-apps with correct CTAs
- `wrifeapp/src/pages/FormulaPage.tsx` — fixed progress save: `.update()` → `.upsert()` in both submit handlers

## Architecture
- wrife.co.uk → teacher dashboard + admin (Platform DB `gzmgjkbtsvezfclmreru`) — **THIS REPO**
- practice.wrife.co.uk → Interactive Practice — **InteractivePracticeApp repo** (Vite)
- pwp-studio.wrife.co.uk → PWP Studio — **wrifeapp repo** (Vite/React SPA) — NOT THIS REPO
- Pool: `max: 2` in `lib/db.ts` — critical for free-tier Supabase connections

## Test Credentials
- **Pupil:** Amadeo B · Silver Birch Y4 · SIL42495 / amab04 / 9543
- **Teacher:** mankrah@kafed.org.uk / niiotin99

---

## Session Log

| # | Date | Summary |
|---|------|---------|
| 35 | 2026-05-14 | Surgically removed mistaken app/pwp/ + components/pwp2/ build from wrife-website (git reset --hard 375d29d, force-pushed). Added viewport export to app/layout.tsx. |
| 34 | 2026-05-11 | Fixed presentations auth, admin user creation for all types, product tiles, PWP progress save bug, school registration flow + bulk CSV import |
| 33 | 2026-05-11 | Sprint 5 + Sprint 6 complete: portfolio table, shareable links, difficulty_profile rolling window, ready_to_advance badge, ai_attempts logging |
| 32 | 2026-05-09 | wrife-brand-ecosystem skill updated: Route B retired for school pupils; formula_progress documented as primary PWP progress table |
| 31 | 2026-05-09 | PWP dashboard crash fixed: coins column added; null guards deployed |
| 30 | 2026-05-07 | Formula Practice 3-bug fix + assess-formula model changed to claude-3-5-haiku-20241022 |
