import { Resend } from "resend";
import nodemailer from "nodemailer";
import { ConfirmEmail } from "../views/emails/ConfirmEmail";
import { BroadcastEmail } from "../views/emails/BroadcastEmail";
import { config } from "../config";

// Hono html templates are objects with a toString() method that returns the HTML string
type HonoTemplate = { toString(): string };

function templateToString(template: HonoTemplate): string {
  const html = template.toString();
  if (html === "[object Object]" || html.length === 0) {
    throw new Error("Failed to serialize email template to HTML");
  }
  return html;
}

// Lazy-load Resend client only when needed
let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) {
    if (!config.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required when using EMAIL_PROVIDER=resend");
    }
    resendClient = new Resend(config.RESEND_API_KEY);
  }
  return resendClient;
}

// Lazy-load SMTP transport only when needed
let smtpTransport: nodemailer.Transporter | null = null;
function getSmtpTransport(): nodemailer.Transporter {
  if (!smtpTransport) {
    if (!config.SMTP_HOST) {
      throw new Error("SMTP_HOST is required when using EMAIL_PROVIDER=smtp");
    }
    smtpTransport = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT ?? 587,
      secure: config.SMTP_SECURE,
      auth: config.SMTP_USER && config.SMTP_PASS
        ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
        : undefined,
    });
  }
  return smtpTransport;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const from = config.EMAIL_FROM ?? "Sendlet <noreply@sendlet.app>";

  if (config.EMAIL_PROVIDER === "smtp") {
    const transport = getSmtpTransport();
    await transport.sendMail({ from, to, subject, html });
    console.log(`[smtp] sent "${subject}" to ${to}`);
  } else if (config.EMAIL_PROVIDER === "resend") {
    if (!config.RESEND_API_KEY) {
      console.log(`[email mock] email to ${to}: "${subject}"`);
      return;
    }
    const resend = getResendClient();
    await resend.emails.send({ from, to, subject, html });
    console.log(`[resend] sent "${subject}" to ${to}`);
  } else {
    // Fallback to console logging
    console.log(`[email mock] email to ${to}: "${subject}"`);
  }
}

export async function sendConfirmationEmail(
  to: string,
  confirmUrl: string
): Promise<void> {
  const html = templateToString(ConfirmEmail({ confirmUrl }));
  await sendEmail(to, "Confirm your subscription", html);
}

export async function sendBroadcastEmail(
  to: string,
  subject: string,
  bodyHtml: string,
  unsubscribeUrl: string
): Promise<void> {
  const html = templateToString(BroadcastEmail({ subject, bodyHtml, unsubscribeUrl }));
  await sendEmail(to, subject, html);
}
