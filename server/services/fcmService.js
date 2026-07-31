/**
 * Firebase Cloud Messaging (FCM) & In-App Notification Manager
 */

export const sendPushNotification = async ({ userId, title, message, type = 'system', data = {} }) => {
  console.log(`[Push Notification] To: ${userId || 'All'} | Title: "${title}" | Message: "${message}"`);
  
  // Here FCM token payload sending can be executed if Firebase credentials are present.
  // We return notification object so callers can persist it in DB and broadcast via Socket.IO.
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || 'all',
    title,
    message,
    type,
    status: 'unread',
    data: JSON.stringify(data),
    createdAt: new Date().toISOString(),
  };
};
