import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/demo-token?app=pwp|dwp|ip|resources
 *
 * Server-side only. Uses the service-role key to generate a Supabase magic
 * link for the shared demo@wrife.co.uk account. The action_link is returned
 * as iframeSrc — when loaded in the overlay iframe it verifies the token and
 * redirects to the sub-app with access_token/refresh_token in the hash
 * (Route A SSO pattern). Each call produces a fresh independent token so
 * concurrent visitors don't invalidate each other's sessions.
 */

const DEMO_EMAIL = 'demo@wrife.co.uk';

// Sub-app landing URLs — the magic link redirects here after auth verification.
// Resources uses /auth/hub because its SSO entry handler lives there.
const APP_URLS: Record<string, string> = {
  pwp:       'https://pwp-studio.wrife.co.uk/dashboard',
  dwp:       'https://dailywrite.wrife.co.uk/dashboard',
  ip:        'https://practice.wrife.co.uk',
  resources: 'https://resources.wrife.co.uk/auth/hub',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const app = searchParams.get('app') ?? 'pwp';

  if (!APP_URLS[app]) {
    return NextResponse.json({ error: 'Unknown app' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Generate a fresh magic link for the demo account.
  // redirectTo must be listed in Supabase Auth → URL Configuration → Redirect URLs.
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: DEMO_EMAIL,
    options: { redirectTo: APP_URLS[app] },
  });

  if (error || !data?.properties?.action_link) {
    console.error('[demo-token] Failed to generate link:', error);
    return NextResponse.json({ error: 'Could not generate demo session' }, { status: 500 });
  }

  return NextResponse.json({
    appUrl: APP_URLS[app],
    // The iframe loads this Supabase auth URL; after token verification it
    // redirects to appUrl with #access_token=…&refresh_token=…&type=magiclink
    iframeSrc: data.properties.action_link,
  });
}
