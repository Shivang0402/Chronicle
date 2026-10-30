const nodemailer = require("nodemailer");

const port = Number(process.env.SMTP_PORT) || 587;

const transport = nodemailer.createTransport(
  process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      }
    : { jsonTransport: true },
);

const sendEmail = async (user, token) => {
  const baseUrl =
    process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
  const link = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const mail = await transport.sendMail({
    from: process.env.SMTP_FROM || "Chronicle <no-reply@chronicle.local>",
    to: user.email,
    subject: "Verify your Chronicle account",
    text: `Hi ${user.name},\n\nVerify your email by opening this link:\n${link}\n\nThis link expires in 24 hours.`,
    html: `<p>Hi ${user.name},</p><p>Verify your email by opening this link:</p><p><a href="${link}">Verify my email</a></p><p>This link expires in 24 hours.</p>`,
  });

  if (mail.message) {
    console.log(`Verification link for ${user.email}: ${link}`);
  }
};

module.exports = sendEmail;
