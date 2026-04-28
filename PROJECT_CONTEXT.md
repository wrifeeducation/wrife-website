# WriFe Platform
*Last updated: 2026-04-28 · Session 2*

## Current state
Full-stack Next.js educational platform at wrife.co.uk, deployed on Vercel, using Supabase (gzmgjkbtsvezfclmreru) for auth and PostgreSQL for data. The teacher class page now has a fully working **Progress Report** feature: a printable HTML report page at `/classes/[id]/report` with NC KS1/KS2 level mapping, per-pupil judgements (Below/At/Above), and a Word document download. Several TypeScript build errors were fixed this session. The Supabase keep-alive scheduled task is active. A systematic testing plan exists in `WriFe-Testing-Plan.md`.

## Next steps
1. Run test accounts through the testing plan (`WriFe-Testing-Plan.md`) — create `test.free@wrife.education`, `test.admin@wrife.education`, `test.teacher@wrife.education` via the signup page
2. Test Stripe payment end-to-end (user's wife to sign up and test paid plan upgrade)
3. Investigate the 2 "Below expectation" pupils showing in the report despite no DWP attempts — likely a `year_group` data issue
4. Add "Print Report" link to the class page's individual pupil view or progress tab for quicker access

## Key decisions
- **Report format:** Hybrid — printable HTML page (browser Print → Save as PDF) + server-side Word document via `docx` npm package. No separate PDF library needed.
- **NC level mapping:** Y1=L1–10, Y2=L11–17, Y3=L18–24, Y4=L25–28, Y5=L29–33, Y6=L34–40. Judgement based on highest DWP level passed vs year-group expectation range.
- **No `submissions` table:** Written assignment submissions table does not exist in the DB. The "Written Assignments" pillar was removed from the report; only DWP and PWP are reported.
- **Report auth:** Uses `await createClient()` from `@/lib/supabase/server` (SSR-aware) — not raw Supabase client. All other API routes use the same pattern.
- **Supabase keep-alive:** Scheduled Cowork task runs every Monday 9am — pings `SELECT COUNT(*) FROM profiles` to prevent free-tier pause.

## Files & locations
- `app/classes/[id]/page.tsx` — class detail page; has Progress Report button in tab bar (green, links to `/classes/[id]/report`)
- `app/classes/[id]/report/page.tsx` — printable report page (class overview + individual pupils, print CSS, Word download button)
- `app/api/classes/[id]/report/route.ts` — report data API; `?format=docx` streams a Word document
- `WriFe-Testing-Plan.md` — full test suite for free teacher, school admin, and pupil flows + regression checklist
- `package.json` — `docx@^9.5.0` added for server-side Word generation

## Open questions
- Stripe payment flow not yet live-tested (waiting on test signup)
- 2 pupils show "Below expectation" despite no DWP data — worth investigating their `year_group` values
- School domain matching (`@kafed.org.uk` → Elfrida Primary) not yet enforced on signup

---

## Session log

| # | Date | Summary |
|---|------|---------|
| 2 | 2026-04-28 | Built NC progress report (HTML + Word), fixed Progress tab empty state, reordered dashboard cards, set up Supabase keep-alive, created testing plan |
| 1 | 2026-04-28 | Fixed "Failed to fetch analytics" (missing user_activity table) and lesson files mismatch (GET handler now reads from DB, not storage) |
