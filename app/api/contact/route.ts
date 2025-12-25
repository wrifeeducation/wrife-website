import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = escapeHtml(String(body.name || '').trim())
    const email = String(body.email || '').trim()
    const school = escapeHtml(String(body.school || '').trim())
    const message = escapeHtml(String(body.message || '').trim())

    if (!name || !email || !school || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'WriFe Contact Form <onboarding@resend.dev>',
      to: 'hello@wrife.co.uk',
      replyTo: email,
      subject: `Pilot Enquiry from ${name} - ${school}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2E5AFF; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Pilot Programme Enquiry</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                  <a href="mailto:${email}" style="color: #2E5AFF;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">School:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${school}</td>
              </tr>
            </table>
            
            <h3 style="color: #333; margin-top: 25px;">Message</h3>
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This enquiry was submitted via the WriFe Pilot Programme landing page.</p>
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
