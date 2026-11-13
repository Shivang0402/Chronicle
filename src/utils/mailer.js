const nodemailer = require("nodemailer");
const { renderActionEmail } = require("../templates/emailTemplate");

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

const productionUrl = "https://chronicle-jet-ten.vercel.app";

const isLocalUrl = (value) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(value);

const configuredBaseUrl = (
  process.env.EMAIL_BASE_URL ||
  process.env.CLIENT_URL ||
  process.env.APP_URL ||
  ""
).trim();

const baseUrl = (
  !configuredBaseUrl || isLocalUrl(configuredBaseUrl)
    ? productionUrl
    : configuredBaseUrl
).replace(/\/+$/, "");

const actions = {
  "verify-email": {
    subject: "Verify your Chronicle account",
    preheader: "One quiet step to open your private writing space.",
    eyebrow: "Verify your email",
    heading: "One quiet step.",
    intro:
      "thank you for beginning your Chronicle. Confirm this email address to open your private writing space.",
    cta: "Verify my email",
    note: "This verification link expires in 24 hours.",
  },
  "reset-password": {
    subject: "Reset your Chronicle password",
    preheader: "A new key for your Chronicle, whenever you are ready.",
    eyebrow: "Password reset",
    heading: "A new key.",
    intro:
      "we received a request to reset the password for your Chronicle account. Choose a new one whenever you are ready.",
    cta: "Reset my password",
    note: "This reset link expires in 1 hour.",
  },
};

const sendMail = async (user, token, path) => {
  const action = actions[path];
  const link = `${baseUrl}/${path}?token=${token}`;
  const html = renderActionEmail({
    name: user.name,
    preheader: action.preheader,
    eyebrow: action.eyebrow,
    heading: action.heading,
    intro: action.intro,
    cta: action.cta,
    link,
    note: action.note,
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM || "Chronicle <no-reply@chronicle.local>",
    to: user.email,
    subject: action.subject,
    text: `Hi ${user.name},\n\n${action.intro.charAt(0).toUpperCase()}${action.intro.slice(1)}\n\n${action.cta}: ${link}\n\n${action.note}\n\nIf you did not request this, ignore this email.`,
    html,
  });

  if (!process.env.SMTP_HOST) {
    console.log(`${action.subject} link for ${user.email}: ${link}`);
  }
};

module.exports = {
  sendVerificationEmail: (user, token) => sendMail(user, token, "verify-email"),
  sendPasswordResetEmail: (user, token) =>
    sendMail(user, token, "reset-password"),
};
