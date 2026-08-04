declare global {
  interface Window {
    Razorpay: any;
  }
}

const getApiEndpoint = (endpoint: string) => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `http://localhost:5000${endpoint}`;
  }
  return endpoint;
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface PaymentOptions {
  userId?: string;
  productName: string;
  productId: string;
  amount: number;
  discount?: number;
  customerName: string;
  email: string;
  phoneNumber: string;
  address?: any;
  bookingDate?: string;
  bookingTime?: string;
  showAllMethods?: boolean;
  onSuccess: (data: { bookingId: string; invoiceNumber: string; booking: any }) => void;
  onFailure: (error: string) => void;
}

export const processUPIPayment = async (options: PaymentOptions) => {
  console.log('[FRONTEND DEBUG OPTIONS]:', options);

  // 1. Ensure Razorpay Checkout script is loaded
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onFailure('Failed to load Razorpay Payment Gateway SDK script. Check your internet connection.');
    return;
  }

  try {
    // 2. Request Backend to Create Razorpay Order
    const createOrderUrl = getApiEndpoint('/api/payment/create-order');
    let orderRes: Response;
    try {
      orderRes = await fetch(createOrderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: options.productName,
          productId: options.productId,
          amount: options.amount,
          discount: options.discount || 0,
          isStoreOrder: options.productId === 'store_order' || (typeof options.productId === 'string' && options.productId.startsWith('sp_')),
          customerName: options.customerName,
          email: options.email,
          phoneNumber: options.phoneNumber,
        }),
      });
    } catch (networkErr: any) {
      console.error('[FRONTEND NETWORK ERROR]:', networkErr);
      options.onFailure('Backend server unreachable on port 5000.');
      return;
    }

    const orderText = await orderRes.text();
    let orderData: any;
    try {
      orderData = JSON.parse(orderText);
    } catch (jsonErr) {
      console.error('[FRONTEND JSON PARSE ERROR]:', orderText);
      options.onFailure(`Server error (${orderRes.status}): Invalid response from backend.`);
      return;
    }

    console.log('[FRONTEND DEBUG ORDER DATA]:', orderData);

    if (!orderRes.ok || !orderData.success) {
      options.onFailure(orderData.message || 'Failed to generate Razorpay order.');
      return;
    }

    if (!orderData.orderId) {
      console.error('[FRONTEND ERROR] Missing orderId in response:', orderData);
      options.onFailure('Invalid response: Missing Razorpay Order ID from backend.');
      return;
    }

    // Helper to trigger payment signature verification on server
    const triggerBackendVerification = async (paymentId: string, orderId: string, signature: string) => {
      const verifyUrl = getApiEndpoint('/api/payment/verify-payment');
      const verifyRes = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          bookingDetails: {
            productName: options.productName,
            productId: options.productId,
            amount: orderData.breakdown?.baseAmount || options.amount,
            gst: orderData.breakdown?.gst || Math.round(options.amount * 0.18),
            discount: options.discount || 0,
            finalAmount: orderData.breakdown?.finalAmount || options.amount,
            userId: options.userId,
            customerName: options.customerName,
            phoneNumber: options.phoneNumber,
            email: options.email,
            address: options.address,
            bookingDate: options.bookingDate,
            bookingTime: options.bookingTime,
          },
        }),
      });

      const verifyText = await verifyRes.text();
      let verifyData: any;
      try {
        verifyData = JSON.parse(verifyText);
      } catch (jsonErr) {
        options.onFailure(`Server error (${verifyRes.status}) during payment verification.`);
        return;
      }

      console.log('[FRONTEND DEBUG VERIFY DATA]:', verifyData);

      if (verifyRes.ok && verifyData.success) {
        options.onSuccess(verifyData);
      } else {
        options.onFailure(verifyData.message || 'Payment Verification Failed: Signature mismatch.');
      }
    };

    // 3. Initialize Razorpay Checkout Modal
    const razorpayOptions: any = {
      key: orderData.keyId,
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: 'HomeSeva Services & Store',
      description: `Payment for ${options.productName}`,
      order_id: orderData.orderId,
      prefill: {
        name: options.customerName,
        email: options.email,
        contact: options.phoneNumber,
      },
      theme: {
        color: '#4F46E5',
      },
      ...(options.showAllMethods
        ? {}
        : {
            config: {
              display: {
                blocks: {
                  upi_qr: {
                    name: 'Scan QR Code or Pay via UPI (GPay, PhonePe, Paytm)',
                    instruments: [{ method: 'upi' }, { method: 'qr' }],
                  },
                },
                sequence: ['block.upi_qr'],
                preferences: { show_default_blocks: false },
              },
            },
          }),
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        console.log('[FRONTEND DEBUG RAZORPAY RESPONSE]:', response);
        await triggerBackendVerification(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
      modal: {
        ondismiss: function () {
          options.onFailure('CANCELLED_BY_USER: Payment was cancelled by customer.');
        },
      },
    };

    console.log('[FRONTEND DEBUG CHECKOUT OPTIONS]:', razorpayOptions);

    const rzp = new window.Razorpay(razorpayOptions);
    rzp.on('payment.failed', function (response: any) {
      console.error('[FRONTEND RAZORPAY PAYMENT FAILED EVENT]:', response);
      options.onFailure(`Payment Failed: ${response.error?.description || 'Transaction unsuccessful'}`);
    });

    rzp.open();
  } catch (err: any) {
    console.error('[FRONTEND PROCESS PAYMENT EXCEPTION]:', err);
    options.onFailure(err.message || 'An error occurred initializing payment.');
  }
};
