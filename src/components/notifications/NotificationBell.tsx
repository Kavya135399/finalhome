import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Package, ShieldCheck, Tag, Info, AlertTriangle } from 'lucide-react';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  status: 'unread' | 'read';
  data?: string;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-indigo-600" />;
      case 'payment':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'marketing':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'admin':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
        title="Notifications"
      >
        <Bell className={`w-5.5 h-5.5 ${unreadCount > 0 ? 'animate-pulse text-brand-600' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Panel Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-500 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => notif.status === 'unread' && markAsRead(notif.id)}
                  className="p-5 flex items-start gap-4 transition cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-gray-50 dark:border-slate-800/50 last:border-0"
                >
                  <div className="mt-1.5 shrink-0 flex items-center justify-center w-2">
                    {notif.status === 'unread' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] mb-1">
                      {notif.title}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-snug mb-2">
                      {notif.message}
                    </p>
                    <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900">
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-500 transition">
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
