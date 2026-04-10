'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const empty = {
  name: '', type: 'india', locationId: '', city: '', country: '',
  fees: '', image: '', description: '', established: '',
  rating: 4, featured: false, brochureUrl: '',
};

export default function CollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [search, setSearch] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    const [c, l] = await Promise.all([
      axios.get('/api/colleges'),
      axios.get('/api/locations'),
    ]);
    setColleges(c.data);
    setLocations(l.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.country || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleLocationChange = (locationId: string) => {
    const loc = locations.find((l: any) => l._id === locationId);
    if (loc) {
      setForm({
        ...form,
        locationId,
        city: loc.type === 'city' ? loc.name : '',
        country: loc.type === 'country' ? loc.name : '',
        type: loc.type === 'city' ? 'india' : 'abroad',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/upload', fd, { headers });
      setForm({ ...form, image: res.data.url });
    } catch {
      alert('Upload failed. Please use URL instead.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return alert('College name is required');
    try {
      if (editId) {
        await axios.put(`/api/colleges/${editId}`, form, { headers });
      } else {
        await axios.post('/api/colleges', form, { headers });
      }
      setModal(false);
      setForm(empty);
      setEditId('');
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error saving college');
    }
  };

  const handleEdit = (c: any) => {
    setForm(c);
    setEditId(c._id);
    setImageMode('url');
    setModal(true);
  };

  const handleDelete = async () => {
    await axios.delete(`/api/colleges/${deleteId}`, { headers });
    setDeleteId('');
    fetchAll();
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <AdminLayout title="Colleges">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search colleges..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 w-64" />
        </div>
        <button onClick={() => { setForm(empty); setEditId(''); setImageMode('url'); setModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          <Plus size={16} /> Add College
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-4">{filtered.length} colleges total</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c: any) => (
          <div key={c._id} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition">
            <div className="h-36 rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 mb-3">
              {c.image ? (
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🏫</div>
              )}
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1 truncate">{c.name}</h3>
            <p className="text-sm text-gray-500 mb-1">{c.city || c.country || '—'}</p>
            <p className="text-sm text-green-600 font-semibold mb-2">{c.fees || 'N/A'}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.type === 'india' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {c.type === 'india' ? '🇮🇳 India' : '🌍 Abroad'}
              </span>
              {c.featured && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">⭐ Featured</span>
              )}
              {c.brochureUrl && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">📄 Brochure</span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(c)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={() => setDeleteId(c._id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm transition">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🏫</div>
            <p className="font-medium">No colleges found</p>
            <p className="text-sm mt-1">Add your first college!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(empty); setEditId(''); }}
        title={editId ? 'Edit College' : 'Add College'}>
        <div className="space-y-4">

          <div>
            <label className={labelClass}>College Name *</label>
            <input placeholder="e.g. Yenepoya Medical College" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <select value={form.locationId || ''} onChange={e => handleLocationChange(e.target.value)}
              className={inputClass}>
              <option value="">Select Location</option>
              <optgroup label="🇮🇳 Cities (India)">
                {locations.filter((l: any) => l.type === 'city').map((l: any) => (
                  <option key={l._id} value={l._id}>{l.name}</option>
                ))}
              </optgroup>
              <optgroup label="🌍 Countries (Abroad)">
                {locations.filter((l: any) => l.type === 'country').map((l: any) => (
                  <option key={l._id} value={l._id}>{l.flag} {l.name}</option>
                ))}
              </optgroup>
            </select>
            {form.city && <p className="text-xs text-green-600 mt-1">City: {form.city}</p>}
            {form.country && <p className="text-xs text-blue-600 mt-1">Country: {form.country}</p>}
          </div>

          <div>
            <label className={labelClass}>College Image</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setImageMode('url')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${imageMode === 'url' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                URL
              </button>
              <button onClick={() => setImageMode('upload')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${imageMode === 'upload' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Upload
              </button>
            </div>
            {imageMode === 'url' ? (
              <input placeholder="https://..." value={form.image || ''}
                onChange={e => setForm({ ...form, image: e.target.value })}
                className={inputClass} />
            ) : (
              <div>
                <input type="file" accept="image/*" onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white" />
                {uploading && <p className="text-xs text-green-600 mt-1">Uploading...</p>}
              </div>
            )}
            {form.image && (
              <img src={form.image} className="mt-2 h-20 rounded-xl object-cover border" alt="Preview" />
            )}
          </div>

          {[
            { key: 'fees', label: 'Fees (e.g. ₹50,000/year)', placeholder: '₹50,000/year' },
            { key: 'established', label: 'Established Year', placeholder: '2002' },
          ].map(f => (
            <div key={f.key}>
              <label className={labelClass}>{f.label}</label>
              <input placeholder={f.placeholder} value={form[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className={inputClass} />
            </div>
          ))}

          <div>
            <label className={labelClass}>Brochure URL (PDF/DOC)</label>
            <input placeholder="https://... (publicly accessible PDF link)" value={form.brochureUrl || ''}
              onChange={e => setForm({ ...form, brochureUrl: e.target.value })}
              className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Students will see a "View Brochure" button on the college page</p>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} placeholder="About the college..." value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Rating (1-5)</label>
            <input type="number" min="1" max="5" step="0.1" value={form.rating || 4}
              onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })}
              className={inputClass} />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.featured || false}
              onChange={e => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 accent-green-600" />
            Mark as Featured
          </label>

          <button onClick={handleSave} disabled={uploading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-60">
            {editId ? '✅ Update College' : '✅ Add College'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this college permanently?"
        onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}