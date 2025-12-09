# WriFe Project Specification

## 1. LESSON DATA STRUCTURE

### All 67 Lessons Overview
The complete lesson data is available in the project file: /mnt/project/WriFe_Lesson_Summaries_For_Website_md.pdf

### Database Structure (Already Created)
- `lessons` table contains all 67 lessons
- Fields: id, lesson_number, part, title, summary, chapter_id, unit_id, year_group_min, year_group_max, duration_minutes

### Special Case
- Lesson 27 has TWO parts: L27a (What is a paragraph?) and L27b (Introduction to Connect Grid)
- These are stored with lesson_number=27 and part='a' or part='b'

### Chapters & Units

```
CHAPTER 1: Stories and Words (L1-17)
- Unit 1: Personal Stories (L1)
- Unit 2: Story Structure (L2-6)
- Unit 3: Parts of Speech 1 (L7-10) - PWP BEGINS at L10
- Unit 4: Parts of Speech 2 (L11-15)
- Unit 5: Reading Comprehension (L16-17)

CHAPTER 2: Sentences and Paragraphs (L18-34)
- Unit 6: Sentence Types (L18-19)
- Unit 7: Phrases and Clauses (L20-22)
- Unit 8: Simple Sentences (L23-26)
- Unit 9: Connect Grid (L27-34) - CORE PLANNING TOOL

CHAPTER 3: Planning and Drafting (L35-41)
- Unit 10: Planning (L35-38)
- Unit 11: First Draft (L39-41)

CHAPTER 4: Editing (L42-44)
- Unit 12: Editing Process

CHAPTER 5: Cohesion (L45-51)
- Unit 13: Building Cohesion

CHAPTER 6: Different Purposes (L52-62)
- Unit 14: Non-fiction Writing (L52-60)
- Unit 15: Fictional Writing (L61-62)

CHAPTER 7: Project-Based Writing (L63-67)
- Unit 16: Real-World Projects
```

### Year Group Mapping
- L1-17: Years 2-3 (Ages 6-8)
- L18-34: Years 3-4 (Ages 7-9)
- L35-51: Years 4-5 (Ages 8-10)
- L52-67: Years 4-5 (Ages 8-10)

### Lesson Duration
- Most lessons: 45-60 minutes
- L10 (PWP launch): 60-70 minutes

---

## 2. USER ROLES & PERMISSIONS

### ROLE 1: SUPER ADMIN (admin)
**Who:** Michael (wrife.education@gmail.com) - WriFe creator

**Can Do:**
- ✅ Manage all schools (create, view, edit, delete)
- ✅ View all teachers, classes, pupils across all schools
- ✅ Access admin portal at /admin
- ✅ Create school admin accounts
- ✅ View analytics across all schools
- ✅ Access special admin login at /admin/login

**Cannot Do:**
- ❌ Cannot create classes (not a teacher)
- ❌ Cannot assign lessons (not a teacher)
- ❌ Cannot log in via regular /login (blocked)

**Dashboard Features:**
- School cards showing: name, teacher count/limit, pupil count/limit, subscription tier
- Create new school button
- View school details (teachers, classes, pupils)
- Edit school settings
- Delete school (with cascade confirmation)

### ROLE 2: SCHOOL ADMIN (school_admin)
**Who:** School leadership (Head, Deputy Head, Curriculum Lead)

**Can Do:**
- ✅ View all teachers in their school
- ✅ View all classes in their school
- ✅ View all pupils in their school
- ✅ View school-wide analytics and reports
- ✅ Assign teachers to their school (future feature)
- ✅ View lesson assignments across all classes

**Cannot Do:**
- ❌ Cannot create/edit/delete classes (teacher only)
- ❌ Cannot assign lessons (teacher only)
- ❌ Cannot view other schools
- ❌ Cannot change subscription tier
- ❌ Cannot mark pupil work

**Dashboard Features:**
- School overview metrics
- Teacher list with class counts
- Pupil progress across all classes
- Assignment completion rates
- Class comparison charts

### ROLE 3: TEACHER (teacher)
**Who:** Classroom teachers using WriFe

**Can Do:**
- ✅ Create classes for their pupils
- ✅ Add pupils to their classes
- ✅ Remove pupils from their classes
- ✅ Browse all 67 lessons
- ✅ View all lesson materials (6 tabs per lesson)
- ✅ Assign lessons to their classes with due dates and instructions
- ✅ View all assignments they've created
- ✅ See pupil submissions for assignments
- ✅ Review pupil work and provide feedback
- ✅ Mark submissions as "Reviewed"
- ✅ View class progress and analytics

**Cannot Do:**
- ❌ Cannot see other teachers' classes
- ❌ Cannot access admin features
- ❌ Cannot view pupils outside their classes
- ❌ Cannot change school settings

**Dashboard Features:**
- Metric cards: PWP today, drafts awaiting review, average score, top skill gap
- Class progress chart
- Recent submissions list
- Upcoming lessons
- Quick access to create assignment

### ROLE 4: PUPIL (pupil)
**Who:** Students aged 7-11 (UK Years 2-6)

**Can Do:**
- ✅ View their assigned lessons
- ✅ Open lesson materials (6 tabs)
- ✅ Submit work for assignments
- ✅ See teacher feedback on their submissions
- ✅ Track their writing streak
- ✅ View their progress over time
- ✅ See due dates for assignments

**Cannot Do:**
- ❌ Cannot browse all 67 lessons (only assigned ones)
- ❌ Cannot create classes
- ❌ Cannot see other pupils' work
- ❌ Cannot access teacher/admin features

**Dashboard Features:**
- Friendly greeting with name
- Writing streak counter (gamification)
- "My Assignments" list with due dates
- Assignment status badges (upcoming, overdue, completed)
- Simple progress visualization

---

## 3. PUPIL EXPERIENCE JOURNEY

### Login Experience
1. Pupil uses class code OR QR code to join class (first time)
2. Creates simple account (first name, last name, display name)
3. Email auto-generated: firstnamelastname[random]@wrife.co.uk
4. Future logins: use class code or saved credentials

### Dashboard Experience
```
Hi, Maya! 👋
Let's get your writing brain warmed up.

[Writing Streak: 5 days 🔥]

MY ASSIGNMENTS
┌─────────────────────────────────────┐
│ 📝 Lesson 1: Personal Stories       │
│ Year 4 Maple                         │
│ Due: Tomorrow (yellow badge)         │
│ Complete practice activities...      │
│ [Open Lesson]                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📝 Lesson 5: Story Structure        │
│ Year 4 Maple                         │
│ Due: Friday (blue badge)             │
│ Focus on beginning, middle, end      │
│ [Open Lesson]                        │
└─────────────────────────────────────┘
```

### Opening an Assignment
1. Click "Open Lesson" → goes to lesson detail page
2. See assignment banner at top with due date and teacher instructions
3. Access all 6 tabs:
   - Teacher Guide (for reference)
   - Lesson Presentation
   - Practice Activities
   - Worksheets
   - Progress Tracker
   - Assessment

### Submitting Work (Future Feature)
1. "Submit Work" button on assignment banner
2. Upload file OR paste text
3. Submit → shows "Submitted" badge
4. Teacher reviews → pupil sees feedback

### Feedback Experience (Future Feature)
```
YOUR FEEDBACK - Lesson 1: Personal Stories

✅ REVIEWED by Ms. Walker

📊 Overall: Secure (Band 3/4)

💚 What you did well:
"Great use of descriptive words! Your story about 
your dog was very clear and engaging."

📝 One thing to improve:
"Remember to use capital letters at the start of 
every sentence."

🎯 Next challenge:
"Try adding more detail about what your dog looks like."

[View Teacher's Comment] [View Next Assignment]
```

### Gamification Elements
- **Writing Streak:** Days in a row with submissions
- **Badges:** (Future) Foundation (L1-17), Application (L18-34), Mastery (L35-67)
- **Progress Bar:** Lessons completed out of assigned
- **Celebration:** Confetti animation on milestone completions

---

## 4. AI ASSESSMENT RUBRICS

Full specification in: /mnt/project/1_1_Rubric___Strand_definition__backend_.rtf

### Assessment Bands (1-4)
- Band 1: Emerging
- Band 2: Developing  
- Band 3: Secure
- Band 4: Greater Depth

### Assessment Criteria (8 strands)
```typescript
export type RubricCriterionId =
  | "audience_purpose"      // Understanding audience
  | "structure"             // Story organization
  | "sentence_control"      // Grammar correctness
  | "cohesion"             // Text flows well
  | "vocabulary"           // Word choice
  | "mechanics"            // Spelling, punctuation
  | "genre_features"       // Meets genre requirements
  | "project_skills";      // Research, planning
```

### AI Output Format
```typescript
interface AiAssessmentResult {
  overallScore: number;              // 1.0-4.0 weighted
  band: Band;                        // "Emerging" | "Developing" | "Secure" | "Greater Depth"
  criterionScores: Record<RubricCriterionId, CriterionScore>;
  teacherRationale: string;          // 2-3 sentence summary
  studentFeedback: StudentFeedbackItem[]; // Child-friendly
  mechanicalEdits: {
    spelling: MechanicalEdit[];
    punctuation: MechanicalEdit[];
    grammarSuggestions: MechanicalEdit[];
  };
  improvedParagraphExample: string;  // 1-2 paragraphs
  confidence: ConfidenceInfo;        // AI confidence 0-1
  explainability: string;            // How score was calculated
}
```

### Student Feedback Types
- **Praise:** "What you did well" (green card)
- **NextStep:** "One thing to improve" (yellow card)
- **Practice:** "Try this mini challenge" (blue card)

---

## 5. DESIGN SPECIFICATIONS

Full design system in: /mnt/project/WriFe_Design_System.rtf

### Color Tokens (CSS Variables)
```css
--wrife-blue: #2E5AFF;
--wrife-blue-soft: #CDE1FF;
--wrife-yellow: #FFCF4A;
--wrife-green: #58C791;
--wrife-coral: #FF7A64;
--wrife-bg: #FFF9F0;
--wrife-surface: #FFFFFF;
--wrife-border: #E3E6F0;
--wrife-text-main: #19213D;
--wrife-text-muted: #6B7280;
--wrife-danger: #E11D48;
```

### Typography
- **Headings:** Baloo 2, 24-40px, weight 600-700
- **Body (Teacher):** Inter/Nunito, 14-16px, weight 400-500
- **Body (Pupil):** Inter/Nunito, 16-18px (larger for readability)

### Component Patterns
- **Cards:** `rounded-2xl`, `shadow-soft`, `border border-[var(--wrife-border)]`
- **Buttons:** `rounded-full`, `px-6 py-2`
- **Badges:** `rounded-full`, `px-3 py-1`, `text-xs font-semibold`
- **Spacing:** 4, 8, 12, 16, 24, 32px scale

### Admin Theme
- Dark mode: `bg-gray-900`, `text-gray-100`
- Cards: `bg-gray-800`, `border-gray-700`
- Buttons: `bg-blue-600`, `bg-gray-800`

---

## 5B. UI MOCKUPS & VISUAL ASSETS

### Available UI Mockups (10 PNG files in /mnt/project/)

#### 1. Teacher Login & Auth
- `Teacher_login_ui.png` - Teacher login page design
- `App_Teacher_Login_page.png` - Mobile teacher login
- `Teacher_and_Pupil_login_page.png` - Both login screens side-by-side

**Key Design Elements:**
- WriFi mascot on login screen (friendly, welcoming)
- Email/Password fields with rounded corners
- "Don't have an account? Sign Up" link
- Blue primary button (var(--wrife-blue))
- Cream background (var(--wrife-bg))

#### 2. Teacher Dashboard
- `Teacher_Dashboard_on_App.png` - Full teacher dashboard layout
- `Teacher_login_AI_page_etc.png` - Dashboard with AI features

**Dashboard Components:**
- Top Nav: WriFe logo, Dashboard/Lessons/Classes links, profile menu
- Metric Cards (4):
  - PWP submissions today (green)
  - Drafts awaiting review (yellow)
  - Average writing score (blue)
  - Top skill gap (coral)
- Class Progress Chart: Line/area chart showing progress over time
- Recent Submissions List: Pupil name, lesson, timestamp, status badge
- Upcoming Lessons: Quick links to next lessons

**Color Coding:**
- Emerging: Red/Coral badges
- Developing: Yellow badges
- Secure: Green badges
- Greater Depth: Blue badges

#### 3. Pupil Dashboard
- `Pupil_dashboard_and_screens_for_ages_6_10_Years_2_5.png` - Pupil interface

**Pupil Dashboard Components:**
- Friendly Greeting: "Hi, Maya! 👋"
- Writing Streak Card: "5 days 🔥" (gamification)
- Today's 7-minute Writing: Big yellow button with timer icon
- My Assignments List:
  - Lesson title with number badge
  - Class name
  - Due date badge (color-coded)
  - Teacher instructions preview
  - "Open Lesson" button (yellow, rounded-full)
- Simple Progress Chart: Bar chart showing completed lessons

**Pupil-Friendly Features:**
- Larger text (16-18px minimum)
- Simple language
- Fewer options (not overwhelming)
- Colorful, encouraging design
- Icons and emojis

#### 4. Lesson Pages
- `WriFe_website_landing_and_lesson_pages.png` - Website lesson library
- `Lesson_page.png` - Individual lesson detail page

**Lesson Library:**
- Grid of lesson cards (3-4 per row)
- Each card shows:
  - Lesson number badge (circular, blue)
  - Lesson title
  - 2-3 line summary
  - Tags (chapter, unit, stage)
  - "Open Teacher Page" button (yellow)
- Filters: Chapter dropdown, Unit dropdown, Year group selector

**Lesson Detail Page - 6 Tabs:**
```
[Teacher Guide] [Presentation] [Practice Activities] 
[Worksheets] [Progress Tracker] [Assessment]
```

Each tab shows:
- Preview card with icon
- Brief description
- "View Content" / "Download" buttons
- Google Drive integration

#### 5. AI Assessment UI
- `WriFe_AI_Assessment_UI.png` - AI feedback interface

**Two-Pane Layout:**

LEFT PANE (Pupil Work):
- Pupil name and lesson info
- Tabs: Draft 1 / Draft 2 / Final
- Text with line numbers
- Highlighting toggles (spelling, grammar, suggestions)

RIGHT PANE (AI Feedback):
- Overall band badge (large, color-coded)
- Green Card: "What you did well" (2-3 strengths)
- Yellow Card: "One thing to improve" (1 specific target)
- Blue Card: "Try this mini challenge" (practice activity)
- White Card: "Improved paragraph example"

**Bottom Actions:**
- "Approve & Send to Pupil" (primary blue button)
- "Edit feedback" (secondary button)
- "Mark for manual review" (danger link)

---

## 5C. WriFi THE PENCIL - OFFICIAL MASCOT

### Mascot Files
- `official_WriFi_Mascot_Selection_Pack.docx` - Full mascot guide
- `Full_Wrife_Mascot_Pack.png` - All mascot variations

### Mascot Overview
- **Name:** WriFi the Pencil
- **Style:** Friendly, warm, child-appropriate (ages 6-10)
- **Character:** Encouraging writing companion

### Mascot Personality & Role

**WriFi Represents:**
- Assessment IS learning (not testing)
- Self-regulation over teacher burden
- Progressive complexity
- Pupil ownership of writing
- Connect Grid as central tool

**Character Traits:**
- Encouraging (never critical)
- Patient and supportive
- Celebrates effort and progress
- Makes writing feel achievable
- Guides without overwhelming

### WriFi Mascot Asset Pack

#### 1. Full Body Poses
- Standing (default pose)
- Waving (greeting)
- Jumping (celebration)
- Thinking (contemplation, hand on chin)
- Writing (holding paper/pencil)
- Celebrating (arms up, excited)

#### 2. Emoji Pack
- 😊 Happy WriFi
- 🤔 Thinking WriFi
- 👍 Thumbs up WriFi
- ✏️ Ready-to-write WriFi
- 🎉 Well-done WriFi

#### 3. Badge Set (Mastery Levels)
- Foundation Badge (Lessons 1-17) - Blue circular badge with WriFi
- Application Badge (Lessons 18-34) - Green badge with WriFi
- Mastery Badge (Lessons 35-67) - Gold badge with WriFi + laurel wreath
- Streak Badges: 5-day, 10-day, 20-day writing streaks

#### 4. UI Icon Set
- Practice activity icon (WriFi + worksheet)
- Connect Grid helper icon (WriFi + grid)
- Story structure icons (WriFi + storybook)
- Free writing icon (WriFi + blank page)
- Assessment icon (WriFi + checkmark)

#### 5. Lesson Page Header Characters
Specific WriFi variants for each tab:
- Teacher Guide: WriFi with glasses (professional)
- Lesson Presentation: WriFi with presentation pointer
- Student Worksheets: WriFi with pencil and paper
- Assessment Package: WriFi with clipboard
- Interactive Practice: WriFi with game controller
- Progress Tracker: WriFi with chart/graph

### Where to Use WriFi

**Website (wrife.co.uk):**
- Homepage hero section: "Meet WriFi—your writing companion"
- Lesson pages: WriFi icon next to each of 6 components
- About page: WriFi introduces the system

**App (app.wrife.co.uk):**
- Login page: WriFi waves "Welcome back!"
- Class Code entry: WriFi says "Enter your class code!"
- Teacher dashboard: WriFi in corner (small, unobtrusive)
- Pupil dashboard: WriFi shows today's practice target
- Practice activities: WriFi pops up with encouragement
- AI feedback screens: WriFi introduces strengths/targets

**Lesson Resources:**
- Warm-up helper for PWP formulas
- Marker of success criteria on worksheets
- Guide in student worksheets (speech bubbles)
- Connect Grid stages helper (L27-38)
- Icon for each assessment form (Forms 1-8)

**Feedback & Gamification:**
- Success celebrations: "Great work! 🎉" with jumping WriFi
- Streak milestones: WriFi with flame emoji
- Badge awards: WriFi presenting the badge
- Encouragement: "Keep going!" with cheering WriFi

### WriFi Usage Guidelines

**DO:**
- ✅ Use WriFi for encouragement and guidance
- ✅ Keep WriFi friendly and supportive
- ✅ Use appropriate size (not too large/distracting)
- ✅ Animate WriFi for celebrations (subtle bounce/fade)
- ✅ Use speech bubbles for tips and hints

**DON'T:**
- ❌ Use WriFi for negative feedback or criticism
- ❌ Make WriFi too dominant (overshadowing content)
- ❌ Use WriFi in serious/formal contexts (reports, official docs)
- ❌ Animate excessively (distracting)

### WriFi Speech Bubble Examples

**PWP Practice:**
> "Remember your formula: Subject + Verb + Object!"

**Connect Grid:**
> "The middle column shows the pattern we can reuse!"

**Submission Success:**
> "Well done! Your teacher will review this soon!"

**Streak Achievement:**
> "5 days in a row! You're on fire! 🔥"

**Encouragement:**
> "Writing takes practice—every sentence makes you better!"

### Mascot Color Scheme

**WriFi Colors:**
- Body: Warm yellow/orange (`#FFCF4A` - var(--wrife-yellow))
- Eraser: Coral pink (`#FF7A64` - var(--wrife-coral))
- Eyes: Dark blue (`#19213D` - var(--wrife-text-main))
- Outline: Strong black stroke
- Shading: Subtle gradient (lighter at top)

**Badge Backgrounds:**
- Foundation: Blue circle (var(--wrife-blue))
- Application: Green circle (var(--wrife-green))
- Mastery: Gold/yellow circle with shine effect
- Streaks: Orange/red flame gradient

---

## 5D. UI MOCKUP REFERENCE GUIDE

### When building Teacher Dashboard, reference:
- `Teacher_Dashboard_on_App.png`
- 4 metric cards layout
- Chart component positioning
- Recent submissions list styling

### When building Pupil Dashboard, reference:
- `Pupil_dashboard_and_screens_for_ages_6_10_Years_2_5.png`
- Larger text and buttons
- Simplified layout
- WriFi integration points

### When building Lesson Pages, reference:
- `WriFe_website_landing_and_lesson_pages.png`
- 6-tab layout structure
- Lesson card design
- Filter bar positioning

### When building AI Feedback UI, reference:
- `WriFe_AI_Assessment_UI.png`
- Two-pane split layout
- Color-coded feedback cards
- Button placement and hierarchy

### When building Login Pages, reference:
- `Teacher_and_Pupil_login_page.png`
- Side-by-side comparison
- WriFi positioning
- Form field styling

---

## 5E. IMPLEMENTATION PRIORITY FOR VISUALS

### Phase 1 (Current Sprint - Assignments)
- WriFi on login pages (simple static image)
- WriFi on pupil dashboard (greeting)
- Basic mascot in assignment banners

### Phase 2 (Submissions & Feedback)
- WriFi in feedback cards
- WriFi celebration animations
- Badge system with WriFi

### Phase 3 (AI Integration)
- WriFi in AI feedback interface
- Animated WriFi for achievements
- Full mascot asset pack deployment

---

## 6. BUSINESS RULES

### Class Codes
- Auto-generated: 6-character alphanumeric (e.g., "A3X7K2")
- Generated by Supabase function: `generate_class_code()`
- Must be unique across entire system
- Case-insensitive when pupils enter them
- Never expire (unless class deleted)

### Subscription Tiers & Limits
```
TRIAL (default):
- 5 teachers
- 150 pupils
- All features enabled
- Duration: Unlimited for pilot phase

BASIC:
- 10 teachers
- 300 pupils
- £500/year per school

PRO:
- 25 teachers
- 750 pupils
- £1,200/year per school

ENTERPRISE:
- Unlimited teachers
- Unlimited pupils
- Custom pricing
```

### School Quotas Enforcement
- Teachers count calculated from `classes` table (unique teacher_ids)
- Pupils count from `class_members` join
- Block new teacher if at teacher_limit
- Block new pupil if at pupil_limit
- Warning shown when approaching limit (90%)

### Email Format Rules
- **Teachers:** Use real email (required for password reset)
- **Pupils:** Auto-generated `firstnamelastname[random]@wrife.co.uk`
- Random suffix: 4-6 alphanumeric characters
- Must use `@wrife.co.uk` domain (not `.test` or `.temp` - Supabase validation)

### Password Policy
- Email confirmation: DISABLED (development phase)
- Minimum length: 6 characters
- Teachers: Can reset via email
- Pupils: Teacher resets via "Reset Password" button

### Session & Timeout
- Default: 7 days (Supabase default)
- Auto-refresh on activity
- No explicit timeout needed (Supabase handles)

### Data Cascade Rules
```
DELETE school → CASCADE deletes:
  - All school_admins records
  - All classes in school
  - All pupils in those classes (via class_members)
  - All assignments for those classes

DELETE class → CASCADE deletes:
  - All class_members records
  - All assignments for that class
  - All submissions for those assignments

DELETE teacher → PREVENT if has classes
  - Must transfer or delete classes first

DELETE pupil → CASCADE deletes:
  - All class_members records
  - All submissions
```

---

## 7. DATABASE SCHEMA

### Core Tables (Already Created)
- ✅ schools - Multi-tenant school records
- ✅ profiles - All users (extends auth.users)
- ✅ school_admins - Junction for school admin roles
- ✅ classes - Teacher's classes
- ✅ pupils - Pupil-specific data
- ✅ class_members - Junction for pupil-class membership
- ✅ lessons - All 67 lessons
- ✅ lesson_files - Google Drive file URLs for lessons
- ✅ assignments - Teacher assigns lesson to class

### To Be Built
- ❌ submissions - Pupil work submissions (EXISTS but needs verification)
- ❌ assessments - AI assessment results (ai_assessments table exists)
