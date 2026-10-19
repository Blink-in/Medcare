import nodemailer from "nodemailer";

const sendPasswordResetEmail = async (email, resetUrl) => {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("Gmail SMTP environment variables are missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"MedCare" <${GMAIL_USER}>`,
    to: email,
    subject: "Reset your MedCare password",
    text: [
      "We received a request to reset your MedCare password.",
      "",
      `Open this link to choose a new password: ${resetUrl}`,
      "",
      "This link expires in 15 minutes and can only be used once.",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#24352d;line-height:1.6">
        <h2 style="color:#118961">MedCare Password Reset</h2>
        <p>We received a request to reset your MedCare password.</p>
        <p>Use the button below to choose a new password. This link expires in 15 minutes.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="background:#118961;color:#fff;text-decoration:none;padding:13px 22px;border-radius:8px;display:inline-block">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, open this link in your browser:</p>
        <p style="word-break:break-all">${resetUrl}</p>
        <p>If you did not request this, you can ignore this email. Your current password will remain unchanged.</p>
      </div>
    `,
  });
};

export default sendPasswordResetEmail;
