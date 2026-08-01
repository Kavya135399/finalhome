import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_SMTP_USER = 'bhalepadharya.app@gmail.com';
const DEFAULT_SMTP_PASS = 'bdjgvxddlpbdbemm';

const isPlaceholder = (val) => {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return (
    lower.includes('your_email') ||
    lower.includes('your_app_password') ||
    lower.includes('example.com') ||
    lower.includes('YOUR_')
  );
};

export const createTransporter = () => {
  let host = process.env.SMTP_HOST || 'smtp.gmail.com';
  let port = parseInt(process.env.SMTP_PORT || '465', 10);
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;

  // Fallback to working Gmail credentials if env contains placeholders or is missing
  if (isPlaceholder(user) || isPlaceholder(pass)) {
    user = DEFAULT_SMTP_USER;
    pass = DEFAULT_SMTP_PASS;
    host = 'smtp.gmail.com';
    port = 465;
  }

  const isGmail = host.includes('gmail');
  const isSecure = port === 465;

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const verifyTransporter = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('[Mailer] ✅ SMTP Connection Verified: Mail server is ready to send emails.');
    return true;
  } catch (err) {
    console.error('[Mailer] ❌ SMTP Connection Verification Failed:', err.message);
    return false;
  }
};
