import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../logging/logger.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(env.resendApiKey || env.smtp.host);
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const from = env.emailFrom;

  if (env.resendApiKey) {
    const resend = new Resend(env.resendApiKey);
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  if (env.smtp.host) {
    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
    });
    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    return;
  }

  logger.warn({
    msg: 'Email not configured — skipping send',
    to: opts.to,
    subject: opts.subject,
  });
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const resetUrl = `${env.appPublicUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const subject = 'Reset your password';
  const html = `
    <p>You requested a password reset for your account.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
  `.trim();
  const text = `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`;

  await sendEmail({ to, subject, html, text });
}
