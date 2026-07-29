import { Booking } from '../models/Booking.js';
import { fallbackBookings } from './paymentController.js';

export const getDashboardStats = async (req, res) => {
  try {
    let allBookings = [];
    try {
      allBookings = await Booking.find({}).sort({ createdAt: -1 });
    } catch (err) {
      allBookings = fallbackBookings;
    }

    if (allBookings.length === 0) {
      allBookings = fallbackBookings;
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const monthStr = now.toISOString().slice(0, 7);

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let confirmedOrders = 0;

    const customerSet = new Set();

    allBookings.forEach((item) => {
      if (item.email) customerSet.add(item.email.toLowerCase());
      
      const isPaid = item.paymentStatus === 'Paid';
      const itemDateStr = new Date(item.createdAt || Date.now()).toISOString().slice(0, 10);
      const itemMonthStr = new Date(item.createdAt || Date.now()).toISOString().slice(0, 7);

      if (isPaid) {
        totalRevenue += item.finalAmount || 0;
        if (itemDateStr === todayStr) {
          todayRevenue += item.finalAmount || 0;
        }
        if (itemMonthStr === monthStr) {
          monthlyRevenue += item.finalAmount || 0;
        }
      }

      if (item.bookingStatus === 'Pending') pendingOrders++;
      else if (item.bookingStatus === 'Completed') completedOrders++;
      else if (item.bookingStatus === 'Cancelled') cancelledOrders++;
      else if (item.bookingStatus === 'Confirmed') confirmedOrders++;
    });

    const recentPayments = allBookings.slice(0, 10);

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        confirmedOrders,
        totalCustomers: customerSet.size || Math.max(1, allBookings.length),
        totalOrders: allBookings.length,
      },
      recentPayments,
    });
  } catch (error) {
    console.error('[Admin Stats Controller Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate dashboard statistics' });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { search = '', paymentStatus = '', bookingStatus = '', page = 1, limit = 20 } = req.query;

    let items = [];
    try {
      items = await Booking.find({}).sort({ createdAt: -1 });
    } catch (err) {
      items = fallbackBookings;
    }

    if (items.length === 0) {
      items = fallbackBookings;
    }

    // Apply Search Filter (Customer Name, Phone, Email, Booking ID, Payment ID, Order ID)
    let filtered = items;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          (b.customerName && b.customerName.toLowerCase().includes(q)) ||
          (b.phoneNumber && b.phoneNumber.includes(q)) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
          (b.razorpayPaymentId && b.razorpayPaymentId.toLowerCase().includes(q)) ||
          (b.razorpayOrderId && b.razorpayOrderId.toLowerCase().includes(q))
      );
    }

    // Apply Payment Status Filter
    if (paymentStatus && paymentStatus !== 'all') {
      filtered = filtered.filter((b) => b.paymentStatus?.toLowerCase() === paymentStatus.toLowerCase());
    }

    // Apply Booking Status Filter
    if (bookingStatus && bookingStatus !== 'all') {
      filtered = filtered.filter((b) => b.bookingStatus?.toLowerCase() === bookingStatus.toLowerCase());
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = filtered.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      total: filtered.length,
      page: pageNum,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
      payments: paginatedItems,
    });
  } catch (error) {
    console.error('[Admin Payments Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;

    let updated;
    try {
      const updateDoc = {};
      if (bookingStatus) updateDoc.bookingStatus = bookingStatus;
      if (paymentStatus) updateDoc.paymentStatus = paymentStatus;

      updated = await Booking.findOneAndUpdate({ bookingId: id }, updateDoc, { new: true });
    } catch (err) {
      updated = fallbackBookings.find((b) => b.bookingId === id);
      if (updated) {
        if (bookingStatus) updated.bookingStatus = bookingStatus;
        if (paymentStatus) updated.paymentStatus = paymentStatus;
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      booking: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
