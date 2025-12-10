import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAINS = [
  'drive.google.com',
  'docs.google.com',
  'supabase.co',
  'supabase.com',
];

function isAllowedDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(domain => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

function extractGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

async function fetchGoogleDriveContent(fileId: string): Promise<string | null> {
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  try {
    const response = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return null;
    }

    let content = await response.text();
    
    const isGoogleWarningPage = content.includes('download_warning') || 
      content.includes('virus scan') || 
      content.includes('Google Drive') ||
      content.includes('uc?export=download');

    if (isGoogleWarningPage) {
      const confirmMatch = content.match(/confirm=([a-zA-Z0-9_-]+)/);
      const idMatch = content.match(/id=([a-zA-Z0-9_-]+)/);
      const token = confirmMatch ? confirmMatch[1] : 't';
      const id = idMatch ? idMatch[1] : fileId;
      
      const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${token}&id=${id}`;
      
      const confirmResponse = await fetch(confirmUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'follow',
      });

      if (confirmResponse.ok) {
        content = await confirmResponse.text();
      }
    }

    const isActualHtml = (content.includes('<!DOCTYPE') || content.includes('<html') || content.includes('<body')) &&
      !content.includes('google.com/drive') && 
      !content.includes('accounts.google.com') &&
      !content.includes('download_warning');

    if (isActualHtml) {
      return content;
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Google Drive:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return new NextResponse(
      '<html><body><p style="font-family: sans-serif; padding: 20px;">URL parameter is required</p></body></html>',
      { headers: { 'Content-Type': 'text/html' }, status: 400 }
    );
  }

  if (!isAllowedDomain(url)) {
    return new NextResponse(
      '<html><body><p style="font-family: sans-serif; padding: 20px;">This URL is not supported. Please use Google Drive or Supabase Storage.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' }, status: 403 }
    );
  }

  try {
    if (url.includes('drive.google.com')) {
      const fileId = extractGoogleDriveFileId(url);
      if (!fileId) {
        return new NextResponse(
          '<html><body><p style="font-family: sans-serif; padding: 20px;">Could not extract file ID from Google Drive URL</p></body></html>',
          { headers: { 'Content-Type': 'text/html' }, status: 400 }
        );
      }

      const content = await fetchGoogleDriveContent(fileId);
      
      if (content) {
        return new NextResponse(content, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Frame-Options': 'SAMEORIGIN',
          },
        });
      } else {
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        return new NextResponse(
          `<html>
            <head>
              <style>
                body { font-family: sans-serif; padding: 20px; margin: 0; }
                .message { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
                .message h3 { margin: 0 0 8px 0; color: #856404; }
                .message p { margin: 0; color: #856404; }
                .iframe-container { width: 100%; height: calc(100vh - 120px); }
                iframe { width: 100%; height: 100%; border: 1px solid #ddd; border-radius: 8px; }
              </style>
            </head>
            <body>
              <div class="message">
                <h3>Limited Preview</h3>
                <p>This activity is stored on Google Drive. You can view it below, but interactive features may be limited.</p>
              </div>
              <div class="iframe-container">
                <iframe src="${previewUrl}" allowfullscreen></iframe>
              </div>
            </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    } else {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        return new NextResponse(
          `<html><body><p style="font-family: sans-serif; padding: 20px;">Could not load content (${response.status})</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' }, status: response.status }
        );
      }

      const content = await response.text();
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching HTML:', error);
    return new NextResponse(
      '<html><body><p style="font-family: sans-serif; padding: 20px;">Failed to load activity. Please try again later.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    );
  }
}
