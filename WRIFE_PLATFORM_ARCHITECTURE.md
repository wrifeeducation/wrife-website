# WriFe Platform Architecture Document

> **Status:** Authoritative · Living document — update before shipping any structural change  
> **Version:** 1.0  
> **Created:** 2026-05-17  
> **Last updated:** 2026-05-17 · Session 39  
> **Owner:** Michael (wrife.education@gmail.com)  
>
> **How to use this document:**  
> Read the relevant sections *before* building any new feature, login route, table, or cross-app integration. If a proposed change contradicts a rule in this document, update the document first (with a dated ADR entry) and then proceed. This document supersedes all scattered spec files, session notes, and README fragments as the single source of architectural truth.

---

## Table of Contents

1. [Platform Identity](#1-platform-identity)
2. [The User Hierarchy](#2-the-user-hierarchy)
3. [The Four Login Routes](#3-the-four-login-routes)
4. [App Ownership Matrix](#4-app-ownership-matrix)
5. [The Curriculum Backbone](#5-the-curriculum-backbone)
6. [Sub-App Detail: PWP Studio](#6-sub-app-detail-pwp-studio)
7. [Sub-App Detail: Interactive Practice](#7-sub-app-detail-interactive-practice)
8. [Sub-App Detail: Daily Writing Practice (DWP)](#8-sub-app-detail-daily-writing-practice-dwp)
9. [Data Architecture](#9-data-architecture)
10. [The `learning_events` Bridge](#10-the-learning_events-bridge)
11. [Billing & Subscription Architecture](#11-billing--subscription-architecture)
12. [AI Assessment System](#12-ai-assessment-system)
13. [Design System](#13-design-system)
14. [Development Governance](#14-development-governance)
15. [Cross-App Pre-Ship Checklist](#15-cross-app-pre-ship-checklist)
16. [Architecture Decision Record (ADR) Log](#16-architecture-decision-record-adr-log)

---

## 1. Platform Identity

WriFe is a UK primary school writing platform (target age: 6–11, Years 2–6) that teaches structured writing through a sequential 67-lesson curriculum. The platform consists of **four web applications** sharing **one Supabase backend project**.

### The Four Apps

| App | URL | Repo | Stack | Primary Audience | Core Purpose |
|-----|-----|------|-------|-----------------|--------------|
| **WriFe Platform** | `wrife.co.uk` | `wrife-website` | Next.js 15, App Router, Tailwind, Drizzle | Teachers, School Admins, Super Admin | School hub — class management, assignments, reporting, SSO gateway, admin portal |
| **PWP Studio** | `pwp-studio.wrife.co.uk` | `wrifeapp` | Vite + React 18, Zustand, React Query | Pupils, Teachers, Parents | Progressive Writing Practice — formula engine, chain practice, free practice, AI assessment |
| **Interactive Practice** | `practice.wrife.co.uk` | `InteractivePracticeApp` | Vite + React 18, Zustand, React Query | Pupils, Teachers | 61-lesson grammar game — worlds, activities, badges, boss challenges |
| **Daily Writing Practice** | `dailywrite.wrife.co.uk` | `wrife-dwp` | Vite + React 18 | Pupils, Teachers | AI-assessed daily writing — 40 curriculum levels, 365 daily prompts |

### The One Database

**All four apps share a single Supabase project: `gzmgjkbtsvezfclmreru` (WriFe Platform)**

Auth is unified — a user account created on any app is valid on all four. Legacy Supabase project IDs `rxmitjrbrsqjeymsycoj` and `nxhkpqngnxshgotvuujb` are **retired and must never be targeted** in new migrations.

### The Pedagogical Flow

```
wrife.co.uk          →  Teacher assigns curriculum lesson (L1–67)
                         Teacher assigns PWP level range
                         Teacher assigns DWP level
                         Teacher assigns IP lesson range

practice.wrife.co.uk →  Pupil plays grammar activities tied to the lesson
pwp-studio.wrife.co.uk→ Pupil practises sentence formulas for that lesson
dailywrite.wrife.co.uk→ Pupil writes and receives AI feedback daily
wrife.co.uk          →  Teacher sees aggregated progress via learning_events
```

---

## 2. The User Hierarchy

There are **six user types** in WriFe. Understanding who a user is and how they arrived on the platform determines every auth, data, permissions, and feature decision.

### Hierarchy Overview

```
Super Admin  (WriFe owner — full platform control)
     │
     ├── School Admin  (per-school leadership — visibility & reporting)
     │        │
     │        └── Teacher  (classroom teacher — classes, assignments, feedback)
     │                 │
     │                 └── School Pupil  (in a teacher-managed class)
     │
     └── Parent  (direct home sign-up — manages their own child)
              │
              └── Home Learner Pupil  (child of a parent subscriber)

Independent Teacher  (no school account — signs up directly on sub-apps)
              │
              └── Independent Teacher Pupil  (in an independent teacher's class)
```

---

### Role 1: Super Admin (`admin`)

**Who:** Michael (wrife.education@gmail.com) — WriFe creator and platform owner. There is exactly one super admin.

**Capabilities:**
- Manage all schools (create, view, edit, delete with cascade confirmation)
- View all teachers, classes, and pupils across all schools
- Create and manage school admin accounts
- View platform-wide analytics
- Access the dark admin portal at `/admin` via `/admin/login` only (blocked from regular `/login`)
- Approve school self-registration requests at `/admin/registrations`
- Access Stripe billing dashboard

**Restrictions:**
- Cannot create classes (that is a teacher action)
- Cannot assign lessons (that is a teacher action)
- Cannot log in via `/login` — must use `/admin/login`

**Dashboard:** `wrife.co.uk/admin` — dark-theme portal with school cards, teacher/pupil counts, subscription tiers, and registration queue.

---

### Role 2: School Admin (`school_admin`)

**Who:** School leadership staff (Headteacher, Deputy Head, Curriculum Lead) at a school with an active WriFe subscription.

**Capabilities:**
- View all teachers, classes, and pupils within their own school only
- View school-wide analytics, assignment completion rates, and class comparison charts
- View progress reports across all classes
- Download school-level Progress Reports (Word document)

**Restrictions:**
- Cannot create, edit, or delete classes (teacher-only action)
- Cannot assign lessons or create assignments
- Cannot view other schools' data
- Cannot change subscription tier or billing settings

**Dashboard:** `wrife.co.uk/school-admin` — school overview metrics, teacher list, cross-class progress charts.

---

### Role 3: Teacher (`teacher`)

**Who:** Classroom teachers at a school with a WriFe account, or independent teachers who signed up directly on a sub-app (Route D — not yet built).

**Capabilities:**
- Create and manage classes; generate class codes
- Add, remove, and reset PIN for pupils within their own classes
- Browse all 67 curriculum lessons and their materials (6 tabs per lesson)
- Assign lessons to classes with due dates, instructions, and resource links
- Assign PWP level ranges (`pwp_assignments`), IP lesson ranges (`ip_assignments`), DWP levels (`dwp_assignments`)
- Review pupil submissions and provide written feedback
- Mark submissions as "Reviewed"
- View per-class and per-pupil analytics (6 dashboard tabs)
- Download individual pupil Progress Reports (Word document)

**Restrictions:**
- Cannot view other teachers' classes or pupils
- Cannot access admin or school admin features
- Cannot change school-level settings or billing

**Dashboard:** `wrife.co.uk/dashboard` — 6-tab teacher dashboard: Overview, Classes, Assignments, PWP, IP, DWP.

---

### Role 4: School Pupil (`pupil`)

**Who:** A child enrolled in a teacher-managed class at a school with a WriFe subscription.

**Login:** Class code + username + 4-digit PIN. **Always via Route A (wrife.co.uk).**

**Capabilities:**
- View their assigned lessons from the teacher dashboard
- Access all 6 tabs of a lesson (Teacher Guide, Presentation, Practice Activities, Worksheets, Progress Tracker, Assessment)
- Play Interactive Practice activities (practice.wrife.co.uk)
- Complete PWP formula practice (pwp-studio.wrife.co.uk)
- Complete DWP daily writing (dailywrite.wrife.co.uk)
- Submit work for teacher review
- View teacher feedback on submissions
- Track writing streaks and earn badges

**Restrictions:**
- Cannot browse all 67 lessons independently (only teacher-assigned lessons visible by default)
- Cannot see other pupils' work
- Cannot create classes or access any admin/teacher features

**Dashboard:** `wrife.co.uk/pupil/dashboard` — friendly greeting, writing streak, assignment list with due dates, app tiles for sub-apps.

---

### Role 5: Parent (`parent`)

**Who:** A parent or guardian who signed up directly on PWP Studio or Interactive Practice via the Route C home sign-up flow, with a Stripe subscription.

**Capabilities:**
- Create and manage child profiles (provisions pupil records with an auto-generated home class)
- View their child's progress across PWP and IP (via `learning_events`)
- Manage their Stripe subscription and billing via the Customer Portal
- Add additional children to their account

**Restrictions:**
- Cannot see school-managed pupils or classes
- Currently managed via `pwp-studio.wrife.co.uk/parent` only; IP app delegates to PWP Studio for all parent actions

**Dashboard:** `pwp-studio.wrife.co.uk/parent` — child progress summary, subscription management.

---

### Role 6: Home Learner Pupil

**Who:** A child whose parent signed up directly (Route C). They are stored in the `pupils` table identically to school pupils but belong to an auto-generated home class (`classes.account_type = 'home'`).

**Login:** Parent code (= class_code on their home class) + username + PIN. Via `pwp-studio.wrife.co.uk/login` or `practice.wrife.co.uk/login`.

**Capabilities:** Same as a school pupil but without school-assigned lessons — they access PWP and IP in standalone mode. `class_id` is nullable throughout their session; all upserts use `pupil_id` as sole conflict key.

---

### Role 7: Independent Teacher Pupil *(future — Route D not yet built)*

**Who:** A pupil enrolled in a class created by an independent teacher (no school account). Stored in the same `pupils` table; `classes.account_type = 'independent_teacher'`.

**Login:** Class code + username + PIN, via sub-app direct login (Route B).

---

## 3. The Four Login Routes

The route a user takes to authenticate determines which interface they land in. Routes are not interchangeable — school pupils must always use Route A.

---

### Route A — School Hub SSO (School Pupils Only)

> **The only valid login path for school pupils.**

```
1. Pupil visits wrife.co.uk/pupil/login
   → Enters: class_code + username + PIN

2. POST /api/pupil/login (Next.js server route on wrife.co.uk)
   → Validates against `pupils` table in gzmgjkbtsvezfclmreru
   → Provisions Supabase Auth user if not yet created
     (synthetic email: pupil-{uuid}@practice.wrife.co.uk)
   → Returns access_token + refresh_token

3. Pupil lands at wrife.co.uk/pupil/dashboard
   → Sees: writing streak, assignment list, app tiles

4. Clicking an app tile embeds JWT in the URL hash:
   https://pwp-studio.wrife.co.uk/dashboard#access_token=<JWT>&refresh_token=<RT>&...
   https://practice.wrife.co.uk#access_token=<JWT>&...
   https://dailywrite.wrife.co.uk#access_token=<JWT>&...

5. Sub-app Supabase SDK auto-detects hash → setSession() → authenticated
   → Sets sessionStorage flag: entryViaHub = '1'
   → Clears hash from URL bar
   → Shows "← WriFe" back button
```

**Back button logic (all sub-apps):**
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
    sessionStorage.setItem('entryViaHub', '1')
    window.history.replaceState(null, '', window.location.pathname)
  }
})
// In nav: show <a href="https://wrife.co.uk/pupil/dashboard">← WriFe</a>
// only when sessionStorage.getItem('entryViaHub') === '1'
```

Use `sessionStorage` (not localStorage) — clears on tab close so a direct fresh load never incorrectly shows the back button.

---

### Route B — Teacher & Admin Email Login

> **For teachers, school admins, parents (on their own app), and the super admin.**

```
Teacher/Admin:
  wrife.co.uk/login → email + password → Supabase cookie session
  → Redirect: /dashboard (teacher) | /school-admin (school_admin) | /admin (admin)

Note: role lives in `profiles.role`, NOT the JWT.
Always fetch the profile after sign-in to determine destination.

Admin special case:
  wrife.co.uk/admin/login only.
  window.location.replace('/admin') — not router.push — forces middleware cookie re-read.
```

**Route B for school pupils is RETIRED.** Sub-app direct login forms must reject school-account class codes and redirect to `wrife.co.uk/pupil/login`. This was retired after session confusion and stale localStorage bugs (ADR-003).

Route B remains valid for:
- Home learner pupils (using parent code — treated as Route C pupils)
- Independent teacher pupils (Route D, not yet built)

---

### Route C — Home Learner Sign-Up (Parent-Purchased)

> **B2C flow. Parent signs up and pays; child credential is provisioned.**

```
1. Parent visits pwp-studio.wrife.co.uk/home-signup
   (or practice.wrife.co.uk/home-signup — currently redirects to PWP Studio)

2. Parent creates account (email + password)
   → Row in `home_accounts` table (account_type: 'parent', app_origin: 'pwp'|'ip'|'dwp')
   → Stripe checkout session created by `stripe-checkout` Edge Function

3. On successful payment, Stripe webhook fires `stripe-webhook` Edge Function:
   → `profiles.membership_tier` updated
   → `create-child-profile` Edge Function called → provisions pupil auth account
   → Auto-creates a home class (classes.account_type = 'home') with a class_code
   → Pupil row created in `pupils` table; class_id = home class

4. Parent logs in at pwp-studio.wrife.co.uk/parent
   → sessionStorage: wrife_pending_child written by home-signup, read by ParentPage

5. Child logs in: parent_code + username + PIN
   → same `pupil-login` Edge Function as Route A
   → home class is a valid class; class_id populated
```

**Note:** The Stripe webhook that provisions pupil credentials after payment is not yet fully built (as of Session 39). The home sign-up page redirects to `/pricing` but the post-payment provisioning step is incomplete.

---

### Route D — Independent Teacher Sign-Up *(not yet built)*

> **For teachers who want to use WriFe without a school account.**

```
Planned:
1. Teacher visits pwp-studio.wrife.co.uk/teacher-signup (or IP equivalent)
2. Account created in `home_accounts` (account_type: 'independent_teacher')
3. Stripe subscription attached
4. Teacher creates a class → classes row (account_type = 'independent_teacher')
5. Teacher adds pupils manually (same pupils table)
6. Pupils log in via class_code + username + PIN (Route B on sub-app)
7. Teacher sees class progress in sub-app teacher view
```

---

## 4. App Ownership Matrix

Each repo owns specific tables, routes, and features. **Never write a migration in one repo that alters, recreates, or removes a table owned by another repo.** Never duplicate a table across repos to avoid cross-querying.

### Feature Ownership

| Feature | wrife.co.uk | pwp-studio | practice.wrife.co.uk | dailywrite.wrife.co.uk |
|---------|:-----------:|:----------:|:--------------------:|:---------------------:|
| School management (create/edit/delete) | ✅ | — | — | — |
| Teacher dashboard (6 tabs) | ✅ | ✅ Basic | — | — |
| Pupil dashboard | ✅ (hub) | ✅ | — | — |
| Assignment creation (PWP/IP/DWP) | ✅ | ✅ PWP only | — | — |
| Progress reporting (Word doc) | ✅ | — | — | — |
| School admin analytics | ✅ | — | — | — |
| SSO pupil deep-links | ✅ | — | — | — |
| PWP formula practice (L1–67) | — | ✅ | — | — |
| PWP chain practice | — | ✅ | — | — |
| PWP free practice | — | ✅ | — | — |
| Connect Grid (L27–34) | — | ✅ | ✅ | — |
| Paragraph builder (LSC scaffold) | — | ✅ | — | — |
| PWP AI assessment (formula/paragraph) | — | ✅ | — | — |
| Full writing AI assessment (rubric) | — | ✅ | — | ✅ |
| IP 61-lesson game | — | — | ✅ | — |
| IP world map + boss challenges | — | — | ✅ | — |
| IP badge system | — | — | ✅ | — |
| DWP 40-level curriculum | — | — | — | ✅ |
| DWP 365 daily prompts | — | — | — | ✅ |
| DWP AI writing assessment | — | — | — | ✅ |
| Stripe subscriptions | — | ✅ | ❌ (→ PWP) | — |
| Parent dashboard | — | ✅ | ❌ (→ PWP) | — |
| Home sign-up | — | ✅ | ✅ (→ PWP) | — |
| Badge system (display) | ✅ | ✅ | ✅ | ✅ |
| Streak tracking | ✅ | ✅ | ✅ | ✅ |

### Table Ownership

#### `wrife-website` owns
```
classes              — school and home classes; contains account_type
pupils               — ALL pupil accounts (school + home + independent)
profiles             — all Supabase auth users (teachers, school admins, super admin, parents)
schools              — school organisations
school_admins        — school admin accounts
school_registrations — self-registration requests pending admin approval
subscriptions        — Stripe subscription state for schools
home_accounts        — parent and independent teacher direct accounts
pupil_parent_links   — school parent access grants (teacher → parent)
pwp_assignments      — teacher-configured PWP tasks (level_from, level_to, due_date)
ip_assignments       — teacher-configured IP tasks (lesson range, due_date)
dwp_assignments      — teacher-configured DWP tasks (level, due_date)
learning_events      — shared progress bridge (written by sub-apps, read here)
pupil_sessions       — legacy session cookies (wrife.co.uk login)
pupil_activity_log   — login events, audit trail
```

#### `wrifeapp` (PWP Studio) owns
```
formula_progress          — per-pupil formula completion (PRIMARY progress table for PWP)
formula_sessions          — individual practice session records
pwp_pupil_levels          — current level assignment per pupil
pwp_chain_sessions        — daily chain practice sessions
pwp_chain_sentences       — sentences produced in chain practice
pwp_free_practice_sentences — free practice sentence history
pwp_weekly_themes         — active theme per class per week
paragraph_sessions        — LSC paragraph builder sessions
paragraph_sentences       — sentences in paragraph sessions
writing_pieces            — full writing studio submissions
```

#### `InteractivePracticeApp` owns
```
activities           — 432+ lesson activities (mc, write, match, fillblank, checklist)
lessons              — 61 lesson definitions (world, name, tier info)
worlds               — 6 world definitions
pupil_progress       — per-pupil lesson completion + stars
pupil_responses      — individual activity answers
badge_definitions    — 80 badge types across all apps
pupil_badges         — earned badges per pupil
streaks              — daily activity streaks (IP-specific)
```

#### `wrife-dwp` owns
```
dwp_levels           — 40 curriculum level definitions
dwp_daily_prompts    — 365 daily prompts (5 categories, 73 per year × 5)
dwp_writing_sessions — pupil writing session records
dwp_feature_taxonomy — linguistic feature taxonomy (20 categories seeded)
```

#### Shared (written by sub-apps, schema owned by wrife-website)
```
learning_events      — sub-apps INSERT only; wrife-website reads only; neither ALTER
```

### Edge Function Ownership

| Function | Project | Owned By | Purpose |
|----------|---------|----------|---------|
| `pupil-login` | `gzmgjkbtsvezfclmreru` | wrife-website | Class code + PIN auth; returns tokens |
| `stripe-checkout` | `gzmgjkbtsvezfclmreru` | wrifeapp | Creates Stripe checkout session |
| `stripe-webhook` | `gzmgjkbtsvezfclmreru` | wrifeapp | Handles subscription events; updates membership_tier |
| `stripe-portal` | `gzmgjkbtsvezfclmreru` | wrifeapp | Opens Stripe Customer Portal |
| `create-child-profile` | `gzmgjkbtsvezfclmreru` | wrifeapp | Provisions child auth + home class after payment |
| `assess-formula` | `gzmgjkbtsvezfclmreru` | wrifeapp | GPT-4o-mini formula sentence validation |
| `assess-paragraph` | `gzmgjkbtsvezfclmreru` | wrifeapp | GPT-4o-mini paragraph structure assessment |
| `assess-writing` | `gzmgjkbtsvezfclmreru` | wrifeapp | GPT-4o full writing rubric scoring (8 strands) |
| `invite-teacher` | `gzmgjkbtsvezfclmreru` | wrife-website | Teacher onboarding welcome email via Resend |
| `dwp-assess` | `gzmgjkbtsvezfclmreru` | wrife-dwp | GPT-4o DWP writing assessment |
| `dwp-tts-feedback` | `gzmgjkbtsvezfclmreru` | wrife-dwp | Text-to-speech for DWP feedback |
| `pupil-create` | `gzmgjkbtsvezfclmreru` | wrife-website | Bulk pupil provisioning |

**CORS rule for ALL WriFe Edge Functions:** Must include `authorization, x-client-info, apikey, content-type`. Missing `apikey` causes a silent `TypeError: Failed to fetch`.

---

## 5. The Curriculum Backbone

The WriFe curriculum is a 67-lesson (plus L27 split = 68 lesson parts) sequential writing programme called **Writing for Everyone**, covering UK primary Years 2–6 (ages 6–11). All three sub-apps are anchored to this curriculum.

### Chapter Structure

| Chapter | Title | Lessons | Year Groups | Age Range |
|---------|-------|---------|-------------|-----------|
| 1 | Stories and Words | L1–17 | Y2–3 | 6–8 |
| 2 | Sentences and Paragraphs | L18–34 | Y3–4 | 7–9 |
| 3 | Planning and Drafting | L35–41 | Y4–5 | 8–10 |
| 4 | Editing to Final Composition | L42–47 | Y4–5 | 8–10 |
| 5 | Building Cohesion | L48–51 | Y4–5 | 8–10 |
| 6 | Writing for Different Purposes | L52–63 | Y4–5 | 8–10 |
| 7 | Project-Based Writing | L64–68 | Y5–6 | 9–11 |

**PWP begins at L10** (Basic Tenses). Formula practice is not meaningful before pupils understand word classes.  
**Connect Grid begins at L27b.** The paragraph planning tool is introduced as a paired lesson: L27a (What is a paragraph?) / L27b (Introduction to the Connect Grid).

### Lesson Database Structure
```sql
lessons (
  id              UUID PRIMARY KEY,
  lesson_number   INTEGER,        -- 1–67
  part            TEXT,           -- NULL, 'a', or 'b' (L27 only)
  title           TEXT,
  summary         TEXT,
  chapter_id      INTEGER,
  unit_id         INTEGER,
  year_group_min  INTEGER,        -- e.g. 2
  year_group_max  INTEGER,        -- e.g. 3
  duration_minutes INTEGER        -- typically 45–60; L10 = 60–70
)
```

### Lesson Materials (6 Tabs Per Lesson)
Every lesson offers teachers six resource types, all served from Google Drive links stored in `lesson_files`:
1. **Teacher Guide** — full lesson plan with learning objectives
2. **Lesson Presentation** — classroom slidedeck
3. **Practice Activities** — in-lesson pupil tasks
4. **Worksheets** — printable or screen-based pupil worksheets
5. **Progress Tracker** — formative assessment forms
6. **Assessment Package** — summative rubric-based assessment

---

## 6. Sub-App Detail: PWP Studio

**URL:** `pwp-studio.wrife.co.uk` | **Repo:** `wrifeapp`

PWP (Progressive Writing Practice) is the sentence formula engine. Pupils build increasingly complex sentence formulas, one element at a time, from L10 onwards.

### Core Principle
> Every formula adds **exactly one new grammatical element** to the previous formula.

```
F1: subject + verb                     (Dog runs)
F2: subject + adverb + verb            (Dog quickly runs)
F3: subject + adverb + verb + prep     (Dog quickly runs through the park)
F4: det + adj + subject + adv + verb + prep  (The energetic dog quickly runs through the park)
```

### Three Practice Modes

**Formula Practice** — The primary mode. Pupil selects a level (L10–L67), attempts to build sentences matching the formula. AI validates each attempt via `assess-formula` Edge Function. Progress tracked in `formula_progress`.

**Daily Chain Practice** — 10-minute daily session. Pupil builds a chain of linked sentences using the formula they are working on. Tracked in `pwp_chain_sessions` / `pwp_chain_sentences`. Streak tracked in `pwp_chain_streaks`.

**Free Practice** — Open-ended writing using any formula. Tracked in `pwp_free_practice_sentences`. No AI assessment — it is for exploration.

### `formula_progress` — The Primary PWP Progress Table

`DashboardPage.tsx` queries `formula_progress`, **not** `pwp_pupil_progress` (legacy/parallel table, not currently surfaced in UI). All new gamification columns (XP, coins, streaks, badges) **must be added to `formula_progress`** with `NOT NULL DEFAULT <value>` so existing rows are backfilled.

```sql
-- Correct way to add a gamification column:
ALTER TABLE formula_progress
  ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 0;

-- Never do this — existing rows get NULL, dashboard crashes:
ALTER TABLE formula_progress ADD COLUMN coins INTEGER;
```

### Assignment System
Teachers configure PWP assignments in `pwp_assignments` on `wrife.co.uk`:
- `level_from` / `level_to` — which formula levels to work through
- `due_date`
- `class_id`

The sub-app reads these and presents the pupil with the assigned range. Progress is written back to `formula_progress` and summarised in `learning_events`.

---

## 7. Sub-App Detail: Interactive Practice

**URL:** `practice.wrife.co.uk` | **Repo:** `InteractivePracticeApp`

Interactive Practice is the gamified grammar game. Pupils progress through 6 worlds, each containing curriculum-aligned lessons and a boss challenge.

### Structure
- **6 Worlds** — each corresponding to a curriculum chapter
- **61 Lessons** — grammar activities aligned to the 67-lesson curriculum
- **432+ Activities** — across 5 types: multiple choice, write, match, fill-blank, checklist
- **Boss Challenges** — end-of-world assessment; awards a world badge

### Activity Types
```typescript
type ActivityType = 'mc' | 'write' | 'match' | 'fillblank' | 'checklist'
```

### Gamification
- **Stars** — 1–3 per lesson, based on score
- **XP** — earned per activity; accumulates across sessions
- **Badges** — 80 defined in `badge_definitions`; awarded to `pupil_badges`
- **Streaks** — daily activity streaks, tracked in `streaks` table

### Connect Grid
L27–34 (the Connect Grid unit) is supported in IP as well as PWP Studio. The planning tool is surfaced as an embedded component within the relevant IP lessons.

### `UserRole` in IP app
Only `'pupil' | 'teacher' | 'admin'`. **Do not add `parent`** — parents manage everything through `pwp-studio.wrife.co.uk`. The IP app delegates all parent actions cross-origin to PWP Studio.

### Home Sign-Up on IP
`practice.wrife.co.uk/home-signup` exists but **redirects cross-origin to `pwp-studio.wrife.co.uk/pricing`**. All payment processing and child provisioning happens on PWP Studio.

---

## 8. Sub-App Detail: Daily Writing Practice (DWP)

**URL:** `dailywrite.wrife.co.uk` | **Repo:** `wrife-dwp`

DWP is the AI-assessed daily writing app. Pupils write extended responses to daily prompts, receive AI feedback scored against the 8-strand writing rubric, and progress through 40 curriculum levels.

### Structure
- **40 Levels** — mapped to the 67-lesson curriculum progression
- **365 Daily Prompts** — seeded live in `dwp_daily_prompts`
- **5 Prompt Categories:** Sensory (60), Narrative (105), Reflection (60), Description (80), Argument (60)
- **AI Assessment** — `dwp-assess` Edge Function uses GPT-4o; scores against the 8-strand rubric

### RLS Rule for DWP
DWP uses an auth-user join pattern because pupils authenticate via Supabase Auth but are stored in the `pupils` table:
```sql
-- CORRECT — always this pattern for DWP RLS policies:
pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid())

-- NEVER this — pupils.id ≠ auth.uid():
pupil_id = auth.uid()
```

### `home_accounts` Constraint
The `app_origin` column on `home_accounts` must include `'dwp'`:
```sql
CHECK (app_origin IN ('pwp', 'ip', 'dwp'))
```

### Learning Events from DWP
DWP writes to `learning_events` with `app = 'dwp'`. Event types:
- `level_completed` — pupil completes a DWP level
- `daily_prompt_submitted` — pupil submits a daily prompt response

---

## 9. Data Architecture

### Single Supabase Project
```
Project ID:   gzmgjkbtsvezfclmreru
Project name: WriFe Platform
Region:       (UK)
```

Never create a second Supabase project for a WriFe feature. All new tables go into this project.

### Critical Schema Gotchas

**`pupils.class_id` is INTEGER; `classes.id` is UUID.** This is a legacy mismatch that cannot be joined directly. Never write `JOIN classes ON classes.id = pupils.class_id`. Use `class_members` to link pupils to classes, or `classes.home_account_id` for home classes.

**`home_accounts` uses `home_account_id`** (not `owner_id`) for class ownership.

**`pupil_parent_links` uses `parent_auth_id`** (not `parent_account_id`).

**`profiles.role`** is the source of truth for user role. Never read role from the JWT — always fetch the profile after sign-in.

### Connection Pool
`lib/db.ts` in `wrife-website` **must stay at `max: 2`**. Supabase free tier allows ~100 total connections. Serverless Vercel functions spawn new pools per invocation. At `max: 10`, ten concurrent users exhaust the connection ceiling instantly, causing 504 cascades. The fix (ADR-001) reduced this to `max: 2` with `idleTimeoutMillis: 10000`.

### RLS Policy Pattern
All Row Level Security policies must use `auth.uid()` equality against the relevant user column. For pupils (who use `auth_user_id` not `id` as the auth link), use the sub-select pattern:
```sql
pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid())
```

### Supabase Client Singleton
Always import from `src/lib/supabase.ts` (the singleton). Never import `@supabase/supabase-js` directly in components. One Supabase client per app — shared across all components and hooks.

### Service Worker / Supabase Edge Functions
`wrifeapp/vite.config.ts` **must include NetworkOnly rules** for `/functions/` and `/auth/` before any NetworkFirst rule. Without this, the service worker intercepts Edge Function calls and auth token refreshes, causing silent authentication failures.

### Pupil Session Storage
- School pupils (Route A): session tokens handled by Supabase SDK from hash
- Sub-app standalone pupils: `localStorage.getItem('pupilSession')` only — never a Supabase cookie for pupils
- Pending child (Route C): `sessionStorage.getItem('wrife_pending_child')` — written by home-signup flow, read by ParentPage
- Profile cache (wrifeapp): `localStorage.getItem('wrife_profile_v1')` — stale-while-revalidate pattern

---

## 10. The `learning_events` Bridge

`learning_events` is the single data channel through which sub-apps communicate progress to `wrife.co.uk`. This table is **owned by wrife-website** (schema changes happen in the wrife-website migration folder only). Sub-apps **INSERT rows only** — they never ALTER the schema.

### Schema
```sql
CREATE TABLE learning_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id     UUID NOT NULL,          -- = auth.uid() = pupils.auth_user_id
  app          TEXT NOT NULL CHECK (app IN ('pwp', 'ip', 'dwp')),
  event_type   TEXT NOT NULL,
  event_data   JSONB DEFAULT '{}',
  class_id     UUID REFERENCES classes(id),  -- nullable for home learners
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### Registered Event Types

**PWP (`app = 'pwp'`)**

| event_type | event_data keys | Meaning |
|---|---|---|
| `formula_completed` | `level`, `score`, `attempts` | Pupil completed a formula level |
| `chain_session_completed` | `level`, `sentences_built`, `streak_day` | Daily chain session done |
| `free_practice_session` | `sentences_built`, `theme` | Free practice session done |
| `pwp_level_advanced` | `from_level`, `to_level` | Pupil advanced to a new level |

**IP (`app = 'ip'`)**

| event_type | event_data keys | Meaning |
|---|---|---|
| `lesson_completed` | `lesson_id`, `stars`, `xp_earned` | Lesson finished |
| `world_completed` | `world_id`, `badge_earned` | World boss challenge beaten |
| `badge_earned` | `badge_id`, `badge_name` | Any badge unlocked |
| `streak_milestone` | `streak_days` | 3 / 7 / 14 / 30 / 60-day streak |

**DWP (`app = 'dwp'`)**

| event_type | event_data keys | Meaning |
|---|---|---|
| `level_completed` | `level`, `score` | DWP level completed |
| `daily_prompt_submitted` | `prompt_slug`, `word_count`, `score` | Daily prompt submitted |

### How Sub-Apps Write Events
```typescript
await supabase.from('learning_events').insert({
  pupil_id: session.user.id,
  app: 'pwp',
  event_type: 'formula_completed',
  event_data: { level: 12, score: 90, attempts: 2 },
  class_id: pupilSession.classId ?? null,  // nullable for home learners
})
```

### How wrife.co.uk Reads Events
The teacher's `ClassActivityPanel` component joins `class_members → pupils → learning_events` to display per-pupil PWP, IP, and DWP activity tabs in the teacher class view.

**When to add a new event type:** Document it here first (in the table above), then write the INSERT in the sub-app. Never leave an undocumented event type in the wild.

---

## 11. Billing & Subscription Architecture

### School Subscriptions (B2B)

Managed on `wrife.co.uk` via the admin panel. Stored in the `subscriptions` table.

| Tier | Teachers | Pupils | Price |
|------|----------|--------|-------|
| Trial | 5 | 150 | Free (pilot phase) |
| Basic | 10 | 300 | £500/year per school |
| Pro | 25 | 750 | £1,200/year per school |
| Enterprise | Unlimited | Unlimited | Custom |

**Quota enforcement:** Teacher count calculated from unique `teacher_id` values in `classes`. Pupil count from `class_members`. Block new additions when at limit; show warning at 90%.

**School self-registration:** Schools submit via the public form at `/school-register`. Stored in `school_registrations`. Super admin reviews at `/admin/registrations`.

### Home Subscriptions (B2C)

Managed on `pwp-studio.wrife.co.uk` via Stripe. Flow:
1. Parent completes home sign-up form → `stripe-checkout` Edge Function creates Stripe session
2. Parent pays → Stripe fires webhook to `stripe-webhook` Edge Function
3. `membership_tier` updated on `profiles`; `create-child-profile` called
4. Parent manages billing at `pwp-studio.wrife.co.uk/parent` via `stripe-portal` Edge Function

**Status (Session 39):** The Stripe webhook provisioning step is not yet complete. The home sign-up page reaches `/pricing` but post-payment child credential provisioning needs finishing.

### Subscription Data
```sql
subscriptions (
  id              UUID PRIMARY KEY,
  school_id       UUID REFERENCES schools(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier            TEXT CHECK (tier IN ('trial','basic','pro','enterprise')),
  status          TEXT,    -- 'active' | 'cancelled' | 'past_due'
  teacher_limit   INTEGER,
  pupil_limit     INTEGER,
  current_period_end TIMESTAMPTZ
)
```

---

## 12. AI Assessment System

### Assessment Bands
| Band | Number | Description |
|------|--------|-------------|
| Emerging | 1 | Writing shows early signs of the target feature |
| Developing | 2 | Feature present but inconsistent |
| Secure | 3 | Feature reliably demonstrated |
| Greater Depth | 4 | Feature used with sophistication and effect |

### The 8 Assessment Strands
```typescript
type RubricCriterionId =
  | 'audience_purpose'    // Understanding and addressing the intended audience
  | 'structure'           // Organisation and sequencing of ideas
  | 'sentence_control'    // Grammatical correctness and sentence variety
  | 'cohesion'            // Flow and connection within and across paragraphs
  | 'vocabulary'          // Word choice, precision, and effect
  | 'mechanics'           // Spelling, punctuation, capitalisation
  | 'genre_features'      // Meeting the conventions of the target text type
  | 'project_skills'      // Research, planning, and process skills
```

### AI Models in Use
- `assess-formula` — GPT-4o-mini (formula sentence validation, low latency)
- `assess-paragraph` — GPT-4o-mini (paragraph structure assessment)
- `assess-writing` — GPT-4o (full 8-strand rubric; higher quality, higher cost)
- `dwp-assess` — GPT-4o (DWP daily writing assessment)

### Feedback Output Structure
```typescript
interface AiAssessmentResult {
  overallScore: number;              // 1.0–4.0 weighted average
  band: 'Emerging' | 'Developing' | 'Secure' | 'Greater Depth';
  criterionScores: Record<RubricCriterionId, CriterionScore>;
  teacherRationale: string;          // 2–3 sentence summary for teacher
  studentFeedback: StudentFeedbackItem[];  // child-friendly feedback cards
  mechanicalEdits: {
    spelling: MechanicalEdit[];
    punctuation: MechanicalEdit[];
    grammarSuggestions: MechanicalEdit[];
  };
  improvedParagraphExample: string;  // 1–2 improved paragraphs
  confidence: ConfidenceInfo;        // AI confidence 0–1
  explainability: string;            // how the score was calculated
}
```

### Student Feedback Card Types
- **Praise** (green) — "What you did well"
- **NextStep** (yellow) — "One thing to improve"
- **Practice** (blue) — "Try this mini challenge"

### PWP Formula Difficulty Profiling
`difficulty_profile` on `formula_progress` is a rolling window of the pupil's last 5 formula scores. `ready_to_advance = true` when the last 3 scores all exceed 95.

---

## 13. Design System

### Design Philosophy: Chromatic Momentum

WriFe's visual language is built on the principle that colour carries forward motion — the palette creates velocity and joy without animation. Key characteristics:
- **Diagonal compositional axis** — content leans upper-left; mascots orbit lower-right
- **Dynamic scale hierarchy** — key typographic elements set at 3× the secondary text
- **Constellated mascot** — WriFi appears in multiple simultaneous poses across a layout
- **Syncopated rhythm** — alternating large/dense/open beats across the page
- **Hard shadows with intent** — cast at consistent angles, like stage lighting

### Brand Colour Tokens

```css
/* Core brand — all three apps must use these */
--color-brand-primary:    #6C5CE7;  /* royal purple — authority, structure */
--color-brand-secondary:  #F5A623;  /* athletic orange — energy, CTA */
--color-background:       #FDF8EE;  /* warm cream — safe, warm learning space */

/* App signature accents */
--color-pwp-accent:  #00B894;  /* teal — creativity, flow */
--color-ip-accent:   #0984E3;  /* electric blue — adventure, energy */
--color-dwp-accent:  #6C5CE7;  /* purple (shared with platform) */

/* Semantic */
--color-success:  #58C791;
--color-warning:  #FFCF4A;
--color-danger:   #E11D48;
--color-muted:    #6B7280;
--color-surface:  #FFFFFF;
--color-border:   #E3E6F0;
--color-text:     #19213D;
```

**wrife.co.uk historically used `--wrife-blue: #2E5AFF` as its primary, which is off-brand.** It should migrate to `#6C5CE7` to match the canonical purple across all apps (ADR-004).

### Typography
- **Headings:** Baloo 2, 24–40px, weight 600–700
- **Teacher body:** Inter / Nunito, 14–16px, weight 400–500
- **Pupil body:** Inter / Nunito, 16–18px (larger for readability at age 6–10)
- **Display numbers** (streaks, counts): treated as typographic events — huge, coloured, bold

### Component Conventions
```css
cards:   rounded-2xl, shadow-soft, border 1px var(--color-border)
buttons: rounded-full, px-6 py-2
badges:  rounded-full, px-3 py-1, text-xs font-semibold
```

### Admin Theme (wrife.co.uk `/admin`)
Dark portal: `bg-gray-900`, `text-gray-100`. Cards: `bg-gray-800`, `border-gray-700`. Buttons: `bg-blue-600`. This dark treatment is intentional — it visually separates the super admin portal from all teacher and pupil interfaces.

### WriFi the Pencil — Official Mascot
- **Character:** Friendly yellow pencil, child-appropriate (ages 6–10)
- **Body colour:** `#FFCF4A` (var(--wrife-yellow))
- **Eraser:** `#FF7A64` (coral pink)
- **Eyes:** `#19213D` (dark blue)
- **Personality:** Encouraging, patient, celebrates effort, never critical

**Where WriFi appears:**
- Login pages: waving "Welcome back!"
- Pupil dashboard: showing today's writing target
- Practice activities: appearing with encouragement mid-session
- AI feedback screens: introducing praise and next-step cards
- Gamification: jumping / celebrating on badge awards and streak milestones

**WriFi usage rules:**
- Always encouraging, never critical
- Use speech bubbles for tips and hints
- Animate only for celebrations (subtle bounce/fade — not distracting)
- Never use WriFi in formal reports, official documents, or admin screens

### Assessment Badge Colours
- Foundation (L1–17): Blue circle
- Application (L18–34): Green circle
- Mastery (L35–67): Gold circle with shine
- Streaks: 5-day, 10-day, 20-day — orange/red flame gradient

---

## 14. Development Governance

### The Cardinal Rule: Stay in Your Lane

When working in `wrifeapp`: only create/alter tables in the PWP-owned list.  
When working in `InteractivePracticeApp`: only create/alter tables in the IP-owned list.  
When working in `wrife-dwp`: only create/alter tables in the DWP-owned list.  
When working in `wrife-website`: you may alter any table, but flag cross-app impact explicitly.

**The accident to avoid:** In Session 35, an entire `app/pwp/` implementation was built inside `wrife-website` by mistake. It took a full day to surgically remove (git reset to `375d29d`). The `PROJECT_CONTEXT.md` now has a prominent warning at the top.

### Cross-Repo Change Order

If a feature spans multiple repos, always complete in this order:
1. **Schema migration first** — apply to `gzmgjkbtsvezfclmreru` via wrife-website migrations
2. **wrife-website API routes** — if new endpoints are needed on the hub
3. **Sub-app second** — consume the new schema or call the new endpoints
4. **Verify cross-app checklist** before merging either

Never interleave edits across repos in a single session — git state gets confused.

### When wrife.co.uk Must Be Updated

A sub-app change requires a wrife.co.uk change only when:
- A **new assignment type** is needed on the teacher dashboard
- A **new data point** needs to appear in the teacher's class view
- The **pupil dashboard SSO tile** needs updating
- A **new `learning_events` event_type** is introduced (document it in Section 10 first)

All other sub-app changes are **self-contained**.

### Standalone Mode Always Works

Both sub-apps must function when `class_id` is null (home learners, standalone access). Every new progress/session table must have `class_id` nullable. Every upsert must use `pupil_id` as the sole conflict key when `class_id` is null.

### Feature Parity

Any access pattern supported by one sub-app must eventually be supported by all relevant sub-apps. If one app handles home learner login, both apps must handle it.

### TypeScript Discipline
- Run `npx tsc -b --noEmit` before every push — zero errors required
- Never commit with TypeScript failures — they ship to production

### Commit Format
```
feat(scope): description
fix(scope): description
chore(scope): description
```

One logical commit per repo per session.

### Pool Limit — Never Increase Without Upgrading Supabase
`lib/db.ts` in wrife-website: `max: 2`. This is a hard constraint on the free tier. Upgrading Supabase to Pro (£22/month) removes the ceiling — but until that upgrade is done, `max: 2` must not be changed.

### Session Start Checklist
1. Run `wrife-supabase-health` skill — wakes paused projects
2. Read `PROJECT_CONTEXT.md` in the active repo — current sprint state
3. Read `PLATFORM_STATUS.md` — cross-app feature status
4. Read this document (relevant sections) — architectural constraints

---

## 15. Cross-App Pre-Ship Checklist

Before shipping any change that touches auth, schema, or cross-app integration:

### Auth / Session
- [ ] Route A (hub hash-token): Supabase SDK auto-handles hash on sub-app load?
- [ ] Route B (standalone direct login): only accepted for Route C/D users (home learners, independent teacher pupils)?
- [ ] Sub-app `/login` redirects school pupils to wrife.co.uk? (Route B retired for school accounts)
- [ ] Route C (home learner): all features work with home class (nullable class_id)?
- [ ] Route D (independent teacher): teacher can log in and see their class?
- [ ] `← WriFe` back button: shown only when `sessionStorage.entryViaHub === '1'`?
- [ ] `class_id` nullable: all new tables and upserts handle null class?
- [ ] `profiles.role` fetched post-sign-in (not read from JWT)?

### Schema / Migrations
- [ ] Migration targets `gzmgjkbtsvezfclmreru` only?
- [ ] Table owned by this repo (not another repo's table)?
- [ ] New RLS policies use `auth.uid()` equality (or sub-select for pupil tables)?
- [ ] Gamification columns added to `formula_progress` (not `pwp_pupil_progress`) with `NOT NULL DEFAULT`?
- [ ] New `learning_events` event_type documented in Section 10?
- [ ] `home_accounts.app_origin` constraint includes 'dwp' if DWP is involved?

### Edge Functions
- [ ] CORS headers include `authorization, x-client-info, apikey, content-type`?
- [ ] DWP Edge Functions use `pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid())`?

### Post-Deploy Smoke Test
1. Login at `wrife.co.uk/pupil/login` → SIL42495 / amab04 / 9543
2. Click "Write →" → `pwp-studio.wrife.co.uk/dashboard` loads authenticated ✅
3. Click "Play →" → `practice.wrife.co.uk/world-map` loads authenticated ✅
4. Both show `← WriFe` back button ✅
5. Visit `pwp-studio.wrife.co.uk/login` directly with school pupil credentials → redirected to wrife.co.uk ✅
6. Teacher login: `mankrah@kafed.org.uk / niiotin99` → teacher dashboard loads ✅
7. Teacher class view: PWP / IP / DWP tabs visible in ClassActivityPanel ✅

---

## 16. Architecture Decision Record (ADR) Log

This log records significant architectural decisions, when they were made, and why. Before reopening a settled decision, read the reasoning here.

---

**ADR-001 · Database Pool Limit**  
*Date:* 2026-04 (approx Session 10)  
*Decision:* Set `Pool max: 2` in `lib/db.ts`.  
*Why:* `max: 10` caused connection exhaustion on Supabase free tier (max ~100 connections). Ten concurrent users × 10 pool connections = instant timeout cascade → 504 on all dashboard routes.  
*Constraint:* Until Supabase is upgraded to Pro, this limit must not increase.

---

**ADR-002 · Single Supabase Project for All Apps**  
*Date:* 2026-04 (Architecture Audit Session 4)  
*Decision:* All four apps share `gzmgjkbtsvezfclmreru`. Legacy projects `rxmitjrbrsqjeymsycoj` and `nxhkpqngnxshgotvuujb` are retired.  
*Why:* Auth is unified — a single auth token works across apps. The `learning_events` bridge requires both the writing app and wrife.co.uk to read/write the same database. Separate projects would require a sync layer that doesn't scale.  
*Trade-off:* All table-ownership discipline is enforced by convention (not database isolation). The Cross-Repo Change Order (Section 14) is the mitigation.

---

**ADR-003 · Route B Retired for School Pupils**  
*Date:* 2026-05 (Session ~20)  
*Decision:* Sub-app direct login (`/login` on pwp-studio and practice.wrife.co.uk) must reject school-account class codes and redirect to `wrife.co.uk/pupil/login`.  
*Why:* Two login paths for school pupils caused session confusion: pupils who logged in directly via Route B had `localStorage.pupilSession` set but no hub session, leading to stale state when they later arrived via Route A hash-token. Teacher dashboards couldn't distinguish sessions, and `entryViaHub` flag was incorrectly set.  
*Rule:* School pupils always authenticate via wrife.co.uk. Route B remains valid only for home learners and (future) independent teacher pupils.

---

**ADR-004 · Brand Primary Colour: Purple, Not Blue**  
*Date:* 2026-05 (Architecture Audit Session 4)  
*Decision:* Canonical brand primary is `#6C5CE7` (royal purple). `wrife.co.uk` historically used `#2E5AFF` (blue) — this is off-brand and should be migrated.  
*Why:* Interactive Practice and PWP Studio both use `#6C5CE7`. A teacher switching from wrife.co.uk to practice.wrife.co.uk sees a jarring blue→purple transition. Design authority is the `wrife_design_philosophy.md` document, which specifies purple throughout.  
*Status:* Migration of wrife.co.uk pending.

---

**ADR-005 · PWP Progress Table: `formula_progress`, Not `pwp_pupil_progress`**  
*Date:* 2026-04  
*Decision:* All new PWP gamification and progress columns go to `formula_progress`.  
*Why:* `DashboardPage.tsx` queries `formula_progress`. `pwp_pupil_progress` is a parallel legacy table that is not surfaced in any current UI. Adding columns to the wrong table causes them to be invisible.  
*Rule:* Any new column must use `NOT NULL DEFAULT <value>` to backfill existing rows automatically.

---

**ADR-006 · DWP RLS Must Use Sub-Select Pattern**  
*Date:* 2026-05-16 (Session 36)  
*Decision:* DWP Edge Functions and RLS policies must use `pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid())`.  
*Why:* DWP pupils authenticate via Supabase Auth, which gives them `auth.uid()` = `auth_user_id`. But `learning_events.pupil_id` and DWP tables reference `pupils.id` (a different UUID). `pupil_id = auth.uid()` returns zero rows — it joins on the wrong column.  
*Rule:* Never use `pupil_id = auth.uid()` in any WriFe RLS policy or Edge Function that involves the `pupils` table.

---

**ADR-007 · Workbox NetworkOnly for Supabase Endpoints**  
*Date:* 2026-05-17 (Session 39)  
*Decision:* `wrifeapp/vite.config.ts` Workbox config must include NetworkOnly rules for `/functions/` and `/auth/` before any NetworkFirst rule.  
*Why:* Without this, the service worker intercepted Supabase Edge Function calls and auth token refreshes when the SW had a cached response. The result was stale or empty responses that looked like network failures, breaking login and all Edge Function-backed features silently.  
*Rule:* Any new sub-app with a service worker must include identical NetworkOnly rules before going live.

---

**ADR-008 · CORS Headers Must Include `apikey`**  
*Date:* 2026-05-17 (Session 37)  
*Decision:* All WriFe Edge Functions must include `apikey` in their CORS `Access-Control-Allow-Headers`.  
*Why:* Supabase's JS client sends the `apikey` header on all requests. If the Edge Function's CORS preflight doesn't allow `apikey`, the browser silently drops the request with `TypeError: Failed to fetch` — no meaningful error in the console. This burnt hours debugging DWP Edge Functions.  
*Standard:* `authorization, x-client-info, apikey, content-type` — copy this exactly into every new Edge Function.

---

**ADR-009 · PWP Studio Does Not Live in wrife-website**  
*Date:* 2026-05-13 (Session 35)  
*Decision:* Never build PWP pupil experience routes (`app/pwp/`, `components/pwp2/`) inside the `wrife-website` repo.  
*Why:* An entire PWP implementation was built inside wrife-website by mistake and had to be surgically removed via `git reset --hard 375d29d`. One full day lost.  
*Rule:* `wrife-website` contains only teacher-dashboard display components for PWP (review modals, chain tabs) and teacher-facing API routes. The pupil PWP experience lives in `wrifeapp`.

---

**ADR-010 · `learning_events` Schema Owned by wrife-website Only**  
*Date:* 2026-05 (Session ~22)  
*Decision:* The `learning_events` table schema is owned and migrated exclusively by wrife-website. Sub-apps INSERT rows; they never ALTER or DROP columns.  
*Why:* wrife.co.uk reads `learning_events` for the teacher class view. If a sub-app alters the schema without coordinating with wrife-website, the teacher view breaks silently. Schema authority must be centralised.  
*Process:* To add a new event_type or column: document it in Section 10 of this document, then add the migration in wrife-website, then update the sub-app.

---

*End of WriFe Platform Architecture Document v1.0*  
*Next review: when a new app is added, when a login route is opened or closed, or when a cross-repo schema change is agreed.*
