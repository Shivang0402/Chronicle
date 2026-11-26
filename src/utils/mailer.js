const { Resend } = require("resend");
const { renderActionEmail } = require("../templates/emailTemplate");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is required to send email in production.");
    }
    console.log(`${action.subject} link for ${user.email}: ${link}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "Chronicle <onboarding@resend.dev>",
    to: [user.email],
    subject: action.subject,
    text: `Hi ${user.name},\n\n${action.intro.charAt(0).toUpperCase()}${action.intro.slice(1)}\n\n${action.cta}: ${link}\n\n${action.note}\n\nIf you did not request this, ignore this email.`,
    html,
  });

  if (error) throw new Error(error.message);
};

module.exports = {
  sendVerificationEmail: (user, token) => sendMail(user, token, "verify-email"),
  sendPasswordResetEmail: (user, token) =>
    sendMail(user, token, "reset-password"),
};
