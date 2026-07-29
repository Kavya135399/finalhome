import express from 'express';
import {
  getDashboardStats,
  getAllPayments,
  updateBookingStatus,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard-stats', getDashboardStats);
router.get('/payments', getAllPayments);
router.patch('/bookings/:id/status', updateBookingStatus);

export default router;
