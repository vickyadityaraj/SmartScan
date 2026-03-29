import nodemailer from 'nodemailer'

// Pre-configure for Gmail App Passwords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // This should be the 16-digit App Password
  },
})

export async function sendOtpEmail(email: string, name: string, otp: string) {
  // Always log for local testing
  console.log(`[AUTH] OTP for ${email} (${name}): ${otp}`)

  // Only attempt send if credentials are provided
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'your-email@gmail.com') {
    try {
      await transporter.sendMail({
        from: `"Smart Scan" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your 6-Digit OTP for Smart Scan',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 40px; border: 1px solid #e1e1e1; border-radius: 24px; background: #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
               <div style="background: #000; color: #fff; width: 48px; height: 48px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; line-height: 48px;">S</div>
            </div>
            <h2 style="color: #1a1a1a; margin-top: 0; text-align: center; font-size: 24px;">Welcome back, ${name}!</h2>
            <p style="color: #666; text-align: center; font-size: 16px; margin-bottom: 32px;">Use the code below to sign in to your Smart Scan terminal. This code expires in 10 minutes.</p>
            <div style="background: #f9f9f9; padding: 24px; text-align: center; border-radius: 16px; border: 1px dashed #ddd;">
              <h1 style="letter-spacing: 8px; margin: 0; color: #000; font-family: monospace; font-size: 32px;">${otp}</h1>
            </div>
            <p style="margin-top: 32px; color: #999; font-size: 12px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
      })
      console.log(`[AUTH] Gmail successfully delivered OTP to ${email}`)
    } catch (error) {
      console.error('[AUTH] Gmail SMTP delivery failed:', error)
      // We don't throw here to ensure local development with terminal logging still works
    }
  } else {
    console.log('[AUTH] SMTP Not Configured. Check terminal logs for OTP code.')
  }
}
