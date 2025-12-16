import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function createSupabaseServerClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
          }
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(requestUrl.origin);
}

export async function POST(request: NextRequest) {
  try {
    const { event, session } = await request.json();
    
    console.log('[Auth Callback] Event:', event);
    
    const response = NextResponse.json({ success: true });

    if (event === 'SIGNED_IN' && session) {
      response.cookies.set('sb-access-token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      response.cookies.set('sb-refresh-token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      console.log('[Auth Callback] Session cookies set successfully');
      return response;
    }

    if (event === 'SIGNED_OUT') {
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      console.log('[Auth Callback] Session cookies cleared');
      return response;
    }

    return response;
  } catch (error) {
    console.error('[Auth Callback] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
