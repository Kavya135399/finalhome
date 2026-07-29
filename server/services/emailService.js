import { createTransporter } from '../config/mailer.js';
import { generateInvoicePDF } from './invoiceService.js';

export const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    const pdfBuffer = await generateInvoicePDF(bookingData);
    const transporter = createTransporter();

    const fromEmail = process.env.EMAIL_FROM || 'HomeSeva Payments <noreply@homeseva.com>';
    const mailOptions = {
      from: fromEmail,
      to: bookingData.email,
      subject: `Booking Confirmed & Tax Invoice - ${bookingData.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; borderRadius: 8px; overflow: hidden;">
          <div style="background-color: #4F46E5; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
            <p style="margin-top: 8px; opacity: 0.9;">Thank you for your payment with HomeSeva</p>
          </div>

          <div style="padding: 24px; color: #374151; background-color: #ffffff;">
            <p>Dear <strong>${bookingData.customerName}</strong>,</p>
            <p>Your payment via Razorpay UPI was <strong>VERIFIED & SUCCESSFUL</strong>. Here are your booking details:</p>
            
            <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; font-size: 14px; line-height: 1.6;">
                <tr><td><strong>Booking ID:</strong></td><td>${bookingData.bookingId}</td></tr>
                <tr><td><strong>Invoice #:</strong></td><td>${bookingData.invoiceNumber}</td></tr>
                <tr><td><strong>Service Name:</strong></td><td>${bookingData.productName}</td></tr>
                <tr><td><strong>Date & Time:</strong></td><td>${bookingData.bookingDate} at ${bookingData.bookingTime}</td></tr>
                <tr><td><strong>Total Amount Paid:</strong></td><td><strong style="color: #059669;">₹${bookingData.finalAmount}</strong></td></tr>
                <tr><td><strong>Payment Method:</strong></td><td>Razorpay UPI (${bookingData.paymentMethod})</td></tr>
                <tr><td><strong>Payment ID:</strong></td><td>${bookingData.razorpayPaymentId}</td></tr>
              </table>
            </div>

            <p>Your official tax invoice PDF has been generated and attached to this email.</p>
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">
              <p>Need support? Contact us at <a href="mailto:support@homeseva.com" style="color: #4F46E5;">support@homeseva.com</a> or call +91 98765 43210.</p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${bookingData.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Confirmation email sent to ${bookingData.email} (Msg ID: ${result.messageId})`);
    return true;
  } catch (error) {
    console.error('[Email Service Error]:', error.message);
    return false;
  }
};
