import { createTransporter } from './config/mailer.js';

async function testLiveMail() {
  console.log('Testing Nodemailer SMTP email dispatch...');
  const transporter = createTransporter();
  try {
    const result = await transporter.sendMail({
      from: 'Bhale Padharya <bhalepadharya.app@gmail.com>',
      to: 'bhalepadharya.app@gmail.com',
      subject: 'Test Verification OTP - Bhale Padharya',
      html: `
        <div style="padding: 20px; font-family: sans-serif;">
          <h2>Your OTP Verification Code: <strong>849201</strong></h2>
          <p>This is a live test email from Bhale Padharya OTP Verification system.</p>
        </div>
      `,
    });
    console.log('SUCCESS! Email dispatched. MessageId:', result.messageId);
  } catch (err) {
    console.error('ERROR dispatching email:', err);
  }
}

testLiveMail();
