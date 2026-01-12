const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // 1. Create Transporter (Using Ethereal for Dev)
    // In Production, you would use Gmail/SendGrid here
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });

    // 2. Send Mail
    const info = await transporter.sendMail({
      from: '"College Portal" <admin@college.edu>', 
      to: to, 
      subject: subject, 
      html: htmlContent, 
    });

    console.log("📨 Email sent: %s", info.messageId);
    console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info)); // <--- CLICK THIS LINK IN TERMINAL TO SEE EMAIL

    return info;
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};

module.exports = sendEmail;