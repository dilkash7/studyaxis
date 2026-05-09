'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit2, Trash2, X, Award } from 'lucide-react';

const TYPES = ['Merit', 'Need-Based', 'Sports', 'SC/ST', 'OBC', 'Minority', 'Women', 'Disability', 'Government', 'Private', 'International'];

export default function ScholarshipsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', provider: '', type: 'Merit', eligibility: '', amount: '', description: '', applicationLink: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };
  const load = () => axios.get('/api/scholarships', { headers }).then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: '', provider: '', type: 'Merit', eligibility: '', amount: '', description: '', applicationLink: '' }); setEditing(null); setShowForm(false); };
  const handleSubmit = async () => {
    if (!form.name) return alert('Name required');
    if (editing) await axios.put(`/api/scholarships/${editing._id}`, form, { headers });
    else await axios.post('/api/scholarships', form, { headers });
    resetForm(); load();
  };
  const handleEdit = (s: any) => { setForm({ name: s.name, provider: s.provider || '', type: s.type, eligibility: s.eligibility || '', amount: s.amount || '', description: s.description || '', applicationLink: s.applicationLink || '' }); setEditing(s); setShowForm(true); };
  const handleDelete = async (id: string) => { if (confirm('Delete?')) { await axios.delete(`/api/scholarships/${id}`, { headers }); load(); } };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const TYPE_COLORS: Record<string, string> = { Merit: 'bg-green-100 text-green-700', 'Need-Based': 'bg-blue-100 text-blue-700', Sports: 'bg-orange-100 text-orange-700', Government: 'bg-purple-100 text-purple-700', Private: 'bg-gray-100 text-gray-700', International: 'bg-indigo-100 text-indigo-700' };

  return (
    <AdminLayout title="Scholarship Management">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{items.length} scholarships</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition"><Plus size={14} /> Add Scholarship</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between"><h2 className="text-lg font-bold">{editing ? 'Edit' : 'New'} Scholarship</h2><button onClick={resetForm}><X size={18} className="text-gray-400" /></button></div>
            <input placeholder="Scholarship Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} />
            <input placeholder="Provider (org/govt)" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className={inp} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
            <input placeholder="Amount (e.g. ₹50,000/year)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inp} />
            <input placeholder="Eligibility" value={form.eligibility} onChange={e => setForm(f => ({ ...f, eligibility: e.target.value }))} className={inp} />
            <textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp} />
            <input placeholder="Application Link" value={form.applicationLink} onChange={e => setForm(f => ({ ...f, applicationLink: e.target.value }))} className={inp} />
            <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(s => (
          <div key={s._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Award size={14} className="text-yellow-500" />
                  <h3 className="font-bold text-gray-800 text-sm">{s.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[s.type] || 'bg-gray-100 text-gray-600'}`}>{s.type}</span>
                </div>
                {s.provider && <p className="text-xs text-gray-500 mb-1">By: {s.provider}</p>}
                {s.amount && <p className="text-xs text-green-600 font-bold mb-1">💰 {s.amount}</p>}
                {s.eligibility && <p className="text-xs text-gray-500">{s.eligibility}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No scholarships yet.</p>}
      </div>
    </AdminLayout>
  );
}
