import { createTransporter } from '../config/mailer.js';
import { generateInvoicePDF } from './invoiceService.js';
import { getTemplateHtml } from './emailTemplates.js';

const getFromEmail = () => process.env.EMAIL_FROM || 'HomeSeva <bhalepadharya.app@gmail.com>';
const getAdminEmail = () => process.env.ADMIN_EMAIL || 'bhalepadharya.app@gmail.com';

/**
 * Converts HTML string to clean plain text fallback for anti-spam rating
 */
const stripHtmlToText = (htmlString) => {
  if (!htmlString) return '';
  return htmlString
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Core Mail Dispatcher
 */
export const dispatchEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: getFromEmail(),
      to,
      subject,
      html,
      text: text || stripHtmlToText(html),
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'X-Mailer': 'HomeSeva Mailer v1.0',
      },
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatch Success] To: ${to} | Subject: "${subject}" | MsgID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`[Email Dispatch Failure] To: ${to} | Error:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Order Notifications (Placed, Confirmed, Shipped, Delivered, Cancelled, etc.)
 */
export const sendOrderNotification = async (templateKey, orderData) => {
  const recipient = orderData.email || orderData.customerEmail;
  if (!recipient) {
    console.error('[Email Service] No recipient email specified for order notification');
    return false;
  }

  const subjects = {
    order_placed: `Order Placed - ${orderData.bookingId || orderData.orderId}`,
    order_confirmed: `Order Confirmed & Tax Invoice - ${orderData.bookingId || orderData.orderId}`,
    order_packed: `Order Packed - ${orderData.bookingId || orderData.orderId}`,
    order_shipped: `Order Shipped - ${orderData.bookingId || orderData.orderId}`,
    out_for_delivery: `Out for Delivery - ${orderData.bookingId || orderData.orderId}`,
    delivered: `Order Delivered - ${orderData.bookingId || orderData.orderId}`,
    order_cancelled: `Order Cancelled - ${orderData.bookingId || orderData.orderId}`,
    payment_failed: `Payment Failed for Order - ${orderData.bookingId || orderData.orderId}`,
    refund_initiated: `Refund Initiated - ${orderData.bookingId || orderData.orderId}`,
    refund_completed: `Refund Completed - ${orderData.bookingId || orderData.orderId}`,
  };

  const html = getTemplateHtml(templateKey, orderData);
  const attachments = [];

  // Generate PDF Invoice attachment for confirmed or delivered orders
  if (['order_confirmed', 'delivered'].includes(templateKey)) {
    try {
      const pdfBuffer = await generateInvoicePDF(orderData);
      attachments.push({
        filename: `Invoice_${orderData.invoiceNumber || orderData.bookingId || 'HomeSeva'}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    } catch (err) {
      console.error('[Invoice Generation Attachment Error]:', err.message);
    }
  }

  return await dispatchEmail({
    to: recipient,
    subject: subjects[templateKey] || `HomeSeva Order Update - ${orderData.bookingId || 'Notification'}`,
    html,
    attachments,
  });
};

/**
 * Backwards Compatible Helper for Booking Confirmation
 */
export const sendBookingConfirmationEmail = async (bookingData) => {
  return await sendOrderNotification('order_confirmed', bookingData);
};

/**
 * Customer Account Notifications (Welcome, OTP, Password Reset, Profile Edit)
 */
export const sendCustomerAccountNotification = async (templateKey, userData) => {
  const recipient = userData.email;
  if (!recipient) return false;

  const subjects = {
    welcome: 'Welcome to HomeSeva',
    verify_email: 'Verify your HomeSeva email address',
    resend_otp: 'Your HomeSeva verification code',
    forgot_password: 'Reset your HomeSeva password',
    forgot_password_otp: 'Your HomeSeva password reset code',
    password_changed: 'Security Alert: Password Changed Successfully',
    profile_updated: 'Security Alert: Profile Details Updated',
    address_changed: 'Security Alert: Address Book Updated',
  };

  const html = getTemplateHtml(templateKey, userData);
  const plainText = templateKey === 'verify_email' || templateKey === 'resend_otp'
    ? `Hello ${userData.name || 'User'},\n\nYour 6-digit verification code for HomeSeva is: ${userData.otp}\n\nThis OTP is valid for 10 minutes. If you did not request this code, please ignore this email.\n\nRegards,\nHomeSeva Team`
    : templateKey === 'forgot_password_otp'
    ? `Hello ${userData.name || 'User'},\n\nYour password reset code for HomeSeva is: ${userData.otp}\n\nThis OTP is valid for 10 minutes. Do not share this code with anyone.\n\nRegards,\nHomeSeva Team`
    : stripHtmlToText(html);

  return await dispatchEmail({
    to: recipient,
    subject: subjects[templateKey] || 'HomeSeva Account Security Update',
    html,
    text: plainText,
  });
};

/**
 * Payment Notifications
 */
export const sendPaymentNotification = async (templateKey, paymentData) => {
  const recipient = paymentData.email;
  if (!recipient) return false;

  const subjects = {
    payment_success: `💳 Payment Successful - Order #${paymentData.bookingId || paymentData.orderId}`,
    payment_failed: `❌ Payment Failed - Order #${paymentData.bookingId || paymentData.orderId}`,
    refund_completed: `💰 Refund Credit Confirmation - Order #${paymentData.bookingId || paymentData.orderId}`,
    cod_confirmation: `📦 Cash on Delivery Confirmed - Order #${paymentData.bookingId || paymentData.orderId}`,
  };

  const html = getTemplateHtml(templateKey, paymentData);
  return await dispatchEmail({
    to: recipient,
    subject: subjects[templateKey] || 'HomeSeva Payment Update',
    html,
  });
};

/**
 * Offer & Marketing Broadcast Emails
 */
export const sendMarketingBroadcast = async (promoData, recipientList = []) => {
  if (!recipientList.length) {
    console.log('[Marketing Broadcast] No recipients provided');
    return { count: 0 };
  }

  const subject = promoData.subject || promoData.title || '🎁 Special Offer from HomeSeva!';
  const html = getTemplateHtml('offer_announcement', promoData);

  let successCount = 0;
  for (const email of recipientList) {
    const res = await dispatchEmail({ to: email, subject, html });
    if (res.success) successCount++;
  }

  console.log(`[Marketing Broadcast Completed] Sent to ${successCount}/${recipientList.length} users`);
  return { count: successCount, total: recipientList.length };
};

/**
 * Admin Notifications (New Order, Cancelled Order, Low Stock, Contact Form)
 */
export const sendAdminNotification = async (alertType, alertData) => {
  const adminEmail = getAdminEmail();
  const title = alertData.title || `Alert: ${alertType}`;
  const details = alertData.details || JSON.stringify(alertData);

  const html = getTemplateHtml('admin_alert', {
    alertTitle: title,
    alertDetails: details,
  });

  return await dispatchEmail({
    to: adminEmail,
    subject: `📢 [Admin Alert] ${title}`,
    html,
  });
};

/**
 * Review Request Email
 */
export const sendReviewRequestEmail = async (orderData) => {
  const recipient = orderData.email;
  if (!recipient) return false;

  const html = getTemplateHtml('review_request', orderData);
  return await dispatchEmail({
    to: recipient,
    subject: `⭐ How was your service? Rate your experience with HomeSeva`,
    html,
  });
};

/**
 * Reminder Emails (Cart, Wishlist, Offer Expiry)
 */
export const sendReminderEmail = async (templateKey, reminderData) => {
  const recipient = reminderData.email;
  if (!recipient) return false;

  const subjects = {
    cart_reminder: '🛒 Items are waiting in your cart!',
    wishlist_reminder: '❤️ Items on your wishlist are back in stock!',
    offer_expiring: '⏰ Your special discount coupon expires soon!',
  };

  const html = getTemplateHtml(templateKey, reminderData);
  return await dispatchEmail({
    to: recipient,
    subject: subjects[templateKey] || 'HomeSeva Reminder',
    html,
  });
};
