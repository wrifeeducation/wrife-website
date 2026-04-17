import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, getSupabaseAdmin, AuthError } from '@/lib/admin-auth';
import { getPool } from '@/lib/db';
import { Resend } from 'resend';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://wrife.co.uk';
}

function buildResetEmailHtml(name: string, resetLink: string, isInvite = false): string {
  const greeting = isInvite
    ? `You have been invited to join WriFe, the writing education platform.`
    : `An administrator has initiated a password reset for your WriFe account.`;
  const buttonLabel = isInvite ? 'Set Up My Account' : 'Reset My Password';
  const headingText = isInvite ? 'Welcome to WriFe' : 'Password Reset';

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
                <td align="right">
                  <span style="font-size:28px;">📝</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">${headingText}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
              Hi ${name || 'there'},
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.6;">
              ${greeting} Click the button below to ${isInvite ? 'set up your password and access your account' : 'choose a new password'}. This link is valid for <strong>1 hour</strong>.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="border-radius:50px;background:#2E5AFF;">
                  <a href="${resetLink}" target="_blank"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:50px;">
                    ${buttonLabel}
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#888888;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin:0 0 28px;font-size:12px;color:#2E5AFF;word-break:break-all;">
              <a href="${resetLink}" style="color:#2E5AFF;">${resetLink}</a>
            </p>

            <hr style="border:none;border-top:1px solid #eaeaea;margin:0 0 24px;">
            <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;">
              If you did not request this, you can safely ignore this email. Your account password will remain unchanged.
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = getPool();
    const result = await db.query(
      `SELECT id, email, display_name, first_name, role FROM profiles WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    if (!user.email) {
      return NextResponse.json({ error: 'This user has no email address on record' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const isAdminRole = user.role === 'admin' || user.role === 'school_admin';
    const resetPath = isAdminRole ? '/admin/update-password' : '/update-password';
    const redirectTo = `${getBaseUrl()}${resetPath}`;

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: user.email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[send-password-reset] generateLink error:', linkError);
      return NextResponse.json(
        { error: linkError?.message || 'Failed to generate reset link' },
        { status: 500 }
      );
    }

    const resetLink = linkData.properties.action_link;
    const userName = user.display_name || user.first_name || 'there';

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: emailError } = await resend.emails.send({
      from: 'WriFe <onboarding@resend.dev>',
      to: user.email,
      subject: 'Reset your WriFe password',
      html: buildResetEmailHtml(userName, resetLink, false),
    });

    if (emailError) {
      console.error('[send-password-reset] Resend error:', emailError);
      return NextResponse.json({
        success: false,
        error: 'Email delivery failed. The reset link was generated but could not be sent.',
        fallbackLink: resetLink,
      }, { status: 500 });
    }

    console.log(`[send-password-reset] Reset email sent to ${user.email} by admin ${admin.userId}`);

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${user.email}`,
    });

  } catch (error: unknown) {
    console.error('[send-password-reset] Error:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const msg = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
