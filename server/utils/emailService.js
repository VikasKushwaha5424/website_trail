const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. Send Mail
  // We do NOT use try/catch here. We let the error throw 
  // so the calling controller can decide how to handle it.
  const info = await transporter.sendMail({
    from: `"College Portal" <${process.env.SMTP_USER}>`, 
    to: to, 
    subject: subject, 
    html: htmlContent, 
  });

  console.log("📨 Email sent: %s", info.messageId);
  return info;
};

module.exports = sendEmail;