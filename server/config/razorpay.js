import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const getValidKey = (envVal, defaultVal, placeholders = []) => {
  if (!envVal || placeholders.includes(envVal)) return defaultVal;
  return envVal;
};

const defaultKeyId = getValidKey(
  process.env.RAZORPAY_KEY_ID, 
  'rzp_test_TImq1gKlDJOs8n', 
  ['your_razorpay_key_id_here', 'rzp_test_YOUR_KEY_ID_HERE', 'rzp_test_mock_key_id']
);

const defaultKeySecret = getValidKey(
  process.env.RAZORPAY_KEY_SECRET, 
  '976v0LXGfoRTEA1CaeqjhHVr', 
  ['your_razorpay_key_secret_here', 'YOUR_RAZORPAY_KEY_SECRET_HERE', 'mock_razorpay_secret_key']
);

let activeKeyId = defaultKeyId;
let activeKeySecret = defaultKeySecret;

export let razorpayInstance = new Razorpay({
  key_id: activeKeyId,
  key_secret: activeKeySecret,
});

export const updateRazorpayConfig = (keyId, keySecret) => {
  if (keyId) activeKeyId = keyId;
  if (keySecret) activeKeySecret = keySecret;
  razorpayInstance = new Razorpay({
    key_id: activeKeyId,
    key_secret: activeKeySecret,
  });
};

export const getRazorpayKeyId = () => activeKeyId;
export const getRazorpayKeySecret = () => activeKeySecret;
export const getRazorpayInstance = () => razorpayInstance;
