import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { session_id, stats } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    console.log('PWP Session completed:', { session_id, stats });

    return NextResponse.json({
      success: true,
      session_id,
      message: 'Session completed successfully'
    });

  } catch (error) {
    console.error('Complete session error:', error);
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
  }
}
