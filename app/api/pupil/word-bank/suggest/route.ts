import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { generateCompletion, parseJSONResponse } from '@/lib/llm-provider';
import { validatePupilSession } from '@/lib/pupil-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pupilId, category, storyType } = body;

    if (!pupilId) {
      return NextResponse.json({ error: 'Missing pupilId' }, { status: 400 });
    }

    const session = await validatePupilSession(pupilId);
    if (!session.valid) {
      return NextResponse.json({ error: 'Invalid or expired pupil session' }, { status: 401 });
    }

    if (!category || !storyType) {
      return NextResponse.json({ error: 'Category and storyType are required' }, { status: 400 });
    }

    const validCategories = ['people', 'places', 'things'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Category must be people, places, or things' }, { status: 400 });
    }

    const validStoryTypes = ['happy', 'sad', 'funny'];
    if (!validStoryTypes.includes(storyType)) {
      return NextResponse.json({ error: 'Story type must be happy, sad, or funny' }, { status: 400 });
    }

    const pool = getPool();
    const existingResult = await pool.query(
      'SELECT word FROM pupil_word_banks WHERE pupil_id = $1 AND category = $2',
      [pupilId, category]
    );
    const existingWords = existingResult.rows.map((r: { word: string }) => r.word);

    const categoryDescriptions: Record<string, string> = {
      people: 'character names or types of people (e.g., a brave knight, a kind grandmother, a cheeky monkey)',
      places: 'settings or locations (e.g., a magical forest, a cosy kitchen, a bustling market)',
      things: 'objects or items (e.g., a golden key, a mysterious letter, a wobbly bicycle)',
    };

    const response = await generateCompletion({
      messages: [
        {
          role: 'system',
          content: `You are a helpful creative writing assistant for primary school children aged 6-10. Suggest age-appropriate, imaginative words that children would enjoy using in their stories. Always respond in valid JSON format.`,
        },
        {
          role: 'user',
          content: `Suggest exactly 5 ${categoryDescriptions[category]} that would fit well in a ${storyType} story for a primary school child.

${existingWords.length > 0 ? `The child already has these words in their ${category} bank, so do NOT suggest any of these: ${existingWords.join(', ')}` : ''}

Respond with a JSON object in this exact format:
{"suggestions": ["word1", "word2", "word3", "word4", "word5"]}

Each suggestion should be a short phrase (1-3 words), age-appropriate, and creative.`,
        },
      ],
      temperature: 0.8,
      maxTokens: 300,
      jsonMode: true,
    });

    const parsed = parseJSONResponse<{ suggestions: string[] }>(response.content, { suggestions: [] });
    const suggestions = (parsed.suggestions || []).slice(0, 5);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating word suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
