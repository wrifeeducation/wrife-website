# WriFe Platform
*Last updated: 2026-04-28 · Session 1*

## Current state
Full-stack Next.js educational platform at wrife.co.uk. Admin dashboard manages schools, lessons, and file uploads. Two bugs were identified and fixed in this session. The app is deployed (likely on Vercel) and uses Supabase (project: gzmgjkbtsvezfclmreru "WriFe Platform") for auth, storage, and database. A separate "WriFe PWP App" project also exists.

## Next steps
1. Deploy the fix to production (push changes and trigger a Vercel redeploy)
2. Verify the lesson files page now shows correct files for each lesson
3. Verify the analytics section loads without error (user_activity table now exists)
4. Consider adding event tracking calls so the analytics section actually shows data

## Key decisions
- **Lesson files source of truth:** GET /api/admin/lesson-files now reads from the `lesson_files` PostgreSQL table rather than listing the Supabase storage bucket directly. The bucket folders are permanently offset from current lesson IDs due to a historical renumbering — the DB is authoritative.
- **user_activity table:** Was defined in db/schema.ts but never migrated. Applied via Supabase MCP and tracked in supabase/migrations/20260428_create_user_activity_table.sql.

## Files & locations
- `app/api/admin/lesson-files/route.ts` — GET handler fixed to query `lesson_files` DB table
- `app/api/admin/analytics/route.ts` — queries user_activity table (now exists)
- `supabase/migrations/20260428_create_user_activity_table.sql` — new migration file
- `db/schema.ts` — Drizzle schema definitions
- `lib/db.ts` — PostgreSQL pool (uses PROD_DATABASE_URL)

## Open questions
- The `lesson-files` storage bucket contains files in offset folders (lesson-10 has L07 files, etc.) — these are now bypassed by reading from DB, but the bucket is untidy. Worth cleaning up eventually.
- No event tracking calls exist yet, so the analytics dashboard will show zeros until user activity logging is wired into the app.

---

## Session log

| # | Date | Summary |
|---|------|---------|
| 1 | 2026-04-28 | Fixed "Failed to fetch analytics" (missing user_activity table) and lesson files mismatch (GET handler now reads from DB, not storage) |
