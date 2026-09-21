import { createHash, randomBytes } from "node:crypto";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "RewardsVerse <noreply@rewardsverse.online>";

export function createEmailVerificationToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, tokenHash, expiresAt };
}

export function hashEmailVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendVerificationEmail(params: {
  email: string;
  username?: string | null;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email delivery is not configured yet. Add RESEND_API_KEY in the deployment environment.");
  }

  const appUrl = (process.env.PUBLIC_APP_URL || "https://rewardsverse.online").replace(/\/$/, "");
  const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(params.token)}`;
  const name = params.username || "there";
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.email],
      subject: "Verify your RewardsVerse email",
      html: `<!doctype html><html><body style="margin:0;background:#f5f7f6;font-family:Arial,sans-serif;color:#17352c"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e2ebe6;border-radius:18px"><div style="font-size:20px;font-weight:800;color:#079669">REWARDSVERSE</div><h1 style="margin:28px 0 10px;font-size:24px">Verify your email</h1><p style="line-height:1.6">Hi ${escapeHtml(name)}, please confirm this email address to secure your account and unlock withdrawals.</p><p style="margin:28px 0"><a href="${verifyUrl}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#079669;color:#fff;text-decoration:none;font-weight:700">Verify email</a></p><p style="font-size:13px;color:#66756f;line-height:1.5">This link expires in 24 hours. If you did not create a RewardsVerse account, you can ignore this message.</p></div></body></html>`,
      text: `Hi ${name}, verify your RewardsVerse email here: ${verifyUrl}\n\nThis link expires in 24 hours.`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend rejected the email (${response.status})${detail ? `: ${detail.slice(0, 240)}` : ""}`);
  }

  return (await response.json()) as { id?: string };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);
}
