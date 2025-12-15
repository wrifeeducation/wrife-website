# WriFe - Writing Education Platform

## Overview
WriFe is a writing education platform designed for primary school teachers, offering a comprehensive 67-lesson system for teaching writing. The platform aims to provide a structured curriculum, interactive practice, and AI-powered assessment tools to enhance writing education.

## User Preferences
I prefer that you focus on high-level architectural and feature discussions. Avoid getting bogged down in minor implementation details unless specifically asked. When suggesting changes, please outline the impact on existing structures, especially the database schema or core user flows. I appreciate clear, concise explanations and a collaborative approach.

## System Architecture
The project is built with Next.js 15 (App Router), TypeScript, and Tailwind CSS v4. Supabase (PostgreSQL) is used for the database.

**UI/UX Decisions:**
- **Theming:** Consistent theming is enforced using CSS custom properties (design tokens) for colors like `--wrife-blue`, `--wrife-yellow`, and `--wrife-bg`.
- **Navigation:** Every page integrates a `Navbar` component for consistent user navigation.

**Technical Implementations & Design Choices:**
- **Dynamic Imports:** `LessonLibrary` and `AuthButtons` utilize `next/dynamic` with `ssr: false` to prevent hydration mismatches, especially concerning authentication states.
- **Client Components:** Pages requiring interactivity are marked with the `"use client"` directive.
- **Lesson Routing:** Lessons are accessed via their `lesson_number` in the URL (e.g., `/lesson/27`).
- **Client-Side Authentication:** `LessonPageWrapper` provides client-side authentication checks for dashboard and lesson pages.
- **Practice File Management:** Interactive HTML practice files are stored in Supabase Storage (bucket: 'practice-activities').
- **HTML Proxy:** A secure `/api/fetch-html` endpoint with domain whitelisting is used to proxy and serve practice activities, ensuring proper interactivity and security.
- **Role-Based Access:** The `profiles` table implements a role-based access control system (admin, school_admin, teacher, pupil).
- **AI Assessment:** Dedicated API endpoints (`/api/assess`, `/api/pwp-assess`, `/api/dwp/assess`) handle AI-powered writing assessments using various rubrics and criteria.
- **Curriculum Management:** The platform supports managing lessons, PWP activities, and DWP levels, including the seeding of 40 DWP levels with detailed rubrics.
- **Pupil Workflow:** Includes distinct pupil login, dashboard, assignment submission, and practice (PWP/DWP) pages.

**Feature Specifications:**
- **Lesson Library:** Teachers can browse, filter, and assign lessons.
- **Class Management:** Teachers can create classes, manage pupils, and assign various activities (lessons, PWP, DWP).
- **Pupil Progress Tracking:** Records pupil progress, submission statuses, and AI assessment results.
- **PWP (Progressive Writing Practice):** Structured activities focusing on grammar and sentence structure with AI feedback.
- **PWP MVP (L10-15):** Simplified PWP flow at `/pupil-mvp` for lessons 10-15. Features:
  - Login via email → Lesson selection → Subject choice → Formula-based practice
  - L10: 2 formulas (Nouns + Verbs), L11: 3 (Determiners), L12: 3 (Adjectives)
  - L13: 4 formulas (Adverbs), L14: 4 (Conjunctions), L15: 4 (Pronouns)
  - API endpoints: `/api/pwp-mvp/start-session`, `/api/pwp-mvp/submit-formula`, `/api/pwp-mvp/complete-session`
  - Formula generator: `lib/formulaGenerator.ts`
- **DWP (Differentiated Writing Programme):** A 40-level program with level-specific rubrics and AI assessment, leading to badges and certificates.
- **Admin Dashboards:** Separate dashboards for super administrators (user/school/curriculum management) and school administrators (school-specific help).
- **PWP Admin Quick Add:** Simplified activity creation with one-click "Quick Add" that auto-populates level name, grammar focus, and default instructions for independent practice. Full form available via "Advanced Options".

## External Dependencies
- **Next.js 15**: Web framework.
- **TypeScript**: Programming language.
- **Tailwind CSS v4**: Styling framework.
- **Supabase**: Backend-as-a-Service providing PostgreSQL database, authentication, and storage ('practice-activities' bucket).