# WriFe Platform — Architecture Review & Integration Plan
*Generated: 2026-05-02 · Claude Architecture Audit Session 4*

---

## Executive Summary

WriFe currently operates as **three completely separate apps** with independent databases, codebases, and authentication systems. Teachers must log into each product separately; none of the three apps share data. The immediate priority is (1) fixing critical infrastructure failures, (2) unifying the teacher/admin experience into a single dashboard, and (3) aligning the brand across all three products. Done right, this puts WriFe ahead of every competitor in the UK primary EdTech space — none offer a single platform where gamified practice, structured sentence writing, and deep writing assessment are all visible to the teacher in one place.

---

## 1. Current State: Three Apps, Zero Integration

| App | URL | Stack | Supabase Project | Status |
|---|---|---|---|---|
| **WriFe Platform** | wrife.co.uk | Next.js 15 / Tailwind / Drizzle | `gzmgjkbtsvezfclmreru` | ⚠️ 504 on dashboard |
| **Interactive Practice** | practice.wrife.co.uk | React 18 SPA / Vite / Framer Motion | `rxmitjrbrsqjeymsycoj` | ✅ Loading (confirmed) |
| **PWP Studio** | pwp.studio.wrife.co.uk | React 18 SPA / Vite | Unknown / same as practice | ⚠️ Intermittent errors |

### What teachers experience today
A teacher who uses all three products must:
1. Log into **wrife.co.uk** → manage classes, assign PWP/DWP, download lesson materials
2. Log into **practice.wrife.co.uk** → see pupil gamified practice progress (separate login)
3. Log into **pwp.studio.wrife.co.uk** → (separate login)

There is **zero cross-app visibility**. A teacher cannot see a pupil's Interactive Practice XP, badge count, or world progress from the wrife.co.uk teacher dashboard.

---

## 2. Critical Bugs (Fix Immediately)

### 🔴 BUG-01 — Dashboard 504 Gateway Timeout
**Root cause identified:** `lib/db.ts` sets `Pool max: 10`. In Vercel's serverless environment, every function invocation spawns a new pool that opens up to 10 Postgres connections. Supabase free tier allows ~100 total connections. Ten concurrent users × 10 connections each = instant exhaustion → timeout cascade → 504.

**Fix applied (this session):** `max: 2`, `idleTimeoutMillis: 10000`, `connectionTimeoutMillis: 8000`. See `lib/db.ts`.

**Additional recommended fix:** Switch the `PROD_DATABASE_URL` from the direct Postgres URI to Supabase's **Session Mode pooler URL** (port 5432, Transaction Mode for higher concurrency). This multiplexes connections through PgBouncer and removes the ceiling entirely.

### 🔴 BUG-02 — Supabase Auth `TypeError: Failed to fetch` (7+ retries/minute)
**Root cause:** The Supabase JS client retries `_refreshAccessToken` indefinitely on network failure. When the Supabase project is slow or rate-limited, this fires 7+ errors per minute in the browser console, potentially degrading performance.

**Fix needed in `lib/auth-context.tsx`:** Wrap `getSession()` with a timeout and add exponential backoff detection. If Supabase is unreachable, degrade gracefully to "not logged in" state rather than retrying forever.

### 🟠 BUG-03 — PWP Studio intermittent errors
**Symptom:** pwp.studio.wrife.co.uk shows error page on initial load; may require refresh. Likely caused by the same Supabase connection issues, or the Vite SPA failing when the Supabase project is paused.

**Fix needed:** Add an error boundary with a "WriFe is waking up — please refresh in a moment" screen. Free-tier Supabase projects pause after 1 week of inactivity; the keep-alive task (Monday 9am ping) may have stopped running.

### 🟠 BUG-04 — Interactive Practice World Map: Only World 1 visible
**Symptom:** Alex's world map shows World 1 (The Storyteller's Island) expanded with 9 lessons, but Worlds 2–6 do not appear at all — the right panel is blank.

**Root cause:** The database for `rxmitjrbrsqjeymsycoj` only has World 1 seeded. Worlds 2–6 (61 lessons total per the architecture spec) have not been populated yet.

**Fix needed:** Seed all 6 worlds into the Interactive Practice Supabase project. Until then, add "Coming Soon" world cards for Worlds 2–6 so the UI doesn't look broken.

### 🟡 BUG-05 — Homepage sections below hero appear blank on first paint
**Symptom:** On initial load, the area below the hero section appears blank for 1–2 seconds before content renders.

**Root cause:** The page is a `"use client"` root that imports multiple components. The Supabase `Failed to fetch` errors (BUG-02) cause a brief render delay. `FeaturedLessons` has a static fallback but the hydration pause is visible.

**Fix needed:** Convert `FeaturedLessons` to an SSR component (Server Component) that fetches data at request time. Remove `"use client"` from `app/page.tsx` and extract only interactive sub-components as Client Components.

---

## 3. Design & Brand Audit

### 3.1 Design Token Inconsistency — CRITICAL
The three apps use completely different colour systems:

| Token | wrife.co.uk | Interactive Practice | WriFe Architecture Spec |
|---|---|---|---|
| Primary | `--wrife-blue` #2E5AFF | `--color-brand-primary` #6C5CE7 | #6C5CE7 purple ✅ |
| CTA button | `--wrife-orange` #F97316 | `--color-brand-secondary` #F5A623 | #F5A623 orange |
| Background | `--wrife-bg` #FFF9F0 | `--color-background` #FDF8EE | #FDF8EE cream |
| Font (display) | Baloo 2 + Nunito | System sans-serif | System sans-serif |

**Impact:** A teacher switching between wrife.co.uk and practice.wrife.co.uk sees a jarring change from blue to purple. The blue primary on wrife.co.uk is off-brand. **wrife.co.uk should migrate to the canonical purple `#6C5CE7`.**

### 3.2 Mascot Inconsistency
- **wrife.co.uk** uses: `BookLogo`, `OwlMascot`, `ChildMascot`, `BearMascot`, `PencilMascot` (5 characters)
- **Interactive Practice** uses: One yellow pencil character (correct per architecture spec)
- **Architecture spec mandates:** ONE yellow pencil character, four poses only

**Impact:** Multiple mascots dilute brand identity and increase visual noise. The owl and child mascots on wrife.co.uk should be retired; the yellow pencil should be the only character across all apps.

### 3.3 Mobile Responsiveness

| Area | Issue |
|---|---|
| Teacher dashboard tab bar | 7 tabs (`overview, lessons, pwp, dwp, pupils, assignments, classes`) do not collapse on mobile — overflow hidden on small screens |
| Interactive Practice sidebar | The left stats sidebar occupies 190px at all screen widths; on small tablets this leaves only ~570px for content |
| Pupil login on practice app | ✅ Works well on mobile — class code, name, PIN fields scale correctly |
| Landing page hero | ✅ Responsive with `sm:/md:/lg:` breakpoints |
| Classes page tabs | Same issue as dashboard — 4 tabs (`pupils, progress, pwp, dwp`) need a mobile-friendly scrollable row or dropdown |

### 3.4 Sound Effects
- **Interactive Practice:** The architecture spec defines sound events (correct answer, wrong answer, badge unlock). Need to verify these are wired up in the actual Vite app. No sound was audible in desktop testing (browser may have blocked autoplay). The WriFe Interactive Practice Rebuild skill notes that early lessons (L1-L11) had sound issues.
- **wrife.co.uk:** No sound effects present — not expected for a teacher-facing tool.
- **PWP Studio:** Unknown — needs testing once stable.

**Recommendation:** Ensure all Interactive Practice sound effects are:
1. Triggered correctly on correct/wrong answer, XP gain, and badge unlock
2. Gated behind a `prefers-reduced-motion` / silent mode toggle
3. Loaded as short OGG/MP3 files (not base64 embedded) for performance

---

## 4. Integration Plan

### Phase 1 — Infrastructure Stability (1–2 weeks)
These must be done before any integration work.

| # | Task | File/Location | Priority |
|---|---|---|---|
| 1.1 | ✅ Fix db.ts pool (max: 2) | `lib/db.ts` | DONE |
| 1.2 | Switch PROD_DATABASE_URL to Supabase pooler URL | Vercel env vars | Critical |
| 1.3 | Fix auth-context Supabase retry spam | `lib/auth-context.tsx` | High |
| 1.4 | Add error boundary + "waking up" screen to PWP Studio | PWP app | High |
| 1.5 | Seed Worlds 2–6 into Interactive Practice DB | `rxmitjrbrsqjeymsycoj` | High |
| 1.6 | Add "Coming Soon" placeholder cards for Worlds 2–6 | Practice app | Medium |
| 1.7 | Verify Supabase keep-alive task is still active | Cowork scheduled tasks | High |
| 1.8 | Convert homepage FeaturedLessons to Server Component | `app/page.tsx` | Medium |

### Phase 2 — Unified Authentication (2–3 weeks)
**Goal:** One login, all three apps.

**Recommended approach:** Share the wrife.co.uk Supabase project (`gzmgjkbtsvezfclmreru`) across all three apps.

Steps:
1. **Migrate Interactive Practice** to use `gzmgjkbtsvezfclmreru` Supabase project
   - Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in practice app
   - Migrate `practice_progress`, `streaks`, `badges`, `xp_transactions` tables to main project
   - Add a `practice_app_users` link table that maps profiles to their practice identities
2. **Add a cross-app JWT handshake**: When a teacher logs into wrife.co.uk, they get a Supabase session token. The wrife.co.uk dashboard can generate a short-lived signed URL that automatically logs the teacher into practice.wrife.co.uk using the same session.
3. **Pupil SSO**: Pupils who log into practice.wrife.co.uk with class code + PIN should be creatable from wrife.co.uk. Add an optional "Connect to Practice" step in the class setup flow.

### Phase 3 — Unified Teacher Dashboard (3–4 weeks)
**Goal:** The wrife.co.uk teacher dashboard shows data from all three products in one view.

**New dashboard tab: "Interactive Practice"**
- Shows per-pupil XP, streak, badges earned, lessons completed, current world
- Shows class-level stats (average XP, most popular world, completion rate)
- Links out to practice.wrife.co.uk with an SSO handshake (from Phase 2)

**Enhancements to existing tabs:**
- **Overview tab**: Add "Interactive Practice" summary card alongside PWP and DWP cards
- **Pupils tab**: Expand pupil row to show practice XP and star count inline
- **Reports**: Include Interactive Practice data in the NC progress report

**New admin capability: Cross-app analytics**
The admin dashboard (`/admin`) should aggregate stats across all three apps:
- Total active pupils across all products
- Which schools are using which products
- Engagement data (daily active users per product)

### Phase 4 — Brand Unification (parallel with Phase 3)
1. **wrife.co.uk**: Replace all `--wrife-blue: #2E5AFF` with `--color-brand-primary: #6C5CE7`
2. **wrife.co.uk**: Retire OwlMascot, ChildMascot, BearMascot — replace with PencilMascot
3. **All apps**: Standardise font stack (Nunito body, Baloo 2 headings — already on wrife.co.uk, add to practice app)
4. **All apps**: Standardise spacing tokens and shadow tokens to match the architecture spec
5. **Landing page**: Showcase practice.wrife.co.uk directly (link-through rather than static demo iframe)

### Phase 5 — Mobile-First Polish (4–6 weeks)
1. **Dashboard tab bar**: Replace 7-tab horizontal bar with a sidebar (desktop) / bottom sheet (mobile)
2. **Interactive Practice sidebar**: Make it collapsible on tablets; show as a bottom stats bar on mobile
3. **Interactive Practice lessons**: Ensure drag-and-drop match tasks work on touch screens (known issue per the rebuild skill)
4. **Pupil login on wrife.co.uk**: Mirror the clean class code + PIN design from practice.wrife.co.uk
5. **Sound effects**: Add silent/sound toggle in Interactive Practice, persist to localStorage

---

## 5. What Would Make WriFe Unbeatable

Based on the review of the platform and the competitive landscape (Pobble, Literacy Shed, Spellzone, ReadingEggs, Boom Writer), here are the capabilities that would place WriFe clearly ahead:

### 5.1 The "One Teacher View" Dashboard
No competitor offers a single dashboard where a teacher sees:
- Pupil's gamified practice progress (stars, XP, streaks)
- Their sentence-writing performance (PWP formula accuracy)
- Their deep writing ability (DWP AI assessment band)
- Lesson material engagement (which resources were used)
- An AI-generated weekly summary per pupil

WriFe is 80% of the way there. Phase 3 above completes it.

### 5.2 Cross-Product Progress Narrative
Generate an automatic "writing journey" for each pupil that narrates their progress across all three products. Example: *"Alex has completed 4 Interactive Practice lessons, is on a 3-day streak, and has just achieved Secure band on DWP Level 7. Recommend moving to World 2 and assigning DWP Level 8."* No competitor does this.

### 5.3 AI Intervention Alerts
The intervention alerts API already exists in wrife.co.uk. Extend it to include Interactive Practice data: a pupil who completes no practice sessions for 7 days AND has low DWP scores gets an automatic "needs attention" flag in the teacher dashboard.

### 5.4 Parent-Facing Progress View
A read-only parent view (no login required, via a unique share link) showing a child's WriFe journey. Pobble has this; WriFe doesn't. This becomes a powerful word-of-mouth feature.

### 5.5 School Admin "Command Centre"
The school_admin role exists in the database but has no real dashboard. A proper school admin view showing:
- All teachers' class progress at a glance
- School-wide league tables
- Comparative data across classes
- Report generation for governors

### 5.6 Interactive Practice Worlds 2–6
Currently only World 1 (9 lessons) is seeded. The full 61-lesson arc is the product's strongest differentiator. Every week without Worlds 2–6 is lost pupil engagement.

---

## 6. Device Rendering Issues Summary

| Issue | App | Fix |
|---|---|---|
| Dashboard tab bar overflows on mobile | wrife.co.uk | Replace with collapsible nav or bottom sheet |
| Classes page tab bar same issue | wrife.co.uk | Same fix |
| Interactive Practice sidebar: fixed 190px width | practice.wrife.co.uk | Make collapsible; bottom stats bar on mobile |
| Drag-and-drop match tasks: touch unresponsive on iOS | practice.wrife.co.uk | Add `touch-action: none` + pointer events to drag targets |
| Hero section mockup cards: may overflow on narrow viewports | wrife.co.uk | Add `overflow-x: hidden` on hero section |
| PWP activity form: textarea may be too small on phone | wrife.co.uk | `min-height: 120px` on PWP text inputs |

---

## 7. Sound Effects Audit

| Product | Expected sounds | Status |
|---|---|---|
| Interactive Practice | ✅ correct answer, ❌ wrong answer, ⭐ star earned, 🏅 badge unlock, ⚡ XP gain | **Unverified** — browser autoplay policy may silently block. Needs manual test with sound on. |
| PWP Studio | Positive chime on formula accepted | **Unverified** |
| wrife.co.uk | None expected | N/A |

**Action required:** Test Interactive Practice on a mobile device with sound on. The WriFe Interactive Practice Rebuild skill notes that L1-L6 had audio issues. Add a sound toggle button (🔊/🔇) in the Interactive Practice header so pupils can control this themselves.

---

## 8. Immediate Action List (Next 48 Hours)

1. ✅ **Fix db.ts pool** — done this session
2. **Switch Vercel env `PROD_DATABASE_URL`** to Supabase Transaction Mode pooler URL (in Vercel dashboard)
3. **Check Supabase project status** — visit app.supabase.com to confirm `gzmgjkbtsvezfclmreru` is not paused
4. **Re-run the keep-alive scheduled task** to re-activate the ping
5. **Fix auth-context.tsx** — add timeout + graceful degradation for `TypeError: Failed to fetch`
6. **Deploy the db.ts fix** via `git push`
7. **Seed Worlds 2–6** into `rxmitjrbrsqjeymsycoj` (or add Coming Soon placeholders)
8. **Test sound effects** on a real mobile device in Interactive Practice

---

## 9. Files Modified This Session

| File | Change |
|---|---|
| `lib/db.ts` | Pool `max: 10 → 2`, reduced idle/connection timeouts |
| `PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md` | This document |

---

*Next session should begin with: checking Supabase project status, applying the Phase 1 fixes, and starting Phase 2 (unified auth) planning.*
