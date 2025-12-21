# WriFe - Writing Education Platform

## Overview
WriFe is a writing education platform designed for primary school teachers, offering a comprehensive 67-lesson system for teaching writing. The platform aims to provide a structured curriculum, interactive practice, and AI-powered assessment tools to enhance writing education.

## Agent Instructions (READ FIRST)

**Before making any changes, understand these critical patterns:**

### Deployment Workflow
1. Development happens in Replit (this environment)
2. **Primary method**: Run `npm run deploy` to push to GitHub and trigger Vercel deployment
3. The deploy script (`scripts/deploy.sh`) handles both GitHub push and Vercel trigger

**Required Setup (One-Time):**
1. Create a GitHub Personal Access Token (PAT):
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
2. Add Replit secret `GIT_REMOTE_URL` with value:
   ```
   https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/wrifeeducation/wrife-website.git
   ```

**Deployment Commands:**
- `npm run deploy` - Checks sync status and triggers Vercel deployment
- `npm run deploy:api-only` - Only triggers Vercel (use if GitHub already has latest code)
- `npm run deploy:cli` - Uses Vercel CLI (may fail due to git author mismatch)

**If code is out of sync with GitHub:**
The deploy script will detect this and show you the command to run. In the Shell, run:
```bash
git push $GIT_REMOTE_URL HEAD:main --force
```
Then run `npm run deploy` again.

**Note**: The Agent cannot push to GitHub due to Replit safety restrictions, but you can run git commands directly in the Shell.

### Database Architecture (CRITICAL)
- **TWO separate databases exist**: Development (Replit) and Production (Vercel)
- Both are Neon-backed PostgreSQL accessed via `DATABASE_URL`
- Development DATABASE_URL is in `.env.local`
- Production DATABASE_URL is in Vercel Environment Variables
- **Always seed both databases** when adding reference data

### Database Changes Workflow
1. Modify `db/schema.ts` with new tables/columns
2. Run `npm run db:push` to apply to development database
3. Test thoroughly in development
4. Push to GitHub (triggers Vercel deployment)
5. If adding reference data, run seed script on production:
   ```bash
   DATABASE_URL="<production_url>" npx tsx db/seed-curriculum.ts
   ```

### Development Database Setup
Since development and production have separate databases, you need to seed test accounts in development:

```bash
npm run db:seed-accounts
```

This creates/updates the following test accounts in the development database:
- **Admin**: wrife.education@gmail.com (full tier, admin role)
- **Test Teacher (Full)**: teacher@test.wrife.co.uk
- **Test Teacher (Free)**: teacher.free@test.wrife.co.uk
- **Test Teacher (Standard)**: teacher.standard@test.wrife.co.uk
- **Test Pupil**: pupil@test.wrife.co.uk

**Important**: These profiles must have matching Supabase auth accounts to log in. The admin account already exists in Supabase. For other test accounts, you would need to create Supabase users or test with the admin account.

### API Route Naming
- **NEVER use underscore prefix** for API folders (e.g., `_admin`)
- Next.js/Vercel treats underscore-prefixed folders as private and won't deploy them
- Use `/api/admin/` not `/api/_admin/`

### Authentication Patterns
- **Supabase**: Authentication ONLY (sign-in, sign-up, sessions)
- **Replit PostgreSQL**: ALL application data storage
- Admin APIs use `requireAdmin()` from `lib/admin-auth.ts`
- Pupil login uses email lookup in profiles table (no password)

### Common Pitfalls to Avoid
1. Don't query Supabase for application data - use Replit PostgreSQL
2. Don't forget to seed production database after adding reference data
3. Don't use `localhost` for API calls in frontend - use relative paths or environment domain
4. Don't skip the `isMounted` pattern in auth context to prevent memory leaks

### Key File Locations
- Database schema: `db/schema.ts`
- Seed scripts: `db/seed-curriculum.ts`
- Auth context: `lib/auth-context.tsx`
- Admin auth helper: `lib/admin-auth.ts`
- Supabase clients: `lib/supabase.ts` (browser), `lib/supabase/server.ts` (server)

## User Preferences
I prefer that you focus on high-level architectural and feature discussions. Avoid getting bogged down in minor implementation details unless specifically asked. When suggesting changes, please outline the impact on existing structures, especially the database schema or core user flows. I appreciate clear, concise explanations and a collaborative approach.

## System Architecture
The project is built with Next.js 15 (App Router), TypeScript, and Tailwind CSS v4.

**Database Architecture (Critical):**
- **Replit PostgreSQL** (via `pg` Pool): Stores ALL application data including lessons, activities, assignments, classes, profiles, etc. Accessed via `DATABASE_URL` environment variable.
- **Supabase**: Provides authentication ONLY (sign-in, sign-up, session management). NOT used for data storage.
- **Important**: All data queries must use server-side API endpoints that connect to Replit PostgreSQL. Client components should NOT query Supabase for application data.

**UI/UX Decisions:**
- **Theming:** Consistent theming is enforced using CSS custom properties (design tokens) for colors like `--wrife-blue`, `--wrife-yellow`, and `--wrife-bg`.
- **Navigation:** Every page integrates a `Navbar` component for consistent user navigation.

**Technical Implementations & Design Choices:**
- **Dynamic Imports:** `LessonLibrary` and `AuthButtons` utilize `next/dynamic` with `ssr: false` to prevent hydration mismatches, especially concerning authentication states.
- **Client Components:** Pages requiring interactivity are marked with the `"use client"` directive.
- **Lesson Routing:** Lessons are accessed via their database `id` in the URL (e.g., `/lesson/30` for lesson ID 30). This ensures multi-part lessons (27a, 27b) each have unique URLs.
- **Client-Side Authentication:** `LessonPageWrapper` provides client-side authentication checks for dashboard and lesson pages.
- **Supabase SSR Pattern (Critical):** Browser client (`lib/supabase.ts`) must have `'use client'` directive to ensure cookies are written in browser context. Server code imports from `lib/supabase/server.ts`. This separation is essential for session persistence across page navigations.
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

## Database Management

**Environment Setup:**
- **Development Database**: Used in Replit during development. CONNECTION: `DATABASE_URL` in `.env.local`
- **Production Database**: Used by Vercel/wrife.co.uk. CONNECTION: `DATABASE_URL` in Vercel Environment Variables

**Tools & Scripts:**
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:push` - Push schema changes directly to database
- `npm run db:seed` - Seed development database with curriculum data
- `npm run db:seed:prod` - Seed production database (requires `PROD_DATABASE_URL` secret)
- `npm run db:studio` - Open Drizzle Studio for database inspection
- `npm run db:backfill-files` - Backfill lesson_files file_type to canonical categories
- `npm run db:backfill-files:prod` - Run backfill on production (requires `PROD_DATABASE_URL` secret)
- `npm run db:update-titles` - Update lesson titles to match official curriculum (development)
- `npm run db:update-titles:prod` - Update lesson titles on production (requires `PROD_DATABASE_URL` secret)

**Schema Location:** `db/schema.ts` - Contains all table definitions using Drizzle ORM

**Workflow for Database Changes:**
1. Modify `db/schema.ts` with new tables/columns
2. Run `npm run db:push` to apply to development
3. Deploy to Vercel (auto-deploys on git push)
4. If adding reference data, update seed scripts and run on production

**Important:**
- Never change primary key ID types (serial ↔ uuid)
- Always test schema changes in development first
- Seed scripts are idempotent (safe to run multiple times)

## LLM Provider Configuration

The platform supports multiple LLM providers for AI-powered assessments. Configuration is done via environment variables.

**Supported Providers:**
- **OpenAI** (default): GPT-4o, GPT-4o-mini
- **Anthropic**: Claude Sonnet 4.5, Claude Haiku 4.5

**Environment Variables:**
```bash
# Provider selection (optional, defaults to 'openai')
LLM_PROVIDER=anthropic   # Options: 'openai' or 'anthropic'

# OpenAI configuration (used when LLM_PROVIDER=openai or not set)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o      # Optional, defaults to gpt-4o

# Anthropic/Claude configuration (used when LLM_PROVIDER=anthropic)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514  # Optional

# Replit AI Integrations (alternative to direct API keys)
AI_INTEGRATIONS_OPENAI_API_KEY=...
AI_INTEGRATIONS_OPENAI_BASE_URL=...
```

**Usage:**
- Set `LLM_PROVIDER=anthropic` for Claude's nuanced educational feedback
- Set `LLM_PROVIDER=openai` for OpenAI's faster responses (default)
- Claude is recommended for assessments due to more detailed, empathetic feedback

**Cost Comparison (per 1M tokens):**
| Model | Input | Output |
|-------|-------|--------|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |
| Claude Sonnet 4.5 | $3.00 | $15.00 |
| Claude Haiku 4.5 | $1.00 | $5.00 |

**Key File:** `lib/llm-provider.ts` - Centralized LLM provider utility

## Freemium Membership System

**Membership Tiers:**
| Tier | Lesson Components | Features |
|------|-------------------|----------|
| Free | Teacher Guide, Presentation, Core Worksheets | View lessons only |
| Standard | All components (including Support/Challenge worksheets, Practice Activities) | No class management |
| Full | All components | Full access: classes, assignments, AI assessment |
| School | All components | Full access for all school teachers |

**Tier Resolution Logic:**
- Users get the **highest tier** between their personal `membership_tier` and their school's `subscription_tier`
- A teacher with "standard" personal tier at a "full" school gets Full access
- A teacher with "full" personal tier at a "standard" school keeps Full access (no downgrade)

**Key Files:**
- `lib/entitlements.ts` - Maps tiers to allowed file types and features
- `lib/auth-context.tsx` - Includes `school_tier` in user context
- `app/api/auth/profile/route.ts` - Fetches school subscription tier

**Access Controls:**
- `LessonDetailPage` filters visible files and locks premium content
- `app/classes/new/page.tsx` blocks free/standard users from class creation
- Admin users page allows manual tier assignment

## External Dependencies
- **Next.js 15**: Web framework.
- **TypeScript**: Programming language.
- **Tailwind CSS v4**: Styling framework.
- **Supabase**: Backend-as-a-Service providing authentication and storage ('practice-activities' bucket).
- **Replit PostgreSQL (Neon-backed)**: Primary database for all application data (via `pg` Pool).
- **Drizzle ORM**: Database schema management and migrations.
- **OpenAI/Anthropic**: AI-powered writing assessment (configurable via LLM_PROVIDER).