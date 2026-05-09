'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit2, Trash2, X, Star as StarIcon, Award } from 'lucide-react';

export default function TestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', role: '', college: '', courseName: '', year: '', content: '', rating: 5, isFeatured: false, photo: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };
  const load = () => axios.get('/api/testimonials', { headers }).then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: '', role: '', college: '', courseName: '', year: '', content: '', rating: 5, isFeatured: false, photo: '' }); setEditing(null); setShowForm(false); };
  const handleSubmit = async () => {
    if (!form.name || !form.content) return alert('Name and content required');
    if (editing) await axios.put(`/api/testimonials/${editing._id}`, form, { headers });
    else await axios.post('/api/testimonials', form, { headers });
    resetForm(); load();
  };
  const handleEdit = (t: any) => { setForm({ name: t.name, role: t.role || '', college: t.college || '', courseName: t.courseName || '', year: t.year || '', content: t.content, rating: t.rating || 5, isFeatured: t.isFeatured, photo: t.photo || '' }); setEditing(t); setShowForm(true); };
  const handleDelete = async (id: string) => { if (confirm('Delete?')) { await axios.delete(`/api/testimonials/${id}`, { headers }); load(); } };
  const toggleFeatured = async (t: any) => { await axios.put(`/api/testimonials/${t._id}`, { isFeatured: !t.isFeatured }, { headers }); load(); };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";

  return (
    <AdminLayout title="Testimonials">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{items.length} testimonials • {items.filter(t => t.isFeatured).length} featured</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition"><Plus size={14} /> Add Testimonial</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between"><h2 className="text-lg font-bold">{editing ? 'Edit' : 'New'} Testimonial</h2><button onClick={resetForm}><X size={18} className="text-gray-400" /></button></div>
            <input placeholder="Student Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Role (e.g. MBBS Student)" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inp} />
              <input placeholder="Year (e.g. 2024)" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="College" value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} className={inp} />
              <input placeholder="Course" value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} className={inp} />
            </div>
            <textarea placeholder="Testimonial content..." rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className={inp} />
            <input placeholder="Photo URL" value={form.photo} onChange={e => setForm(f => ({ ...f, photo: e.target.value }))} className={inp} />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">Rating:</span>
                {[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}><StarIcon size={16} className={s <= form.rating ? 'text-yellow-500 fill-current' : 'text-gray-200'} /></button>)}
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} /> Featured</label>
            </div>
            <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm">{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(t => (
          <div key={t._id} className={`bg-white rounded-xl shadow-sm border p-4 ${t.isFeatured ? 'border-yellow-200 bg-yellow-50/20' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {t.photo ? <img src={t.photo} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">{t.name?.[0]}</div>}
                <div>
                  <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{[t.role, t.college, t.year].filter(Boolean).join(' • ')}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => toggleFeatured(t)} className={`p-1 rounded ${t.isFeatured ? 'text-yellow-500' : 'text-gray-300'}`}><Award size={13} /></button>
                <button onClick={() => handleEdit(t)} className="p-1 text-blue-500"><Edit2 size={12} /></button>
                <button onClick={() => handleDelete(t._id)} className="p-1 text-red-400"><Trash2 size={12} /></button>
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-3 mb-2">{t.content}</p>
            <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <StarIcon key={s} size={10} className={s <= (t.rating || 5) ? 'text-yellow-500 fill-current' : 'text-gray-200'} />)}</div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-10 text-sm col-span-2">No testimonials yet.</p>}
      </div>
    </AdminLayout>
  );
}
