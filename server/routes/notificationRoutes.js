import express from 'express';
import { authenticateToken } from '../middleware/securityMiddleware.js';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, '..', 'homeseva.db');

const router = express.Router();

const db = new sqlite3.Database(dbFile);

// Get all notifications for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Failed to fetch notifications:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      // Convert DB rows to camelCase for frontend
      const notifications = rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        message: row.message,
        type: row.type,
        status: row.status,
        data: row.data,
        createdAt: row.created_at
      }));

      const unreadCount = notifications.filter(n => n.status === 'unread').length;

      // If no notifications exist, let's create a welcome one so it's not empty!
      if (notifications.length === 0) {
        const welcomeId = `notif_${Date.now()}`;
        const createdAt = new Date().toISOString();
        db.run(
          'INSERT INTO notifications (id, user_id, title, message, type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [welcomeId, userId, 'Welcome to BhalePadharya!', 'Your account has been successfully set up. Explore our services and book your first request!', 'marketing', 'unread', createdAt],
          (insertErr) => {
            if (!insertErr) {
              const welcomeNotif = {
                id: welcomeId,
                userId: userId,
                title: 'Welcome to BhalePadharya!',
                message: 'Your account has been successfully set up. Explore our services and book your first request!',
                type: 'marketing',
                status: 'unread',
                createdAt: createdAt
              };
              return res.json({
                success: true,
                notifications: [welcomeNotif],
                unreadCount: 1
              });
            }
            return res.json({ success: true, notifications: [], unreadCount: 0 });
          }
        );
      } else {
        res.json({
          success: true,
          notifications,
          unreadCount
        });
      }
    }
  );
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const notifId = req.params.id;

  db.run(
    'UPDATE notifications SET status = ? WHERE id = ? AND user_id = ?',
    ['read', notifId, userId],
    function (err) {
      if (err) {
        console.error('Failed to mark notification read:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.json({ success: true });
    }
  );
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.run(
    'UPDATE notifications SET status = ? WHERE user_id = ? AND status = ?',
    ['read', userId, 'unread'],
    function (err) {
      if (err) {
        console.error('Failed to mark all read:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      res.json({ success: true });
    }
  );
});

export default router;
