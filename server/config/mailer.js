import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'bhalepadharya.app@gmail.com';
  const pass = process.env.SMTP_PASS || 'bdjgvxddlpbdbemm';

  if (!user || !pass) {
    console.log('[Mailer] SMTP credentials missing in .env. Email dispatch logged in dev mode.');
    return {
      sendMail: async (options) => {
        console.log(`[Dev Mailer Simulation] Email to ${options.to} | Subject: ${options.subject}`);
        return { messageId: `mock_msg_${Date.now()}` };
      },
    };
  }

  if (host.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};
