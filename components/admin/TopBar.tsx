'use client';
import { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import axios from 'axios';

export default function TopBar({ title }: { title: string }) {
  const [adminName, setAdminName] = useState('Admin');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminName(payload.name || 'Admin');
      } catch {}
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setUnread(res.data.length);
    } catch {}
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative z-30">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setUnread(0); }}
            className="p-2 rounded-full hover:bg-gray-100 transition relative">
            <Bell size={20} className="text-gray-600" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <p className="font-bold text-gray-800 text-sm">Notifications</p>
                <button onClick={() => setShowNotifs(false)}><X size={16} className="text-gray-500" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">No notifications</div>
                ) : (
                  notifications.map((n: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 truncate">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.time)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t bg-gray-50">
                <a href="/admin/leads" className="text-xs text-green-600 font-medium hover:underline">
                  View all leads →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
            {adminName[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{adminName}</span>
        </div>
      </div>
    </div>
  );
}