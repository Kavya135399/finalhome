import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { apiClient } from '../services/apiClient';

export interface NotificationItem {
  id: string;
  type: 'booking' | 'promo' | 'review' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', type: 'system', title: 'Welcome to HomeSeva', message: 'Complete your profile for personalized service.', time: 'Just now', read: false },
    { id: 'n2', type: 'promo', title: '20% Off Cleaning', message: 'Use code CLEAN20 on your next deep cleaning booking.', time: '1d ago', read: false }
  ]);

  const [prevBookings, setPrevBookings] = useState<any[]>([]);

  // Periodically check for bookings updates to simulate live notifications
  useEffect(() => {
    if (!user) {
      setPrevBookings([]);
      return;
    }

    const checkBookings = async () => {
      try {
        const bookings = await apiClient.getBookings({ userId: user.id, role: user.role });
        if (prevBookings.length > 0) {
          bookings.forEach((b: any) => {
            const old = prevBookings.find((ob) => ob.id === b.id);
            if (!old) {
              // New booking created
              addNotification(
                'New Order Placed',
                `Your booking #${b.id} for ${b.serviceName || 'service'} has been placed.`,
                'booking'
              );
              toast(`New Booking #${b.id} Placed!`, 'success');
            } else {
              // Compare status
              if (old.status !== b.status) {
                let title = 'Booking Status Updated';
                let message = `Booking #${b.id} status is now ${b.status}.`;
                let type: 'success' | 'info' | 'error' = 'info';

                if (b.status === 'upcoming') {
                  title = 'Booking Confirmed';
                  message = `Your booking for ${b.serviceName} has been confirmed.`;
                  type = 'success';
                } else if (b.status === 'completed') {
                  title = 'Booking Completed';
                  message = `Your booking for ${b.serviceName} is marked as completed.`;
                  type = 'success';
                } else if (b.status === 'cancelled') {
                  title = 'Booking Cancelled';
                  message = `Your booking for ${b.serviceName} has been cancelled.`;
                  type = 'error';
                }

                addNotification(title, message, 'booking');
                toast(`${title}: ${message}`, type);
              }
              
              // Compare paid status for verify/reject
              if (!old.paid && b.paid) {
                addNotification(
                  'Payment Verified',
                  `Payment for booking #${b.id} has been verified successfully.`,
                  'booking'
                );
                toast(`Payment Verified for Booking #${b.id}!`, 'success');
              } else if (old.status !== 'cancelled' && b.status === 'cancelled' && !b.paid && old.paid) {
                // If it was paid but now it's unpaid and cancelled (simulate rejection)
                addNotification(
                  'Payment Rejected',
                  `Your payment for booking #${b.id} was rejected by the admin.`,
                  'booking'
                );
                toast(`Payment Rejected for Booking #${b.id}`, 'error');
              }
            }
          });
        }
        setPrevBookings(bookings);
      } catch (err) {
        console.error('Failed to check bookings for notifications:', err);
      }
    };

    checkBookings();
    const interval = setInterval(checkBookings, 4000); // Check every 4 seconds for instant update
    return () => clearInterval(interval);
  }, [user, prevBookings]);

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'booking') => {
    const item: NotificationItem = {
      id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
