# WriFe Pupil Dashboard — Strategic Review & Recommendations
*Written: 2026-05-03 · For discussion and Phase 5 planning*

---

## 1. Current State: What Actually Exists

The pupil dashboard at `/pupil/dashboard` is the entry point for everything a pupil does on wrife.co.uk. It currently presents five distinct work areas — some fully built, some scaffolded, and one now pointing to a system that no longer exists.

**AI Writing Coach** (`/pupil/writing-coach`) is a standalone sentence-building tool with formula-based structure, word class colour coding, and instant AI feedback. It scores sentences across six dimensions (formula adherence, grammar, meaning, vocabulary, personal connection) and produces a mastery percentage. It is fully functional and well-built but feels isolated — there is no progression system driving pupils toward it and no way to move what you write here into an assignment.

**The Writing Box** (`/pupil/assignment/[id]`) is the most complete and pedagogically coherent feature on the platform. A teacher assigns a task linked to a lesson; the pupil first completes the lesson's interactive HTML practice in an iframe (Step 1), then writes a free response in a textarea (Step 2), then submits (Step 3). After submission, AI assessment arrives in four bands (Emerging, Developing, Secure, Greater Depth) with structured feedback on strengths, improvements, mechanical edits, and an improved example. When the teacher reviews the work they can add their own written feedback which the pupil then sees. This is a serious, well-designed formative writing workflow — the best thing on the platform — but the pupil dashboard barely signals how important it is. It sits under the generic label "Your Assignments" with a small card per task and no sense that this is the core of WriFe.

**Daily Writing Practice** (`/pupil/dwp/[id]`) is a 40-level progressive timed writing programme. Each level has a prompt, word bank, expected time, and a pass threshold (typically 70%). AI assessment gives a pass/fail verdict and a performance band. It is a strong standalone feature — the consistent daily habit loop that many EdTech products are built entirely around. Currently it is presented at the bottom of the dashboard, subordinate to everything else, with no visual emphasis on the daily habit aspect.

**Sentence Practice** (scaffold — dead) still appears on the dashboard and still fetches `pwpAssignments`/`pwpSubmissions` from the old progressive writing platform that was never completed. This section now points to a system that no longer exists and should be understood as empty scaffolding. It will never show meaningful content again. For any new pupil, this section simply sits there contributing to the dashboard's "unfinished" feel.

**Interactive Practice and PWP Studio** are absent entirely from the pupil dashboard. A pupil signed in to wrife.co.uk has no way to navigate to `practice.wrife.co.uk` or `pwp-studio.wrife.co.uk`. These are the two most gamified, most engaging parts of the WriFe ecosystem, and from the pupil's perspective they do not exist.

---

## 2. The Core Problem: Three Disconnected Islands

The fundamental strategic issue is that WriFe currently operates as three completely separate experiences with no shared identity or progression from the pupil's point of view.

A pupil who logs in to do Interactive Practice goes to `practice.wrife.co.uk`. A pupil who logs in to write sentences goes to `pwp-studio.wrife.co.uk`. A pupil who has a writing assignment goes to `wrife.co.uk`. These three sites do not reference each other. The pupil has no understanding that they are part of the same platform. The teacher can see cross-app data now (thanks to Phase 4), but the pupil cannot feel the unity.

This matters enormously for engagement. The EdTech products that win — Duolingo, Times Tables Rock Stars, Seesaw — do so because pupils experience one cohesive loop with a single identity, a single streak, a single sense of progress. WriFe currently has three loops with no bridges.

The second problem is hierarchy. On the current dashboard, the AI Writing Coach (a useful but supplementary tool) is given a large gradient hero card at the top left. The Writing Box (the actual pedagogical core) is buried below it. The Daily Writing Practice (the daily habit engine) is at the bottom. The hierarchy of visual prominence is almost exactly the opposite of the hierarchy of educational value.

---

## 3. What the Writing Box Is (and What It Should Become)

The writing box is the right design for the core WriFe workflow: teacher assigns → pupil practises → pupil writes → AI assesses → teacher reviews → pupil sees feedback. This is how excellent formative assessment works in schools. The three-step flow (practice → write → submit) is also pedagogically sound: the interactive lesson primes the writing, the writing consolidates the learning, the AI and teacher feedback closes the loop.

The issue is that the current implementation treats each assignment as a disconnected item on a list. There is no sense of "here is your current writing task — here is exactly what to do." Pupils have to understand the three-step structure themselves by reading the UI. The feedback from AI is well-structured but presented in a fairly clinical card after submission; there is no moment of celebration, no badge, no XP.

The writing box also currently requires a teacher to have assigned a specific lesson file as the Step 1 practice. This works when lessons are being actively taught, but means the writing box goes quiet between assignment cycles. A pupil visiting the dashboard on a day when no new assignment exists has nothing obvious to do.

---

## 4. How DWP Connects (or Should Connect) to the Writing Box

DWP and the Writing Box are currently completely separate. A pupil does DWP independently; the results do not inform the writing box, and the writing box does not refer to DWP. They happen to coexist on the same dashboard.

The natural connection — and the one that would make WriFe genuinely coherent — is to think of DWP as the daily home practice routine and the Writing Box as the assessed homework/project work. DWP provides the daily habit and progressive skill-building. The Writing Box provides the teacher-assigned, teacher-reviewed, higher-stakes writing task. Together they give pupils both consistent practice and meaningful feedback from their teacher.

A clean way to surface this: the dashboard shows a "Today's Writing" banner when a DWP level is assigned (similar to how Duolingo shows a daily lesson). When the pupil completes it, the banner becomes a green tick and the streak updates. Separately, active Writing Box assignments are shown as cards with clear status indicators. The two systems share the same streak counter.

---

## 5. Individually Assigned Interactive Practice from Live Lessons

The current writing assignment flow (`/pupil/assignment/[id]`) already supports this: Step 1 is an iframe loading the lesson's interactive HTML file. When a teacher assigns a task and links it to a lesson, the pupil gets the interactive practice embedded before the writing step. This is functional.

What is missing is a standalone route for individually assigned Interactive Practice outside of the writing assignment context. Currently if a teacher wants to tell a specific pupil "go and do Lesson 12 on practice.wrife.co.uk," there is no way to surface that assignment from within wrife.co.uk. The teacher has to communicate it verbally or separately, and the pupil has to go to a completely different URL to do it.

The longer-term solution is for wrife.co.uk to be able to display a "Practice Task" card linking directly to a specific lesson on `practice.wrife.co.uk`. This requires a lightweight assignment type (no writing, just a lesson link with a completion marker) and the Interactive Practice app to post back a completion event to the Platform DB when the pupil finishes. Both are achievable but represent new development work.

---

## 6. Strategic Options

There are three credible paths forward, ranging from conservative to ambitious:

**Option A — Clean and connect (lowest effort, highest immediate value)**

Remove the dead Sentence Practice scaffold entirely. Add two entry point cards to the dashboard stat row: 🎮 Interactive Practice (links to `practice.wrife.co.uk`) and ✏️ PWP Studio (links to `pwp-studio.wrife.co.uk`). Reorder the existing cards so the Writing Box assignments are most prominent. Add a "Daily Writing Practice" call-to-action in the hero section when there is an active DWP assignment. This requires no new backend work, takes one session to implement, and immediately makes the three-app structure visible to pupils. The cost is that the apps still feel like separate sites.

**Option B — Unified dashboard with app cards (medium effort)**

Redesign the pupil dashboard as a single home screen that shows the pupil's activity across all three apps. The dashboard fetches cross-app summary data (XP from Interactive Practice, level from PWP Studio, streak) from the same API routes that the teacher tab already uses. It shows a "Your Progress" summary row displaying XP, current PWP level, writing assignments completed, and DWP streak all in one place. Entry points to each app are prominent action cards. This gives pupils a sense of one unified platform without requiring any changes to the three apps themselves. Medium effort (new API route for pupil stats, dashboard redesign), but meaningfully changes how WriFe feels.

**Option C — Single shared pupil session (high effort, maximum coherence)**

Move the pupil auth model from `localStorage` class-code login to Supabase Auth, matching how teachers log in. A pupil has one Supabase session that works across all three apps. The single-sign-on means a pupil who visits any WriFe URL is automatically identified. XP, streaks, and badges become truly unified across all apps. This is the "best in the business" end state — the same coherence that makes Duolingo compelling — but it requires significant work in all three apps (especially Interactive Practice, which currently uses class-code PIN auth). This is a Phase 6/7 project, not something to do immediately.

---

## 7. Immediate Recommendations (Phase 5)

Given where the platform is today, the highest-impact changes that can be delivered quickly are:

**Remove the Sentence Practice scaffold.** It shows nothing useful, uses dead API data, and undermines trust in the platform. Every pupil who sees it sees an unfinished product.

**Redesign the dashboard card row.** Replace the four current stat cards with a cleaner set: 🎮 Interactive Practice (links to `practice.wrife.co.uk`, shows XP if available), ✏️ PWP Studio (links to `pwp-studio.wrife.co.uk`, shows current level), 📝 Your Writing (count of active assignments with a direct link to the first pending one), and 🔥 Daily Practice (DWP streak + today's task CTA). This is Option A but with deliberate hierarchy.

**Elevate the Writing Box as the primary task surface.** When a pupil has an active writing assignment, it should appear above everything else on the dashboard — not in a list at the bottom. A large task card with the assignment title, due date, their current step (Practice / Write / Submitted / Reviewed), and a clear action button. This is the teacher's assigned work and it should feel important.

**Make DWP the daily habit anchor.** Add a persistent "Today's Practice" section at the top of the dashboard that shows the next unstarted DWP level with a clear "Start" button. When completed it shows a green streak tick. This is the daily ritual that brings pupils back, and it should be the first thing they see — not the fourth.

**Add a shared cross-app progress strip.** A single row under the hero showing: ⭐ `{xp}` XP · 🔥 `{streak}`d streak · 📖 Level `{pwp_level}` PWP · ✍️ `{sentences}` sentences written. This fetches from the same cross-app API calls already built for the teacher dashboard. It costs little to implement and gives pupils a sense of total WriFe identity for the first time.

---

## 8. On the "Best in the Business" Goal

The products that dominate school EdTech share three characteristics: they are simple enough for an 8-year-old to navigate without a teacher in the room; they reward the pupil for returning tomorrow; and they give the teacher genuinely useful data with no manual work.

WriFe already has the third — the teacher dashboard is genuinely strong. It has most of the second — streaks, XP, bands, and badges are all implemented. What it lacks for the first is a clear, simple pupil home screen that says: "Here is what WriFe is. Here is what you have done. Here is what to do next."

The writing box is the right pedagogical core. The DWP is the right habit engine. Interactive Practice is the right engagement hook. PWP Studio is the right mastery track. The strategy for Phase 5 is simply to let pupils see all four, with a clear hierarchy and a unified identity, from the moment they log in.

---

*Recommended Phase 5 scope: Option A + elevated Writing Box + DWP as daily anchor + cross-app progress strip. Estimated: 2–3 sessions.*
