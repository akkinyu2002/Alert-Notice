import { useEffect, useRef, useState } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { playAlertSound } from '../utils/sound';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const previousUnreadRef = useRef(null);

  const fetchNotifications = () => {
    getNotifications()
      .then((r) => {
        const nextUnreadCount = r.data.unreadCount || 0;
        if (
          previousUnreadRef.current !== null &&
          nextUnreadCount > previousUnreadRef.current
        ) {
          playAlertSound('notification');
        }
        previousUnreadRef.current = nextUnreadCount;
        setNotifications(r.data.notifications);
        setUnreadCount(nextUnreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  };

  if (loading) return <div className="page-container text-center text-slate-600 py-20">Loading...</div>;

  return (
    <div className="page-container max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="section-title mb-0">Notifications</h1>
          {unreadCount > 0 && <span className="badge bg-danger-500 text-white border-none">{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm font-semibold link-accent">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && <div className="glass-card p-12 text-center text-slate-600">No notifications yet.</div>}

      <div className="space-y-2">
        {notifications.map((notif, i) => (
          <div
            key={notif.id}
            onClick={() => !notif.read && handleMarkRead(notif.id)}
            className={`glass-card p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 animate-fade-in ${
              !notif.read ? 'border-l-4 border-l-primary-500 bg-[#edf8f3]' : 'opacity-80 hover:opacity-100'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 font-medium">{notif.title}</p>
              <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
              <p className="text-xs text-slate-500 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
            </div>
            {!notif.read && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

