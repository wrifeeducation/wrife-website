import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    const fileId = url.match(/\/d\/([^\/]+)/)?.[1];
    if (!fileId) {
      return NextResponse.json({ error: 'Invalid Google Drive URL' }, { status: 400 });
    }

    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    const response = await fetch(directUrl);
    const html = await response.text();

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error fetching HTML:', error);
    return NextResponse.json({ error: 'Failed to fetch HTML' }, { status: 500 });
  }
}
