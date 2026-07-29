import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.js';

export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  try {
    const amountInPaisa = Math.round(Number(amount) * 100);
    const options = {
      amount: amountInPaisa,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes,
    };

    console.log('[RAZORPAY CREATE ORDER OPTIONS]:', JSON.stringify(options, null, 2));

    // Execute official Razorpay SDK Order Creation
    const order = await razorpayInstance.orders.create(options);
    
    console.log('[RAZORPAY ORDER SUCCESS]:', JSON.stringify(order, null, 2));

    if (!order || !order.id) {
      throw new Error('Razorpay SDK returned invalid or missing order ID.');
    }

    return order;
  } catch (error) {
    console.error('[RAZORPAY ORDER CREATION ERROR DETAILS]:', error);
    const errorMsg = error.error?.description || error.description || error.message || 'Failed to create Razorpay order';
    throw new Error(`Razorpay API Error: ${errorMsg}`);
  }
};

export const verifySignature = ({ orderId, paymentId, signature }) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('[SECURITY ERROR] RAZORPAY_KEY_SECRET is missing in environment variables.');
      return false;
    }

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    console.log('[SIGNATURE VERIFICATION] EXPECTED:', expectedSignature);
    console.log('[SIGNATURE VERIFICATION] RECEIVED:', signature);

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const actualBuffer = Buffer.from(signature, 'utf-8');

    if (expectedBuffer.length !== actualBuffer.length) {
      console.error('[SIGNATURE MISMATCH] Buffer lengths do not match.');
      return false;
    }

    const isMatch = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    if (!isMatch) {
      console.error('[SIGNATURE MISMATCH] HMAC SHA256 signatures do not match.');
    }
    return isMatch;
  } catch (error) {
    console.error('Signature Verification Error:', error);
    return false;
  }
};

export const verifyWebhookSignature = (rawBody, signature) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return false;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const actualBuffer = Buffer.from(signature, 'utf-8');

    if (expectedBuffer.length !== actualBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error('Webhook Verification Error:', error);
    return false;
  }
};

export const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    console.log('[RAZORPAY FETCH PAYMENT METADATA]:', JSON.stringify(payment, null, 2));
    return payment;
  } catch (error) {
    console.error('[RAZORPAY FETCH PAYMENT ERROR]:', error);
    throw error;
  }
};
