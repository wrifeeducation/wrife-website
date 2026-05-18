---
name: wrife-brand-ecosystem
description: >
  MANDATORY — load at the start of EVERY session that touches any WriFe app or
  codebase. This is the single master reference for the entire WriFe platform:
  cross-app architecture, the five apps, seven user types, four login routes,
  table ownership rules, the learning_events bridge, canonical tech stack, brand
  & design system, coding conventions, gamification patterns, and development
  isolation. Supersedes wrife-app-architecture (merged into this skill).

  Triggers on: "wrife", "cross-app", "five apps", "three apps", "learning_events",
  "home_accounts", "Route A", "Route B", "Route C", "Route D", "table ownership",
  "pupil login", "home learner", "independent teacher", "Play Store", "PWP Studio",
  "Interactive Practice", "Daily Writing", "DWP", "Learning Toolkit", "resources.wrife",
  "WriFe brand", "WriFe design tokens", "teacher dashboard", "pupil experience",
  "gamification", "build a WriFe app", "new WriFe product", "same stack as WriFe",
  any task spanning more than one WriFe repo, or any architecture/auth/schema question
  about the WriFe platform. Always invoke BEFORE writing any code, schema migration,
  or cross-repo change.
---

# WriFe Platform — Master Reference Skill

**Load this skill at the start of EVERY WriFe session. It is the single source of
truth across all five apps and all seven user types.**

Authoritative long-form reference: `wrife-website/WRIFE_PLATFORM_ARCHITECTURE.html`
(12-tab HTML document — read it for deep detail on any topic).

---

## The Five Apps

All five apps share **one Supabase project: `gzmgjkbtsvezfclmreru` (WriFe Platform)**.
Never target `rxmitjrbrsqjeymsycoj` or `nxhkpqngnxshgotvuujb` — those are retired legacy
projects. **Recommendation: delete both legacy projects to eliminate accidental targeting.**

| App | URL | Repo | Stack | Primary role |
|-----|-----|------|-------|--------------|
| **WriFe Platform** | `wrife.co.uk` | `wrife-website` | Next.js 14, App Router, Tailwind, Drizzle | School hub — teacher dashboard, admin panel, SSO gateway, marketing site |
| **PWP Studio** | `pwp-studio.wrife.co.uk` | `wrifeapp` | Vite + React 18, Zustand, React Query | Progressive Writing Practice — formula engine (L1–L67), chain, free practice, AI assess |
| **Interactive Practice** | `practice.wrife.co.uk` | `InteractivePracticeApp` | Vite + React 18, Zustand, React Query | 61-lesson grammar game — 6 worlds, XP, badges, boss challenges |
| **Daily Writing Practice** | `dailywrite.wrife.co.uk` | `wrife-dwp` | Vite + React 18 | Daily free-writing — 40 levels, 365 prompts, AI assess, Edge Functions |
| **Learning Toolkit** | `resources.wrife.co.uk` | `resources.wrife` | Next.js 14, App Router, Tailwind | 9 Claude Haiku AI tools + 30+ downloadable PDFs for teachers |

---

## 🔴 Critical Pending Actions (do before any resources.wrife work)

**1. Fix the `learning_events` CHECK constraint** — `resources.wrife` inserts with `app = 'resources'`
but the constraint is currently `CHECK (app IN ('pwp', 'ip', 'dwp'))`. Inserts silently fail until fixed:

```sql
ALTER TABLE learning_events
  DROP CONSTRAINT IF EXISTS learning_events_app_check,
  ADD CONSTRAINT learning_events_app_check
    CHECK (app IN ('pwp', 'ip', 'dwp', 'resources'));
```

Run against `gzmgjkbtsvezfclmreru` BEFORE deploying `resources.wrife.co.uk`.

**2. Deploy `resources.wrife.co.uk`** — all 9 AI tools are built (Session 6, 2026-05-10).
Requires: git push → Vercel deploy → Stripe integration (est. £4.90/mo standard, £9.90/mo full).

---

## The Seven User Types

| Type | Description | Login route | Dashboard |
|------|-------------|-------------|-----------|
| **Super Admin** | Michael — WriFe creator | `/admin/login` (blocked from `/login`) | `/admin` — all schools, all data |
| **School Admin** | Head/Deputy/Curriculum Lead | `wrife.co.uk/login` | School overview — read-only, no class edit |
| **School Teacher** | Classroom teachers at school-account schools | `wrife.co.uk/login` (Route B) | Teacher dashboard (6 tabs) on wrife.co.uk |
| **Parent (B2C)** | Parents who sign up directly | `pwp-studio/home-signup` (Route C) | Parent dashboard showing child progress |
| **School Pupil** | Students in a teacher-managed class | **Route A ONLY** — `wrife.co.uk/pupil/login` | `wrife.co.uk/pupil/dashboard` → SSO to sub-apps |
| **Home Learner** | Child provisioned by a parent via Route C | Sub-app `/login` with parent code + PIN | Sub-app dashboard only; no wrife.co.uk access |
| **Resources Teacher** | Teacher using Learning Toolkit | `resources.wrife.co.uk/login` (separate) | resources.wrife dashboard — 9 AI tools + PDFs |

> **Role lives in `profiles.role` — NOT the JWT.** Always fetch the profile after sign-in
> before any routing or permission decision.

---

## The Four Login Routes

### Route A — School Hub SSO ✅ (school pupils only)

```
1. Pupil → wrife.co.uk/pupil/login (class_code + username + PIN)
2. POST /api/pupil/login → validates pupils table → provisions Supabase Auth user
   (synthetic email: pupil-{uuid}@practice.wrife.co.uk)
3. JWT minted → pupil dashboard at /pupil/dashboard
4. App tile clicked → JWT embedded in URL hash fragment
   https://pwp-studio.wrife.co.uk/#access_token=<JWT>&...
5. Sub-app SDK auto-detects hash → setSession() → authenticated
6. sessionStorage.setItem('entryViaHub', '1') → "← WriFe" back button shown
```

### Route B — Teacher / Admin Email Login ✅

```
- Teacher:     wrife.co.uk/login (email + password → Supabase Auth cookie)
- Admin:       wrife.co.uk/admin/login (special portal)
- Profile fetched → profiles.role → routed to correct dashboard
⚠️ Route B for SCHOOL PUPILS on sub-apps is RETIRED.
   Sub-app /login must reject school pupils and redirect to wrife.co.uk.
   Route B on sub-apps is valid ONLY for home learners (Route C) and ind. teacher pupils (Route D).
```

### Route C — Parent Home Sign-up ✅ (partial)

```
1. Parent → pwp-studio.wrife.co.uk/home-signup
2. home_accounts row (account_type = 'parent') + Stripe checkout
3. create-child-profile Edge Function → pupils row + auto-created home class
4. Parent code (= class_code on home class) generated
5. Child logs in at sub-app /login: parent_code + username + PIN
⚠️ Stripe webhook → pupil provisioning not yet fully built.
```

### Route D — Independent Teacher Sign-up ❌ Not built

```
- Teacher signs up at sub-app /teacher-signup → home_accounts (account_type = 'independent_teacher')
- Creates classes in sub-app → pupils log in via Route B
- All of this is yet to be built on any sub-app.
```

---

## The `← WriFe` Back Button

Show **only** when the pupil arrived via Route A. Use `sessionStorage` (not `localStorage`):

```typescript
// Run once on app init (PWP Studio, Interactive Practice, DWP, resources.wrife):
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
    sessionStorage.setItem('entryViaHub', '1')
    window.history.replaceState(null, '', window.location.pathname)
  }
})
// Nav component:
const showBackToHub = sessionStorage.getItem('entryViaHub') === '1'
// <a href="https://wrife.co.uk/pupil/dashboard">← WriFe</a>
```

---

## Table Ownership — The Hard Rule

**Never write a migration in one repo that alters, recreates, or removes a table owned by another repo.**

### `wrife-website` owns
```
classes, pupils, profiles, schools, school_admins, subscriptions,
home_accounts, pupil_parent_links, pwp_assignments, ip_assignments, dwp_assignments,
learning_events, pupil_sessions, pupil_activity_log, school_registrations
```

### `wrifeapp` (PWP Studio) owns
```
formula_levels, formula_progress, formula_sessions, pwp_pupil_levels,
pwp_chain_sessions, pwp_chain_sentences, pwp_free_practice_sentences,
pwp_weekly_themes, paragraph_sessions, paragraph_sentences, writing_pieces
```

### `InteractivePracticeApp` owns
```
activities, lessons, worlds, pupil_progress, pupil_responses,
badge_definitions, pupil_badges, streaks
```

### `wrife-dwp` owns
```
dwp_levels, dwp_daily_prompts, dwp_feature_taxonomy,
dwp_progress, dwp_submissions, dwp_assessments
```

### `resources.wrife` owns
```
ai_sessions, ai_attempts, daily_streaks, usage_quotas, ai_tool_assignments
```

### Shared bridge (wrife-website owns; sub-apps INSERT only, never ALTER)
```
learning_events
```

---

## The `learning_events` Bridge

Sub-apps write events; wrife.co.uk reads them in `ClassActivityPanel` (teacher class view).

```sql
CREATE TABLE learning_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id    UUID NOT NULL,       -- = auth.uid() = pupils.id
  app         TEXT NOT NULL CHECK (app IN ('pwp', 'ip', 'dwp', 'resources')),
  event_type  TEXT NOT NULL,
  event_data  JSONB DEFAULT '{}',
  class_id    UUID REFERENCES classes(id),  -- nullable for home learners
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

> 🔴 **CURRENT CONSTRAINT IS WRONG** — production still has `('pwp', 'ip', 'dwp')`.
> Run the migration above before any `resources.wrife` work.

| App | event_type | event_data keys |
|-----|-----------|-----------------|
| pwp | `formula_completed` | `level, score, attempts` |
| pwp | `chain_session_completed` | `level, sentences_built, streak_day` |
| pwp | `free_practice_session` | `sentences_built, theme` |
| pwp | `pwp_level_advanced` | `from_level, to_level` |
| ip  | `lesson_completed` | `lesson_id, stars, xp_earned` |
| ip  | `world_completed` | `world_id, badge_earned` |
| ip  | `badge_earned` | `badge_id, badge_name` |
| ip  | `streak_milestone` | `streak_days` |
| dwp | `level_completed` | `level_id, score` |
| dwp | `daily_prompt_submitted` | `prompt_id, category, word_count` |
| resources | `tool_used` | `tool_slug, session_id, prompt_length` |

Insert pattern (fire-and-forget):
```typescript
await supabase.from('learning_events').insert({
  pupil_id: session.user.id,
  app: 'resources',
  event_type: 'tool_used',
  event_data: { tool_slug: 'connect-grid', session_id: sid },
  class_id: pupilSession?.classId ?? null,
})
```

---

## Canonical Tech Stack

Every WriFe brand app uses exactly this stack. Do not substitute without explicit agreement.

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend (sub-apps) | React 18 SPA | Vite + TypeScript strict mode |
| Frontend (hub + resources) | Next.js 14 App Router | TypeScript strict mode |
| Styling | Tailwind CSS + CSS custom properties | Tokens in `src/index.css` — **never hardcode hex** |
| Animation | Framer Motion | All significant transitions |
| UI state / auth | Zustand | Lives, XP, streak, current user session |
| Server state | TanStack React Query | All DB reads/writes; never raw useEffect for fetching |
| Routing (SPA) | React Router v6 | SPA rewrite in `vercel.json` required |
| Backend | Supabase — `gzmgjkbtsvezfclmreru` | Postgres + Auth + RLS + Edge Functions |
| Payments | Stripe | School subscriptions (wrife.co.uk); B2C (wrifeapp); resources pending |
| Email | Resend via `noreply@wrife.co.uk` | |
| Deployment | Vercel | All five apps; auto-deploy from GitHub `main` |
| AI assessment | Claude Haiku | resources.wrife (9 tools); also used in PWP assess |

### Bootstrap (new Vite sub-app)
```bash
npm create vite@latest <app-name> -- --template react-ts
npm install react-router-dom @supabase/supabase-js @tanstack/react-query zustand framer-motion
npm install -D tailwindcss @tailwindcss/vite typescript @types/react @types/react-dom
```

### `vercel.json` (mandatory for all Vite SPAs)
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### DB connection pool (wrife-website `lib/db.ts`)
```
max: 2, idleTimeoutMillis: 10000, connectionTimeoutMillis: 8000
```
**Critical — do not raise on free-tier Supabase.** Original max:10 exhausted the ~100-connection limit
at ~10 concurrent users → cascade of 504 errors on the teacher dashboard.

---

## Brand & Design System

### Colour tokens — use CSS variables only, never hex in components

| Token | Value | Use |
|-------|-------|-----|
| `var(--color-brand-primary)` | `#6C5CE7` | Purple — nav, headers, teacher UI |
| `var(--color-brand-secondary)` | `#F5A623` | Orange — CTA buttons, highlights |
| `var(--color-background)` | `#FDF8EE` | Warm cream — page backgrounds |
| `var(--color-background-auth)` | `#D4EBF8` | Light blue — auth screens |
| `var(--color-text)` | `#2D3436` | Body text |
| `var(--color-xp)` / `var(--color-gold)` | `#F5C500` | XP stars |
| `var(--color-green-success)` | `#00b894` | Pupil SSO, working features |
| `var(--color-blue-dwp)` | `#0984e3` | DWP accent |
| `var(--color-green-toolkit)` | `#27AE60` | resources.wrife brand colour |

### Typography

| Use | Size | Weight |
|-----|------|--------|
| Page title | 28px | 700 |
| Section heading | 22px | 600 |
| Question text (pupil-facing) | 20px | 500 |
| Body / instructions | 18px | 400 |
| Caption | 14px | 400 |

- Minimum 18px for any text a pupil reads during an activity
- Minimum touch target: 44×44px on mobile
- System sans-serif stack only — no decorative fonts for content

### Mascot — WriFi the Pencil
Body `#FFCF4A`, eraser `#FF7A64`. Encouraging, never critical. PNG files in `public/mascots/`.
Poses: `pencil-waving`, `pencil-celebrating`, `pencil-thinking`, `pencil-reading`.
Never use in formal or negative contexts.

---

## Mandatory Coding Conventions

### 1. No hardcoded hex
All colours via `var(--token-name)`. All tokens in `src/index.css`.

### 2. TypeScript interfaces
All interfaces/types in `src/types/index.ts` only. Read it before implementing any feature.

### 3. Component size
Max 200 lines per component. Split into sub-components in a dedicated sub-folder if exceeded.

### 4. Accessibility + test hooks
- `data-testid="<descriptive-name>"` on ALL interactive elements
- `data-tts="<content-description>"` on ALL text content (for future TTS)
- WCAG AA: 4.5:1 contrast normal text, 3:1 large text
- 2px solid `var(--color-brand-primary)` focus indicator on all interactive elements

### 5. Supabase access
All queries through `src/lib/supabase.ts` singleton. Never import `@supabase/supabase-js`
directly in components. Never bypass RLS with service key on the client.

### 6. State management split
- **React Query** — all server state (fetch, cache, mutate)
- **Zustand** — UI state and auth (lives, XP, streak, current user)
- Do NOT use React context for state that belongs in Zustand or React Query

### 7. TypeScript strict mode
`tsconfig.json` has `"strict": true`. No `any` types. After every session:
```bash
npx tsc -b --noEmit   # use this, NOT npm run build
```

### 8. Lazy loading
Teacher Dashboard, Admin pages, and heavy components (confetti, etc.) use `React.lazy()` + `<Suspense>`.

### 9. Environment variables
Never commit `.env` or `.env.local`. All vars prefixed `VITE_` (Vite) or `NEXT_PUBLIC_` (Next.js).

### 10. Admin navigation (wrife-website)
`window.location.replace('/admin')` — NOT `router.push`. Forces middleware cookie re-read.

### 11. Commit format
`feat(scope): description`. One logical commit per repo per session.

### 12. CORS standard for ALL Edge Functions
Must include: `authorization, x-client-info, apikey, content-type`.
Missing `apikey` causes a silent `TypeError: Failed to fetch` with no useful error message.

---

## Known Schema Gotchas

- **`pupils.class_id` is INTEGER; `classes.id` is UUID** — legacy mismatch; never join directly.
- **DWP RLS:** `pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid())` — NEVER `pupil_id = auth.uid()`.
- **`formula_progress` is the PWP dashboard's primary table** — not `pwp_pupil_progress` (legacy).
  Any new gamification column must use `NOT NULL DEFAULT <value>` to backfill existing rows.
  ```sql
  -- ✅ Correct
  ALTER TABLE formula_progress ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 0;
  -- ❌ Wrong — NULL crashes dashboard for existing pupils
  ALTER TABLE formula_progress ADD COLUMN coins INTEGER;
  ```
- **`home_accounts` uses `home_account_id`** (not `owner_id`) for class ownership.
- **`pupil_parent_links` uses `parent_auth_id`** (not `parent_account_id`).
- **`home_accounts_app_origin_check`** constraint is `CHECK (app_origin IN ('pwp', 'ip', 'dwp'))` — if resources.wrife ever creates home accounts, add `'resources'`.

---

## Gamification System (Interactive Practice — reference for new apps)

### XP
10 pts on first correct attempt, 5 pts on retry; never decreases.
Float "+10 XP" with Framer Motion `AnimatePresence` (y: 0 → -40, fade out, 800ms).

### Lives
5 per session; 0 lives → Rest screen (soft block, not hard stop). Animate lost heart with `scale(0)` + fade.

### Stars
1–3 per lesson: ≥90% accuracy = 3 stars, ≥60% = 2, else 1.
Three stars animate in sequence: `scale(0 → 1.2 → 1)`, 400ms each.

### Streak
Daily flame counter; milestone badges at 3, 7, 14, 30, 60 days.
Stored in `streaks` (`current_streak`, `longest_streak`, `last_activity_date`).
On World Map load: always hydrate from DB — never trust Zustand initial value of 0.

### Tier unlock (lessons)
Bronze: unlocked by default · Silver: requires 2 Bronze stars · Gold: requires 2 Silver stars.

### Badge counts (Interactive Practice)
61 lesson + 6 world + 5 streak + 5 mastery + 3 speed = **80 badges total**.

### Animation guidelines
| Event | Animation | Max duration |
|-------|-----------|--------------|
| Correct answer | Green flash + `scale(1.02)` | 600ms |
| Wrong answer | Red flash + shake `x: [0,-8,8,-6,6,0]` | 400ms |
| XP gain | Float up 40px + fade | 800ms |
| Badge unlock | Full-screen modal slides up, badge bounces | 600ms |
| Star earned | `scale(0 → 1.2 → 1)` | 400ms |
| Page transition | `opacity: 0→1` + `y: 20→0` | 300ms |

Always check `prefers-reduced-motion`. Never block interaction with animation >600ms.

---

## Six Worlds (Interactive Practice)

| World | Name | Lessons | Domain |
|-------|------|---------|--------|
| 1 | Story Seeds | 1–9 | Personal narrative, nouns, adjectives |
| 2 | Grammar Toolkit | 10–19 | Tenses, pronouns, prepositions, comprehension |
| 3 | Sentence Builders | 20–31 | Phrases, clauses, simple/compound/complex sentences |
| 4 | Writer's Craft | 32–45 | Noun/adjective phrases, direct speech, figurative language |
| 5 | Flow & Finish | 46–51 | Show don't tell, transitions, final draft |
| 6 | Genre Arena | 52–61 | News, diary, argument, letter, explanation, biography, speech |

---

## Activity Types (Interactive Practice)

| Code | Name | Validation |
|------|------|------------|
| `mc` | Multiple choice | Client-side; `correct` field in `question_json` |
| `write` | Open writing | Self-assessed by pupil |
| `match` | Drag-and-drop pairs | Compare submitted pairs against `pairs` array |
| `fillblank` | Fill-in-the-blank | Compare against `blanks[].answer` |
| `checklist` | Self-assessment | No correct/incorrect |

MC data quality rule: `correct` value must appear verbatim in `options[]` and be no longer than
average wrong answer × 1.5. Strip explanatory sentences from option text — feedback goes in `feedback.correct`.

---

## Curriculum — Writing for Everyone (KS1–KS3)

**68 lesson items (L1–L68, where L27 = L27a + L27b) across 7 chapters, KS1–KS3, Years 2–8.**
WriFe is NOT primary only — it extends into lower secondary (Year 7–8).

| Key Stage | Year Group | Age | Lessons |
|-----------|-----------|-----|---------|
| KS1–KS2 | Years 2–4 | 6–9 | L1–L17 |
| KS2 | Years 3–5 | 7–10 | L18–L26 |
| KS2–KS3 | Years 5–8 | 9–14 | L27–L68 |

L27b = Introduction to the Connect Grid (primary Connect Grid lesson).
L68 = "Celebrating the End Results" (project celebration activity).
PWP formula practice begins at L10.

> ⚠️ **Data correction pending:** `lessons.year_group_max` for L27+ currently shows ≤5 in the DB.
> Correct to 8. Any code reading `year_group_max` should not assume ≤6 (primary only).

---

## Development Isolation Rules

**Rule 1 — Stay in your lane.** When in `wrifeapp`: only PWP-owned tables. In `InteractivePracticeApp`: only IP-owned tables. In `wrife-dwp`: only DWP-owned tables. In `resources.wrife`: only resources-owned tables. In `wrife-website`: may alter any table but flag shared-table changes explicitly.

**Rule 2 — Cross-repo changes: wrife-website first, sub-app second, then verify checklist.**

**Rule 3 — wrife.co.uk needs updating from a sub-app ONLY when:** new assignment type needed, new data point in teacher class view, pupil dashboard SSO tile changes, or a new `learning_events` event_type is introduced (document it in this skill first).

**Rule 4 — Standalone mode always works.** `class_id` must be nullable on all new tables. All upserts must use `pupil_id` as sole conflict key when `class_id` is null.

**Rule 5 — Feature parity.** Any access pattern in one sub-app must eventually be in all.

**Rule 6 — wrife-website boundary.** This repo is wrife.co.uk ONLY. A previous session built an entire `app/pwp/` implementation inside wrife-website by mistake — required `git reset --hard 375d29d` (2026-05-13). If asked to work on PWP/IP/DWP/Resources pupil experience: stop and connect the correct repo.

---

## Assignment System

wrife.co.uk defines **what** to do and **by when**. Sub-apps handle **how** and report back via `learning_events`.

| Configured in | Table | What it controls |
|---|---|---|
| wrife.co.uk teacher dashboard | `pwp_assignments` | `level_from`, `level_to`, `due_date`, `status` |
| wrifeapp (PWP Studio) | `formula_progress`, `pwp_pupil_levels` | Actual practice engine state |
| wrife.co.uk teacher dashboard | `ip_assignments` | World/lesson range, `due_date` |
| InteractivePracticeApp | `pupil_progress`, `pupil_responses` | Actual lesson engine state |
| wrife.co.uk teacher dashboard | `dwp_assignments` | DWP level, prompt category, `due_date` |

---

## Cross-App Checklist — Before Shipping Any Change

**Auth / session**
- [ ] Route A (hub hash-token): SDK auto-handles hash on load?
- [ ] Route B on sub-app: only accepted for Route C/D users (not school pupils)?
- [ ] Sub-app `/login` redirects school pupils to wrife.co.uk?
- [ ] Route C (home learner): login + all features work with home class?
- [ ] `← WriFe` back button shown ONLY for Route A?
- [ ] `class_id` nullable: all new tables + upserts handle null class?

**Schema / migrations**
- [ ] Migration targets `gzmgjkbtsvezfclmreru` only?
- [ ] Table owned by THIS repo (not another repo's)?
- [ ] New RLS policies use `auth.uid()` equality?
- [ ] New PWP columns on `formula_progress` with `NOT NULL DEFAULT`?
- [ ] If new `learning_events` event_type: documented in this skill?
- [ ] If resources.wrife work: learning_events constraint migration applied first?

**Post-deploy smoke test**
1. Login at `wrife.co.uk/pupil/login` → SIL42495 / amab04 / 9543
2. Click "Play →" → `practice.wrife.co.uk` loads authenticated ✅
3. Click "Write →" → `pwp-studio.wrife.co.uk` loads authenticated ✅
4. Click "Write Daily →" → `dailywrite.wrife.co.uk` loads authenticated ✅
5. All three show `← WriFe` back button ✅
6. Direct visit to `pwp-studio.wrife.co.uk/login` with school pupil → redirected to wrife.co.uk ✅

---

## Reference — Supabase Projects

| Project ID | Name | Status |
|-----------|------|--------|
| `gzmgjkbtsvezfclmreru` | WriFe Platform | ✅ ALL production work — all five apps |
| `rxmitjrbrsqjeymsycoj` | IP Practice (legacy) | ❌ Retired — recommend deletion |
| `nxhkpqngnxshgotvuujb` | PWP App (legacy) | ❌ Retired — recommend deletion |

---

## Reference — Test Credentials

| Role | Credentials | Notes |
|------|-------------|-------|
| School pupil | SIL42495 / amab04 / 9543 | Amadeo B, Silver Birch Y4, PWP L15 |
| School teacher | mankrah@kafed.org.uk / niiotin99 | wrife.co.uk teacher dashboard |
| Parent (B2C) | Create fresh via `/home-signup` | Stripe test card: 4242 4242 4242 4242 |

---

## Reference — resources.wrife AI Tools

| Slug | Tool name | Route |
|------|-----------|-------|
| `pwp` | PWP Practice | `/daily/pwp` |
| `dwp` | Daily Writing | `/daily/dwp` |
| `connect-grid` | Connect Grid | `/lesson/connect-grid` |
| `sentence-coach` | Sentence Coach | `/lesson/sentence-coach` |
| `story-types` | Story Type Identifier | `/lesson/story-types` |
| `composition` | Composition Reviewer | `/lesson/composition` |
| `editing-doctor` | Editing Doctor | `/lesson/editing-doctor` |
| `genre-coach` | Genre Coach | `/lesson/genre-coach` |
| `project-mentor` | Project Mentor | `/lesson/project-mentor` |

All 9 require `'full'` tier. Tier resolved by `get_user_tier()` DB function:
school licence first → individual subscription → default `'free'`.
