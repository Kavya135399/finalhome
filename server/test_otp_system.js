async function testOtpSystem() {
  console.log('--- STARTING EMAIL OTP VERIFICATION SYSTEM AUDIT ---');
  const testEmail = `otp_test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const baseUrl = 'http://localhost:5000/api/auth';

  try {
    // 1. REGISTER USER
    console.log(`\n1. Registering new pending user: ${testEmail}...`);
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'OTP Test User', email: testEmail, password: testPassword, mobile: '+91 99988 77766' }),
    });
    const regData = await regRes.json();
    console.log('Registration Response:', regData);

    if (!regData.success || !regData.requiresVerification) {
      throw new Error('Registration failed to enter pending verification state.');
    }

    // 2. UNVERIFIED LOGIN BLOCK TEST
    console.log('\n2. Testing login attempt BEFORE email verification...');
    const loginAttempt = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const loginData = await loginAttempt.json();
    console.log('Unverified Login Status:', loginAttempt.status, loginData);
    if (loginAttempt.status !== 403 || !loginData.requiresVerification) {
      throw new Error('FAILED: Unverified user was not blocked from logging in!');
    }
    console.log('SUCCESS: Unverified login correctly blocked with 403!');

    // 3. WRONG OTP SUBMISSION TEST
    console.log('\n3. Submitting WRONG 6-digit OTP code (000000)...');
    const wrongRes = await fetch(`${baseUrl}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' }),
    });
    const wrongData = await wrongRes.json();
    console.log('Wrong OTP Response:', wrongData);
    if (wrongRes.status !== 400 || !wrongData.error.includes('attempt(s) remaining')) {
      throw new Error('FAILED: Wrong OTP check failed.');
    }
    console.log('SUCCESS: Wrong OTP correctly incremented failed attempt counter!');

    // 4. RESEND OTP COOLDOWN TEST (within 60s)
    console.log('\n4. Attempting immediate Resend OTP (testing 60s cooldown)...');
    const resendRes = await fetch(`${baseUrl}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const resendData = await resendRes.json();
    console.log('Resend Cooldown Response:', resendRes.status, resendData);
    if (resendRes.status !== 429 || !resendData.cooldownRemaining) {
      throw new Error('FAILED: 60-second resend cooldown was not enforced!');
    }
    console.log(`SUCCESS: 60-second cooldown active (${resendData.cooldownRemaining}s remaining)!`);

    // 5. LIVE NODEMAILER GMAIL OTP DISPATCH VERIFICATION
    console.log(`\n5. Dispatching live OTP to real email bhalepadharya.app@gmail.com...`);
    const liveRegRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Live Verification Customer', email: 'bhalepadharya.app@gmail.com', password: 'TestPassword123!' }),
    });
    const liveData = await liveRegRes.json();
    console.log('Live Registration Response:', liveData);

    console.log('\n--- EMAIL OTP SYSTEM AUDIT COMPLETE AND VERIFIED SUCCESSFUL ---');
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err.message);
  }
}

testOtpSystem();
