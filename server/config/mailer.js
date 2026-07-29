import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!user || !pass) {
    console.log('[Mailer] SMTP credentials missing in .env. Email dispatch logged in dev mode.');
    return {
      sendMail: async (options) => {
        console.log(`[Dev Mailer Simulation] Email to ${options.to} | Subject: ${options.subject}`);
        return { messageId: `mock_msg_${Date.now()}` };
      },
    };
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};
