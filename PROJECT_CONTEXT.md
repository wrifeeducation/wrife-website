# WriFe Platform
*Last updated: 2026-05-03 · Session 15*

## Current state
Full-stack Next.js educational platform at wrife.co.uk and PWP Studio at pwp.studio.wrife.co.uk. Both deployed on Vercel, sharing Supabase Platform (`gzmgjkbtsvezfclmreru`).

**PWP Daily Chain Practice — Phases A, B, and C are fully complete and live.**

---

### Phase A (Session 12)
4 new DB tables (`pwp_pupil_levels`, `pwp_chain_sessions`, `pwp_chain_sentences`, `pwp_class_themes`), full daily-practice flow in PWP Studio (L1–L10), teacher completion grid on class PWP tab.

### Phase B (Session 13)
- `parseSentence.ts` extended for L11–L30 vocab (modals, irregular verbs, adjectives, adverbs)
- `formulaDefinitions.ts` extended to L11–L30 with `alternatives` mechanism
- `validateChainSentence.ts` — alternatives support
- Mastery signal on pupil dashboard `DailyPracticeCard` (progress bar + gold banner)
- `POST /api/teacher/pwp/advance-level` — teacher advances mastery-signalled pupil to next level
- `PWPChainTab.tsx` — "→ L{n+1}" advance button per mastery row

### Phase C (Sessions 14–15)
- **`pwp_free_practice_sentences` table** — live on Platform DB (no UNIQUE constraint)
- **`ChainRow` help mode** — `helpMode` prop shows word-class colour bands above input
- **`ChainBuilder` help mode** — threads `helpMode` prop down to each ChainRow
- **`FreePracticePage`** (`/free-practice`) — unlimited sessions, help mode on, 5 XP/sentence, L(n+1) challenge row, weekly theme wired
- **Dashboard** — orange "🎨 Free Practice" button below the daily chain card
- **Weekly theme setter** — `GET/POST /api/teacher/pwp/set-theme`; teacher form in `PWPChainTab.tsx`; both `/daily-practice` and `/free-practice` query `pwp_class_themes` and pass theme to `SubjectPicker`
- **Chain streak display** — `computeChainStreak()` derives consecutive-day streak from `pwp_chain_sessions`; shown as "🔗 Nd streak" pill inside `DailyPracticeCard`
- **Level distribution chart** — bottom of `PWPChainTab.tsx`; client-side bar chart from `pupils` array, 🏆 marker on levels with mastery-signalled pupils

---

## Mastery point thresholds
`calculateMasteryPoints`: perfect session = 4 pts. `mastery_signal` fires at `mastery_points >= 12` (~3 perfect sessions).

## Architecture decision (2026-05-02)
**wrifeapp** is the PWP Studio codebase (`pwp.studio.wrife.co.uk`). The three apps share one Supabase Platform project:
- wrife.co.uk → teacher dashboard + admin (Platform DB)
- practice.wrife.co.uk → Interactive Practice (Platform DB ✅)
- pwp.studio.wrife.co.uk → PWP Studio (Platform DB ✅)

## Session collision fix (deployed 2026-05-03, commit 959ed30)
Pupil SSO tokens are stored in `localStorage` under `pupilSSOTokens` only — never via `supabase.auth.setSession()`.
`lib/pupil-sso.ts` reads from `localStorage.pupilSSOTokens` to build cross-domain hash URLs.

## Process — Post-phase smoke testing
After every phase: teacher login → class page → new tab → assign something → pupil login → pupil dashboard → complete activity → check it saved.

## Files changed in Session 15
### wrifeapp (PWP Studio)
- `src/pages/DashboardPage.tsx` — chain streak query + `computeChainStreak()` + `chainStreak` prop on `DailyPracticeCard`
- `src/pages/FreePracticePage.tsx` — weekly theme query wired to SubjectPicker

### wrife-website (wrife.co.uk)
- `app/api/teacher/pwp/set-theme/route.ts` — new GET + POST endpoint
- `components/PWPChainTab.tsx` — weekly theme setter UI + level distribution bar chart
