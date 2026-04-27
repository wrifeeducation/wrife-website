# WriFe Platform — Testing & Automation Playbook
*Last updated: April 2026*

---

## Part 1 — Cowork Automation Opportunities

The following tasks can be handed off to Claude Cowork to run automatically or on demand, without your involvement.

### ✅ Already Live
| Task | Schedule | What it does |
|------|----------|--------------|
| **Supabase Keep-Alive** | Every Monday 9am | Pings the WriFe Supabase project with a `SELECT COUNT(*) FROM profiles` to prevent free-tier pausing |

---

### 🔧 Ready to Activate (say "set this up" to Claude)

| Task | Suggested Schedule | Description |
|------|--------------------|-------------|
| **Weekly Class Digest** | Every Friday 4pm | Queries all classes for submission counts, pending reviews, and DWP pass rates. Generates a per-teacher summary saved to Google Drive. |
| **Pending Review Sweep** | Every weekday 7am | Finds PWP and DWP submissions that have been `submitted` for more than 5 days without teacher review. Logs a summary for action. |
| **Auto-Assess PWP Backlog** | On demand | Scans for `pwp_submissions` with `status = 'submitted'` and no linked `pwp_assessments` row. Calls `/api/pwp-assess` for each to trigger AI assessment. |
| **Platform Health Check** | Every Monday 9:15am | Fetches `https://wrife.co.uk`, `/api/health`, `/api/pupil/assignments` and verifies HTTP 200 responses. Reports any failures. |
| **Monthly Stats Digest** | 1st of each month 8am | Counts total users, schools, pupils, submissions, assessments. Saves a snapshot report to Google Drive for trend tracking. |
| **Stale Invite Cleanup** | Every Sunday midnight | Finds `teacher_invites` with `status = 'pending'` older than 7 days and marks them `expired`. Logs count of cleaned records. |
| **New Signup Audit** | Every Monday 9:30am | Lists profiles created in the past 7 days (role, email, school_id, membership_tier). Flags any with missing `display_name` or stuck at `free` after a paid plan signup. |

---

## Part 2 — Systematic Test Plan

### Test Accounts Registry

The following accounts exist for testing. **Do not delete these profiles or the test school.**

| Account | Email | Role | School | Purpose |
|---------|-------|------|--------|---------|
| Free Teacher | `test.free@wrife.education` | teacher | none | Individual free-tier signup flow |
| School Admin | `test.admin@wrife.education` | teacher | WriFe Test Academy | School admin appointment flow |
| School Teacher | `test.teacher@wrife.education` | teacher | WriFe Test Academy | School member onboarding flow |
| Test Pupil A | PIN login via class code | pupil | WriFe Test Academy | Pupil assignment + feedback flow |

**Test School:** `WriFe Test Academy` (ID: `96da5b59-1001-4ef7-a227-ca7a99da7e42`) — `trial` tier, 10 teacher limit, 300 pupil limit.

> **Creating auth accounts:** These must be created via the WriFe signup page or via the Supabase Dashboard → Authentication → Users → Invite User. Use password `WriFe.Test.2026!` for all test accounts. After creating each auth user, update their `profiles` row using the instructions in each test below.

---

## Test Suite A — Free Individual Teacher

**Goal:** Verify the complete journey from sign-up to assigning and reviewing a pupil's work.

### A1 · Sign Up
1. Go to `https://wrife.co.uk/signup`
2. Enter email: `test.free@wrife.education`, display name: `Test Free Teacher`, password: `WriFe.Test.2026!`
3. ✅ Expect: confirmation email sent, page shows "Check your email"
4. ✅ Expect: `profiles` row created with `role = 'teacher'`, `membership_tier = 'free'`, `school_id = null`

### A2 · Email Confirmation
1. Open the confirmation email and click the link
2. ✅ Expect: redirected to `/dashboard`
3. ✅ Expect: Dashboard shows "Create a Class" prompt with no classes listed

### A3 · Create a Class
1. Click "Create Class" → enter name: `Test Class Free`, year group: 4
2. ✅ Expect: class created, redirected to class page with class code shown
3. ✅ Expect: class code is 6–8 uppercase characters

### A4 · Add a Pupil via Class Code
1. In a separate incognito window, go to `https://wrife.co.uk/pupil/login`
2. Enter the class code from A3
3. Enter name: `Test Pupil Free`
4. ✅ Expect: pupil session cookie set, redirected to `/pupil/dashboard`
5. ✅ Expect: dashboard shows the class name and empty task panels

### A5 · Assign a PWP Activity
1. Back in teacher view → class page → PWP tab → Assign PWP
2. Select Level 1 activity, set due date 7 days ahead
3. ✅ Expect: PWP assignment appears in the PWP tab with 0 submissions
4. ✅ Expect: Pupil dashboard (refresh incognito) shows the activity under "Sentence Practice"

### A6 · Pupil Completes PWP
1. In incognito (pupil view), click the PWP activity
2. Write a valid sentence and submit
3. ✅ Expect: status changes to "Submitted ✓" on dashboard
4. ✅ Expect: `pwp_submissions` row created with `status = 'submitted'`

### A7 · Teacher Reviews PWP
1. In teacher view → class page → PWP tab → click the submission badge for Test Pupil Free
2. Click "✨ Run AI Assessment"
3. ✅ Expect: assessment displays grammar_accuracy (1–4), structure_correctness (1–4), feedback, corrections, improved example
4. Add a teacher note: "Well done on your first attempt!"
5. Click "Save note" → ✅ Expect: note saved
6. Click "Mark as Reviewed" → ✅ Expect: status badge turns blue "Reviewed"

### A8 · Pupil Views Feedback
1. In incognito (pupil view), click the PWP activity
2. ✅ Expect: feedback view shown with grammar band, corrections, improved example, teacher note
3. ✅ Expect: PWP card on dashboard shows amber "⭐ Feedback!" badge

### A9 · Assign a DWP Level
1. Teacher view → class page → DWP tab → Assign DWP
2. Select Level 1, no instructions, save
3. ✅ Expect: DWP assignment appears in DWP tab

### A10 · Pupil Completes DWP
1. Pupil view → click DWP task → complete the writing
2. Submit when ready
3. ✅ Expect: `writing_attempts` row created
4. ✅ Expect: AI assessment runs and shows performance band + score
5. ✅ Expect: DWP card on teacher Progress tab shows assessed status

### A11 · Progress Tab
1. Teacher view → class page → Progress tab
2. ✅ Expect: class completion % shown in banner
3. ✅ Expect: Test Pupil Free card shows writing 0/0, sentences 1/1, daily writing 1/1
4. ✅ Expect: expand pupil card shows individual task rows with status badges

---

## Test Suite B — School Signup & Admin Setup

**Goal:** Verify the school creation, admin appointment, and teacher invitation flow.

### B1 · Create School (Platform Admin)
1. Log in to `https://wrife.co.uk/admin/login` as platform admin
2. Navigate to Schools → New School
3. Enter: Name: `WriFe Test Academy`, Domain: `test.wrife.co.uk`, Tier: `trial`
4. ✅ Expect: school created, appears in schools list
5. ✅ Expect: `schools` row exists with `active = true`

> *Note: WriFe Test Academy already exists in the DB (ID: `96da5b59-1001-4ef7-a227-ca7a99da7e42`). Skip creation; verify it appears in the admin schools list.*

### B2 · Create School Admin Account
1. Go to `https://wrife.co.uk/signup`
2. Sign up as `test.admin@wrife.education`, display name: `Test School Admin`, password: `WriFe.Test.2026!`
3. Confirm email via the link in the confirmation email
4. In Supabase Dashboard → Table Editor → profiles:
   - Find the row for `test.admin@wrife.education`
   - Set `school_id = 96da5b59-1001-4ef7-a227-ca7a99da7e42`
   - Set `role = 'school_admin'`
5. ✅ Expect: logging in as this user shows `/admin/school` dashboard (School Admin Dashboard)

### B3 · School Admin Dashboard
1. Log in as `test.admin@wrife.education`
2. ✅ Expect: WriFe Test Academy overview shown (0 teachers, 0 pupils, 0 classes)
3. ✅ Expect: subscription tier badge shows "trial"
4. ✅ Expect: teacher/pupil quota bars shown

### B4 · Invite a Teacher
1. School Admin Dashboard → Teachers tab → Invite Teacher
2. Enter: name `Test School Teacher`, email `test.teacher@wrife.education`
3. Click Send Invite
4. ✅ Expect: invite email sent to `test.teacher@wrife.education`
5. ✅ Expect: teacher invite appears in Invites tab with `status = 'pending'`
6. ✅ Expect: `teacher_invites` row created in DB

### B5 · Teacher Accepts Invite
1. Open invite email sent to `test.teacher@wrife.education`
2. Click "Set Up My Account"
3. ✅ Expect: redirected to `/admin/setup` or `/admin/update-password`
4. Set password to `WriFe.Test.2026!`
5. ✅ Expect: account activated, redirected to `/dashboard`
6. ✅ Expect: profile has `school_id = 96da5b59-1001-4ef7-a227-ca7a99da7e42`, `role = 'teacher'`
7. ✅ Expect: invite status in DB changes to `accepted`

### B6 · Teacher Appears in School Admin View
1. Log back in as `test.admin@wrife.education`
2. Go to Teachers tab
3. ✅ Expect: `Test School Teacher` listed with email and display name
4. ✅ Expect: teacher count shows 1/10

### B7 · School Teacher Creates a Class
1. Log in as `test.teacher@wrife.education`
2. Dashboard → Create Class → `Test School Class`, Year 3
3. ✅ Expect: class created and linked to the teacher's account
4. ✅ Expect: School Admin Dashboard → Classes tab shows this class

### B8 · School Admin Removes a Teacher
1. School Admin Dashboard → Teachers tab → Remove `test.teacher@wrife.education`
2. ✅ Expect: confirmation prompt shown
3. ✅ Expect: teacher removed from school, `school_id` set to null on their profile
4. ✅ Expect: teacher count shows 0/10

---

## Test Suite C — Pupil Experience End-to-End

**Goal:** Verify the complete pupil journey including login, dashboard, assignments and feedback loop.

### C1 · Pupil Login via Class Code
1. Go to `https://wrife.co.uk/pupil/login`
2. Enter class code from a teacher in WriFe Test Academy
3. ✅ Expect: name entry screen shown
4. ✅ Expect: after entering name, `pupil_sessions` row created, redirected to `/pupil/dashboard`

### C2 · Dashboard Layout
1. ✅ Expect: Pupil name shown in navbar
2. ✅ Expect: Progress counter visible (X% / X done / X active / X total)
3. ✅ Expect: Three sections visible: Lesson Assignments, Sentence Practice (PWP), Daily Writing (DWP)
4. ✅ Expect: Only assigned tasks shown (not all 40 DWP levels if only a few are assigned)

### C3 · PWP Flow (see A5–A8 above)

### C4 · DWP Flow (see A9–A10 above)

### C5 · Session Persistence
1. Close and reopen the pupil browser tab
2. ✅ Expect: still logged in (session cookie persists)
3. ✅ Expect: completed tasks still show correct status

### C6 · Previously Assessed Task
1. Navigate to a previously completed DWP task
2. ✅ Expect: results view shown immediately (not blank writing page)
3. ✅ Expect: score, performance band, AI feedback visible
4. ✅ Expect: "Your Writing" section shows submitted text

---

## Part 3 — Regression Checklist (run after major deploys)

Run through these quickly after any significant code change. Each should take under 2 minutes.

| # | Check | Expected |
|---|-------|----------|
| R1 | `/pupil/login` → enter class code | Name entry screen appears |
| R2 | `/pupil/dashboard` loads | Three task panels, progress counter |
| R3 | Pupil clicks existing DWP task (assessed) | Results view, not blank |
| R4 | PWP task with feedback | Amber badge on dashboard, feedback view on task page |
| R5 | Teacher PWP tab → click submission | PWPReviewModal opens |
| R6 | Run AI Assessment button | Assessment appears within 10s |
| R7 | Progress tab → no lesson assignments | PWP/DWP pillars still visible (not "No assignments yet") |
| R8 | Progress tab → expand pupil | Individual task rows shown |
| R9 | Dashboard → PWP/DWP cards | Appear above Pending Reviews |
| R10 | Supabase keep-alive task | Run manually from Scheduled sidebar; confirm ✅ success notification |

---

## Part 4 — Known Limitations & Future Tests

| Area | Current Status | Future Test Needed |
|------|---------------|-------------------|
| Stripe payment flow | Stripe products exist; no live test account | Test paid signup → membership_tier upgrade → feature unlock |
| Email deliverability | Resend configured | Send real invite and verify delivery, spam score |
| School domain matching | Domain field exists but not enforced on signup | Test that `@kafed.org.uk` email auto-links to Elfrida Primary |
| PWP "Mark Complete" for pupil | No explicit "done" button for pupil | Design decision: auto-complete on teacher review? |
| DWP retry after fail | Pupil can't retry a failed attempt | Test and confirm behaviour; add retry if needed |
| Mobile layout | Not tested | Run through C1–C6 on iOS Safari |

---

*Automation setup and test school provisioned by Claude Cowork, April 2026.*
