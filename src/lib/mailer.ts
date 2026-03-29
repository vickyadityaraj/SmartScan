import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Sends a premium-styled OTP email to the user.
 */
export async function sendOtpEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"Smart Scan" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Smart Scan Verification Code',
    html: `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px; background: #ffffff; border-radius: 20px; border: 1px solid #f0f0f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 12px; background: #000000; border-radius: 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #1a1a1a; margin: 20px 0 10px 0;">Verify your identity</h1>
          <p style="font-size: 14px; color: #666666; line-height: 1.5;">Enter the following code to complete your registration or login.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 30px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 800; color: #000000; letter-spacing: 12px; margin-left: 12px;">${otp}</span>
        </div>
        
        <p style="font-size: 12px; color: #999999; text-align: center;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center;">
          <p style="font-size: 12px; font-weight: 600; color: #1a1a1a; margin: 0;">Smart Scan Terminal</p>
          <p style="font-size: 10px; color: #666666; margin: 4px 0 0 0;">Automated Identity Service</p>
        </div>
      </div>
    `,
  }

  // Also log the OTP in the terminal for local development if needed
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEVELOPMENT] OTP for ${email}: ${otp}`)
  }

  return transporter.sendMail(mailOptions)
}
