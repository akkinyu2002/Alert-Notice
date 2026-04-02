import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import Icon from '../components/ui/Icon';

const typeIcons = { emergency: 'alert', blood_request: 'blood', response: 'check', system: 'bell' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    getNotifications()
      .then((r) => {
        setNotifications(r.data.notifications);
        setUnreadCount(r.data.unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
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
          <h1 className="section-title mb-0 inline-flex items-center gap-2">
            <Icon name="bell" size={22} className="text-primary-400" />
            Notifications
          </h1>
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
            <div className="w-9 h-9 rounded-lg bg-[#f7fcf9] border border-[#d3e3d9] text-slate-700 flex items-center justify-center mt-0.5">
              <Icon name={typeIcons[notif.type] || 'bell'} size={18} />
            </div>
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

