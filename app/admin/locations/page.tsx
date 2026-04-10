'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const empty = { name: '', type: 'city', image: '', flag: '' };

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetch = async () => {
    const [cities, countries] = await Promise.all([
      axios.get('/api/locations?type=city'),
      axios.get('/api/locations?type=country')
    ]);
    setLocations([...cities.data, ...countries.data]);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (editId) {
      await axios.put(`/api/locations/${editId}`, form, { headers });
    } else {
      await axios.post('/api/locations', form, { headers });
    }
    setModal(false); setForm(empty); setEditId(''); fetch();
  };

  const handleDelete = async () => {
    await axios.delete(`/api/locations/${deleteId}`, { headers });
    setDeleteId(''); fetch();
  };

  return (
    <AdminLayout title="Locations">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{locations.length} locations</p>
        <button onClick={() => { setForm(empty); setEditId(''); setModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          <Plus size={16} /> Add Location
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>{['Name', 'Type', 'Flag', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {locations.map((l: any) => (
              <tr key={l._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${l.type === 'city' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{l.type}</span></td>
                <td className="px-4 py-3">{l.flag || '-'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setForm(l); setEditId(l._id); setModal(true); }} className="p-1 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
                  <button onClick={() => setDeleteId(l._id)} className="p-1 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Location' : 'Add Location'}>
        <div className="space-y-3">
          <input placeholder="Location Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="city">City (India)</option>
            <option value="country">Country (Abroad)</option>
          </select>
          <input placeholder="Flag emoji (e.g. 🇷🇺)" value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          <button onClick={handleSave} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
            {editId ? 'Update' : 'Add'} Location
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this location?" onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}