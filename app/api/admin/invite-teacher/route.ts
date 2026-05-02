import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, supabaseAdmin, getSupabaseAdmin, AuthError } from '@/lib/admin-auth';
import { Resend } from 'resend';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://wrife.co.uk';
}

function buildWelcomeEmailHtml(name: string, email: string, setupLink: string, loginUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7ff;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7ff;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#2E5AFF;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:28px;font-weight:900;color:#ffffff;font-family:Arial,sans-serif;">WriFe</span>
                  <span style="display:block;font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;">Writing for Everyone</span>
                </td>
                <td align="right"><span style="font-size:28px;">📝</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#1a1a2e;">You've been invited to WriFe!</h1>
            <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.6;">
              Hi ${name || 'there'},
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.6;">
              You have been added as a teacher on <strong>WriFe</strong>, the writing education platform for primary schools. Your account has been created with the email address:
            </p>
            <p style="margin:0 0 28px;font-size:15px;font-weight:700;color:#2E5AFF;">${email}</p>

            <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.6;">
              Click the button below to set your password and activate your account. This link is valid for <strong>24 hours</strong>.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="border-radius:50px;background:#2E5AFF;">
                  <a href="${setupLink}" target="_blank"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:50px;">
                    Set Up My Account
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#888888;">
              If the button doesn't work, paste this link into your browser:
            </p>
            <p style="margin:0 0 28px;font-size:12px;color:#2E5AFF;word-break:break-all;">
              <a href="${setupLink}" style="color:#2E5AFF;">${setupLink}</a>
            </p>

            <hr style="border:none;border-top:1px solid #eaeaea;margin:0 0 24px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#333333;">Signing in after setup</p>
            <p style="margin:0 0 16px;font-size:13px;color:#888888;line-height:1.6;">
              Once you've set your password, you can sign in at any time from:<br>
              <a href="${loginUrl}" style="color:#2E5AFF;">${loginUrl}</a>
            </p>
            <hr style="border:none;border-top:1px solid #eaeaea;margin:0 0 24px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#333333;">What is WriFe?</p>
            <p style="margin:0;font-size:13px;color:#888888;line-height:1.6;">
              WriFe is a structured 67-lesson writing curriculum for primary schools, with AI-powered writing feedback, pupil progress tracking, and a gamified pupil experience.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaaaaa;">
              WriFe · Writing Education Platform · 
              <a href="https://wrife.co.uk" style="color:#2E5AFF;text-decoration:none;">wrife.co.uk</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();

    const { email, firstName, lastName, schoolId } = await request.json();

    if (!email || !schoolId) {
      return NextResponse.json(
        { error: 'Email and school ID are required' },
        { status: 400 }
      );
    }

    if (admin.role === 'school_admin' && schoolId !== admin.schoolId) {
      return NextResponse.json({ error: 'Forbidden: You can only add teachers to your own school' }, { status: 403 });
    }

    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, first_name')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: `Failed to check existing user: ${checkError.message}` }, { status: 500 });
    }

    if (existingUser) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          school_id: schoolId,
          role: 'teacher',
          first_name: firstName || null,
          last_name: lastName || null,
        })
        .eq('id', existingUser.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      const supabaseAdminClient = getSupabaseAdmin();
      const redirectTo = `${getBaseUrl()}/update-password`;

      const { data: linkData, error: linkError } = await supabaseAdminClient.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });

      const loginUrl = `${getBaseUrl()}/login`;
      let emailSent = false;
      let fallbackLink: string | null = null;

      if (!linkError && linkData?.properties?.action_link) {
        fallbackLink = linkData.properties.action_link;
        const resend = new Resend(process.env.RESEND_API_KEY);
        const userName = firstName || existingUser.display_name || existingUser.first_name || 'there';
        const { error: emailError } = await resend.emails.send({
          from: 'WriFe <onboarding@resend.dev>',
          to: email,
          subject: "You've been added to a school on WriFe",
          html: buildWelcomeEmailHtml(userName, email, linkData.properties.action_link, loginUrl),
        });
        emailSent = !emailError;
        if (emailError) console.error('[invite-teacher] Resend error (existing user):', emailError);
      } else {
        console.error('[invite-teacher] generateLink error (existing user):', linkError);
      }

      return NextResponse.json({
        success: true,
        message: 'Teacher added to school',
        emailSent,
        ...(!emailSent && fallbackLink ? { fallbackLink } : {}),
      });
    }

    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-4).toUpperCase();
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: [firstName, lastName].filter(Boolean).join(' ') || null,
        role: 'teacher',
        school_id: schoolId,
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const supabaseAdminClient = getSupabaseAdmin();
    const redirectTo = `${getBaseUrl()}/update-password`;
    const loginUrl = `${getBaseUrl()}/login`;

    const { data: linkData, error: linkError } = await supabaseAdminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    let emailSent = false;
    let fallbackLink: string | null = null;

    if (!linkError && linkData?.properties?.action_link) {
      fallbackLink = linkData.properties.action_link;
      const resend = new Resend(process.env.RESEND_API_KEY);
      const userName = firstName || 'there';
      const { error: emailError } = await resend.emails.send({
        from: 'WriFe <onboarding@resend.dev>',
        to: email,
        subject: "You've been invited to WriFe",
        html: buildWelcomeEmailHtml(userName, email, linkData.properties.action_link, loginUrl),
      });
      emailSent = !emailError;
      if (emailError) console.error('[invite-teacher] Resend error (new user):', emailError);
    } else {
      console.error('[invite-teacher] generateLink error (new user):', linkError);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Teacher invited successfully — a welcome email has been sent'
        : 'Teacher account created. Note: the welcome email could not be sent.',
      emailSent,
      ...(!emailSent && fallbackLink ? { fallbackLink } : {}),
    });
  } catch (error: unknown) {
    console.error('[invite-teacher] Error:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const msg = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
