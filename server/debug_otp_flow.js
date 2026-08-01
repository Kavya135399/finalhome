import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

console.log('==================================================');
console.log('🔍 FULL END-TO-END EMAIL OTP RUNTIME DEBUGGING');
console.log('==================================================\n');

// 1. STEP 1 & 11 & 16: Check dotenv loading
const dotenvResult = dotenv.config({ path: envPath });
console.log('[DEBUG STEP 16] dotenv.config() Executed Result:', dotenvResult.error ? `FAILED: ${dotenvResult.error.message}` : 'SUCCESS: Loaded .env');

// 2. STEP 12, 13, 14, 15: Print environment variables
console.log('\n--- ENVIRONMENT VARIABLES CHECK ---');
console.log('[DEBUG STEP 12] process.env.SMTP_USER  :', process.env.SMTP_USER);
console.log('[DEBUG STEP 13] process.env.SMTP_HOST  :', process.env.SMTP_HOST);
console.log('[DEBUG STEP 14] process.env.SMTP_PORT  :', process.env.SMTP_PORT);
console.log('[DEBUG STEP 15] process.env.EMAIL_FROM :', process.env.EMAIL_FROM);
console.log('------------------------------------\n');

// 3. STEP 6 & 10: Test Transporter creation & verify()
const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '465', 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

console.log(`[DEBUG STEP 6] Creating Nodemailer Transporter (Host: ${host}, Port: ${port}, User: ${user})...`);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
});

async function runFullDiagnosis() {
  // STEP 6: Transporter Verify Result
  console.log('[DEBUG STEP 6] Executing transporter.verify()...');
  try {
    const verifyRes = await transporter.verify();
    console.log('[DEBUG STEP 6 RESULT] transporter.verify() SUCCESS:', verifyRes);
    console.log('✅ SMTP Authentication & Credentials are VALID!');
  } catch (verifyErr) {
    console.error('❌ [DEBUG STEP 6 & 9 FAILED] transporter.verify() ERROR:');
    console.error('Code:', verifyErr.code);
    console.error('Message:', verifyErr.message);
    console.error('Stack Trace:\n', verifyErr.stack);
    console.log('\n[DEBUG STEP 22] FIX FOR SMTP AUTH FAILURE:');
    console.log('1. Ensure 2-Step Verification is ON for Gmail account:', user);
    console.log('2. Generate a fresh 16-character App Password at: https://myaccount.google.com/apppasswords');
    console.log('3. Set SMTP_PASS in .env without spaces.');
    return;
  }

  // STEP 7 & 21: Test Actual Email Dispatch
  const targetEmail = process.env.ADMIN_EMAIL || 'bhalepadharya.app@gmail.com';
  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log(`\n[DEBUG STEP 7] Executing transporter.sendMail() to ${targetEmail}...`);
  const mailOptions = {
    from: process.env.EMAIL_FROM || `HomeSeva <${user}>`,
    to: targetEmail,
    subject: `🔐 Live Diagnostic OTP: ${testOtp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f5;">
        <h2 style="color: #4f46e5;">HomeSeva Live OTP Verification Audit</h2>
        <p>Your 6-digit OTP code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e1b4b; background: #e0e7ff; padding: 10px; display: inline-block; rounded: 8px;">${testOtp}</h1>
        <p>Generated at: ${new Date().toLocaleString()}</p>
      </div>
    `,
    text: `Your HomeSeva diagnostic OTP is: ${testOtp}`,
  };

  console.log('[DEBUG STEP 4] Request Body (mailOptions):', JSON.stringify({ to: mailOptions.to, from: mailOptions.from, subject: mailOptions.subject }));

  try {
    const sendRes = await transporter.sendMail(mailOptions);
    console.log('\n🎉 [DEBUG STEP 5 & 7 RESULT] transporter.sendMail() SUCCESS!');
    console.log('Response:', sendRes);
    console.log('Message ID:', sendRes.messageId);
    console.log('Accepted Recipients:', sendRes.accepted);
    console.log(`\n✅ LIVE EMAIL SUCCESSFULLY DELIVERED TO: ${targetEmail}`);
  } catch (sendErr) {
    console.error('❌ [DEBUG STEP 8 & 21 FAILED] transporter.sendMail() ERROR:');
    console.error('Message:', sendErr.message);
    console.error('Stack Trace:\n', sendErr.stack);
  }
}

runFullDiagnosis();
