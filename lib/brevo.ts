import { logServerError } from "@/lib/server-log";

function parseSender(value: string) {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^(.*)<([^>]+)>$/);

  if (!match) {
    return {
      email: trimmedValue,
      name: "Moroccan Trip"
    };
  }

  const senderName = match[1].trim().replace(/^"|"$/g, "");
  const senderEmail = match[2].trim();

  return {
    email: senderEmail,
    name: senderName || "Moroccan Trip"
  };
}

export function getBrevoConfig() {
  const sender = parseSender(process.env.EMAIL_FROM?.trim() || "");

  return {
    apiKey: process.env.BREVO_API_KEY?.trim() || "",
    senderEmail: sender.email,
    senderName: sender.name,
    appUrl: (process.env.NEXT_PUBLIC_APP_URL?.trim() || "").replace(/\/+$/, "")
  };
}

export function isBrevoConfigured() {
  const { apiKey, senderEmail, appUrl } = getBrevoConfig();
  return Boolean(apiKey && senderEmail && appUrl);
}

export async function sendPasswordResetEmail({
  to,
  resetToken
}: {
  to: string;
  resetToken: string;
}) {
  const { apiKey, senderEmail, senderName, appUrl } = getBrevoConfig();

  if (!apiKey || !senderEmail || !appUrl) {
    throw new Error("Password reset service is not configured.");
  }

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const subject = "Reset your Moroccan Trip password";
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a">
      <h2>Reset your Moroccan Trip password</h2>
      <p>We received a request to reset the password for your Moroccan Trip account.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#0f3d2e;color:#ffffff;text-decoration:none;border-radius:999px">
          Reset password
        </a>
      </p>
      <p>This link expires in 20 minutes and can only be used once.</p>
      <p>If you did not request this reset, you can ignore this email.</p>
    </div>
  `;
  const textContent = [
    "Reset your Moroccan Trip password",
    "",
    "We received a request to reset the password for your Moroccan Trip account.",
    `Reset password: ${resetUrl}`,
    "",
    "This link expires in 20 minutes and can only be used once.",
    "If you did not request this reset, you can ignore this email."
  ].join("\n");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent
    })
  });

  if (!response.ok) {
    const body = await response.text();
    logServerError("brevo.reset-email", new Error("Brevo request failed."), {
      status: response.status,
      body
    });
    throw new Error("Could not send reset email.");
  }
}
