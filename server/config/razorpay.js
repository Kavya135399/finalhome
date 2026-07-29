import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_id';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_razorpay_secret_key';

export const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || keyId;
