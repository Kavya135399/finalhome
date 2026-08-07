import { createTransporter, getFromEmail } from '../config/mailer.js';
import { generateInvoicePDF } from './invoiceService.js';
import { getTemplateHtml } from './emailTemplates.js';

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
 * Core Mail Dispatcher with Step-by-Step Logging
 */
export const dispatchEmail = async ({ to, subject, html, text, attachments = [] }) => {
  console.log(`\n==========================================`);
  console.log(`[EMAIL STEP 1] Preparing email dispatch...`);
  console.log(`[EMAIL STEP 1] Recipient: ${to}`);
  console.log(`[EMAIL STEP 1] Subject: ${subject}`);
  
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
        'X-Mailer': 'Bhale Padharya Mailer v1.0',
      },
      attachments,
    };

    console.log(`[EMAIL STEP 2] Sending email via SMTP Transporter...`);
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`[EMAIL STEP 3 SUCCESS] Email Sent Successfully!`);
    console.log(`[EMAIL STEP 3 SUCCESS] Message ID: ${result.messageId}`);
    console.log(`==========================================\n`);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`[EMAIL STEP 3 ERROR] Email Sending Failed to ${to}:`, error.message);
    console.log(`==========================================\n`);
    return { success: false, error: error.message };
  }
};

/**
 * Order Notifications
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

  if (['order_confirmed', 'order_placed', 'delivered'].includes(templateKey)) {
    try {
      const pdfBuffer = await generateInvoicePDF(orderData);
      attachments.push({
        filename: `Invoice_${orderData.invoiceNumber || orderData.bookingId || 'BhalePadharya'}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    } catch (err) {
      console.error('[Invoice Generation Attachment Error]:', err.message);
    }
  }

  return await dispatchEmail({
    to: recipient,
    subject: subjects[templateKey] || `Bhale Padharya Order Update - ${orderData.bookingId || 'Notification'}`,
    html,
    attachments,
  });
};

export const sendBookingConfirmationEmail = async (bookingData) => {
  const result = await sendOrderNotification('order_confirmed', bookingData);
  
  // Also send order details notification to admin (bhalepadharya.app@gmail.com)
  try {
    const adminEmail = getAdminEmail();
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: bold;">✅ New Order Confirmed</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.95);">Client booking has been confirmed & invoice sent.</p>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;">
          <p style="font-size: 15px; margin-top: 0;">Hello Admin,</p>
          <p>A new service order has been successfully paid and confirmed. Here are the details:</p>
          
          <div style="background-color: #f8fafc; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Booking ID:</strong> <span style="color: #2563EB; font-weight: bold;">#${bookingData.bookingId || bookingData.orderId || 'N/A'}</span></p>
            <p style="margin: 4px 0;"><strong>Client Name:</strong> ${bookingData.customerName || 'Customer'}</p>
            <p style="margin: 4px 0;"><strong>Client Email:</strong> ${bookingData.email || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Client Phone:</strong> ${bookingData.phoneNumber || bookingData.phone || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Product / Service:</strong> ${bookingData.productName || 'Home Service'}</p>
            <p style="margin: 4px 0;"><strong>Quantity:</strong> ${bookingData.quantity || 1}</p>
            <p style="margin: 4px 0;"><strong>Amount Paid:</strong> ₹${(bookingData.finalAmount || bookingData.amount || 0).toLocaleString('en-IN')}</p>
            <p style="margin: 4px 0;"><strong>Scheduled Date:</strong> ${bookingData.bookingDate || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Scheduled Time:</strong> ${bookingData.bookingTime || 'N/A'}</p>
            <p style="margin: 4px 0; line-height: 1.4;"><strong>Address:</strong> ${bookingData.address?.fullAddress || bookingData.address?.street || bookingData.address || 'N/A'}</p>
          </div>
          
          <p>This is a copy generated automatically for your reference. Please configure support/specialist assignment details in your admin workspace.</p>
          <p style="margin-top: 24px; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9; padding-top: 16px;">Regards,<br/><strong>Bhale Padharya Notification Service</strong></p>
        </div>
      </div>
    `;

    await dispatchEmail({
      to: adminEmail,
      subject: `🔔 [New Confirmed Order] #${bookingData.bookingId || 'N/A'} - ${bookingData.customerName || 'Customer'}`,
      html: adminHtml,
    });
    console.log(`[EMAIL Admin Notification] Successfully sent order confirmation copy to admin: ${adminEmail}`);
  } catch (err) {
    console.error('[EMAIL Admin Notification Error]:', err.message);
  }

  return result;
};

/**
 * Customer Account Notifications (Welcome, OTP, Password Reset)
 */
export const sendCustomerAccountNotification = async (templateKey, userData) => {
  const recipient = userData.email;
  if (!recipient) return false;

  const subjects = {
    welcome: 'Welcome to Bhale Padharya',
    verify_email: 'Verify your Bhale Padharya email address',
    resend_otp: 'Your Bhale Padharya verification code',
    forgot_password: 'Reset your Bhale Padharya password',
    forgot_password_otp: 'Your Bhale Padharya password reset code',
    password_changed: 'Security Alert: Password Changed Successfully',
    profile_updated: 'Security Alert: Profile Details Updated',
    address_changed: 'Security Alert: Address Book Updated',
  };

  const html = getTemplateHtml(templateKey, userData);
  const plainText = templateKey === 'verify_email' || templateKey === 'resend_otp'
    ? `Hello ${userData.name || 'User'},\n\nYour 6-digit verification code for Bhale Padharya is: ${userData.otp}\n\nThis OTP is valid for 10 minutes. If you did not request this code, please ignore this email.\n\nRegards,\nBhale Padharya Team`
    : templateKey === 'forgot_password_otp'
    ? `Hello ${userData.name || 'User'},\n\nYour password reset code for Bhale Padharya is: ${userData.otp}\n\nThis OTP is valid for 10 minutes. Do not share this code with anyone.\n\nRegards,\nBhale Padharya Team`
    : stripHtmlToText(html);

  return await dispatchEmail({
    to: recipient,
    subject: subjects[templateKey] || 'Bhale Padharya Account Security Update',
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
    subject: subjects[templateKey] || 'Bhale Padharya Payment Update',
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

  const subject = promoData.subject || promoData.title || '🎁 Special Offer from Bhale Padharya!';
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
 * Admin Notifications
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

export const sendReviewRequestEmail = async (orderData) => {
  const recipient = orderData.email;
  if (!recipient) return false;

  const html = getTemplateHtml('review_request', orderData);
  return await dispatchEmail({
    to: recipient,
    subject: `⭐ How was your service? Rate your experience with Bhale Padharya`,
    html,
  });
};

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
    subject: subjects[templateKey] || 'Bhale Padharya Reminder',
    html,
  });
};

/**
 * Catering Feature Notifications
 */
export const sendCateringCustomerEmail = async (requestData) => {
  const recipient = requestData.email;
  if (!recipient) return false;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #2563EB; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🍽️ Catering Request Received</h1>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p style="font-size: 16px;">Hello <strong>${requestData.user_name || requestData.customer_name}</strong>,</p>
        <p>Thank you for submitting your catering request with Bhale Padharya! We have received your inquiry and our food curation team is reviewing it.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Request ID:</strong> #${requestData.id}</p>
          <p style="margin: 4px 0;"><strong>Package:</strong> ${requestData.package_title || 'Custom Catering Request'}</p>
          <p style="margin: 4px 0;"><strong>Event Date:</strong> ${requestData.event_date} ${requestData.event_time || ''}</p>
          <p style="margin: 4px 0;"><strong>Guest Count:</strong> ${requestData.guest_count || requestData.guests} Guests</p>
          <p style="margin: 4px 0;"><strong>Estimated Price:</strong> ₹${requestData.total_estimated_price || requestData.estimated_price || 0}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">PENDING (Under Review)</span></p>
        </div>
        <p>Our team will reach out to you at <strong>${requestData.contact_phone || requestData.phone}</strong> shortly to discuss the menu, customization, and confirmed quotations.</p>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">Best regards,<br/>Bhale Padharya Catering Team</p>
      </div>
    </div>
  `;

  return await dispatchEmail({
    to: recipient,
    subject: `🍽️ Catering Request Received - #${requestData.id} | Bhale Padharya`,
    html,
  });
};

export const sendCateringAdminEmail = async (requestData) => {
  const adminEmail = getAdminEmail();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">🚨 New Catering Request Received</h2>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p>A new catering booking has just been submitted on Bhale Padharya:</p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>ID:</strong> #${requestData.id}</p>
          <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${requestData.user_name || requestData.customer_name}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${requestData.email}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> ${requestData.contact_phone || requestData.phone}</p>
          <p style="margin: 4px 0;"><strong>Package:</strong> ${requestData.package_title}</p>
          <p style="margin: 4px 0;"><strong>Event Type:</strong> ${requestData.event_type || 'General'}</p>
          <p style="margin: 4px 0;"><strong>Event Date:</strong> ${requestData.event_date} ${requestData.event_time || ''}</p>
          <p style="margin: 4px 0;"><strong>Guests:</strong> ${requestData.guest_count || requestData.guests}</p>
          <p style="margin: 4px 0;"><strong>Location/Address:</strong> ${requestData.location || ''} ${requestData.address || ''}</p>
          <p style="margin: 4px 0;"><strong>Food Preference:</strong> ${requestData.food_preference || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Estimated Amount:</strong> ₹${requestData.total_estimated_price || requestData.estimated_price || 0}</p>
          <p style="margin: 4px 0;"><strong>Special Notes:</strong> ${requestData.special_notes || requestData.special_requirements || 'None'}</p>
        </div>
        <p>Please review and follow up with the customer via the Admin Dashboard.</p>
      </div>
    </div>
  `;

  return await dispatchEmail({
    to: adminEmail,
    subject: `🚨 [New Catering Inquiry] #${requestData.id} (${requestData.guest_count} Pax) - ${requestData.user_name}`,
    html,
  });
};

export const sendCateringStatusEmail = async (requestData, newStatus) => {
  const recipient = requestData.email;
  if (!recipient) return false;

  const statusColor = newStatus === 'CONFIRMED' ? '#10B981' : newStatus === 'COMPLETED' ? '#8B5CF6' : newStatus === 'REJECTED' ? '#EF4444' : '#3B82F6';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${statusColor}; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">Catering Status Updated: ${newStatus}</h1>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p>Hello <strong>${requestData.user_name || requestData.customer_name}</strong>,</p>
        <p>Your catering request <strong>#${requestData.id}</strong> for <strong>${requestData.package_title}</strong> has been updated to:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="background-color: #f1f5f9; color: ${statusColor}; font-weight: bold; font-size: 18px; padding: 12px 24px; border-radius: 999px; border: 2px solid ${statusColor}; display: inline-block;">
            ${newStatus}
          </span>
        </div>
        ${requestData.admin_notes ? `<p style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px;"><strong>Message from Team:</strong> ${requestData.admin_notes}</p>` : ''}
        <p>If you have any questions or require modifications, please reply to this email or contact us at our customer service line.</p>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">Thank you for choosing Bhale Padharya!</p>
      </div>
    </div>
  `;

  return await dispatchEmail({
    to: recipient,
    subject: `✨ Catering Order #${requestData.id} Status: ${newStatus} | Bhale Padharya`,
    html,
  });
};

