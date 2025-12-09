# WriFe Development Handoff Document
## Week 8, Session 5 Continuation Point
**Date:** December 9, 2025  
**Developer:** Michael Ankrah  
**Project:** WriFe (Writing for Everyone) - EdTech Platform  
**Status:** 80% Complete, Ready for School Detail Page Build

---

## 🎯 PROJECT OVERVIEW

**WriFe** is a comprehensive EdTech platform providing systematic English writing instruction for primary school pupils aged 7-11 (UK Years 2-6).

**Core Value Proposition:**
- 67 structured lessons with complete teaching materials
- Progressive Writing Practice (PWP) system
- AI-powered assessment (planned)
- Multi-tenant school management
- Teacher and pupil dashboards

**Business Model:**
- Schools purchase licenses (e.g., 10 teachers + 400 pupils)
- Schools self-administer internally
- Super admin (you) oversees all schools

**Tech Stack:**
- Frontend: Next.js 14, React, Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth)
- Hosting: Vercel
- Domain: app.wrife.co.uk
- Cost: £0/month (all free tiers)

---

## ✅ WHAT'S COMPLETE (80%)

### **Phase 1: Foundation (Weeks 1-3)**
- [x] All accounts created (Supabase, Vercel, Replit, GitHub, Resend)
- [x] DNS configured (app.wrife.co.uk)
- [x] Environment variables set up
- [x] 280 lesson files organized in Google Drive (L1-L34)
- [x] Design system implemented (color tokens, components)

### **Phase 2: Core Features (Weeks 4-6)**
- [x] Responsive Navbar component
- [x] Homepage with hero section
- [x] Lesson library (filterable, searchable)
- [x] Lesson detail pages with 6-tab interface
- [x] 67 lessons database (titles, summaries, chapters, units)
- [x] L1-L34 file access (280 files with HTML rendering)
- [x] Teacher authentication (signup/login)
- [x] Email confirmation system (branded templates)

### **Phase 3: Class Management (Week 7)**
- [x] Classes table with auto-generated codes
- [x] Create class functionality
- [x] Classes list page
- [x] Class detail page
- [x] Add pupil modal (creates auth user + profile + pupil record)
- [x] Pupils table and class_members junction
- [x] Remove pupil from class
- [x] Test data: Year 4 Maple with Emily Smith and Sam Johnson

### **Phase 4: School Hierarchy (Week 8, Sessions 4-5)**
- [x] Multi-tenant database architecture
- [x] Schools table (quotas, subscription tiers)
- [x] School_admins junction table
- [x] Profiles.school_id foreign key
- [x] Classes.school_id foreign key
- [x] Comprehensive RLS policies for data isolation
- [x] Role system: admin, school_admin, teacher, pupil
- [x] Separate admin login portal (/admin/login)
- [x] Super admin dashboard (/admin)
- [x] Create school page (/admin/schools/new)
- [x] Pilot School created with test data
- [x] You as super admin (wrife.education@gmail.com)

---

## 📊 DATABASE SCHEMA

### **Key Tables**

#### **schools**
```sql
id uuid PRIMARY KEY
name text NOT NULL
domain text
teacher_limit int4 DEFAULT 5
pupil_limit int4 DEFAULT 150
subscription_tier text DEFAULT 'trial' CHECK (trial, basic, pro, enterprise)
active boolean DEFAULT true
created_at timestamptz
updated_at timestamptz
```

#### **profiles**
```sql
id uuid PRIMARY KEY REFERENCES auth.users
email text UNIQUE NOT NULL
role text NOT NULL CHECK (admin, school_admin, teacher, pupil)
display_name text
school_name text
school_id uuid REFERENCES schools(id) -- NEW in Week 8
created_at timestamptz
updated_at timestamptz
```

#### **classes**
```sql
id uuid PRIMARY KEY
teacher_id uuid REFERENCES profiles(id)
name text NOT NULL
year_group int4 CHECK (1-6)
class_code text UNIQUE NOT NULL
school_name text
school_id uuid REFERENCES schools(id) -- NEW in Week 8
created_at timestamptz
updated_at timestamptz
```

#### **pupils**
```sql
id uuid PRIMARY KEY REFERENCES profiles(id)
first_name text NOT NULL
last_name text
display_name text
year_group int4 CHECK (1-6)
created_at timestamptz
updated_at timestamptz
```

#### **class_members**
```sql
id uuid PRIMARY KEY
class_id uuid REFERENCES classes(id) ON DELETE CASCADE
pupil_id uuid REFERENCES pupils(id) ON DELETE CASCADE
joined_at timestamptz
UNIQUE(class_id, pupil_id)
```

#### **school_admins**
```sql
id uuid PRIMARY KEY
school_id uuid REFERENCES schools(id) ON DELETE CASCADE
user_id uuid REFERENCES profiles(id) ON DELETE CASCADE
created_at timestamptz
UNIQUE(school_id, user_id)
```

#### **lessons**
```sql
id uuid PRIMARY KEY
lesson_number int4 UNIQUE NOT NULL
part text (for L27a/L27b)
title text NOT NULL
summary text
chapter_id uuid REFERENCES chapters(id)
unit_id uuid REFERENCES units(id)
year_group_min int4
year_group_max int4
duration_minutes int4
created_at timestamptz
```

#### **lesson_files**
```sql
id uuid PRIMARY KEY
lesson_number int4 REFERENCES lessons(lesson_number)
part text
file_type text (teacher_guide, presentation, worksheets, etc.)
file_name text
file_url text (Google Drive URL)
created_at timestamptz
```

### **RLS Policies Summary**

**schools:**
- Super admins: SELECT, INSERT, UPDATE (all schools)
- School admins: SELECT (own school only)
- Teachers: SELECT (own school only)

**profiles:**
- Users: SELECT, UPDATE (own profile)
- Teachers: SELECT (pupils in their classes via class_members)
- School admins: SELECT (all profiles in their school)
- Note: Super admin SELECT policy was causing circular dependency (parked issue)

**classes:**
- Teachers: SELECT, INSERT, UPDATE, DELETE (own classes)
- School admins: SELECT (all classes in their school)
- Auto-sets school_id from teacher's profile on INSERT

**pupils:**
- Pupils: SELECT, UPDATE (own profile)
- Teachers: SELECT (pupils in their classes)
- School admins: SELECT (all pupils in their school)

**class_members:**
- Teachers: SELECT, INSERT, DELETE (own classes)
- Pupils: SELECT (own memberships)
- School admins: SELECT (their school's classes)

---

## 🏗️ CURRENT ARCHITECTURE

### **File Structure**
```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx              # Admin login portal (dark theme)
│   ├── schools/
│   │   └── new/
│   │       └── page.tsx          # Create school form
│   └── page.tsx                  # Super admin dashboard
├── api/
│   └── fetch-html/
│       └── route.ts              # Fetches Google Drive HTML files
├── classes/
│   ├── new/
│   │   └── page.tsx              # Create class form
│   ├── [id]/
│   │   └── page.tsx              # Class detail with pupils
│   └── page.tsx                  # Classes list
├── dashboard/
│   └── page.tsx                  # Teacher dashboard
├── lesson/
│   └── [id]/
│       └── page.tsx              # Lesson detail with 6 tabs
├── login/
│   └── page.tsx                  # Regular login (blocks admins)
├── signup/
│   └── page.tsx                  # Teacher signup
└── page.tsx                      # Homepage with lesson library

components/
├── AddPupilModal.tsx             # Add pupil to class (creates auth user)
├── LessonCard.tsx                # Lesson card in library
├── LessonDetailPage.tsx          # 6-tab lesson detail UI
├── LessonLibrary.tsx             # Filterable lesson grid
├── MetricCard.tsx                # Dashboard metric cards
└── Navbar.tsx                    # Main navigation (role-aware)

lib/
├── auth-context.tsx              # Auth provider with user state
└── supabase.ts                   # Supabase client
```

### **Key Components**

**Navbar.tsx:**
- Role-aware navigation
- Logged out: "Log in" + "Get started"
- Logged in: User menu with avatar, role display, dashboard link, sign out
- Classes link for teachers
- Subtle "Admin" link in corner

**AddPupilModal.tsx:**
- Creates temporary email: `firstnamelastname[random]@wrife.co.uk`
- Uses `supabase.auth.signUp()` with role='pupil' in metadata
- Trigger auto-creates profile
- Inserts into pupils table
- Adds to class_members

**LessonDetailPage.tsx:**
- 6 tabs: Teacher Guide, Presentation, Practice Activities, Worksheets, Progress Tracker, Assessment
- Fetches files from lesson_files table
- HTML files: "View Content" button → iframe with srcDoc
- Other files: "View" (Google Drive) + "Download" buttons

---

## ⚠️ KNOWN ISSUES & PARKED ITEMS

### **Issue 1: Admin Dashboard Count Display (Parked)**

**Problem:**
- Dashboard shows "0/10 teachers" and "0/300 pupils"
- Actual data in database is correct (2 teachers, 2 pupils exist)

**Root Cause:**
- RLS policies prevent super admin from querying profiles table client-side
- Attempting to add admin SELECT policy created circular dependency (can't check role without reading profile, can't read profile without checking role)

**Solution (15 min when ready):**
1. Create API route: `/app/api/admin/school-counts/route.ts`
2. Use service role key in server-side route (bypasses RLS)
3. Update admin dashboard to fetch counts from API
4. Add `SUPABASE_SERVICE_ROLE_KEY` to Replit Secrets

**Current Workaround:**
- Counts display as 0/10 and 0/300 (cosmetic issue only)
- Data is correct in database
- School creation and management fully functional

### **Issue 2: L35-L67 Files Not Collected (264 files)**

**Status:** Week 5 Session 2 incomplete
- L1-L34 files collected and accessible (280 files)
- L35-L67 files remain in Google Drive (not yet added to database)

**Solution:** Continue file collection process from Week 5

### **Issue 3: Hydration Warning (Cosmetic)**

**Details:** React hydration mismatch warning in console (Week 4)
- Non-breaking, does not affect functionality
- Low priority

---

## 🎯 NEXT STEPS (In Order)

### **IMMEDIATE: Complete Session 5 (30-45 min)**

**Build School Detail Page** `/admin/schools/[id]/page.tsx`

**Requirements:**
1. Fetch school data by ID
2. Display school information card:
   - Name, domain, subscription tier badge
   - Active status toggle
   - Teacher limit and pupil limit
   - Created date
3. "Edit School" button (opens edit modal or inline edit)
4. Teachers section:
   - List all teachers (name, email, created date)
   - Count displayed: "2 teachers"
   - Link to teacher profile (future)
5. Classes section:
   - List all classes (name, year group, teacher name, pupil count)
   - Count displayed: "1 class"
   - Link to class detail page
6. Pupils section:
   - Total count: "2 pupils"
   - Optional: list all pupils with classes
7. Actions:
   - Edit school button
   - Delete school button (with confirmation)
   - "Back to Dashboard" link

**Data Fetching:**
```typescript
// Fetch school
const { data: school } = await supabase
  .from('schools')
  .select('*')
  .eq('id', params.id)
  .single();

// Fetch teachers
const { data: teachers } = await supabase
  .from('profiles')
  .select('id, email, display_name, created_at')
  .eq('school_id', params.id)
  .eq('role', 'teacher');

// Fetch classes with teacher names
const { data: classes } = await supabase
  .from('classes')
  .select(`
    id,
    name,
    year_group,
    teacher:profiles(display_name, email),
    class_members(count)
  `)
  .eq('school_id', params.id);
```

**Styling:**
- Same WriFe design tokens
- Card-based layout
- Sections with headers
- Lists with hover states
- Edit/Delete buttons (danger color for delete)

### **OPTIONAL: Fix Count Display (15 min)**

Only if time permits, otherwise defer to later.

See "Issue 1" solution above.

### **AFTER SESSION 5: Week 9 - Pupil Login & Dashboard**

**Features to build:**
1. Pupil login page with class code entry
2. Class code validation
3. Pupil dashboard (simplified, age-appropriate)
4. Role-based routing (pupils → pupil dashboard)

### **AFTER WEEK 9: Assignment System (Weeks 10-11)**

**Features:**
1. Teachers create assignments (link to lessons)
2. Assign to classes
3. Pupils view assignments
4. Pupils submit writing
5. Teachers review submissions

### **AFTER WEEK 11: AI Assessment (Weeks 12-13)**

**Features:**
1. Integrate AI marking API
2. Rubric system
3. Automated feedback
4. Teacher review interface

---

## 🔑 CREDENTIALS & ACCESS

### **Supabase**
- URL: `https://uijpqtppyqoqjjpjojgf.supabase.co`
- Anon Key: In `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var
- Service Role Key: Available in Supabase Dashboard → Settings → API
  - **Not yet added to Replit Secrets** (needed for count fix)

### **Admin Login**
- Email: `wrife.education@gmail.com`
- Password: [User knows this]
- Access: `/admin/login`

### **Test Accounts**
- Teacher: `mankrahwrife@gmail.com` (in Pilot School)
- Teacher: `jwalker@kafed.org.uk` (in Pilot School)
- Pupil: `emilysmithjpub47@wrife.co.uk` (in Year 4 Maple)
- Pupil: `samjohnsonkf6x24@wrife.co.uk` (in Year 4 Maple)

### **Pilot School Details**
- ID: `8b8509a9-593c-4c5a-9151-943241587556`
- Name: "Pilot School"
- Domain: "pilot.wrife.co.uk"
- Teacher Limit: 10
- Pupil Limit: 300
- Subscription: trial

### **Replit**
- Project: Active in Replit AI
- Build instructions available
- Auto-deploy to Vercel on push

### **Vercel**
- Domain: `app.wrife.co.uk`
- Auto-deploy from Replit
- Free tier: 100GB bandwidth/month

### **Google Drive**
- Folder: L1-L67 lesson files (280 files collected so far)
- Share permissions: Set to "Anyone with link can view"
- File URLs in `lesson_files` table

---

## 🧪 TESTING INSTRUCTIONS

### **Test Admin Portal**
1. Navigate to `https://app.wrife.co.uk/admin/login`
2. Log in with `wrife.education@gmail.com`
3. Should redirect to `/admin` (Super Admin Dashboard)
4. Verify Pilot School card displays (with 0/10 counts - known issue)
5. Click "+ New School"
6. Fill in form, submit
7. Should redirect back to `/admin`
8. New school should appear in grid

### **Test Teacher Flow**
1. Log out from admin
2. Navigate to `https://app.wrife.co.uk/login`
3. Log in with `mankrahwrife@gmail.com`
4. Should redirect to `/dashboard` (Teacher Dashboard)
5. Click "Classes" in navbar
6. Should see "Year 4 Maple"
7. Click on class card
8. Should see Emily Smith and Sam Johnson

### **Test Lesson Library**
1. From homepage, browse lessons
2. Click on any lesson (e.g., Lesson 1)
3. Should see 6 tabs
4. Click each tab to verify content
5. For lessons 1-34, files should be accessible
6. HTML files should render in iframe

### **Verify Data in Supabase**
```sql
-- Check schools
SELECT * FROM schools;

-- Check super admin
SELECT id, email, role, school_id FROM profiles WHERE email = 'wrife.education@gmail.com';

-- Check teachers in Pilot School
SELECT email, role, school_id FROM profiles 
WHERE school_id = '8b8509a9-593c-4c5a-9151-943241587556' AND role = 'teacher';

-- Check pupils in Pilot School
SELECT p.first_name, p.last_name, prof.email, prof.school_id
FROM pupils p
JOIN profiles prof ON prof.id = p.id
WHERE prof.school_id = '8b8509a9-593c-4c5a-9151-943241587556';

-- Check classes
SELECT name, year_group, school_id FROM classes;
```

---

## 💡 TIPS FOR NEXT DEVELOPER

### **When Building School Detail Page**

**Query Pattern:**
```typescript
// Always fetch with joins to get related data
const { data: classes } = await supabase
  .from('classes')
  .select(`
    *,
    teacher:profiles!teacher_id(display_name, email),
    class_members(count)
  `)
  .eq('school_id', schoolId);
```

**RLS Consideration:**
- Super admin queries work for schools, classes, pupils
- But NOT for profiles (hence the count issue)
- For profiles counting, use server-side API route or simple count display

**Styling Consistency:**
- Use `var(--wrife-blue)`, `var(--wrife-yellow)`, etc.
- Cards: `rounded-2xl`, `shadow-soft`, `border border-[var(--wrife-border)]`
- Buttons: `rounded-full`, `px-6 py-2`
- Badges: `rounded-full`, `px-3 py-1`, `text-xs font-semibold`

### **Common Patterns**

**Auth Check:**
```typescript
'use client';
import { useAuth } from '@/lib/auth-context';

export default function Page() {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }
  // ... rest of component
}
```

**Supabase Query:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)
  .single(); // or .order() or nothing

if (error) {
  console.error(error);
  setError(error.message);
}
```

**Loading States:**
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    setLoading(true);
    // ... fetch
    setLoading(false);
  }
  fetchData();
}, []);

if (loading) return <div>Loading...</div>;
```

### **Debug Tips**

**Check RLS Issues:**
- If query returns empty when data exists, check RLS policies
- Use Supabase Dashboard → SQL Editor to test queries with user context
- Or create API route with service role key

**Check Auth State:**
- `console.log('user:', user)` in component
- Verify role is correct
- Check if user is null (not logged in)

**Check Database:**
- Use Supabase Table Editor to verify data
- Use SQL Editor to run test queries
- Check foreign key relationships

---

## 🚀 DEPLOYMENT

**Current Setup:**
- Replit AI writes code
- Code is in Replit workspace
- Push to GitHub (if configured)
- Auto-deploy to Vercel
- Live at `app.wrife.co.uk`

**To Deploy Changes:**
1. Make changes in Replit
2. User clicks "Publish" or code auto-deploys
3. Vercel builds and deploys (2-3 minutes)
4. Check `app.wrife.co.uk` for changes

---

## 📊 PROJECT METRICS

**Development Time:** ~20 hours over 8 weeks
**Lines of Code:** ~5,000 (estimated)
**Database Tables:** 9 core tables
**Lessons Available:** 67 (280 files accessible)
**Current Cost:** £0/month
**Capacity (free tier):**
- Supabase: 500MB database, 50K monthly active users
- Vercel: 100GB bandwidth/month
- Ready to scale when needed

---

## 📝 IMPORTANT NOTES

1. **Pupil Email Format:** All pupil temp emails use `@wrife.co.uk` (not `.test` or `.temp` - Supabase validation)

2. **Class Code Generation:** Uses `generate_class_code()` function in Supabase (6-character alphanumeric, unique)

3. **Password Policy:** Email confirmation disabled in Supabase for development (avoids spam issues)

4. **Lesson 27 Special Case:** Has L27a and L27b (uses `part` column to distinguish)

5. **File URLs:** Google Drive direct download URLs (not view URLs) - see `/app/api/fetch-html/route.ts` for conversion logic

6. **Role Hierarchy:**
   - admin: Super admin (you) - manages all schools
   - school_admin: School administrator - manages teachers in their school
   - teacher: Creates classes, manages pupils
   - pupil: Student accounts

7. **Multi-tenant Isolation:** All data queries filtered by `school_id` via RLS - schools cannot see each other's data

---

## 🎯 SESSION 5 SUCCESS CRITERIA

**You'll know Session 5 is complete when:**
- [ ] `/admin/schools/[id]` page exists and loads
- [ ] School information displays correctly
- [ ] Teachers list shows (even if count is manual)
- [ ] Classes list shows with links
- [ ] Pupils count displays
- [ ] Edit school button exists (can be placeholder)
- [ ] Delete school button exists with confirmation
- [ ] Back button returns to `/admin`
- [ ] Page is responsive and follows WriFe design system

**Estimated time:** 30-45 minutes

---

## ✅ HANDOFF COMPLETE

**This document contains everything needed to continue development.**

**Starting point:** Build School Detail Page at `/admin/schools/[id]/page.tsx`

**Good luck!** 🚀

---

**Document Version:** 1.0  
**Last Updated:** December 9, 2025  
**Next Review:** After Session 5 completion
