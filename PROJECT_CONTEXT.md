# WriFe Platform
*Last updated: 2026-05-02 · Session 4*

## Current state
Full-stack Next.js educational platform at wrife.co.uk, deployed on Vercel, using Supabase (`gzmgjkbtsvezfclmreru`) for auth and PostgreSQL for data. A comprehensive architecture audit was completed this session covering all three WriFe apps (wrife.co.uk, practice.wrife.co.uk, pwp.studio.wrife.co.uk). Two critical fixes were applied: the Postgres connection pool was reduced from max:10 to max:2 (was causing 504 Gateway Timeouts on the dashboard) and the auth-context was updated to time out gracefully after 6 seconds if Supabase is unreachable. A full integration and improvement plan is saved at PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md.

## Next steps
1. **Deploy the db.ts + auth-context fixes** — `cd` into the wrife-website folder and `git push`
2. **Switch `PROD_DATABASE_URL` in Vercel** to Supabase's Transaction Mode pooler URL (not the direct Postgres URL) — this removes the connection ceiling entirely
3. **Check Supabase project status** — visit app.supabase.com to confirm `gzmgjkbtsvezfclmreru` is not paused; if it is, unpause it
4. **Seed Worlds 2–6** into the Interactive Practice Supabase project (`rxmitjrbrsqjeymsycoj`), or add Coming Soon placeholder world cards
5. **Phase 2 unified auth** — begin migrating Interactive Practice to share the wrife.co.uk Supabase project (full plan in PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md)

## Key decisions
- **Report format:** Hybrid — printable HTML page (browser Print → Save as PDF) + server-side Word document via `docx` npm package. No separate PDF library needed.
- **NC level mapping:** Y1=L1–10, Y2=L11–17, Y3=L18–24, Y4=L25–28, Y5=L29–33, Y6=L34–40. Judgement based on highest DWP level passed vs year-group expectation range.
- **No `submissions` table:** Written assignment submissions table does not exist in the DB. The "Written Assignments" pillar was removed from the report; only DWP and PWP are reported.
- **Report auth:** Uses `await createClient()` from `@/lib/supabase/server` (SSR-aware) — not raw Supabase client. All other API routes use the same pattern.
- **Supabase keep-alive:** Scheduled Cowork task runs every Monday 9am — pings `SELECT COUNT(*) FROM profiles` to prevent free-tier pause.
- **db.ts pool max:** Must stay at 2 or below in serverless. Never increase — each Vercel invocation creates its own pool, 10 concurrent users × old max:10 = 100 connections = free-tier exhausted.
- **Integration strategy:** Three separate apps should share the wrife.co.uk Supabase project. Interactive Practice migrates its data to `gzmgjkbtsvezfclmreru`. Teacher dashboard gets a new "Interactive Practice" tab showing cross-app progress.

## Files & locations
- `lib/db.ts` — FIXED: Pool max reduced from 10 → 2 to prevent connection exhaustion
- `lib/auth-context.tsx` — FIXED: Added 6-second timeout + graceful degradation for Supabase network failures
- `app/auth/confirm/page.tsx` — handles all token-hash email links (signup, recovery, invite, magiclink)
- `app/signup/page.tsx` — "already registered" error shows friendly card with Sign in / Reset password links
- `app/api/stripe/webhook/route.ts` — `priceIdToTier` fallback map ensures Full Teacher resolves to `full` tier
- `app/classes/[id]/report/page.tsx` — printable NC progress report (HTML + Word download)
- `WriFe-Testing-Plan.md` — full test suite for free teacher, school admin, and pupil flows
- `PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md` — NEW: full architecture audit + 5-phase integration plan

## Open questions
- Stripe payment flow not yet live-tested (waiting on test signup)
- 2 pupils show "Below expectation" despite no DWP data — worth investigating their `year_group` values
- School domain matching (`@kafed.org.uk` → Elfrida Primary) not yet enforced on signup
- Supabase upgrade timing — see PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md Section 8 for advice

---

## Session log

| # | Date | Summary |
|---|------|---------|
| 4 | 2026-05-02 | Full 3-app architecture audit; fixed db.ts pool exhaustion (max:2) and auth-context timeout; produced PLATFORM_REVIEW_AND_INTEGRATION_PLAN.md with 5-phase integration plan |
| 3 | 2026-04-28 | Fixed email auth: /auth/confirm page, signup UX, sender domain → noreply@wrife.co.uk, Stripe tier fix; Supabase SMTP configured via Resend |
| 2 | 2026-04-28 | Built NC progress report (HTML + Word), fixed Progress tab empty state, reordered dashboard cards, set up Supabase keep-alive, created testing plan |
| 1 | 2026-04-28 | Fixed "Failed to fetch analytics" (missing user_activity table) and lesson files mismatch (GET handler now reads from DB, not storage) |
