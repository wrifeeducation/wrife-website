import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// NC year group expectations mapped to DWP level ranges
const NC_EXPECTATIONS: Record<number, { min: number; max: number; label: string }> = {
  1: { min: 1,  max: 10, label: 'Tiers 1–2: Word & phrase building' },
  2: { min: 11, max: 17, label: 'Tier 3: Basic sentence writing' },
  3: { min: 18, max: 24, label: 'Tier 4: Conjunctions & expansion' },
  4: { min: 25, max: 28, label: 'Tier 5: Sequencing & cohesion' },
  5: { min: 29, max: 33, label: 'Tier 6: Story structure' },
  6: { min: 34, max: 40, label: 'Tiers 7–8: Complex sentences & extended writing' },
};

// NC grammar/writing objectives per year group (for Word report checklist)
const NC_OBJECTIVES: Record<number, string[]> = {
  1: [
    'Use capital letters for proper nouns and sentence starts',
    'Demarcate sentences with full stops and question marks',
    'Join words and clauses using "and"',
    'Write simple noun phrases (e.g. "the blue cat")',
    'Sequence sentences to form short narratives',
  ],
  2: [
    'Use coordination: or, and, but',
    'Use subordination: when, if, that, because',
    'Use expanded noun phrases to describe and specify',
    'Use present and past tense correctly and consistently',
    'Use capital letters, full stops, question marks and exclamation marks',
    'Use apostrophes for omission (e.g. can\'t, didn\'t)',
  ],
  3: [
    'Organise writing into paragraphs',
    'Use conjunctions to express time, place and cause (when, before, after, while, so, because)',
    'Use adverbs and prepositions to express time and cause',
    'Choose nouns and pronouns for clarity and cohesion',
    'Use inverted commas to punctuate direct speech',
  ],
  4: [
    'Use paragraphs with fronted adverbials (followed by a comma)',
    'Use expanded noun phrases to convey complicated information concisely',
    'Use appropriate choice of pronoun within and across sentences',
    'Use inverted commas and other punctuation for direct speech',
    'Use commas after fronted adverbials',
  ],
  5: [
    'Use relative clauses beginning with who, which, where, when, whose, that',
    'Use modal verbs to indicate degrees of possibility (might, could, should)',
    'Use brackets, dashes or commas to indicate parenthesis',
    'Use commas to clarify meaning or avoid ambiguity',
    'Link ideas across paragraphs using a wide range of cohesive devices',
  ],
  6: [
    'Use the passive voice to affect presentation of information',
    'Use semi-colons, colons or dashes to mark boundaries between clauses',
    'Use a colon to introduce a list',
    'Use hyphens to avoid ambiguity',
    'Use a wide range of devices to build cohesion across paragraphs',
    'Use modal verbs, adverbs and the subjunctive to convey possibility',
  ],
};

function getNCJudgement(yearGroup: number, highestLevelPassed: number | null): 'above' | 'at' | 'below' | 'not_assessed' {
  if (!highestLevelPassed) return 'not_assessed';
  const exp = NC_EXPECTATIONS[yearGroup];
  if (!exp) return 'not_assessed';
  if (highestLevelPassed > exp.max) return 'above';
  if (highestLevelPassed < exp.min) return 'below';
  return 'at';
}

function getPWPBandLabel(avgBand: number | null): string {
  if (!avgBand) return 'Not assessed';
  if (avgBand >= 3.5) return 'Mastery';
  if (avgBand >= 2.5) return 'Greater Depth';
  if (avgBand >= 1.5) return 'Expected';
  return 'Working Towards';
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const classId = resolvedParams.id;
  const format = new URL(request.url).searchParams.get('format');

  // Verify teacher auth via Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { cookie: request.headers.get('cookie') || '' } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const pool = getPool();

  try {
    // Class info
    const classRes = await pool.query(
      `SELECT c.id, c.name, c.year_group, c.class_code,
              p.display_name AS teacher_name, p.email AS teacher_email
       FROM classes c
       LEFT JOIN profiles p ON p.id = c.teacher_id
       WHERE c.id = $1 AND c.teacher_id = $2`,
      [classId, user.id]
    );
    if (classRes.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 });
    }
    const classData = classRes.rows[0];

    // Pupils
    const pupilsRes = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.year_group
       FROM pupils p
       JOIN class_members cm ON cm.pupil_id = p.id
       WHERE cm.class_id = $1
       ORDER BY p.last_name, p.first_name`,
      [classId]
    );
    const pupils = pupilsRes.rows;
    if (pupils.length === 0) {
      return NextResponse.json({ classData, pupils: [], reportData: [] });
    }
    const pupilIds = pupils.map((p: any) => p.id);

    // DWP: highest passed level per pupil
    const dwpRes = await pool.query(
      `SELECT wa.pupil_id,
              MAX(wl.level_number) FILTER (WHERE wa.passed = true) AS highest_passed,
              COUNT(*) FILTER (WHERE wa.status = 'assessed') AS attempts,
              COUNT(*) FILTER (WHERE wa.passed = true) AS passed_count,
              ROUND(AVG(wa.percentage) FILTER (WHERE wa.percentage IS NOT NULL))::int AS avg_pct
       FROM writing_attempts wa
       JOIN dwp_assignments da ON da.id = wa.dwp_assignment_id
       JOIN writing_levels wl ON wl.level_id = da.level_id
       WHERE da.class_id = $1 AND wa.pupil_id = ANY($2)
       GROUP BY wa.pupil_id`,
      [classId, pupilIds]
    );
    const dwpMap: Record<string, any> = {};
    for (const row of dwpRes.rows) dwpMap[row.pupil_id] = row;

    // DWP: highest level name
    const dwpLevelRes = await pool.query(
      `SELECT wl.level_number, wl.tier_number, wl.activity_name FROM writing_levels wl ORDER BY wl.level_number`
    );
    const levelMap: Record<number, any> = {};
    for (const row of dwpLevelRes.rows) levelMap[row.level_number] = row;

    // PWP: avg grammar_accuracy per pupil
    const pwpRes = await pool.query(
      `SELECT ps.pupil_id,
              COUNT(*) FILTER (WHERE ps.status IN ('submitted','reviewed')) AS submitted_count,
              ROUND(AVG(pa.grammar_accuracy)::numeric, 1) AS avg_grammar,
              ROUND(AVG(pa.structure_correctness)::numeric, 1) AS avg_structure,
              MAX(pact.level) AS highest_level
       FROM pwp_submissions ps
       JOIN pwp_assignments pa_assign ON pa_assign.id = ps.pwp_assignment_id
       JOIN progressive_activities pact ON pact.id = pa_assign.activity_id
       LEFT JOIN pwp_assessments pa ON pa.pwp_submission_id = ps.id
       WHERE pa_assign.class_id = $1 AND ps.pupil_id = ANY($2)
       GROUP BY ps.pupil_id`,
      [classId, pupilIds]
    );
    const pwpMap: Record<string, any> = {};
    for (const row of pwpRes.rows) pwpMap[row.pupil_id] = row;

    // Writing assignments: submissions per pupil
    const assignRes = await pool.query(
      `SELECT s.pupil_id,
              COUNT(*) AS total_assignments,
              COUNT(*) FILTER (WHERE s.status IN ('submitted','reviewed')) AS submitted,
              COUNT(*) FILTER (WHERE s.status = 'reviewed') AS reviewed
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       WHERE a.class_id = $1 AND s.pupil_id = ANY($2)
       GROUP BY s.pupil_id`,
      [classId, pupilIds]
    );
    const assignMap: Record<string, any> = {};
    for (const row of assignRes.rows) assignMap[row.pupil_id] = row;

    // Assemble per-pupil report data
    const reportData = pupils.map((pupil: any) => {
      const yearGroup = pupil.year_group || classData.year_group || 4;
      const dwp = dwpMap[pupil.id] || null;
      const pwp = pwpMap[pupil.id] || null;
      const writing = assignMap[pupil.id] || null;
      const highestPassed = dwp?.highest_passed ? parseInt(dwp.highest_passed) : null;
      const judgement = getNCJudgement(yearGroup, highestPassed);
      const exp = NC_EXPECTATIONS[yearGroup];
      const levelInfo = highestPassed ? levelMap[highestPassed] : null;
      const avgGrammar = pwp?.avg_grammar ? parseFloat(pwp.avg_grammar) : null;

      return {
        pupil: {
          id: pupil.id,
          name: `${pupil.first_name} ${pupil.last_name || ''}`.trim(),
          first_name: pupil.first_name,
          year_group: yearGroup,
        },
        judgement,
        ncExpectation: exp || null,
        ncObjectives: NC_OBJECTIVES[yearGroup] || [],
        dwp: {
          highestLevelPassed: highestPassed,
          levelInfo,
          attempts: dwp ? parseInt(dwp.attempts) : 0,
          passedCount: dwp ? parseInt(dwp.passed_count) : 0,
          avgPct: dwp?.avg_pct ? parseInt(dwp.avg_pct) : null,
        },
        pwp: {
          submittedCount: pwp ? parseInt(pwp.submitted_count) : 0,
          avgGrammar,
          avgStructure: pwp?.avg_structure ? parseFloat(pwp.avg_structure) : null,
          highestLevel: pwp?.highest_level ? parseInt(pwp.highest_level) : null,
          bandLabel: getPWPBandLabel(avgGrammar),
        },
        writing: {
          submitted: writing ? parseInt(writing.submitted) : 0,
          reviewed: writing ? parseInt(writing.reviewed) : 0,
          total: writing ? parseInt(writing.total_assignments) : 0,
        },
      };
    });

    if (format === 'docx') {
      return generateWordReport(classData, reportData, request);
    }

    return NextResponse.json({ classData, reportData });
  } catch (error: any) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function generateWordReport(classData: any, reportData: any[], request: NextRequest) {
  try {
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
      ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
    } = await import('docx');

    const BLUE = '2E5AFF';
    const LIGHT_BLUE = 'E6F1FB';
    const GREEN = '1D9E75';
    const LIGHT_GREEN = 'E1F5EE';
    const RED = 'E24B4A';
    const LIGHT_RED = 'FCEBEB';
    const AMBER = 'B97A0A';
    const LIGHT_AMBER = 'FEF3C7';
    const GRAY = '6B7280';
    const LIGHT_GRAY = 'F3F4F6';
    const BORDER = { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' };
    const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

    function judgementColor(j: string) {
      if (j === 'above') return GREEN;
      if (j === 'at') return BLUE;
      if (j === 'below') return RED;
      return GRAY;
    }
    function judgementBg(j: string) {
      if (j === 'above') return LIGHT_GREEN;
      if (j === 'at') return LIGHT_BLUE;
      if (j === 'below') return LIGHT_RED;
      return LIGHT_GRAY;
    }
    function judgementLabel(j: string) {
      if (j === 'above') return 'Above expectation';
      if (j === 'at') return 'Working at expectation';
      if (j === 'below') return 'Below expectation';
      return 'Not assessed';
    }

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const termLabel = (() => {
      const m = new Date().getMonth();
      if (m >= 8) return 'Autumn Term';
      if (m >= 3) return 'Summer Term';
      return 'Spring Term';
    })();

    const cell = (text: string, width: number, opts: {
      bold?: boolean; color?: string; bg?: string; center?: boolean; size?: number;
    } = {}) => new TableCell({
      borders: BORDERS,
      width: { size: width, type: WidthType.DXA },
      shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [new TextRun({
          text,
          bold: opts.bold || false,
          color: opts.color || '1F2937',
          size: opts.size || 20,
          font: 'Arial',
        })],
      })],
    });

    // ── Cover / Class Summary page ─────────────────────────────────────
    const summaryChildren: any[] = [
      // Title block
      new Paragraph({
        children: [new TextRun({ text: 'Writing Progress Report', bold: true, size: 52, color: BLUE, font: 'Arial' })],
        spacing: { before: 0, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `${classData.name}  ·  Year ${classData.year_group}`, size: 32, color: GRAY, font: 'Arial' })],
        spacing: { before: 0, after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Teacher: ${classData.teacher_name || classData.teacher_email || 'Unknown'}`, size: 22, color: GRAY, font: 'Arial' })],
      }),
      new Paragraph({
        children: [new TextRun({ text: `${termLabel} ${new Date().getFullYear()}  ·  Generated ${today}`, size: 22, color: GRAY, font: 'Arial' })],
        spacing: { before: 0, after: 400 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 8 } },
      }),

      // NC framework note
      new Paragraph({
        children: [new TextRun({ text: 'National Curriculum Alignment', bold: true, size: 24, font: 'Arial', color: '1F2937' })],
        spacing: { before: 300, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'Pupil levels are derived from WriFe Daily Writing Practice (DWP) and Progressive Writing Practice (PWP) assessments, mapped to NC KS1 and KS2 year group expectations. Judgements are: Below expectation, Working at expectation, or Above expectation.',
          size: 20, color: GRAY, font: 'Arial',
        })],
        spacing: { before: 0, after: 240 },
      }),

      // DWP mapping table
      new Paragraph({ children: [new TextRun({ text: 'DWP level to year group mapping', bold: true, size: 22, font: 'Arial', color: '1F2937' })], spacing: { before: 0, after: 80 } }),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [1500, 1500, 6026],
        rows: [
          new TableRow({ children: [
            cell('Year group', 1500, { bold: true, bg: LIGHT_BLUE, center: true }),
            cell('DWP levels', 1500, { bold: true, bg: LIGHT_BLUE, center: true }),
            cell('NC focus area', 6026, { bold: true, bg: LIGHT_BLUE }),
          ]}),
          ...Object.entries(NC_EXPECTATIONS).map(([yr, exp]) => new TableRow({ children: [
            cell(`Year ${yr}`, 1500, { center: true }),
            cell(`L${exp.min}–${exp.max}`, 1500, { center: true }),
            cell(exp.label, 6026),
          ]})),
        ],
      }),

      // Class summary table
      new Paragraph({ children: [new TextRun({ text: 'Class summary', bold: true, size: 24, font: 'Arial', color: '1F2937' })], spacing: { before: 400, after: 100 } }),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2500, 900, 1600, 1500, 1200, 1326],
        rows: [
          new TableRow({ children: [
            cell('Pupil', 2500, { bold: true, bg: LIGHT_BLUE }),
            cell('Year', 900, { bold: true, bg: LIGHT_BLUE, center: true }),
            cell('DWP highest level', 1600, { bold: true, bg: LIGHT_BLUE, center: true }),
            cell('PWP grammar band', 1500, { bold: true, bg: LIGHT_BLUE, center: true }),
            cell('Writing done', 1200, { bold: true, bg: LIGHT_BLUE, center: true }),
            cell('Judgement', 1326, { bold: true, bg: LIGHT_BLUE, center: true }),
          ]}),
          ...reportData.map((rd: any) => new TableRow({ children: [
            cell(rd.pupil.name, 2500),
            cell(`Y${rd.pupil.year_group}`, 900, { center: true }),
            cell(rd.dwp.highestLevelPassed ? `Level ${rd.dwp.highestLevelPassed}` : '–', 1600, { center: true }),
            cell(rd.pwp.bandLabel, 1500, { center: true }),
            cell(rd.writing.submitted > 0 ? `${rd.writing.submitted}/${rd.writing.total}` : '–', 1200, { center: true }),
            cell(judgementLabel(rd.judgement), 1326, { bold: true, color: judgementColor(rd.judgement), bg: judgementBg(rd.judgement), center: true }),
          ]})),
        ],
      }),
    ];

    // ── Individual pupil pages ─────────────────────────────────────────
    const individualSections: any[] = [];

    for (const rd of reportData) {
      const j = rd.judgement;
      const yr = rd.pupil.year_group;
      const exp = rd.ncExpectation;

      individualSections.push(
        new Paragraph({ children: [new PageBreak()] }),

        new Paragraph({
          children: [new TextRun({ text: rd.pupil.name, bold: true, size: 44, color: '1F2937', font: 'Arial' })],
          spacing: { before: 0, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Year ${yr}  ·  `, size: 24, color: GRAY, font: 'Arial' }),
            new TextRun({ text: judgementLabel(j), bold: true, size: 24, color: judgementColor(j), font: 'Arial' }),
          ],
          spacing: { before: 0, after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 6 } },
        }),

        // Three pillars
        new Paragraph({ children: [new TextRun({ text: 'Assessment summary', bold: true, size: 24, font: 'Arial', color: '1F2937' })], spacing: { before: 200, after: 100 } }),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [3008, 3009, 3009],
          rows: [
            new TableRow({ children: [
              cell('Daily Writing (DWP)', 3008, { bold: true, bg: LIGHT_BLUE }),
              cell('Sentence Practice (PWP)', 3009, { bold: true, bg: 'F3E8FF' }),
              cell('Written Assignments', 3009, { bold: true, bg: LIGHT_GREEN }),
            ]}),
            new TableRow({ children: [
              cell(
                rd.dwp.highestLevelPassed
                  ? `Highest level passed: ${rd.dwp.highestLevelPassed}\n${rd.dwp.levelInfo?.activity_name || ''}\nAttempts: ${rd.dwp.attempts} · Passed: ${rd.dwp.passedCount}${rd.dwp.avgPct ? ` · Avg: ${rd.dwp.avgPct}%` : ''}`
                  : 'No levels attempted yet',
                3008, { size: 19 }
              ),
              cell(
                rd.pwp.submittedCount > 0
                  ? `Submitted: ${rd.pwp.submittedCount}\nGrammar band: ${rd.pwp.bandLabel}${rd.pwp.highestLevel ? `\nHighest level: ${rd.pwp.highestLevel}` : ''}`
                  : 'No activities submitted yet',
                3009, { size: 19 }
              ),
              cell(
                rd.writing.total > 0
                  ? `${rd.writing.submitted} of ${rd.writing.total} submitted\n${rd.writing.reviewed} reviewed by teacher`
                  : 'No assignments set',
                3009, { size: 19 }
              ),
            ]}),
          ],
        }),

        // NC expectation for their year
        new Paragraph({ children: [new TextRun({ text: `Year ${yr} NC expectations`, bold: true, size: 24, font: 'Arial', color: '1F2937' })], spacing: { before: 300, after: 100 } }),
        exp ? new Paragraph({
          children: [new TextRun({ text: `Working at expectation = DWP Levels ${exp.min}–${exp.max} (${exp.label})`, size: 20, color: GRAY, font: 'Arial', italics: true })],
          spacing: { before: 0, after: 120 },
        }) : new Paragraph({ children: [] }),

        // NC objectives checklist
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [700, 8326],
          rows: [
            new TableRow({ children: [
              cell('', 700, { bold: true, bg: LIGHT_BLUE }),
              cell('NC writing objective for this year group', 8326, { bold: true, bg: LIGHT_BLUE }),
            ]}),
            ...(rd.ncObjectives as string[]).map((obj: string) => new TableRow({ children: [
              cell('[ ]', 700, { center: true, color: GRAY }),
              cell(obj, 8326, { size: 20 }),
            ]})),
          ],
        }),

        // Teacher notes
        new Paragraph({ children: [new TextRun({ text: 'Teacher notes', bold: true, size: 24, font: 'Arial', color: '1F2937' })], spacing: { before: 300, after: 80 } }),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [9026],
          rows: [
            new TableRow({ children: [new TableCell({
              borders: BORDERS,
              width: { size: 9026, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { before: 200 } }),
                new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { before: 200 } }),
                new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { before: 200 } }),
                new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { before: 200 } }),
              ],
            })] }),
          ],
        }),

        new Paragraph({ children: [new TextRun({ text: 'Next steps / targets', bold: true, size: 24, font: 'Arial', color: '1F2937' })], spacing: { before: 200, after: 80 } }),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [9026],
          rows: [
            new TableRow({ children: [new TableCell({
              borders: BORDERS,
              width: { size: 9026, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { before: 200 } }),
                new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { before: 200 } }),
                new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { before: 200 } }),
              ],
            })] }),
          ],
        }),
      );
    }

    const doc = new Document({
      styles: {
        default: { document: { run: { font: 'Arial', size: 22 } } },
      },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [
                new TextRun({ text: 'WriFe  ·  ', bold: true, color: BLUE, size: 18, font: 'Arial' }),
                new TextRun({ text: `${classData.name}  ·  Year ${classData.year_group}  ·  Writing Progress Report`, size: 18, color: GRAY, font: 'Arial' }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 4 } },
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'WriFe Education  ·  wrife.co.uk  ·  Page ', size: 18, color: GRAY, font: 'Arial' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GRAY, font: 'Arial' }),
                new TextRun({ text: ' of ', size: 18, color: GRAY, font: 'Arial' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: GRAY, font: 'Arial' }),
              ],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 4 } },
            })],
          }),
        },
        children: [...summaryChildren, ...individualSections],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const className = classData.name.replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `WriFe-Progress-Report-${className}-${new Date().getFullYear()}.docx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('Word generation error:', err);
    return NextResponse.json({ error: 'Failed to generate Word document' }, { status: 500 });
  }
}
