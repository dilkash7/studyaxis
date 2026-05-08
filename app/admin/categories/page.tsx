'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, Search, X, Tags } from 'lucide-react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  collegeName: string;
  shortCode: string;
  applicableFor: string;
  active: boolean;
}

const PRESET_CATEGORIES = [
  'Karnataka', 'Non-Karnataka', 'Management Quota', 'Merit',
  'NRI', 'International', 'Government Seat', 'Private Seat',
  'SC/ST', 'OBC', 'General', 'EWS', 'Scholarship',
];

const CATEGORY_COLORS: Record<string, string> = {
  Karnataka: 'bg-green-100 text-green-700',
  'Non-Karnataka': 'bg-blue-100 text-blue-700',
  'Management Quota': 'bg-purple-100 text-purple-700',
  Merit: 'bg-yellow-100 text-yellow-700',
  NRI: 'bg-orange-100 text-orange-700',
  International: 'bg-red-100 text-red-700',
  'Government Seat': 'bg-teal-100 text-teal-700',
  'Private Seat': 'bg-indigo-100 text-indigo-700',
  'SC/ST': 'bg-pink-100 text-pink-700',
  OBC: 'bg-cyan-100 text-cyan-700',
  General: 'bg-gray-100 text-gray-700',
  EWS: 'bg-amber-100 text-amber-700',
  Scholarship: 'bg-emerald-100 text-emerald-700',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    collegeId: '',
    name: '',
    description: '',
    shortCode: '',
    eligibilityNotes: '',
    cutoffPercentage: '',
    applicableFor: 'Both',
    active: true,
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [catRes, colRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/colleges'),
      ]);
      setCategories(catRes.data.data || catRes.data || []);
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
      alert('Please select a college and enter a category name');
      return;
    }
    const token = localStorage.getItem('token');
    const college = colleges.find(c => c._id === formData.collegeId);
    const payload = { ...formData, collegeName: college?.name || '' };

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'put' : 'post';
      await axios({ method, url, data: payload, headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this admission category?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  function resetForm() {
    setFormData({
      collegeId: '', name: '', description: '', shortCode: '',
      eligibilityNotes: '', cutoffPercentage: '', applicableFor: 'Both', active: true,
    });
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.collegeName || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admission Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} categories across all colleges</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search categories..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition font-medium shrink-0">
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-800">{editingId ? 'Edit Category' : 'Add Admission Category'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* College Dropdown */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">College *</label>
                <select value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                  <option value="">Select College</option>
                  {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category Name *</label>
                <input type="text" placeholder="e.g. Karnataka" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  list="preset-categories" required />
                <datalist id="preset-categories">
                  {PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Short Code</label>
                <input type="text" placeholder="e.g. KA, NRI, MGMT" value={formData.shortCode}
                  onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Cutoff %</label>
                <input type="number" placeholder="e.g. 75" value={formData.cutoffPercentage}
                  onChange={(e) => setFormData({ ...formData, cutoffPercentage: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Applicable For</label>
                <div className="flex gap-2">
                  {['UG', 'PG', 'Both'].map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setFormData({ ...formData, applicableFor: opt })}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                        formData.applicableFor === opt
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600'
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Eligibility Notes</label>
              <textarea placeholder="e.g. Must be Karnataka domicile..." value={formData.eligibilityNotes}
                onChange={(e) => setFormData({ ...formData, eligibilityNotes: e.target.value })}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows={2} />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-blue-600" />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button type="submit"
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md">
                {editingId ? 'Update' : 'Create'} Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((category) => (
          <div key={category._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  CATEGORY_COLORS[category.name] || 'bg-gray-100 text-gray-600'
                }`}>
                  <Tags size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{category.name}</h3>
                  {category.shortCode && <p className="text-xs text-gray-400">{category.shortCode}</p>}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                category.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {category.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500">{category.collegeName || '—'}</p>
            {category.applicableFor && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold mt-2 inline-block">
                {category.applicableFor}
              </span>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => {
                setEditingId(category._id);
                setFormData({
                  collegeId: (category as any).collegeId?._id || (category as any).collegeId || '',
                  name: category.name,
                  description: (category as any).description || '',
                  shortCode: category.shortCode || '',
                  eligibilityNotes: (category as any).eligibilityNotes || '',
                  cutoffPercentage: (category as any).cutoffPercentage || '',
                  applicableFor: (category as any).applicableFor || 'Both',
                  active: category.active,
                });
                setShowForm(true);
              }} className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition">
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => handleDelete(category._id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm transition">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <Tags size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
