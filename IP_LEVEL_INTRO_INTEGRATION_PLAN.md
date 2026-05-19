# WriFe Interactive Practice — Level Introduction Scripts Integration Plan
*Prepared: 2026-05-19*

---

## What We Have

### 1. The Scripts (`WriFe Level Introduction Scripts/` on Google Drive)
One `.md` file per lesson (all 67 confirmed present), created 2026-05-17 to 2026-05-19.
Each file contains six short spoken introductions — one per W-band — voiced by the WriFe pencil character.

**Script structure per lesson:**
```
## W1 — Recognition        (~20-25 seconds, "Hello again, welcome to Lesson N...")
## W2 — Identification      (warm follow-on: "Well done for understanding X...")
## W3 — Sorting and Matching ("Good progress. Now you will...")
## W4 — Fill in the Blank   ("You are doing really well. Now you will...")
## W5 — Construction        ("This is the independent level. You will...")
## W6 — Application         ("This is your mastery level. You will...")
```

Writing style: warm, unhurried, UK English, one sentence per line with a pause. All lessons follow the same structure.

### 2. The Audio Files (`intro.mp3` on Google Drive)
Pre-generated MP3 files already exist in per-level sub-folders within Google Drive. These were created 2026-05-15. They are the TTS-rendered versions of the scripts and are ready for hosting. File sizes range from ~35 KB to ~122 KB (roughly 5–15 seconds each).

### 3. The Interactive Practice App (practice.wrife.co.uk)
- **Stack**: Vite + React 18 + TypeScript + Tailwind v4 + Supabase
- **Lesson player**: `src/pages/ActivitySession.tsx`
- **Activities** fetched from Supabase `activities` table, structured as:
  - `level` enum: `bronze | silver | gold` (game tier)
  - `sort_order`: integer (1–20 within a tier)
  - `type`: `mc | match | fillblank | write | checklist`
  - `question_json` / `answer_json`: JSONB

### 4. The Key Mismatch: W-Bands vs. Game Tiers
The scripts use the **pedagogical W-band** structure (W1=Recognition → W6=Application).
The app uses **game tiers** (bronze / silver / gold).

These are **not the same thing**. They need to be reconciled:

| W-Band | Pedagogical Role | Maps to Game Tier |
|--------|-----------------|-------------------|
| W1 | Recognition | Bronze (start) |
| W2 | Identification | Bronze (mid) |
| W3 | Sorting & Matching | Silver (start) |
| W4 | Fill in the Blank | Silver (mid) |
| W5 | Construction | Gold (start) |
| W6 | Application / Mastery | Gold (mid/end) |

Each tier has roughly 8–10 activities split across two W-bands. The intro should fire **at the boundary** between W-bands — i.e., when `sort_order` crosses from the first half of a tier into the second half, and when a pupil enters a new tier altogether.

---

## Integration Plan

### Phase 1 — Database: New `lesson_level_introductions` Table

Create a dedicated table (cleaner than adding JSONB to `lessons`):

```sql
CREATE TABLE lesson_level_introductions (
  id          bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lesson_id   bigint NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  w_band      text   NOT NULL CHECK (w_band IN ('w1','w2','w3','w4','w5','w6')),
  script_text text   NOT NULL,
  audio_url   text,                          -- Supabase Storage public URL
  created_at  timestamptz DEFAULT now(),
  UNIQUE (lesson_id, w_band)
);

-- RLS: pupils can read their own lesson's intros; admins can do anything
ALTER TABLE lesson_level_introductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read intros"
  ON lesson_level_introductions FOR SELECT USING (true);
CREATE POLICY "Admins manage intros"
  ON lesson_level_introductions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

Also add a `w_band` column to `activities` so the app knows which band each activity belongs to:

```sql
ALTER TABLE activities
  ADD COLUMN w_band text CHECK (w_band IN ('w1','w2','w3','w4','w5','w6'));
```

This column lets `ActivitySession.tsx` detect when the W-band changes and trigger the right intro — even mid-tier.

### Phase 2 — Seeding: Parse Scripts → Supabase

Write a Node seeding script (`scripts/seed-level-intros.mjs`) that:

1. Reads all 67 `.md` files from the Google Drive "WriFe Level Introduction Scripts" folder (via the Drive API or by downloading them)
2. Parses each file's W1–W6 sections using the `## W{n}` heading pattern
3. Inserts rows into `lesson_level_introductions` with `ON CONFLICT (lesson_id, w_band) DO UPDATE`

**Parsing logic (pseudocode):**
```js
const sections = {};
let current = null;
for (const line of file.split('\n')) {
  const match = line.match(/^## (W[1-6])/);
  if (match) { current = match[1].toLowerCase(); sections[current] = ''; }
  else if (current) { sections[current] += line + '\n'; }
}
// sections = { w1: '...', w2: '...', ... }
```

**Lesson number → lesson ID mapping:**
The filename convention is `L{N} - {Title}.md`. Extract `N`, look up `lessons.id WHERE lesson_number = N`.

### Phase 3 — W-Band Backfill on Activities

Once activities have a `w_band` column, backfill based on sort_order thresholds per tier.
The typical pattern from the lesson HTML files is:

| Tier   | sort_order 1–4 | sort_order 5–10 |
|--------|---------------|-----------------|
| bronze | w1            | w2              |
| silver | w3            | w4              |
| gold   | w5            | w6              |

```sql
-- Approximate backfill (adjust thresholds per lesson as needed)
UPDATE activities SET w_band = CASE
  WHEN level = 'bronze' AND sort_order <= 4 THEN 'w1'
  WHEN level = 'bronze' AND sort_order > 4  THEN 'w2'
  WHEN level = 'silver' AND sort_order <= 4 THEN 'w3'
  WHEN level = 'silver' AND sort_order > 4  THEN 'w4'
  WHEN level = 'gold'   AND sort_order <= 2 THEN 'w5'
  WHEN level = 'gold'   AND sort_order > 2  THEN 'w6'
END;
```

For early lessons that have been audited individually, this can be made more precise later.

### Phase 4 — Audio: Upload MP3s to Supabase Storage

Create a storage bucket `ip-level-intros` (public read) and upload each `intro.mp3` file with the naming convention:

```
ip-level-intros/lesson_{lesson_number}_w{band}.mp3
```

Example: `ip-level-intros/lesson_11_w1.mp3`

After uploading, update `lesson_level_introductions.audio_url` with the public URL:
```
https://gzmgjkbtsvezfclmreru.supabase.co/storage/v1/object/public/ip-level-intros/lesson_{n}_w{b}.mp3
```

For lessons without a pre-recorded MP3, either:
- Use the **text-only fallback** (Phase 5 handles this gracefully), OR
- Generate audio via an ElevenLabs Edge Function on first play and cache it to Storage

### Phase 5 — React: `LevelIntroPanel` Component

**New file: `src/components/LevelIntroPanel.tsx`**

```tsx
interface LevelIntroPanelProps {
  lessonNumber: number;
  wBand: 'w1' | 'w2' | 'w3' | 'w4' | 'w5' | 'w6';
  scriptText: string;
  audioUrl?: string;
  onDismiss: () => void;
}
```

**Visual design** (WriFe World system):
- Full-width panel slides up from bottom (Pattern 5 style from design system)
- Purple header band with W-band label (e.g. "Week 1 — Recognition")
- Pencil character mascot: `pencil-waving.png` for W1, `pencil-thinking.png` for W2–W4, `pencil-celebrating.png` for W5–W6
- Script text in a speech-bubble card (warm cream `#FDF8EE` background)
- If `audioUrl` is present: auto-plays on mount; show a small speaker icon to replay
- Chunky orange "Let's go! →" CTA button (Pattern 2 border-bottom) to dismiss

**Accessibility:**
- `role="dialog"`, `aria-live="polite"` on the script text
- Audio play is NOT auto-forced — tap/click activates it for the first time
- "Skip" text link for pupils who prefer to proceed without reading

### Phase 6 — Wire into `ActivitySession.tsx`

The session component needs to:

1. **Fetch intros alongside activities** — add a query for `lesson_level_introductions` filtered by `lesson_id`
2. **Track which W-bands have been shown** — `const [shownBands, setShownBands] = useState<Set<string>>(new Set())`
3. **Detect band changes** — on each activity advance, compare `currentActivity.w_band` to the previous one
4. **Show panel when the band is new:**

```tsx
const currentBand = currentActivity?.w_band;
const intro = intros?.find(i => i.w_band === currentBand);

if (intro && !shownBands.has(currentBand)) {
  return (
    <LevelIntroPanel
      lessonNumber={lesson.lesson_number}
      wBand={currentBand}
      scriptText={intro.script_text}
      audioUrl={intro.audio_url}
      onDismiss={() => {
        setShownBands(prev => new Set(prev).add(currentBand));
      }}
    />
  );
}
```

5. **On lesson start (W1)** — the intro fires immediately before activity 1. This replaces the current "blank page" transition.
6. **Persistence (optional)** — store `shownBands` in `localStorage` keyed by `lessonId` so refreshes don't re-show intros within the same session

---

## Implementation Order

| Step | Work | Where | Effort |
|------|------|--------|--------|
| 1 | DB migration: `lesson_level_introductions` table + `activities.w_band` column | Supabase | 30 min |
| 2 | Seed script: parse 67 `.md` files → insert into DB | `scripts/seed-level-intros.mjs` | 2 hrs |
| 3 | W-band backfill on 1100 activities | SQL migration | 30 min |
| 4 | Upload 67×6 = 402 MP3 files to Supabase Storage | Script or manual | 1 hr |
| 5 | Build `LevelIntroPanel.tsx` component | InteractivePracticeApp | 2 hrs |
| 6 | Update `ActivitySession.tsx` to fetch intros + trigger panel | InteractivePracticeApp | 1 hr |
| 7 | QA: test W-band transitions across 3 different lessons | Manual testing | 1 hr |

**Total estimated effort: ~8 hours across two sessions.**

---

## Quick-Win Option (Text Only, No Audio, 2 Hours)

If you want to ship the guidance sooner without audio infrastructure:

1. Do steps 1–3 above (DB + seed)
2. Build a minimal `LevelIntroPanel` that shows text only (no `<audio>` element)
3. Wire into `ActivitySession.tsx`

Audio can be added later by populating `audio_url` in the database — the component gracefully falls back to text-only when `audioUrl` is undefined.

---

## Open Questions

1. **Are the existing `intro.mp3` files already organised by lesson/W-band?** The folder structure needs verifying before bulk upload. If they're named/organised by lesson+band, the upload script is simple. If not, they need sorting first.
2. **Should W1 intro fire before the first activity, or alongside it?** Recommend: fire first, then advance to activity 1 on "Let's go!". This matches the lesson HTML experience.
3. **Should returning pupils see the intro again?** Recommend: no — only show once per lesson session. Use localStorage to persist across refreshes.
4. **ElevenLabs for missing audio?** Some scripts may not have a pre-recorded MP3 yet. ElevenLabs TTS via an Edge Function is the cleanest fallback. Defer to Phase 2 if budget allows.
5. **Year-group filtering on intros?** Lessons L1–L11 target younger pupils (Y2–Y4). The scripts are already calibrated per lesson, but the TTS voice could vary. Not urgent for MVP.

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `supabase/migrations/20260519_lesson_level_intros.sql` | New table + w_band column |
| `scripts/seed-level-intros.mjs` | Parser + Supabase seed script |
| `scripts/upload-intro-audio.mjs` | Bulk upload MP3s to Storage |
| `src/components/LevelIntroPanel.tsx` | New component |
| `src/pages/ActivitySession.tsx` | Fetch intros, detect band transitions, render panel |
| `src/types/index.ts` | Add `LevelIntro` interface |
