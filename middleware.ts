import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  return await updateSession(req);
}

export const config = {
  matcher: [
    '/lesson/:path*', 
    '/dashboard/:path*', 
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
