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

const baseUrl =
  process.env.CLIENT_URL ||
  process.env.APP_URL ||
  `http://localhost:${process.env.PORT || 3000}`;

const actions = {
  "verify-email": [
    "Verify your Chronicle account",
    "Verify your email by opening this link:",
  ],
  "reset-password": [
    "Reset your Chronicle password",
    "Reset your password by opening this link:",
  ],
};

const sendMail = async (user, token, path) => {
  const [subject, message] = actions[path];
  const link = `${baseUrl}/${path}?token=${token}`;

  await transport.sendMail({
    from: process.env.SMTP_FROM || "Chronicle <no-reply@chronicle.local>",
    to: user.email,
    subject,
    text: `Hi ${user.name},\n\n${message}\n${link}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Hi ${user.name},</p><p>${message}</p><p><a href="${link}">${subject}</a></p><p>If you did not request this, ignore this email.</p>`,
  });

  if (!process.env.SMTP_HOST) {
    console.log(`${subject} link for ${user.email}: ${link}`);
  }
};

module.exports = {
  sendVerificationEmail: (user, token) => sendMail(user, token, "verify-email"),
  sendPasswordResetEmail: (user, token) =>
    sendMail(user, token, "reset-password"),
};
