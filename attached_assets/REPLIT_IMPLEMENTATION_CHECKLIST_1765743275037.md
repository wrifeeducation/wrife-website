# PWP Implementation Checklist
## Quick Reference for Replit

**Use this to track progress and verify each step is complete.**

---

## ☐ PHASE 1: PROJECT SETUP (30 minutes)

- [ ] Created Next.js project with TypeScript + Tailwind
- [ ] Installed all dependencies (Supabase, Lucide, date-fns, zod)
- [ ] Created Supabase project
- [ ] Copied URL + keys to `.env.local`
- [ ] Created `src/lib/supabase.ts`
- [ ] Dev server runs without errors (`npm run dev`)

**Test:** Visit http://localhost:3000 → See Next.js welcome

---

## ☐ PHASE 2: DATABASE SETUP (45 minutes)

- [ ] Created `users` table
- [ ] Created `classes` table
- [ ] Created `curriculum_map` table
- [ ] Created `pwp_sessions` table
- [ ] Created `pwp_formulas` table
- [ ] Created `concept_mastery` table
- [ ] Created indexes
- [ ] Seeded curriculum data (L10-15)
- [ ] Created test teacher
- [ ] Created test class
- [ ] Created 3 test pupils (Sarah, James, Maya)

**Test:** Run `SELECT * FROM curriculum_map` → Returns 6 lessons

---

## ☐ PHASE 3: FORMULA GENERATION (1 hour)

- [ ] Created `src/lib/formulaGenerator.ts`
- [ ] Implemented `generateFormulas()` function
- [ ] Implemented `generateL10Formulas()` (2 formulas)
- [ ] Implemented `generateL11Formulas()` (3 formulas)
- [ ] Implemented `generateL12Formulas()` (3 formulas)
- [ ] Implemented `generateL13Formulas()` (4 formulas)
- [ ] Implemented `generateL14Formulas()` (4 formulas)
- [ ] Implemented `generateL15Formulas()` (4 formulas)
- [ ] All helper functions implemented

**Test:** Import function, call with L10 → Returns 2 formulas

---

## ☐ PHASE 4: API ENDPOINTS (1 hour)

- [ ] Created `src/app/api/pwp/start-session/route.ts`
- [ ] Start session endpoint validates input
- [ ] Start session creates session in database
- [ ] Start session creates formula records
- [ ] Start session returns formulas to client
- [ ] Created `src/app/api/pwp/submit-formula/route.ts`
- [ ] Submit formula validates sentence
- [ ] Submit formula updates database
- [ ] Submit formula returns feedback
- [ ] Created `src/app/api/pwp/complete-session/route.ts`
- [ ] Complete session calculates accuracy
- [ ] Complete session updates status

**Test:** Use Postman/Thunder Client to call endpoints

---

## ☐ PHASE 5: PUPIL INTERFACE (2 hours)

- [ ] Created `src/app/pupil/page.tsx` (login)
- [ ] Login page has email input
- [ ] Login validates pupil exists
- [ ] Login stores pupilId in sessionStorage
- [ ] Login redirects to lesson selection
- [ ] Created `src/app/pupil/lesson-select/page.tsx`
- [ ] Lesson select fetches curriculum data
- [ ] Lesson select displays L10-15 cards
- [ ] Lesson select starts session on click
- [ ] Created `src/app/pupil/pwp/page.tsx` (main interface)
- [ ] PWP page has 3 steps: setup, practice, complete
- [ ] Setup screen asks for subject
- [ ] Practice screen shows labelled example
- [ ] Practice screen shows word bank (F2+)
- [ ] Practice screen has text input
- [ ] Practice screen shows feedback
- [ ] Practice screen advances to next formula
- [ ] Complete screen shows success message

**Test:** Full user flow from login → complete session

---

## ☐ PHASE 6: TESTING (1 hour)

### Test Flow 1: Lesson 10
- [ ] Login as sarah@test.com
- [ ] Select L10
- [ ] Enter subject "Ben"
- [ ] Complete F1: "Ben runs"
- [ ] Complete F2: "Ben runs"
- [ ] See completion screen

### Test Flow 2: Lesson 13
- [ ] Login as james@test.com
- [ ] Select L13
- [ ] Enter subject "Dog"
- [ ] Complete all 4 formulas
- [ ] See completion screen

### Database Verification
- [ ] Check `pwp_sessions` has 2 completed sessions
- [ ] Check `pwp_formulas` has sentences
- [ ] Check accuracy calculated correctly

---

## ☐ PHASE 7: DEPLOYMENT (30 minutes)

- [ ] Installed Vercel CLI
- [ ] Logged into Vercel
- [ ] Deployed project
- [ ] Set environment variables in Vercel
- [ ] Production deployment successful
- [ ] Tested production URL
- [ ] All flows work in production

**Test:** Visit prod URL, complete full session

---

## FINAL VERIFICATION

### ✅ Must All Be True:

- [ ] Can login as any test pupil
- [ ] Can see all 6 lessons (L10-15)
- [ ] Can start any lesson
- [ ] Can complete all formulas
- [ ] Word bank works (clicking adds words)
- [ ] Typing in textarea works
- [ ] Feedback appears after submit
- [ ] Next formula loads automatically
- [ ] Completion screen appears
- [ ] Can start another lesson
- [ ] Database saves all data
- [ ] No console errors

### 🚨 If Any Are False:

1. **Identify which phase**
2. **Re-read that phase's instructions**
3. **Check code matches exactly**
4. **Look at troubleshooting section**
5. **Fix and re-test**

---

## TIME ESTIMATES

**Total implementation time: ~7-8 hours**

- Phase 1: 30 min
- Phase 2: 45 min  
- Phase 3: 1 hour
- Phase 4: 1 hour
- Phase 5: 2 hours
- Phase 6: 1 hour
- Phase 7: 30 min
- Bug fixing/adjustments: 1 hour buffer

**Recommendation:** Do 2-3 phases per day over 3 days. Don't rush.

---

## COMMON PITFALLS TO AVOID

### ❌ Don't:

1. **Skip phases** - Each builds on previous
2. **Modify code creatively** - Follow exactly as written
3. **Deploy before testing locally** - Fix bugs locally first
4. **Add features early** - Get MVP working first
5. **Ignore error messages** - Read them carefully
6. **Copy code without understanding** - Read comments

### ✅ Do:

1. **Test after each phase** - Verify before continuing
2. **Commit to git frequently** - Easy rollback if needed
3. **Use console.log liberally** - Debug by logging
4. **Check database often** - Verify data is saving
5. **Ask specific questions** - "Formula 2 not showing word bank" not "It doesn't work"
6. **Take breaks** - Fresh eyes catch errors

---

## SUCCESS CRITERIA

**You'll know you're done when:**

✅ A pupil can login  
✅ Choose any lesson L10-15  
✅ Enter a subject  
✅ Complete all formulas by rewriting sentences  
✅ Click word bank words (they appear in textarea)  
✅ See "Excellent!" feedback on correct answers  
✅ Automatically advance to next formula  
✅ See completion screen  
✅ Choose another lesson and repeat  
✅ All data saved in Supabase  
✅ Works on production URL  

**When ALL of these work consistently → MVP COMPLETE ✅**

---

## WHAT'S NEXT (After MVP Works)

**Phase 8: Teacher Dashboard** (2-3 hours)
- Live session monitoring
- Pupil progress view
- Basic analytics

**Phase 9: Enhanced AI Feedback** (3-4 hours)
- Socratic questioning
- Error type detection
- Hint generation

**Phase 10: Paragraph Writing** (4-5 hours)
- Contextual prompts
- Topic sentence integration
- L16+ lessons

**Phase 11: Mastery Adaptive** (3-4 hours)
- Concept mastery tracking
- Adaptive formula generation
- Remediation triggers

**But don't start these until MVP is 100% working!**

---

## HELP RESOURCES

**If stuck, check:**

1. Main Implementation Guide (detailed explanations)
2. Formula Progression Spec (formula rules)
3. Supabase docs (database queries)
4. Next.js docs (routing, API routes)
5. React docs (hooks, state)

**Remember:**
- Code is provided - use it exactly
- Each phase builds on previous
- Test thoroughly before moving on
- MVP first, features later

**You can do this! 💪**
