import mongoose from 'mongoose';

const paymentLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: String,
    amount: Number,
    payload: Object,
    verified: {
      type: Boolean,
      default: false,
    },
    errorDetails: String,
  },
  { timestamps: true }
);

export const PaymentLog = mongoose.models.PaymentLog || mongoose.model('PaymentLog', paymentLogSchema);
