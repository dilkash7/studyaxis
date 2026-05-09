'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit2, Trash2, Pin, AlertTriangle, CheckCircle, X } from 'lucide-react';

const CATEGORIES = ['General', 'Admission', 'Exam', 'Result', 'Event', 'Holiday', 'Urgent'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600', urgent: 'bg-red-100 text-red-600',
};
const CAT_COLORS: Record<string, string> = {
  General: 'bg-gray-100 text-gray-700', Admission: 'bg-green-100 text-green-700',
  Exam: 'bg-purple-100 text-purple-700', Result: 'bg-blue-100 text-blue-700',
  Event: 'bg-pink-100 text-pink-700', Holiday: 'bg-yellow-100 text-yellow-700',
  Urgent: 'bg-red-100 text-red-700',
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'General', priority: 'normal', pinned: false, isActive: true, expiryDate: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => axios.get('/api/notices', { headers }).then(r => setNotices(r.data));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ title: '', content: '', category: 'General', priority: 'normal', pinned: false, isActive: true, expiryDate: '' }); setEditing(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.title || !form.content) return alert('Title and content required');
    try {
      if (editing) {
        await axios.put(`/api/notices/${editing._id}`, form, { headers });
      } else {
        await axios.post('/api/notices', form, { headers });
      }
      resetForm(); load();
    } catch { alert('Failed to save notice'); }
  };

  const handleEdit = (n: any) => {
    setForm({ title: n.title, content: n.content, category: n.category, priority: n.priority, pinned: n.pinned, isActive: n.isActive, expiryDate: n.expiryDate ? new Date(n.expiryDate).toISOString().split('T')[0] : '' });
    setEditing(n); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    await axios.delete(`/api/notices/${id}`, { headers }); load();
  };

  const togglePin = async (n: any) => {
    await axios.put(`/api/notices/${n._id}`, { pinned: !n.pinned }, { headers }); load();
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";

  return (
    <AdminLayout title="Notice Board">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{notices.length} notices</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition">
          <Plus size={14} /> Add Notice
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Notice' : 'New Notice'}</h2>
              <button onClick={resetForm}><X size={18} className="text-gray-400" /></button>
            </div>
            <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inp} />
            <textarea placeholder="Content..." rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className={inp} />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inp}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={inp}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className={inp} placeholder="Expiry date (optional)" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} /> Pin to top</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
            </div>
            <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition">
              {editing ? 'Update Notice' : 'Publish Notice'}
            </button>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-3">
        {notices.map(n => (
          <div key={n._id} className={`bg-white rounded-xl shadow-sm border p-4 ${n.pinned ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-100'} ${!n.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {n.pinned && <Pin size={12} className="text-yellow-600" />}
                  <h3 className="font-bold text-gray-800 text-sm">{n.title}</h3>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{n.content}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[n.category] || CAT_COLORS.General}`}>{n.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[n.priority] || PRIORITY_COLORS.normal}`}>{n.priority}</span>
                  <span className="text-xs text-gray-400">{new Date(n.publishDate || n.createdAt).toLocaleDateString()}</span>
                  {!n.isActive && <span className="text-xs text-red-500">Inactive</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePin(n)} title="Toggle pin" className={`p-1.5 rounded-lg transition ${n.pinned ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:bg-gray-100'}`}><Pin size={13} /></button>
                <button onClick={() => handleEdit(n)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(n._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No notices yet. Click "Add Notice" to create one.</p>}
      </div>
    </AdminLayout>
  );
}
