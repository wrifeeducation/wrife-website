/**
 * presentationUtils.ts
 * Transforms presentation file URLs into embeddable and fullscreen-presentable URLs.
 * Handles three source types:
 *  1. Google Drive presentation links  (docs.google.com/presentation/d/FILE_ID/...)
 *  2. Supabase Storage .pptx files     (*.supabase.co/storage/v1/object/public/...)
 *  3. Direct .pptx URLs (CDN / other)  (anything ending in .pptx)
 */

export type PresentationUrlType = 'google_drive' | 'pptx_office_online' | 'unknown';

export interface PresentationUrls {
  type: PresentationUrlType;
  /** URL suitable for embedding in an iframe */
  embedUrl: string;
  /** URL to open a fullscreen / present view */
  presentUrl: string;
  /** Original source URL */
  sourceUrl: string;
}

/** Extract the Google Drive file/presentation ID from any Drive URL */
function extractGoogleDriveId(url: string): string | null {
  // presentation/d/FILE_ID/...
  const presMatch = url.match(/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presMatch) return presMatch[1];
  // file/d/FILE_ID/...
  const fileMatch = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  // ?id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return null;
}

/** Returns true if the URL points to a Google Slides / Drive presentation */
export function isGoogleDrivePresentation(url: string): boolean {
  return url.includes('docs.google.com/presentation') ||
    url.includes('drive.google.com/file') ||
    url.includes('drive.google.com/open');
}

/** Returns true if the URL is a .pptx file (Supabase storage or CDN) */
export function isPptxFile(url: string): boolean {
  return url.toLowerCase().includes('.pptx');
}

/**
 * Resolve a presentation URL (from the lesson_files table) into usable embed + present URLs.
 */
export function resolvePresentationUrls(fileUrl: string): PresentationUrls {
  const url = fileUrl.trim();

  // ── Google Drive / Slides ──────────────────────────────────────────────────
  if (isGoogleDrivePresentation(url)) {
    const fileId = extractGoogleDriveId(url);
    if (fileId) {
      return {
        type: 'google_drive',
        sourceUrl: url,
        // Embed format (works in iframes, no login required for shared files)
        embedUrl: `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=60000`,
        // Present / full-screen format
        presentUrl: `https://docs.google.com/presentation/d/${fileId}/present`,
      };
    }
  }

  // ── .pptx file (Supabase storage or direct link) ──────────────────────────
  if (isPptxFile(url)) {
    const encodedUrl = encodeURIComponent(url);
    return {
      type: 'pptx_office_online',
      sourceUrl: url,
      // Microsoft Office Online viewer – free, no auth required for public files
      embedUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`,
      presentUrl: `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`,
    };
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return {
    type: 'unknown',
    sourceUrl: url,
    embedUrl: url,
    presentUrl: url,
  };
}

/**
 * Pick the best presentation file from a list of lesson files.
 * Prefers file_type === 'presentation'; falls back to 'pptx'.
 */
export function getPrimaryPresentation(files: { file_type: string; file_url: string; file_name: string }[]) {
  return (
    files.find(f => f.file_type === 'presentation') ||
    files.find(f => f.file_type === 'pptx') ||
    null
  );
}
