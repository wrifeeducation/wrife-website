# WriFe Weekly Health Check — 2026-05-18

## Supabase Status
| Project | Status |
|---|---|
| WriFe Platform (gzmgjkbtsvezfclmreru) | ACTIVE_HEALTHY ✅ |

---

## wrife.co.uk — Teacher Dashboard

| Feature | Status | Notes |
|---|---|---|
| Teacher login | ✅ | mankrah@kafed.org.uk / "Power Mike" — session active, redirected to /dashboard |
| Dashboard overview | ✅ | 1 Active Class, 25 Total Pupils, 2 Pending Reviews, 0 Reviewed loaded correctly |
| Classes tab | ✅ | Silver Birch class visible (25 pupils · Year 4) with current assignment shown |
| Top-nav Lessons link | ✅ | Sidebar "Lessons" link routes to /dashboard?tab=lessons; Lesson Library loads with 68 lessons in 3 chapters — no 404 |
| Assignments tab | ✅ | 5 active assignments listed: Developing Awareness of Personal Stories (2 to review), Telling Our Story, Identifying Meaning and Usage of Words, Letters (Formal and Informal), Final Draft |
| WriFe Resources tile | ⚠️ | Shown as "AI Writing Tools — Soon" on teacher dashboard with no active link to resources.wrife.co.uk. Tile is not clickable. (Pupil dashboard DOES have a working "Skills Toolkit" tile linking to resources.wrife.co.uk.) |

---

## wrife.co.uk — Pupil Hub

| Feature | Status | Notes |
|---|---|---|
| Pupil login (Route A) | ✅ | Class code SIL42495 / amab04 / PIN 9543 → redirected to /pupil/dashboard |
| Pupil display name | ✅ | Shows "Hi Amadeo!" — B1 fixed, no "Pupil / ??" |
| IP SSO tile | ✅ | "Play →" navigates to practice.wrife.co.uk/world-map; pupil authenticated as "Amadeo B", world map loaded |
| ← WriFe back button (IP) | ✅ | "← WriFe Hub" button clearly visible in top-left of Interactive Practice — B2 fixed |
| PWP Studio SSO tile | ✅ | "Write →" navigates to pwp-studio.wrife.co.uk/dashboard with JWT SSO; pupil authenticated, Learning Path loaded |
| Display name in PWP Studio | ⚠️ | Shows "Writer / Apprentice Writer" (gamification rank), not "Amadeo B". Not the B1 bug ("Pupil / ??") — likely intentional gamification design, but real name not displayed in sidebar |

---

## resources.wrife.co.uk

| Feature | Status | Notes |
|---|---|---|
| Teacher login | ✅ | Teacher session persisted via shared cookie; redirected to /dashboard without re-authentication |
| Full Teacher tier badge | ✅ | "Full Teacher" badge visible in top-right nav on all resources pages |
| 9 tools listed | ✅ | All 9 confirmed: PWP Practice, Daily Writing Practice, Connect Grid Tutor, Sentence Quality Coach, Story Type Identifier, Composition Reviewer, Editing Doctor, Genre Coach, Project Mentor |
| Live AI call (Sentence Coach) | ✅ | Submitted: "The old oak tree stood silently at the edge of the misty forest." — Response: Vocabulary 4/5, Grammar 5/5, Originality 3/5, with narrative feedback and one improvement suggestion. No errors. |
| Pupil gating | ⚠️ UNTESTED | Could not open an incognito window with automated browser tools. When resources.wrife.co.uk was accessed with a pupil session active, the landing page was shown (not the tools dashboard), which suggests gating is in place — but a full redirect-to-/login test could not be confirmed. Recommend manual spot-check. |

---

## Bug Tracker

| Bug | Status | Evidence |
|---|---|---|
| B1 — Pupil display name ("Pupil / ??") | Fixed ✅ | wrife.co.uk shows "Hi Amadeo!"; IP shows "Amadeo B" in sidebar |
| B2 — "← WriFe" back button absent in IP | Fixed ✅ | "← WriFe Hub" button confirmed in top-left of practice.wrife.co.uk |
| B3 — Lessons nav 404 | Fixed ✅ | Sidebar "Lessons" link routes to /dashboard?tab=lessons; Lesson Library loads with 68 lessons, no 404 |
| B4 — Assignment review count mismatch | Fixed ✅ | Overview shows "2 Pending Reviews"; Assignments tab shows "2 to review" on the Developing Awareness assignment — counts match |

---

## New Issues Found

1. **Teacher dashboard "AI Writing Tools" tile not linked** — The WriFe Resources tile on the teacher dashboard shows "AI Writing Tools — Soon" with no active link or Open button. Teachers accessing the dashboard have no direct route to resources.wrife.co.uk from their hub. The pupil dashboard's "Skills Toolkit" tile works correctly. Suggested fix: replace the "Soon" badge with an active "Open →" link to resources.wrife.co.uk once teacher access is confirmed ready.

2. **PWP Studio shows writing rank instead of pupil name** — The PWP Studio sidebar displays "Writer / Apprentice Writer" (the gamification title) in place of the pupil's real name. Not a data bug, but worth reviewing for safeguarding/teacher-monitoring purposes. Real name appears correctly in wrife.co.uk and Interactive Practice.

---

## Overall Platform Health

🟢 **Healthy** — all four critical user journeys (teacher login, pupil login, Interactive Practice SSO, PWP Studio SSO) passed. All four tracked bugs (B1–B4) are confirmed fixed. One test (pupil gating on resources) could not be completed with automated tooling.

---

## Recommended Actions

1. **Activate the teacher-dashboard Resources tile** — Replace "AI Writing Tools (Soon)" with an active link to resources.wrife.co.uk so teachers can navigate there from their hub.
2. **Manual spot-check: resources.wrife.co.uk pupil gating** — Open resources.wrife.co.uk/dashboard in a private/incognito browser window (not signed in) and confirm it redirects to /login.
3. **Review PWP Studio display name** — Confirm whether showing "Writer" instead of the pupil's real name is intentional for all contexts (safeguarding review may be needed).

---

*Report generated: 2026-05-18 | Automated weekly health check | Supabase region: eu-west-1*
