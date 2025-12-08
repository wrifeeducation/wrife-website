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
/components              # React components
  /LessonLibrary.tsx     # Lesson list with filtering
  /LessonCard.tsx        # Individual lesson card
  /LessonDetailPage.tsx  # Lesson detail with tabs
  /Navbar.tsx            # Navigation bar
  /HeroSection.tsx       # Hero section
/lib
  /supabase.ts           # Supabase client configuration
  /auth-context.tsx      # Authentication context provider
/styles
  /globals.css           # Global styles and design tokens
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

## Project Policies

### Navigation Policy
**Every page must include the Navbar component** to ensure users can always navigate back to the home page. When creating a new page:
1. Import the Navbar: `import Navbar from '@/components/Navbar';`
2. Include `<Navbar />` at the top of the page content
