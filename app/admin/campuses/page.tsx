'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, Search, X, Building2 } from 'lucide-react';
import axios from 'axios';

interface Campus {
  _id: string;
  name: string;
  collegeName: string;
  city: string;
  state: string;
  address: string;
  active: boolean;
}

export default function CampusesPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    collegeId: '',
    name: '',
    location: '',
    city: '',
    state: '',
    country: 'India',
    address: '',
    pincode: '',
    phoneNumber: '',
    email: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [campRes, colRes] = await Promise.all([
        axios.get('/api/campuses'),
        axios.get('/api/colleges'),
      ]);
      setCampuses(campRes.data.data || []);
      setColleges(colRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.collegeId || !formData.name) {
      alert('Please select a college and enter campus name');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const url = editingId ? `/api/campuses/${editingId}` : '/api/campuses';
      const method = editingId ? 'put' : 'post';
      
      // Add collegeName
      const college = colleges.find(c => c._id === formData.collegeId);
      const payload = { ...formData, collegeName: college?.name || '' };

      await axios({ method, url, data: payload, headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Error saving campus:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this campus?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/campuses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      console.error('Error deleting campus:', error);
    }
  }

  function resetForm() {
    setFormData({
      collegeId: '', name: '', location: '', city: '', state: '',
      country: 'India', address: '', pincode: '', phoneNumber: '',
      email: '', description: '', active: true,
    });
  }

  const filtered = campuses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.collegeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 animate-pulse">Loading campuses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Campuses</h1>
          <p className="text-sm text-gray-500">{campuses.length} campuses across all colleges</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search campuses..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition font-medium shrink-0">
            <Plus size={18} /> Add Campus
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-800">{editingId ? 'Edit Campus' : 'Add New Campus'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* College Dropdown */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">College *</label>
                <select value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required>
                  <option value="">Select College</option>
                  {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Campus Name *</label>
                <input type="text" placeholder="e.g. Main Campus" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">City *</label>
                <input type="text" placeholder="e.g. Mangalore" value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">State</label>
                <input type="text" placeholder="e.g. Karnataka" value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Address</label>
                <input type="text" placeholder="Full address" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone</label>
                <input type="tel" placeholder="+91..." value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Pincode</label>
                <input type="text" placeholder="575001" value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button type="submit"
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md">
                {editingId ? 'Update Campus' : 'Create Campus'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-bold text-gray-600">Campus</th>
                <th className="px-6 py-4 text-left font-bold text-gray-600">College</th>
                <th className="px-6 py-4 text-left font-bold text-gray-600">Location</th>
                <th className="px-6 py-4 text-left font-bold text-gray-600">Status</th>
                <th className="px-6 py-4 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                  <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No campuses found</p>
                </td></tr>
              ) : filtered.map((campus) => (
                <tr key={campus._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-bold text-gray-800">{campus.name}</td>
                  <td className="px-6 py-4 text-gray-600">{campus.collegeName || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{[campus.city, campus.state].filter(Boolean).join(', ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${campus.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {campus.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => {
                        setEditingId(campus._id);
                        setFormData({
                          collegeId: (campus as any).collegeId?._id || (campus as any).collegeId || '',
                          name: campus.name,
                          location: (campus as any).location || '',
                          city: campus.city || '',
                          state: campus.state || '',
                          country: (campus as any).country || 'India',
                          address: campus.address || '',
                          pincode: (campus as any).pincode || '',
                          phoneNumber: (campus as any).phoneNumber || '',
                          email: (campus as any).email || '',
                          description: (campus as any).description || '',
                          active: campus.active,
                        });
                        setShowForm(true);
                      }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(campus._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
