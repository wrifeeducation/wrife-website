import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { yearGroup, lessonNumber, wordBank, subjectsUsedThisWeek, storyType } = body;

    const prompt = `This Year ${yearGroup || 4} pupil is on Lesson ${lessonNumber || 10}, writing a ${storyType || 'happy'} story.

Their personal word bank:
- People: ${JSON.stringify(wordBank?.people || [])}
- Places: ${JSON.stringify(wordBank?.places || [])}
- Things: ${JSON.stringify(wordBank?.things || [])}

Previously used subjects this week: ${JSON.stringify(subjectsUsedThisWeek || [])}

Suggest 3 new subjects they could write about today that:
1. Come from their word bank or are similar
2. Haven't been used this week
3. Fit their story type (${storyType || 'happy'})
4. Are age-appropriate for a ${yearGroup <= 3 ? '6-7' : '8-10'} year old

Return ONLY JSON: {"subjects": ["subject1", "subject2", "subject3"]}`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ subjects: parsed.subjects || [] });
      }
    } catch (aiError) {
      console.error('AI suggestion error:', aiError);
    }

    // Fallback suggestions
    const allWords = [
      ...(wordBank?.people || ['my friend', 'my teacher']),
      ...(wordBank?.things || ['a puppy', 'a robot']),
      ...(wordBank?.places || ['the park']),
    ];

    const unused = allWords.filter(
      (w) => !(subjectsUsedThisWeek || []).includes(w)
    );
    const subjects = unused.length >= 3
      ? unused.slice(0, 3)
      : [...unused, 'a magical cat', 'the brave knight', 'a friendly dragon'].slice(0, 3);

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Subject suggestion error:', error);
    return NextResponse.json({ error: 'Failed to suggest subjects' }, { status: 500 });
  }
}
