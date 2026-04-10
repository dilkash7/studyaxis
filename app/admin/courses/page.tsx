'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const empty = { name: '', duration: '', description: '', icon: '', collegeId: '', collegeName: '' };

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [search, setSearch] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    const [co, cl] = await Promise.all([
      axios.get('/api/courses'),
      axios.get('/api/colleges'),
    ]);
    setCourses(co.data);
    setColleges(cl.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.collegeName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCollegeChange = (collegeId: string) => {
    const col = colleges.find((c: any) => c._id === collegeId);
    setForm({ ...form, collegeId, collegeName: col?.name || '' });
  };

  const handleSave = async () => {
    if (!form.name) return alert('Course name is required');
    try {
      if (editId) await axios.put(`/api/courses/${editId}`, form, { headers });
      else await axios.post('/api/courses', form, { headers });
      setModal(false); setForm(empty); setEditId(''); fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error saving course');
    }
  };

  const handleDelete = async () => {
    await axios.delete(`/api/courses/${deleteId}`, { headers });
    setDeleteId(''); fetchAll();
  };

  return (
    <AdminLayout title="Courses">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 w-64" />
        </div>
        <button onClick={() => { setForm(empty); setEditId(''); setModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c: any) => (
          <div key={c._id} className="bg-white rounded-2xl shadow p-5 border border-gray-100">
            <div className="text-4xl mb-2">{c.icon || '📚'}</div>
            <h3 className="font-bold text-gray-800 text-lg">{c.name}</h3>
            <p className="text-sm text-green-600 font-medium mb-1">{c.collegeName || '—'}</p>
            <p className="text-sm text-gray-500 mb-1">Duration: {c.duration || 'N/A'}</p>
            <p className="text-sm text-gray-400 line-clamp-2 mb-4">{c.description}</p>
            <div className="flex gap-2">
              <button onClick={() => { setForm(c); setEditId(c._id); setModal(true); }}
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
            <div className="text-5xl mb-3">📚</div>
            <p>No courses found. Add one!</p>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Course' : 'Add Course'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College *</label>
            <select value={form.collegeId} onChange={e => handleCollegeChange(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Select College</option>
              {colleges.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {[
            { key: 'name', label: 'Course Name *', placeholder: 'e.g. MBBS' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g. 5.5 years' },
            { key: 'icon', label: 'Icon Emoji', placeholder: '🩺' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input placeholder={f.placeholder} value={form[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} placeholder="About the course..." value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <button onClick={handleSave}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
            {editId ? 'Update Course' : 'Add Course'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this course?"
        onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}