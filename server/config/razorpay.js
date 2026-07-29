import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const getValidKey = (envVal, defaultVal, placeholders = []) => {
  if (!envVal || placeholders.includes(envVal)) return defaultVal;
  return envVal;
};

const keyId = getValidKey(
  process.env.RAZORPAY_KEY_ID, 
  'rzp_test_TImq1gKlDJOs8n', 
  ['your_razorpay_key_id_here', 'rzp_test_YOUR_KEY_ID_HERE', 'rzp_test_mock_key_id']
);

const keySecret = getValidKey(
  process.env.RAZORPAY_KEY_SECRET, 
  '976v0LXGfoRTEA1CaeqjhHVr', 
  ['your_razorpay_key_secret_here', 'YOUR_RAZORPAY_KEY_SECRET_HERE', 'mock_razorpay_secret_key']
);

export const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export const getRazorpayKeyId = () => keyId;
export const getRazorpayKeySecret = () => keySecret;
