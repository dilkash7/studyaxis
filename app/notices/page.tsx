'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { Bell, Clock, Pin, AlertTriangle } from 'lucide-react';

const CAT_COLORS: Record<string, string> = {
  General: 'bg-gray-100 text-gray-700', Admission: 'bg-green-100 text-green-700',
  Exam: 'bg-purple-100 text-purple-700', Result: 'bg-blue-100 text-blue-700',
  Event: 'bg-pink-100 text-pink-700', Holiday: 'bg-yellow-100 text-yellow-700',
  Urgent: 'bg-red-100 text-red-700',
};

export default function PublicNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notices').then(r => r.json()).then(data => {
      setNotices(data.filter((n: any) => n.isActive));
    });
  }, []);

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bell size={24} className="text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-800">Notice Board</h1>
          </div>
          <p className="text-gray-500">Important announcements and updates</p>
        </div>

        <div className="space-y-4">
          {notices.map(n => (
            <div key={n._id} className={`bg-white rounded-2xl shadow-sm border p-5 transition hover:shadow-md ${n.pinned ? 'border-yellow-300 bg-yellow-50/20' : 'border-gray-100'} ${n.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="flex items-start gap-3">
                {n.pinned && <Pin size={14} className="text-yellow-500 mt-1 shrink-0" />}
                {n.priority === 'urgent' && <AlertTriangle size={14} className="text-red-500 mt-1 shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="font-bold text-gray-800">{n.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[n.category] || CAT_COLORS.General}`}>{n.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{n.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={10} />{new Date(n.publishDate || n.createdAt).toLocaleDateString()}</span>
                    {n.collegeName && <span>🏫 {n.collegeName}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {notices.length === 0 && <p className="text-center text-gray-400 py-10">No notices at the moment.</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
