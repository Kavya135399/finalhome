import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import { sendOrderNotification, sendCustomerAccountNotification, sendAdminNotification } from './services/emailService.js';

async function runTest() {
  console.log('--- Testing Gmail SMTP Email & PDF Invoice System ---');
  console.log(`SMTP User: ${process.env.SMTP_USER}`);

  const testOrder = {
    bookingId: `HS-${Date.now().toString().slice(-6)}`,
    invoiceNumber: `INV-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
    customerName: 'Bhale Padharya Test Customer',
    email: 'bhalepadharya.app@gmail.com',
    productName: 'Full Home Deep Cleaning & Sanitization',
    quantity: 1,
    amount: 2500,
    gst: 450,
    discount: 200,
    finalAmount: 2750,
    paymentStatus: 'Paid',
    paymentMethod: 'Razorpay UPI',
    razorpayOrderId: 'order_live_test_101',
    razorpayPaymentId: 'pay_live_test_202',
    transactionId: 'upi_ref_3039090',
    address: { fullAddress: 'Suite 404, Tech Park, Mumbai, MH, 400001' },
    createdAt: new Date(),
  };

  console.log('Sending Order Confirmed Email with PDF Invoice attachment to bhalepadharya.app@gmail.com...');
  const result = await sendOrderNotification('order_confirmed', testOrder);
  
  if (result.success) {
    console.log('✅ SUCCESS! Email sent to bhalepadharya.app@gmail.com with PDF invoice attached!');
  } else {
    console.error('❌ FAILURE sending email:', result.error);
  }
}

runTest();
