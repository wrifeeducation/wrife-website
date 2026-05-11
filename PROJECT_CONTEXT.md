# WriFe Platform
*Last updated: 2026-05-11 · Session 34*

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
- wrife.co.uk → teacher dashboard + admin (Platform DB `gzmgjkbtsvezfclmreru`)
- practice.wrife.co.uk → Interactive Practice (Platform DB ✅)
- pwp.studio.wrife.co.uk → PWP Studio (Platform DB ✅)
- Pool: `max: 2` in `lib/db.ts` — critical for free-tier Supabase connections

## Test Credentials
- **Pupil:** Amadeo B · Silver Birch Y4 · SIL42495 / amab04 / 9543
- **Teacher:** mankrah@kafed.org.uk / niiotin99

---

## Session Log

| # | Date | Summary |
|---|------|---------|
| 34 | 2026-05-11 | Fixed presentations auth, admin user creation for all types, product tiles, PWP progress save bug, school registration flow + bulk CSV import |
| 33 | 2026-05-11 | Sprint 5 + Sprint 6 complete: portfolio table, shareable links, difficulty_profile rolling window, ready_to_advance badge, ai_attempts logging |
| 32 | 2026-05-09 | wrife-brand-ecosystem skill updated: Route B retired for school pupils; formula_progress documented as primary PWP progress table |
| 31 | 2026-05-09 | PWP dashboard crash fixed: coins column added; null guards deployed |
| 30 | 2026-05-07 | Formula Practice 3-bug fix + assess-formula model changed to claude-3-5-haiku-20241022 |
