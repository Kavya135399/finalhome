import express from 'express';
import {
  getCustomerBookings,
  getBookingDetails,
  downloadInvoice,
  cancelBooking,
} from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-orders', authenticateToken, getCustomerBookings);
router.get('/:id', authenticateToken, getBookingDetails);
router.get('/:id/invoice', downloadInvoice);
router.post('/:id/cancel', authenticateToken, cancelBooking);

export default router;
