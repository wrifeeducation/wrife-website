import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { yearGroup, question, activityType, options } = body;

    const prompt = `A Year ${yearGroup || 4} pupil (age ${yearGroup <= 3 ? '6-7' : '8-10'}) is stuck on this activity:

Question: ${question}
Type: ${activityType || 'multiple_choice'}
${options ? `Options: ${JSON.stringify(options)}` : ''}

Provide a helpful hint (NOT the answer) that:
1. Guides their thinking
2. Uses simple, child-friendly language
3. Is encouraging
4. Is 1-2 sentences only

Return ONLY JSON: {"hint": "your hint here"}`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 128,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ hint: parsed.hint });
      }
    } catch (aiError) {
      console.error('AI hint error:', aiError);
    }

    // Fallback hints by activity type
    const fallbackHints: Record<string, string> = {
      multiple_choice: 'Read each option carefully. Think about what type of word the question is asking for.',
      fill_blank: 'Think about what type of word fits in the gap. Is it a doing word, a naming word, or a describing word?',
      sorting: 'Read each word and ask: Is this a person/place/thing (noun), a doing word (verb), or a describing word (adjective)?',
      matching: 'Look at each word on the left. Say the word in a sentence to help you decide what type of word it is.',
      drag_drop: 'Try putting the words in order. Does the sentence make sense when you read it out loud?',
    };

    return NextResponse.json({
      hint: fallbackHints[activityType] || 'Think carefully about each word. What job does it do in the sentence?',
    });
  } catch (error) {
    console.error('Hint error:', error);
    return NextResponse.json({ error: 'Failed to get hint' }, { status: 500 });
  }
}
