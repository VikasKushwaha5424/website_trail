const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // 1. Create Transporter (Using Real Credentials from Env)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,     // e.g., smtp.gmail.com
      port: process.env.SMTP_PORT,     // e.g., 587
      secure: false,                   // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,   // your email address
        pass: process.env.SMTP_PASS,   // your email password or app password
      },
    });

    // 2. Send Mail
    const info = await transporter.sendMail({
      // ✅ FIX: Use the authenticated email to prevent rejection
      // Most providers (Gmail, Outlook) require the 'from' address to match the auth user
      from: `"College Portal" <${process.env.SMTP_USER}>`, 
      to: to, 
      subject: subject, 
      html: htmlContent, 
    });

    console.log("📨 Email sent: %s", info.messageId);
    
    return info;
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};

module.exports = sendEmail;