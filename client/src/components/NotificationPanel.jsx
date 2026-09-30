import React, { useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Clock, AlertCircle, ShoppingBag, CheckCircle } from 'lucide-react';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'RESERVATION_CREATED':
      case 'RESERVATION_CONFIRMED':
        return <ShoppingBag className="w-4 h-4 text-teal-600" />;
      case 'RESERVATION_PICKED_UP':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fadeIn"
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-teal-600" />
          <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center space-x-1"
          >
            <Check className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`p-3.5 flex items-start space-x-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                !n.isRead ? 'bg-teal-50/30' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-800 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 flex items-center space-x-0.5 ml-2">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTime(n.createdAt)}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
