/**
 * Responsive HTML Email Templates for HomeSeva
 */

const primaryColor = '#4F46E5';
const secondaryColor = '#059669';
const dangerColor = '#DC2626';
const darkColor = '#1F2937';
const lightBg = '#F9FAFB';

const emailWrapper = (title, headerColor, contentHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #F3F4F6; color: ${darkColor};">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F3F4F6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin: 20px auto;">
          <!-- Header -->
          <tr>
            <td style="background: ${headerColor}; padding: 30px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; tracking: -0.5px;">HomeSeva</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 15px;">${title}</p>
            </td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px; background-color: #ffffff;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: ${lightBg}; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 13px; color: #6B7280;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: ${darkColor};">HomeSeva Services Pvt Ltd</p>
              <p style="margin: 0 0 12px 0;">Need assistance? Contact us at <a href="mailto:bhalepadharya.app@gmail.com" style="color: ${primaryColor}; text-decoration: none;">bhalepadharya.app@gmail.com</a> or +91 98765 43210.</p>
              <p style="margin: 0; font-size: 11px; color: #9CA3AF;">© 2026 HomeSeva. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const renderOrderSummaryTable = (data) => `
<div style="background-color: ${lightBg}; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
  <h3 style="margin: 0 0 14px 0; font-size: 16px; color: ${darkColor}; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Order Details</h3>
  <table role="presentation" style="width: 100%; font-size: 14px; line-height: 1.7; border-collapse: collapse;">
    <tr><td style="color: #6B7280; width: 140px;">Order ID:</td><td><strong style="color: ${primaryColor};">${data.bookingId || data.orderId || 'N/A'}</strong></td></tr>
    <tr><td style="color: #6B7280;">Customer Name:</td><td><strong>${data.customerName || 'Customer'}</strong></td></tr>
    <tr><td style="color: #6B7280;">Item / Service:</td><td><strong>${data.productName || data.serviceName || 'Home Service'}</strong></td></tr>
    <tr><td style="color: #6B7280;">Quantity:</td><td>${data.quantity || 1}</td></tr>
    <tr><td style="color: #6B7280;">Total Amount:</td><td><strong style="color: ${secondaryColor}; font-size: 16px;">₹${(data.finalAmount || data.amount || 0).toLocaleString('en-IN')}</strong></td></tr>
    <tr><td style="color: #6B7280;">Payment Method:</td><td>${data.paymentMethod || 'Online Payment'}</td></tr>
    <tr><td style="color: #6B7280;">Order Status:</td><td><span style="display: inline-block; background-color: #EEF2FF; color: ${primaryColor}; padding: 3px 10px; border-radius: 20px; font-weight: 600; font-size: 12px;">${(data.status || 'Confirmed').toUpperCase()}</span></td></tr>
    <tr><td style="color: #6B7280; vertical-align: top;">Delivery Address:</td><td>${data.address?.fullAddress || data.address?.street || data.address || 'Standard Address'}</td></tr>
  </table>
</div>
`;

export const getTemplateHtml = (templateName, data = {}) => {
  const apiUrl = process.env.API_URL || 'http://localhost:5000';
  const downloadInvoiceUrl = `${apiUrl}/api/bookings/${data.bookingId || data.orderId || 'inv'}/invoice`;
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  switch (templateName) {
    // 📦 ORDER NOTIFICATIONS
    case 'order_placed':
      return emailWrapper('Order Placed Successfully', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Order Received! 📦</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>Thank you for choosing HomeSeva. We have received your order and are currently processing it.</p>
        ${renderOrderSummaryTable(data)}
        <p style="color: #6B7280; font-size: 14px;">We will notify you as soon as your order status changes.</p>
      `);

    case 'order_confirmed':
      return emailWrapper('Order Confirmed', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Order Confirmed & Invoice Attached! ✅</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>Great news! Your order <strong>${data.bookingId || data.orderId}</strong> has been officially confirmed and scheduled.</p>
        ${renderOrderSummaryTable(data)}
        <p>Your official tax invoice PDF is attached to this email.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${downloadInvoiceUrl}" target="_blank" style="background-color: ${primaryColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">📄 Download Official PDF Invoice</a>
        </div>
      `);

    case 'order_packed':
      return emailWrapper('Order Packed', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Your Order is Packed! 🎁</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>Your items have been carefully packed and are ready for dispatch.</p>
        ${renderOrderSummaryTable(data)}
      `);

    case 'order_shipped':
      return emailWrapper('Order Shipped', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Your Order is On the Way! 🚚</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>Your order has been shipped and is heading towards your location.</p>
        ${renderOrderSummaryTable(data)}
        ${data.trackingNumber ? `<p style="background-color: #EEF2FF; padding: 12px; border-radius: 6px; color: ${primaryColor}; font-weight: 600;">Tracking ID: ${data.trackingNumber}</p>` : ''}
      `);

    case 'out_for_delivery':
      return emailWrapper('Out For Delivery', secondaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Out for Delivery Today! 🛵</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>Our service partner / agent is out for delivery and will arrive shortly.</p>
        ${renderOrderSummaryTable(data)}
      `);

    case 'delivered':
      return emailWrapper('Order Delivered', secondaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Order Successfully Delivered! 🎉</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>Your order has been delivered successfully. Thank you for booking with HomeSeva!</p>
        ${renderOrderSummaryTable(data)}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadInvoiceUrl}" target="_blank" style="background-color: ${primaryColor}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">📄 Download Invoice</a>
          <a href="${appUrl}/services" target="_blank" style="background-color: ${secondaryColor}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">⭐ Rate & Review Service</a>
        </div>
      `);

    case 'order_cancelled':
      return emailWrapper('Order Cancelled', dangerColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Order Cancellation Notice ❌</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>Your order <strong>${data.bookingId || data.orderId}</strong> has been cancelled.</p>
        <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; color: ${dangerColor}; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <strong>Reason:</strong> ${data.reason || 'Requested by customer or operational constraints'}
        </div>
        ${renderOrderSummaryTable(data)}
        <p>If payment was deducted, a full refund will be initiated to your original payment method within 3-5 business days.</p>
      `);

    case 'payment_failed':
      return emailWrapper('Payment Failed', dangerColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Payment Execution Failed ⚠️</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>We were unable to process your payment for order <strong>${data.bookingId || data.orderId}</strong>.</p>
        <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; color: ${dangerColor}; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <strong>Error Details:</strong> ${data.errorMessage || 'Transaction declined by bank or UPI gateway timeout'}
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/checkout" target="_blank" style="background-color: ${dangerColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">🔄 Retry Payment Now</a>
        </div>
      `);

    case 'refund_initiated':
      return emailWrapper('Refund Initiated', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Refund Initiated 🔄</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>We have initiated a refund of <strong style="color: ${secondaryColor}; font-size: 16px;">₹${(data.refundAmount || data.amount || 0).toLocaleString('en-IN')}</strong> for order <strong>${data.bookingId || data.orderId}</strong>.</p>
        <p style="color: #6B7280;">Refund Reference ID: <strong>${data.refundId || 'REF-' + Date.now()}</strong></p>
        <p>The amount should reflect in your source account within 3 to 5 business days.</p>
      `);

    case 'refund_completed':
      return emailWrapper('Refund Completed', secondaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Refund Completed Successfully 💰</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>Your refund of <strong style="color: ${secondaryColor}; font-size: 16px;">₹${(data.refundAmount || data.amount || 0).toLocaleString('en-IN')}</strong> for order <strong>${data.bookingId || data.orderId}</strong> has been credited.</p>
        <p style="color: #6B7280;">Transaction ID: <strong>${data.transactionId || 'TXN-' + Date.now()}</strong></p>
      `);

    // 🔔 CUSTOMER & OTP NOTIFICATIONS
    case 'welcome':
      return emailWrapper('Welcome to HomeSeva!', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Welcome to the HomeSeva Family! 👋</h2>
        <p>Dear <strong>${data.name || 'User'}</strong>,</p>
        <p>Your email address has been verified successfully. We are excited to have you on board! HomeSeva provides top-quality home services, instant booking, and seamless store deliveries right to your doorstep.</p>
        <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #C7D2FE;">
          <h4 style="margin: 0 0 8px 0; color: ${primaryColor};">What you can do with HomeSeva:</h4>
          <ul style="margin: 0; padding-left: 20px; color: ${darkColor}; line-height: 1.8;">
            <li>Book expert cleaning, plumbing, & electric services</li>
            <li>Shop home essentials & electronics from our store</li>
            <li>Track live order status & download instant GST invoices</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}" target="_blank" style="background-color: ${primaryColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Explore HomeSeva Services</a>
        </div>
      `);

    case 'verify_email':
    case 'resend_otp':
      return emailWrapper('Verify Your Email Address', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Verify Your Email Account 🔒</h2>
        <p>Dear <strong>${data.name || 'User'}</strong>,</p>
        <p>Please use the 6-digit verification code below to verify your HomeSeva account email:</p>
        <div style="text-align: center; margin: 25px 0;">
          <div style="display: inline-block; background-color: #F3F4F6; border: 2px dashed ${primaryColor}; padding: 15px 30px; font-size: 32px; font-weight: 800; color: ${primaryColor}; letter-spacing: 6px; border-radius: 10px;">
            ${data.otp || '592814'}
          </div>
        </div>
        <p style="color: #6B7280; font-size: 13px; text-align: center;">This OTP is valid for <strong>10 minutes</strong>. Maximum 5 attempts allowed.</p>
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
      `);

    case 'forgot_password_otp':
    case 'password_reset':
      return emailWrapper('Reset Your Password', dangerColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Password Reset Verification OTP 🔑</h2>
        <p>Dear <strong>${data.name || 'User'}</strong>,</p>
        <p>We received a request to reset your password. Use the 6-digit verification OTP code below:</p>
        <div style="text-align: center; margin: 25px 0;">
          <div style="display: inline-block; background-color: #FEF2F2; border: 2px dashed ${dangerColor}; padding: 15px 30px; font-size: 32px; font-weight: 800; color: ${dangerColor}; letter-spacing: 6px; border-radius: 10px;">
            ${data.otp || '901234'}
          </div>
        </div>
        <p style="color: #6B7280; font-size: 13px; text-align: center;">This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
      `);

    case 'password_changed':
      return emailWrapper('Security Alert: Password Changed', secondaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Password Changed Successfully 🛡️</h2>
        <p>Dear <strong>${data.name || 'User'}</strong>,</p>
        <p>Your HomeSeva account password was updated successfully on <strong>${new Date().toLocaleString()}</strong>.</p>
        <p style="color: #6B7280;">If you did not make this change, please immediately contact our support team at bhalepadharya.app@gmail.com.</p>
      `);

    case 'profile_updated':
      return emailWrapper('Security Alert: Profile Updated', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Profile Information Updated 🛡️</h2>
        <p>Dear <strong>${data.name || 'User'}</strong>,</p>
        <p>Your HomeSeva profile details were updated on <strong>${new Date().toLocaleString()}</strong>.</p>
        <p style="color: #6B7280;">If you did not make this change, please contact bhalepadharya.app@gmail.com.</p>
      `);

    case 'address_changed':
      return emailWrapper('Security Alert: Address Updated', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Address Book Updated 🏠</h2>
        <p>Dear <strong>${data.name || 'User'}</strong>,</p>
        <p>A new address was added or modified in your HomeSeva account.</p>
        <p><strong>Address:</strong> ${data.address || 'New address registered'}</p>
      `);

    // 🎁 MARKETING & OFFERS
    case 'offer_announcement':
      return emailWrapper(data.subject || 'Special Festival Offer from HomeSeva!', primaryColor, `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${data.bannerUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80'}" alt="Offer Banner" style="width: 100%; max-height: 240px; object-fit: cover; border-radius: 8px;" />
        </div>
        <h2 style="color: ${darkColor}; margin-top: 0; text-align: center;">${data.title || '🎉 Mega Sale & Discounts!'}</h2>
        <p>${data.description || 'Enjoy exclusive discounts across all home cleaning, repairing, and store products this week.'}</p>
        
        <div style="background-color: #FEF3C7; border: 2px dashed #F59E0B; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">USE COUPON CODE</p>
          <h2 style="margin: 8px 0; color: #B45309; font-size: 32px; font-weight: 900; letter-spacing: 3px;">${data.couponCode || 'FESTIVE25'}</h2>
          <p style="margin: 0; color: #92400E; font-size: 13px;">Valid until <strong>${data.expiryDate || 'Limited Period'}</strong></p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/store" target="_blank" style="background-color: ${secondaryColor}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">🛍️ Shop Now & Save Big</a>
        </div>
      `);

    // 📢 ADMIN ALERTS
    case 'admin_alert':
      return emailWrapper(`[ADMIN ALERT] ${data.alertTitle || 'System Notification'}`, dangerColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Admin Alert Notice 📢</h2>
        <div style="background-color: #F3F4F6; border-left: 4px solid ${dangerColor}; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 6px 0; color: ${darkColor};">${data.alertTitle}</h3>
          <p style="margin: 0; color: #4B5563; font-size: 14px;">${data.alertDetails}</p>
        </div>
        <p style="font-size: 13px; color: #6B7280;">Timestamp: ${new Date().toLocaleString()}</p>
      `);

    // ⭐ REVIEW REQUEST
    case 'review_request':
      return emailWrapper('Rate Your Service Experience', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">How was your HomeSeva service? ⭐</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>We hope you loved your experience with <strong>${data.serviceName || 'HomeSeva Service'}</strong>!</p>
        <p>Your feedback helps us continuously improve our quality.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/services" target="_blank" style="background-color: ${primaryColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">⭐ Rate & Write a Review</a>
        </div>
      `);

    // 📅 REMINDERS
    case 'cart_reminder':
      return emailWrapper('Items Left in Your Cart 🛒', primaryColor, `
        <h2 style="color: ${darkColor}; margin-top: 0;">Did you forget something?</h2>
        <p>Dear <strong>${data.customerName || 'Customer'}</strong>,</p>
        <p>You left items in your cart. Complete your order now before stock runs out!</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/cart" target="_blank" style="background-color: ${secondaryColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View Cart & Checkout</a>
        </div>
      `);

    default:
      return emailWrapper('HomeSeva Notification', primaryColor, `
        <h2>HomeSeva Update</h2>
        <p>${data.message || 'Thank you for using HomeSeva.'}</p>
      `);
  }
};
