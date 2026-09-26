import nodemailer from "nodemailer";

const hasSmtp =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@stocksense.local";

  if (!transporter) {
    console.log("\n========== EMAIL (dev fallback) ==========");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log("==========================================\n");
    return { mocked: true };
  }

  return transporter.sendMail({ from, to, subject, text, html });
}

export async function sendOtpEmail(to, code) {
  return sendEmail({
    to,
    subject: "StockSense password reset code",
    text: `Your StockSense password reset code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `<p>Your StockSense password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 10 minutes.</p>`,
  });
}

export async function sendInviteEmail(to, { name, tempPassword, role }) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return sendEmail({
    to,
    subject: "You've been invited to StockSense",
    text: `Hi ${name || "there"},\n\nYou've been added to a company on StockSense as ${role}.\n\nLogin email: ${to}\nTemporary password: ${tempPassword}\n\nPlease log in at ${frontendUrl}/login and reset your password when prompted.\n`,
    html: `<p>Hi ${name || "there"},</p>
<p>You've been added to a company on StockSense as <strong>${role}</strong>.</p>
<p><strong>Login email:</strong> ${to}<br/><strong>Temporary password:</strong> ${tempPassword}</p>
<p>Please <a href="${frontendUrl}/login">log in</a> and reset your password when prompted.</p>`,
  });
}
