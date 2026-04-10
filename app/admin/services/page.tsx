'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';

const empty = { title: '', description: '', icon: '🎓', image: '', link: '', order: 0, active: true };

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetch = async () => {
    const r = await axios.get('/api/services');
    setServices(r.data);
  };

  useEffect(() => { fetch(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/upload', fd, { headers });
      setForm({ ...form, image: res.data.url });
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title) return alert('Title required');
    try {
      if (editId) await axios.put(`/api/services/${editId}`, form, { headers });
      else await axios.post('/api/services', form, { headers });
      setModal(false); setForm(empty); setEditId(''); fetch();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error saving');
    }
  };

  const handleDelete = async () => {
    await axios.delete(`/api/services/${deleteId}`, { headers });
    setDeleteId(''); fetch();
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <AdminLayout title="Services">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{services.length} services — shown on homepage</p>
        <button onClick={() => { setForm(empty); setEditId(''); setModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s: any) => (
          <div key={s._id} className="bg-white rounded-2xl shadow p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {s.image ? (
                  <img src={s.image} alt={s.title} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <span className="text-4xl">{s.icon || '🎓'}</span>
                )}
                <div>
                  <h3 className="font-bold text-gray-800">{s.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              <GripVertical size={16} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{s.description}</p>
            {s.link && <p className="text-xs text-green-600 mb-3 truncate">🔗 {s.link}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setForm(s); setEditId(s._id); setModal(true); }}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={() => setDeleteId(s._id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm transition">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🎓</div>
            <p className="font-medium">No services yet</p>
            <p className="text-sm mt-1">Default services are shown on homepage until you add custom ones</p>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Service' : 'Add Service'}>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Title *</label>
            <input placeholder="e.g. MBBS in India" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={2} placeholder="Brief description..." value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Icon Emoji</label>
            <input placeholder="🩺" value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Image (optional)</label>
            <input placeholder="https://..." value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })} className={`${inputClass} mb-2`} />
            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm text-gray-700 transition w-fit">
              📁 Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            {uploading && <p className="text-xs text-green-600 mt-1">Uploading...</p>}
            {form.image && <img src={form.image} className="mt-2 h-16 rounded-xl object-cover" />}
          </div>
          <div>
            <label className={labelClass}>Link (optional)</label>
            <input placeholder="/india or /abroad" value={form.link}
              onChange={e => setForm({ ...form, link: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Order (lower = first)</label>
            <input type="number" value={form.order}
              onChange={e => setForm({ ...form, order: parseInt(e.target.value) })} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 accent-green-600" />
            Show on Homepage
          </label>
          <button onClick={handleSave} disabled={uploading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-60">
            {editId ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this service?"
        onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}