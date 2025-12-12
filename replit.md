# WriFe - Writing Education Platform

## Overview
WriFe is a writing education platform for primary school teachers, providing a complete 67-lesson system for teaching writing. Built with Next.js 15, TypeScript, and Tailwind CSS v4.

## Tech Stack
- **Framework**: Next.js 15.2.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Port**: 5000

## Project Structure
```
/app                      # Next.js App Router pages
  /page.tsx              # Home page with lesson library
  /lesson/[id]/page.tsx  # Dynamic lesson detail page
  /classes/page.tsx      # Teacher's classes list
  /classes/new/page.tsx  # Create new class form
  /classes/[id]/page.tsx # Class detail page with pupil management (includes PWP and DWP tabs)
  /pupil/login/page.tsx  # Pupil login with class code
  /pupil/dashboard/page.tsx # Pupil dashboard with assignments
  /pupil/assignment/[id]/page.tsx # Pupil writing submission page
  /pupil/pwp/[id]/page.tsx # Pupil PWP practice page
  /pupil/dwp/[id]/page.tsx # Pupil DWP writing page with AI assessment
  /admin/page.tsx        # Super admin dashboard
  /admin/login/page.tsx  # Secure admin login
  /admin/users/page.tsx  # User management (assign to schools)
  /admin/schools/new/page.tsx # Create new school form
  /admin/schools/[id]/page.tsx # School detail page
  /admin/help/page.tsx   # Super admin help guide
  /admin/lessons/page.tsx # Lesson curriculum management
  /admin/practice-files/page.tsx # Upload practice HTML files to Supabase Storage
  /admin/school/help/page.tsx # School admin help guide
  /admin/pwp-activities/page.tsx # Manage Progressive Writing Practice activities
  /admin/dwp-levels/page.tsx # Manage DWP levels (seed 40 levels)
  /dashboard/help/page.tsx # Teacher help guide
/app/api                 # API endpoints
  /pupil/lookup-class/route.ts  # Class code lookup for pupil login (uses service role)
  /pupil/assignments/route.ts   # Fetch assignments and progress records for pupil dashboard
  /pupil/assignment/route.ts    # Fetch individual assignment details for pupil
  /pupil/practice-complete/route.ts # Mark practice activity as complete (GET/POST)
  /assess/route.ts       # AI assessment API endpoint (teacher auth required)
  /pwp-assess/route.ts   # AI assessment for PWP submissions (grammar-focused)
  /dwp/assess/route.ts   # AI assessment for DWP submissions (level-specific rubrics)
  /pupil/pwp-submit/route.ts # Submit PWP writing responses
  /admin/storage/route.ts # Admin storage management for practice files (auth protected)
  /fetch-html/route.ts    # HTML proxy for serving practice activities
/docs
  /WriFe_Curriculum.md   # Official 68-lesson curriculum outline
/components              # React components
  /LessonLibrary.tsx     # Lesson list with filtering
  /LessonCard.tsx        # Individual lesson card
  /LessonDetailPage.tsx  # Lesson detail with tabs
  /AddPupilModal.tsx     # Modal for adding pupils to classes
  /AssignLessonModal.tsx # Modal for assigning lessons to classes
  /AssignPWPModal.tsx    # Modal for assigning PWP activities to classes
  /AssignDWPModal.tsx    # Modal for assigning DWP levels to classes
  /SubmissionReviewModal.tsx # Modal for viewing submissions and running AI assessments
  /Navbar.tsx            # Navigation bar
  /HeroSection.tsx       # Hero section
  /Footer.tsx            # Footer with admin link
/lib
  /supabase.ts           # Supabase client configuration
  /auth-context.tsx      # Authentication context provider (auto-creates profiles on signup)
  /dwp-levels-data.ts    # All 40 DWP level definitions with rubrics
/styles
  /globals.css           # Global styles and design tokens
/supabase/migrations
  /20251212_create_dwp_tables.sql # DWP database schema
```

## Design Tokens
The project uses CSS custom properties for consistent theming:
- `--wrife-blue`: #2E5AFF (primary color)
- `--wrife-blue-soft`: #CDE1FF (light accent)
- `--wrife-yellow`: #FFCF4A (secondary accent)
- `--wrife-bg`: #FFF9F0 (background)
- `--wrife-surface`: #FFFFFF (card/surface)
- `--wrife-border`: #E3E6F0 (borders)
- `--wrife-text-main`: #19213D (primary text)
- `--wrife-text-muted`: #6B7280 (secondary text)

## Database Schema

### lessons table
- `id`: Primary key
- `lesson_number`: Lesson number for navigation
- `title`: Lesson title
- `has_parts`: Boolean indicating if lesson has multiple parts
- `part`: Part identifier (a, b, c, etc.)
- `chapter`: Chapter number (1-7)
- `unit`: Unit number
- `summary`: Lesson description
- `duration_minutes`: Lesson duration
- `year_group_min`: Minimum year group
- `year_group_max`: Maximum year group

### lesson_files table
- `id`: Primary key
- `lesson_id`: Foreign key to lessons table
- `file_type`: Type of file (teacher_guide, presentation, interactive_practice, worksheet_support, progress_tracker, assessment)
- `file_name`: Display name of the file
- `file_url`: Google Drive URL to the file

### classes table
- `id`: Primary key
- `teacher_id`: Foreign key to auth.users (UUID)
- `name`: Class name (e.g., "Year 4 Maple")
- `year_group`: Year group number (2-6)
- `class_code`: Unique 6-character code for pupils to join
- `school_name`: Optional school name
- `created_at`: Timestamp
- `updated_at`: Timestamp

### class_members table
- `id`: Primary key (serial)
- `class_id`: Foreign key to classes table (with CASCADE delete)
- `pupil_id`: Foreign key to pupils table (UUID, with CASCADE delete)
- `pupil_name`: Pupil's name (legacy)
- `pupil_email`: Optional pupil email (legacy)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### pupils table
- `id`: Primary key (UUID, references auth.users)
- `first_name`: Pupil's first name
- `last_name`: Pupil's last name (optional)
- `display_name`: Full display name
- `year_group`: Year group number (2-6)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### schools table
- `id`: Primary key (UUID)
- `name`: School name
- `domain`: School domain
- `subscription_tier`: trial, basic, pro, or enterprise
- `teacher_limit`: Maximum teachers allowed
- `pupil_limit`: Maximum pupils allowed
- `is_active`: Boolean status
- `created_at`: Timestamp
- `updated_at`: Timestamp

### profiles table
- `id`: Primary key (UUID, matches auth.users id)
- `email`: User email
- `first_name`: User's first name
- `last_name`: User's last name
- `display_name`: Full display name
- `role`: admin, school_admin, teacher, or pupil
- `school_id`: Foreign key to schools table
- `created_at`: Timestamp
- `updated_at`: Timestamp

### assignments table
- `id`: Primary key (serial)
- `lesson_id`: Lesson ID (integer)
- `class_id`: Foreign key to classes table (with CASCADE delete)
- `teacher_id`: Teacher's UUID
- `title`: Assignment title (from lesson)
- `instructions`: Optional instructions text
- `due_date`: Optional due date
- `created_at`: Timestamp
- `updated_at`: Timestamp

### submissions table
- `id`: Primary key (serial)
- `assignment_id`: Foreign key to assignments table
- `pupil_id`: Foreign key to class_members.id (integer)
- `content`: Text content of the pupil's writing
- `status`: draft, submitted, or reviewed
- `submitted_at`: Timestamp when submitted
- `created_at`: Timestamp
- `updated_at`: Timestamp

### ai_assessments table
- `id`: Primary key (serial)
- `submission_id`: Foreign key to submissions table
- `teacher_id`: Teacher's UUID who triggered the assessment
- `strengths`: Array of strength points
- `improvements`: Array of improvement suggestions
- `improved_example`: Rewritten example paragraph
- `mechanical_edits`: Array of spelling/grammar corrections
- `banding_score`: Score 1-4 (working towards, expected, greater depth, mastery)
- `raw_response`: JSONB storing the full AI response
- `created_at`: Timestamp

### rubrics table
- `id`: Primary key (serial)
- `name`: Rubric name
- `description`: Rubric description
- `criteria`: JSONB storing assessment criteria
- `year_group_min`: Minimum year group
- `year_group_max`: Maximum year group
- `is_default`: Boolean for default rubric

### progress_records table
- `id`: Primary key (serial)
- `pupil_id`: Pupil identifier
- `lesson_id`: Foreign key to lessons table
- `class_id`: Foreign key to classes table
- `status`: Progress status
- `score`: Optional score
- `completed_at`: Timestamp when completed

### progressive_activities table (PWP)
- `id`: Primary key (serial)
- `level`: Level 1-7 indicating difficulty progression
- `level_name`: Display name (e.g., "Simple Sentences")
- `grammar_focus`: Grammar concept being taught
- `sentence_structure`: Target structure pattern (e.g., "Subject + Verb + Object")
- `instructions`: Activity instructions for pupils
- `examples`: Array of example sentences
- `practice_prompts`: Array of writing prompts
- `year_group_min`: Minimum year group
- `year_group_max`: Maximum year group
- `created_at`: Timestamp
- `updated_at`: Timestamp

### pwp_assignments table
- `id`: Primary key (serial)
- `activity_id`: Foreign key to progressive_activities
- `class_id`: Foreign key to classes table
- `teacher_id`: Teacher's UUID
- `instructions`: Optional custom instructions
- `due_date`: Optional due date
- `created_at`: Timestamp
- `updated_at`: Timestamp

### pwp_submissions table
- `id`: Primary key (serial)
- `pwp_assignment_id`: Foreign key to pwp_assignments
- `pupil_id`: Pupil's UUID
- `content`: Text content of pupil's writing
- `status`: draft, submitted, or reviewed
- `submitted_at`: Timestamp when submitted
- `created_at`: Timestamp
- `updated_at`: Timestamp

### pwp_assessments table
- `id`: Primary key (serial)
- `pwp_submission_id`: Foreign key to pwp_submissions
- `teacher_id`: Teacher's UUID who triggered assessment
- `grammar_accuracy`: Score 1-4
- `structure_correctness`: Score 1-4
- `feedback`: Text feedback
- `corrections`: Array of corrections
- `improved_example`: Improved sentence example
- `raw_response`: JSONB storing full AI response
- `created_at`: Timestamp

### writing_levels table (DWP)
- `id`: Primary key (UUID)
- `level_number`: Level 1-40
- `tier_number`: Tier 1-8
- `level_id`: Unique string identifier (writing_level_1, etc.)
- `activity_name`: Name of the activity
- `activity_type`: Type of activity (word_sorting, sentence_completion, etc.)
- `learning_objective`: What pupils will learn
- `prompt_title`: Title shown to pupils
- `prompt_instructions`: Full instructions for the activity
- `rubric`: JSONB with assessment criteria and scoring bands
- `passing_threshold`: Percentage needed to pass (usually 80)
- `tier_finale`: Boolean - is this the last level of a tier
- `programme_finale`: Boolean - is this Level 40

### dwp_assignments table
- `id`: Primary key (serial)
- `level_id`: Reference to writing_levels.level_id
- `class_id`: Foreign key to classes table
- `teacher_id`: Teacher's UUID
- `instructions`: Optional custom instructions
- `due_date`: Optional due date
- `created_at`: Timestamp

### writing_attempts table
- `id`: Primary key (UUID)
- `pupil_id`: Pupil's UUID
- `dwp_assignment_id`: Foreign key to dwp_assignments
- `level_id`: Reference to writing_levels.level_id
- `pupil_writing`: Text content of pupil's work
- `word_count`: Number of words
- `score`: Raw score achieved
- `percentage`: Percentage score
- `passed`: Boolean - did pupil pass
- `performance_band`: mastery, secure, developing, or emerging
- `ai_assessment`: JSONB storing full AI assessment response
- `badge_earned`: Badge string if earned
- `status`: draft, submitted, or assessed

### writing_progress table
- `id`: Primary key (UUID)
- `pupil_id`: Pupil's UUID (unique)
- `current_level_number`: Current level in programme
- `levels_completed`: Array of completed level_ids
- `tiers_completed`: Array of completed tier numbers
- `programme_completed`: Boolean
- `badges_earned`: JSONB array of badges
- `total_attempts`: Total number of attempts
- `total_levels_passed`: Number of levels passed

### writing_badges table
- `id`: Primary key (UUID)
- `badge_id`: Unique badge identifier
- `badge_name`: Display name
- `badge_icon`: Emoji icon
- `badge_description`: What the badge is for
- `badge_type`: tier, programme, special, or streak

### writing_certificates table
- `id`: Primary key (UUID)
- `certificate_id`: Unique certificate identifier
- `certificate_name`: Display name
- `certificate_type`: tier or programme
- `tier_number`: Which tier (null for programme)

## Running the Project
```bash
npm run dev   # Start development server on port 5000
npm run build # Build for production
npm run start # Start production server
```

## Architecture Decisions
- **Dynamic Imports**: LessonLibrary uses `next/dynamic` with `ssr: false` to prevent hydration mismatches
- **AuthButtons Dynamic Import**: AuthButtons uses `next/dynamic` with `ssr: false` to prevent hydration issues with authentication state
- **Client Components**: Pages with interactivity use "use client" directive
- **Lesson Routing**: Lessons use `lesson_number` for URL paths (e.g., /lesson/27)
- **Client-Side Auth Protection**: Dashboard and lesson pages use client-side authentication checks via LessonPageWrapper component
- **Practice File Storage**: Interactive HTML practice files should be stored in Supabase Storage (bucket: 'practice-activities') rather than Google Drive for proper interactivity
- **HTML Proxy**: The `/api/fetch-html` endpoint serves as a secure proxy for loading practice activities, with domain whitelisting for security

## Project Policies

### Navigation Policy
**Every page must include the Navbar component** to ensure users can always navigate back to the home page. When creating a new page:
1. Import the Navbar: `import Navbar from '@/components/Navbar';`
2. Include `<Navbar />` at the top of the page content
