# WriFe - Writing Education Platform

## Overview
WriFe is a writing education platform for primary school teachers, offering a 67-lesson system. Its purpose is to provide a structured curriculum, interactive practice, and AI-powered assessment tools to enhance writing education. The platform aims to be a comprehensive resource for teachers to manage classes, track pupil progress, and utilize AI for feedback.

## User Preferences
I prefer that you focus on high-level architectural and feature discussions. Avoid getting bogged down in minor implementation details unless specifically asked. When suggesting changes, please outline the impact on existing structures, especially the database schema or core user flows. I appreciate clear, concise explanations and a collaborative approach.

## System Architecture
The project is built with Next.js 15 (App Router), TypeScript, and Tailwind CSS v4.

**UI/UX Decisions:**
- **Theming:** Consistent theming uses CSS custom properties (design tokens) for colors like `--wrife-blue`, `--wrife-yellow`, and `--wrife-bg`.
- **Navigation:** All pages include a `Navbar` component for consistent user navigation.

**Technical Implementations & Design Choices:**
- **Database Architecture:**
    - **Shared PostgreSQL (Neon-backed):** A single shared database stores ALL application data (lessons, activities, assignments, classes, profiles) across both development (Replit) and production (Vercel) environments.
    - **Connection Priority:** APIs prefer `PROD_DATABASE_URL` when available, falling back to `DATABASE_URL`. This ensures environment consistency.
    - **Auto-Provisioning:** The profile API automatically creates profiles for authenticated users who don't have one in the database, preventing login failures across environments.
    - **Supabase:** Used ONLY for authentication (sign-in, sign-up, session management); NOT for application data storage.
    - All data queries must use server-side API endpoints connecting to the shared PostgreSQL database.
- **Authentication:** Supabase handles authentication. Admin APIs use `requireAdmin()`. Pupil login uses email lookup in the `profiles` table.
- **Dynamic Imports:** `next/dynamic` with `ssr: false` is used for components like `LessonLibrary` and `AuthButtons` to prevent hydration mismatches.
- **Supabase SSR Pattern:** Separate Supabase clients for browser (`lib/supabase.ts` with `'use client'`) and server (`lib/supabase/server.ts`) ensure session persistence.
- **Lesson Routing:** Lessons are accessed via their database `id` in the URL (e.g., `/lesson/30`).
- **Practice File Management:** Interactive HTML practice files are stored in Supabase Storage ('practice-activities' bucket). A secure `/api/fetch-html` endpoint proxies and serves these files.
- **Role-Based Access:** The `profiles` table implements role-based access control (admin, school_admin, teacher, pupil).
- **AI Assessment:** Dedicated API endpoints (`/api/assess`, `/api/pwp-assess`, `/api/dwp/assess`) handle AI-powered writing assessments.
- **Curriculum Management:** Supports managing lessons, PWP (Progressive Writing Practice), and DWP (Differentiated Writing Programme) levels, including seeding 40 DWP levels with rubrics.
- **Pupil Workflow:** Includes distinct login, dashboard, assignment submission, and practice (PWP/DWP) pages.
- **Freemium Membership:** Supports Free, Standard, Full, and School tiers. Tier resolution provides users with the highest applicable tier (personal or school).
- **Subscription Management:** 
    - Admin can change user tiers via `/admin/users` page, which updates PostgreSQL directly.
    - Users can upgrade via Stripe checkout from `/pricing` page.
    - Stripe webhook (`/api/stripe/webhook`) updates `membership_tier` in PostgreSQL on successful payment.
    - Teacher dashboard displays current tier with upgrade CTA for free users.
    - Dashboard calls `refreshProfile()` on mount to pick up tier changes from admin or Stripe.
    - Stripe checkout redirects to `/pricing/success` page which refreshes profile before dashboard redirect.
    - Standard tier now includes class management, pupil assignments, and progress tracking (same as Full except AI assessment).
- **Usage Analytics:** Tracks user activity (logins, PWP/DWP, lesson views) in the `user_activity` table for admin dashboards.

**Feature Specifications:**
- **Lesson Library:** Teachers can browse, filter, and assign lessons.
- **Class Management:** Teachers can create classes, manage pupils, and assign activities.
- **Pupil Progress Tracking:** Records pupil progress, submission statuses, and AI assessment results.
- **PWP (Progressive Writing Practice):** Structured activities with AI feedback. Includes a simplified MVP flow (`/pupil-mvp`) for lessons 10-15 using formula-based practice.
- **DWP (Differentiated Writing Programme):** A 40-level program with level-specific rubrics, AI assessment, badges, and certificates.
- **Admin Dashboards:** Separate dashboards for super administrators (user/school/curriculum management) and school administrators.
- **PWP Admin Quick Add:** Streamlined activity creation for PWP with auto-populated fields.
- **Promo Subdomain:** Marketing landing page at `promo.wrife.co.uk` (or `/promo` route) for pilot programme promotion. Uses host-based middleware routing to serve marketing content separately from the main app.

## External Dependencies
- **Next.js 15**: Web framework.
- **TypeScript**: Programming language.
- **Tailwind CSS v4**: Styling framework.
- **Supabase**: Authentication and storage for practice activities ('practice-activities' bucket).
- **Replit PostgreSQL (Neon-backed)**: Primary application database.
- **Drizzle ORM**: Database schema management.
- **OpenAI/Anthropic**: AI-powered writing assessment (configurable via `LLM_PROVIDER`).
- **Stripe**: Payment processing for subscriptions, integrated via Replit connector.
- **Resend**: Email delivery for contact forms. Uses RESEND_API_KEY secret. Currently using onboarding@resend.dev as sender; for production, verify wrife.co.uk domain in Resend dashboard for branded sending.