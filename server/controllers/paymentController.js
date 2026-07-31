import { Booking } from '../models/Booking.js';
import { PaymentLog } from '../models/PaymentLog.js';
import {
  createRazorpayOrder,
  verifySignature,
  verifyWebhookSignature,
  fetchPaymentDetails,
} from '../services/razorpayService.js';
import { sendBookingConfirmationEmail, sendAdminNotification } from '../services/emailService.js';
import { getRazorpayKeyId } from '../config/razorpay.js';

// In-memory / fallback storage array if MongoDB is not connected
export const fallbackBookings = [];

/**
 * 1. Create Razorpay Order
 */
export const createOrder = async (req, res) => {
  try {
    console.log('[DEBUG PAYMENT CREATE-ORDER] HEADERS:', req.headers);
    console.log('[DEBUG PAYMENT CREATE-ORDER] BODY:', req.body);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is empty or undefined. Ensure Content-Type is application/json.',
      });
    }

    const {
      amount,
      productName,
      productId,
      quantity = 1,
      customerName,
      email,
      phoneNumber,
    } = req.body;

    if (!amount || Number(amount) <= 0 || !productName) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or amount specified in request body.',
      });
    }

    const baseAmount = Number(amount);
    const discount = req.body.discount ? Number(req.body.discount) : 0;
    const isStoreOrder = Boolean(
      req.body.isStoreOrder ||
      req.body.exactTotal ||
      productId === 'store_order' ||
      (typeof productId === 'string' && (productId.startsWith('sp_') || productId.startsWith('store'))) ||
      (typeof productName === 'string' && productName.toLowerCase().includes('store'))
    );

    let finalAmount = Math.max(1, Math.round(baseAmount));
    if (!isStoreOrder && discount > 0 && baseAmount > discount && baseAmount === Number(req.body.basePrice)) {
      finalAmount = Math.max(1, Math.round(baseAmount - discount));
    }
    const gst = Math.round(finalAmount * 0.1525);

    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const order = await createRazorpayOrder({
      amount: finalAmount,
      receipt,
      notes: {
        productName,
        productId: productId || 'svc_custom',
        customerName: customerName || 'Valued Customer',
        email: email || '',
        phone: phoneNumber || '',
      },
    });

    console.log('[DEBUG PAYMENT ORDER CREATED]:', order);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      isMockOrder: !!order.isMock,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      breakdown: {
        baseAmount,
        gst,
        discount,
        finalAmount,
      },
    });
  } catch (error) {
    console.error('[Create Order Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment order',
    });
  }
};

/**
 * 2. Cryptographic Signature Verification & Booking Creation
 */
export const verifyPayment = async (req, res) => {
  try {
    console.log('[DEBUG PAYMENT VERIFY-PAYMENT] HEADERS:', req.headers);
    console.log('[DEBUG PAYMENT VERIFY-PAYMENT] BODY:', req.body);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is empty or undefined. Cannot verify payment.',
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory payment verification fields.',
      });
    }

    // Cryptographic HMAC SHA256 Signature Verification
    const isValidSignature = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      console.warn(`[SECURITY ALERT] Invalid signature for Order ${razorpay_order_id} & Payment ${razorpay_payment_id}`);
      
      try {
        await PaymentLog.create({
          event: 'signature_verification_failed',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'failed',
          verified: false,
          errorDetails: 'HMAC SHA256 signature mismatch',
        });
      } catch (logErr) {
        // ignore log error
      }

      return res.status(400).json({
        success: false,
        message: 'Payment Verification Failed: Cryptographic signature mismatch. Booking NOT created.',
      });
    }

    const paymentMeta = await fetchPaymentDetails(razorpay_payment_id);
    console.log('[DEBUG PAYMENT DETAILS FETCHED]:', paymentMeta);
    const transactionId = paymentMeta.vpa || paymentMeta.acquirer_data?.rrn || paymentMeta.id || razorpay_payment_id;

    const bookingId = `HS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;

    const details = bookingDetails || {};
    const baseAmt = Number(details.amount || 1000);
    const gstAmt = Number(details.gst || Math.round(baseAmt * 0.18));
    const discAmt = Number(details.discount || 0);
    const finalAmt = baseAmt + gstAmt - discAmt;

    const newBookingData = {
      bookingId,
      userId: req.user?.id || details.userId || 'guest',
      customerName: details.customerName || 'Customer',
      phoneNumber: details.phoneNumber || details.phone || '9876543210',
      email: details.email || 'bhalepadharya.app@gmail.com',
      address: {
        street: details.address?.street || details.address || 'Standard Address',
        city: details.address?.city || 'Mumbai',
        state: details.address?.state || 'Maharashtra',
        pincode: details.address?.pincode || '400001',
        fullAddress: details.address?.fullAddress || (typeof details.address === 'string' ? details.address : 'Standard Address'),
      },
      productName: details.productName || 'Home Service',
      productId: details.productId || 'svc_101',
      quantity: Number(details.quantity || 1),
      amount: baseAmt,
      gst: gstAmt,
      discount: discAmt,
      finalAmount: finalAmt,
      bookingDate: details.bookingDate || new Date().toISOString().slice(0, 10),
      bookingTime: details.bookingTime || '10:00 AM - 11:30 AM',
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'upi',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      transactionId,
      invoiceNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let savedBooking;
    try {
      savedBooking = await Booking.create(newBookingData);
    } catch (mongoErr) {
      console.warn('MongoDB save fallback:', mongoErr.message);
      savedBooking = newBookingData;
    }
    
    fallbackBookings.unshift(newBookingData);

    try {
      await PaymentLog.create({
        event: 'payment_verified_booking_created',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'Paid',
        amount: finalAmt,
        payload: { bookingId, invoiceNumber },
        verified: true,
      });
    } catch (logErr) {
      // ignore
    }

    // Dispatch Order Confirmation Email with PDF invoice attached
    sendBookingConfirmationEmail(newBookingData).catch((err) => {
      console.error('Email dispatch background warning:', err.message);
    });

    // Send Admin Notification
    sendAdminNotification('new_order', {
      title: `New Paid Order #${bookingId}`,
      details: `Received payment of ₹${finalAmt} for ${newBookingData.productName} from ${newBookingData.customerName} (${newBookingData.email}).`,
    }).catch((err) => console.error('Admin alert warning:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Payment Verified & Booking Confirmed Successfully',
      bookingId,
      invoiceNumber,
      booking: savedBooking,
    });
  } catch (error) {
    console.error('[Verify Payment Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during payment verification.',
    });
  }
};

/**
 * 3. Razorpay Webhook Handler
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || req.body;

    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing Webhook Signature header' });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[SECURITY ALERT] Fake or invalid Webhook signature received.');
      return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
    }

    const eventData = JSON.parse(rawBody.toString());
    const event = eventData.event;
    console.log(`[Webhook Verified] Received Razorpay Event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = eventData.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      try {
        await Booking.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { paymentStatus: 'Paid', bookingStatus: 'Confirmed', razorpayPaymentId: paymentId }
        );
      } catch (e) {
        // fallback
      }

      await PaymentLog.create({
        event,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        status: 'Paid',
        payload: eventData,
        verified: true,
      });
    } else if (event === 'payment.failed') {
      const paymentEntity = eventData.payload.payment.entity;
      await PaymentLog.create({
        event,
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
        status: 'Failed',
        payload: eventData,
        verified: true,
        errorDetails: paymentEntity.error_description || 'Payment Failed',
      });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook Error]:', error);
    return res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
};

/**
 * 4. Get Razorpay Config Public Key
 */
export const getPaymentConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    keyId: getRazorpayKeyId(),
  });
};
