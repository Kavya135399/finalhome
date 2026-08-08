import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Package, ShieldCheck, Tag, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  status?: 'unread' | 'read';
  read?: boolean;
  data?: string;
  createdAt?: string;
  time?: string;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ctx = useNotifications();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount ?? 0);
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

  const displayUnreadCount = unreadCount !== null ? unreadCount : ctx.unreadCount;
  const displayNotifications: NotificationItem[] = notifications.length > 0
    ? notifications
    : ctx.notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        status: n.read ? 'read' : 'unread',
        read: n.read,
        createdAt: n.time,
        time: n.time,
      }));

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
    } catch (err) {
      console.error(err);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, (prev || 0) - 1));
    ctx.markAsRead(id);
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
    } catch (err) {
      console.error(err);
    }
    setNotifications([]);
    setUnreadCount(0);
    ctx.markAllAsRead();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
      case 'booking':
        return <Package className="w-4 h-4 text-indigo-600" />;
      case 'payment':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'marketing':
      case 'promo':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'admin':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    if (dateStr === 'Just now' || dateStr.endsWith('ago')) return dateStr;
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return dateStr;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800 flex items-center justify-center focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${displayUnreadCount > 0 ? 'text-brand-600 dark:text-brand-400' : ''}`} />
        {displayUnreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white dark:ring-slate-900 pointer-events-none">
            {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Panel Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight">Notifications</h3>
            {displayUnreadCount > 0 && (
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
            {displayNotifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                No notifications yet
              </div>
            ) : (
              displayNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => (notif.status === 'unread' || notif.read === false) && markAsRead(notif.id)}
                  className="p-4 flex items-start gap-3 transition cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-gray-50 dark:border-slate-800/50 last:border-0"
                >
                  <div className="mt-0.5 shrink-0 flex items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-slate-800">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                        {notif.title}
                      </h4>
                      {(notif.status === 'unread' || notif.read === false) && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-1">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      {formatTimeAgo(notif.createdAt || notif.time)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
