'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit2, Trash2, X, Star, CheckCircle, XCircle } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };
  const load = () => axios.get('/api/reviews', { headers }).then(r => setReviews(r.data));
  useEffect(() => { load(); }, []);

  const approve = async (id: string) => { await axios.put(`/api/reviews/${id}`, { isApproved: true }, { headers }); load(); };
  const reject = async (id: string) => { if (confirm('Delete this review?')) { await axios.delete(`/api/reviews/${id}`, { headers }); load(); } };

  const filtered = reviews.filter(r => tab === 'pending' ? !r.isApproved : r.isApproved);

  return (
    <AdminLayout title="Reviews & Ratings">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('pending')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
          Pending ({reviews.filter(r => !r.isApproved).length})
        </button>
        <button onClick={() => setTab('approved')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          Approved ({reviews.filter(r => r.isApproved).length})
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r._id} className={`bg-white rounded-xl shadow-sm border p-4 ${!r.isApproved ? 'border-yellow-200' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800 text-sm">{r.userName}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= r.overallRating ? 'text-yellow-500 fill-current' : 'text-gray-200'} />)}
                  </div>
                  {r.collegeName && <span className="text-xs text-gray-400">{r.collegeName}</span>}
                </div>
                {r.title && <p className="text-sm font-medium text-gray-700 mb-1">{r.title}</p>}
                <p className="text-xs text-gray-600 mb-2">{r.content}</p>
                {r.ratings && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(r.ratings).filter(([, v]) => v).map(([k, v]) => (
                      <span key={k} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{k}: {String(v)}/5</span>
                    ))}
                  </div>
                )}
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!r.isApproved && <button onClick={() => approve(r._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><CheckCircle size={16} /></button>}
                <button onClick={() => reject(r._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Delete"><XCircle size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No {tab} reviews.</p>}
      </div>
    </AdminLayout>
  );
}
