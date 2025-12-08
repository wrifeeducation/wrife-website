import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // For now, let's disable middleware and handle auth client-side
  return res;
}

export const config = {
  matcher: ['/lesson/:path*', '/dashboard/:path*'],
};
