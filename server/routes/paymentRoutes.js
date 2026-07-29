import express from 'express';
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentConfig,
} from '../controllers/paymentController.js';
import { paymentRateLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-order', paymentRateLimiter, createOrder);
router.post('/verify-payment', paymentRateLimiter, verifyPayment);

// Webhook endpoint (uses raw text/buffer parser for HMAC verification)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
