# WriFe Platform
*Last updated: 2026-05-18 · Session 41*

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
Teacher dashboard is live with improved visual hierarchy and correct app URLs. The `learning_events` bridge is now fully consumed — `ClassActivityPanel` shows PWP, IP, and DWP per-pupil data in the teacher class view. All 365 DWP daily prompts are seeded in the live database. PWP Studio service worker now has NetworkOnly rules for `/functions/` and `/auth/` so the SW never intercepts Supabase Edge Function or auth calls.

## Next Steps (Session 41 priority order)
1. 🔴 **Fix learning_events CHECK constraint** — must run before resources.wrife.co.uk deploys:
   ```sql
   ALTER TABLE learning_events DROP CONSTRAINT IF EXISTS learning_events_app_check,
   ADD CONSTRAINT learning_events_app_check CHECK (app IN ('pwp', 'ip', 'dwp', 'resources'));
   ```
2. **Deploy resources.wrife.co.uk** — all 9 AI tools built (Session 6). git push + Vercel deploy + domain config.
3. **Integrate Stripe into resources.wrife** — estimated pricing: £4.90/mo standard, £9.90/mo full; school licence via school subscription.
4. **Delete legacy Supabase projects** — export schema, then delete `rxmitjrbrsqjeymsycoj` and `nxhkpqngnxshgotvuujb`.
5. **Apply DB migration** — `supabase/migrations/20260511_school_registrations.sql` against `gzmgjkbtsvezfclmreru`
6. **Apply Supabase migration** — `20260511000001_ai_attempts.sql`: `npx supabase db push --project-id gzmgjkbtsvezfclmreru`
7. **Deploy assess-formula Edge Function** — `npx supabase functions deploy assess-formula --project-id gzmgjkbtsvezfclmreru`
8. **Sync local DWP Edge Function source files** — `dwp-assess`, `dwp-tts-feedback`, `pupil-create`
9. **Stripe + Route C backend** — parent home sign-up webhook → pupil provisioning not fully built
10. **First paying school onboarding** — upgrade WriFe Platform Supabase to Pro (£22/month)
11. **Correct lesson year_group data** — L27+ records have wrong year_group_max (≤5); should be up to year 8
12. **`dwp_transfer_gap_metrics` table** — skipped due to `pupils.class_id` INTEGER / `classes.id` UUID mismatch

## Key Decisions
- **DWP shares the platform Supabase project** (`gzmgjkbtsvezfclmreru`) — not its own isolated project.
- **DWP RLS policies use auth_user_id join** — `pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid())` — NOT `pupil_id = auth.uid()`.
- **`home_accounts_app_origin_check`** constraint includes 'dwp': `CHECK (app_origin IN ('pwp', 'ip', 'dwp'))`.
- **DWP writes `learning_events`** with `app = 'dwp'`, event types `level_completed` and `daily_prompt_submitted`.
- **learning_events consumed in ClassActivityPanel** — three app tabs (PWP / IP / DWP) visible per pupil in teacher class view; JOIN is `class_members → pupils → learning_events`.
- **DWP daily prompts** — 365 prompts in 5 categories (sensory 60, narrative 105, reflection 60, description 80, argument 60) seeded live with `ON CONFLICT (prompt_slug) DO NOTHING`.
- **Workbox NetworkOnly** — `wrifeapp/vite.config.ts` has NetworkOnly rules for `/functions/` and `/auth/` Supabase endpoints; prevents SW from intercepting Edge Function calls.
- **CORS standard for ALL WriFe Edge Functions:** must include `authorization, x-client-info, apikey, content-type`. Missing `apikey` causes silent `TypeError: Failed to fetch`.
- **Login routing rule:** wrife.co.uk is the sole login point for school pupils.
- **Admin user creation** routes teacher creation through `/api/admin/invite-teacher` (sends welcome email).
- **School registrations** stored in `school_registrations` table; reviewed at `/admin/registrations`; public form at `/school-register`.
- **difficulty_profile** is a rolling window of 5 scores on `formula_progress`; `ready_to_advance = true` when last 3 scores all > 95.

## Files & Locations

### Session 41 — Pupil dashboard design world upgrade + master skill (2026-05-18)
- `app/pupil/dashboard/page.tsx` — full wrife-design-world upgrade: white background, Pattern 1 purple hero banner with level/streak/XP chips, `max-w-4xl` container (was `max-w-3xl`), Pattern 2 border-bottom CTAs on all app tiles, full-width header with inner max-w-4xl, `w-full` on sticky nav
- `WRIFE_MASTER_SKILL_DRAFT.md` (wrife-website) + `wrife-brand-ecosystem.skill` — merged wrife-brand-ecosystem + wrife-app-architecture into one mandatory session primer; packaged as installable .skill file
- ⚠️ **DWP SSO broken** — `buildSSOUrl` emits correct hash URL but `dailywrite.wrife.co.uk` (wrife-dwp repo) does not have hash-token detection. Need to add `onAuthStateChange` hash listener to wrife-dwp app init.
- ⚠️ **PWP ← WriFe button failing** — `entryViaHub` detection is in wrifeapp. Possible URL bug (must link to `https://wrife.co.uk/pupil/dashboard` not root).
- ⚠️ **Interactive Practice "page can't be reached"** — `practice.wrife.co.uk` appears to be down or not deployed. Check Vercel / InteractivePracticeApp repo.

### Session 39 — Close all critical gaps (2026-05-17)
- `app/api/teacher/class-activity/route.ts` — added DWP aggregates (`dwp_levels_completed`, `dwp_total_xp`, `dwp_last_active`) to per-pupil SQL query
- `components/ClassActivityPanel.tsx` — DWP interface fields, stat chips, table column, activity feed labels for DWP event types
- `wrifeapp/vite.config.ts` — added NetworkOnly rules for `/functions/` and `/auth/` before the NetworkFirst REST rule
- `dwp_daily_prompts` (DB, `gzmgjkbtsvezfclmreru`) — 365 prompts seeded live

### Session 38 — Dashboard visual improvements (2026-05-17)
- `app/dashboard/page.tsx` — PWP Studio URL fixed; AI Writing Tools "Soon" badge; larger fonts/bars/buttons throughout. **Deployed Session 39.**

### Session 37 — Auth sweep + CORS fix (2026-05-17)
- `wrifeapp/src/pages/LoginPage.tsx` — fixed field names + response path
- All 4 wrife-dwp Edge Functions — CORS `apikey` header fix (deployed)
- `wrifeapp/skills/wrife-auth-sweep/SKILL.md` — NEW post-deploy auth validation skill

### Session 36 — DWP Integration (2026-05-16)
- All DWP tables created in shared project + RLS secured; `dwp_levels` (40 seeded), `dwp_feature_taxonomy` (20 seeded)
- `app/pupil/dashboard/page.tsx` — DWP tile uses `<a href={dwpUrl}>` (Route A SSO)

## Architecture
- wrife.co.uk → teacher dashboard + admin (Platform DB `gzmgjkbtsvezfclmreru`) — **THIS REPO**
- practice.wrife.co.uk → Interactive Practice — **InteractivePracticeApp repo** (Vite)
- pwp-studio.wrife.co.uk → PWP Studio — **wrifeapp repo** (Vite/React SPA) — NOT THIS REPO
- dailywrite.wrife.co.uk → DWP — **wrife-dwp repo** (Vite/React SPA) — NOT THIS REPO
- resources.wrife.co.uk → Learning Toolkit — **resources.wrife repo** (Next.js 14) — NOT THIS REPO
- All sub-apps share **one Supabase project**: `gzmgjkbtsvezfclmreru`
- Pool: `max: 2` in `lib/db.ts` — critical for free-tier Supabase connections

## Schema Notes (shared DB gotchas)
- `pupils.class_id` is **INTEGER** but `classes.id` is **UUID** — legacy mismatch, do NOT join them directly
- `home_accounts` uses `home_account_id` (not `owner_id`) for class ownership
- `pupil_parent_links` uses `parent_auth_id` (not `parent_account_id`)
- DWP RLS policies must use `pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid())` — never `pupil_id = auth.uid()`

## Test Credentials
- **Pupil:** Amadeo B · Silver Birch Y4 · SIL42495 / amab04 / 9543
- **Teacher:** mankrah@kafed.org.uk / niiotin99

---

## Session Log

| # | Date | Summary |
|---|------|---------|
| 39 | 2026-05-17 | Closed all 3 critical gaps: learning_events consumed in ClassActivityPanel (PWP+IP+DWP per pupil); 365 DWP daily prompts seeded live; workbox NetworkOnly rules added to wrifeapp. Dashboard changes from Session 38 deployed. |
| 38 | 2026-05-17 | Teacher dashboard: fixed PWP Studio URL (dot→hyphen), disabled AI Writing Tools with 'Soon' badge, improved visual hierarchy. Platform architecture diagram + 11-item gap analysis. |
| 37 | 2026-05-17 | Fixed all WriFe auth failures: PWP LoginPage.tsx field name + response path bugs; CORS `apikey` header missing from all 4 wrife-dwp Edge Functions; confirmed live login working. |
| 36 | 2026-05-16 | Full DWP integration: rewrote .env, created all DWP tables + RLS in gzmgjkbtsvezfclmreru (40 levels seeded), fixed app_origin constraint, updated pupil dashboard SSO link. |
| 35 | 2026-05-14 | Surgically removed mistaken app/pwp/ + components/pwp2/ build from wrife-website (git reset --hard 375d29d). Added viewport export to app/layout.tsx. |
