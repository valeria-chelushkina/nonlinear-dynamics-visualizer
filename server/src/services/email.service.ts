/**
 * @file email.service.ts
 * @description Service for sending sandbox (for coursework) emails using Nodemailer.
 */

import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST || "smtp.mailtrap.io";
    const port = parseInt(process.env.SMTP_PORT || "2525");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      logger.warn(
        "SMTP credentials (SMTP_USER/SMTP_PASS) are missing.",
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  /**
   * Sends a password reset email to the user.
   * @param email - User's email address
   * @param token - Password reset token
   */
  public async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Nonlinear Dynamics Visualizer" <${process.env.EMAIL_FROM || "noreply@nonlinear-visualizer.com"}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #6366f1; text-align: center;">Reset Your Password</h2>
          <p>Hi there,</p>
          <p>We received a request to reset your password for your <strong>Nonlinear Dynamics Visualizer</strong> account. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #64748b;">This link will expire in 1 hour.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Nonlinear Dynamics Visualizer<br />
            Coursework Project 2026
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send email to ${email}:`, error);
      throw new Error("Failed to send reset email. Please try again later.");
    }
  }
}
