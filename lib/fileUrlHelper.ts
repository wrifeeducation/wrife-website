export function isHtmlFile(fileUrl: string, fileType?: string): boolean {
  const url = fileUrl.toLowerCase();
  return url.endsWith('.html') || 
         url.endsWith('.htm') || 
         fileType === 'interactive_practice';
}

export function getProxiedHtmlUrl(fileUrl: string): string {
  return `/api/fetch-html?url=${encodeURIComponent(fileUrl)}`;
}

export function shouldUseProxy(fileUrl: string, fileType?: string): boolean {
  return isHtmlFile(fileUrl, fileType);
}
