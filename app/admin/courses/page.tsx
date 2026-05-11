'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2, Search, Sparkles, Check } from 'lucide-react';
import { classifyCourse } from '@/lib/courseClassifier';

const MAIN_CATEGORIES = [
  'Engineering', 'Medical', 'Management', 'Arts', 'Commerce', 'Law',
  'Pharmacy', 'Nursing', 'Allied Health Sciences', 'Science', 'Design',
  'Agriculture', 'Paramedical', 'Aviation', 'Hotel Management',
  'Computer Applications', 'Education', 'Other'
];

const COURSE_TYPES = ['UG', 'PG', 'Diploma', 'Doctorate', 'Certificate', 'Other'];

const empty = {
  name: '', duration: '', description: '', icon: '',
  collegeId: '', collegeName: '',
  campusId: '', campusName: '',
  mainCategory: '', degreeType: '', specialization: '',
  courseType: 'UG', eligibility: '', seats: '',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [autoDetect, setAutoDetect] = useState<any>(null);
  const [token, setToken] = useState('');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  // Auto-classify when course name changes
  const handleNameChange = (name: string) => {
    setForm({ ...form, name });
    if (name.length >= 3) {
      const result = classifyCourse(name);
      if (result.confidence > 0) setAutoDetect(result);
      else setAutoDetect(null);
    } else {
      setAutoDetect(null);
    }
  };

  const applyAutoDetect = () => {
    if (!autoDetect) return;
    setForm({
      ...form,
      mainCategory: autoDetect.mainCategory || form.mainCategory,
      courseType: autoDetect.courseType || form.courseType,
      degreeType: autoDetect.degreeType || form.degreeType,
      specialization: autoDetect.specialization || form.specialization,
      eligibility: autoDetect.entranceExam ? `${autoDetect.entranceExam} required` : form.eligibility,
    });
    setAutoDetect(null);
  };

  const fetchAll = async () => {
    const [co, cl] = await Promise.all([
      axios.get('/api/courses'),
      axios.get('/api/colleges'),
    ]);
    setCourses(co.data);
    setColleges(cl.data);
  };

  useEffect(() => { fetchAll(); }, []);

  // Fetch campuses when college changes in form
  useEffect(() => {
    if (!form.collegeId) { setCampuses([]); return; }
    axios.get(`/api/campuses?collegeId=${form.collegeId}`)
      .then(res => setCampuses(res.data.data || []))
      .catch(() => setCampuses([]));
  }, [form.collegeId]);

  const filtered = courses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.collegeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.mainCategory || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || c.mainCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCollegeChange = (collegeId: string) => {
    const col = colleges.find((c: any) => c._id === collegeId);
    setForm({ ...form, collegeId, collegeName: col?.name || '', campusId: '', campusName: '' });
  };

  const handleCampusChange = (campusId: string) => {
    const camp = campuses.find((c: any) => c._id === campusId);
    setForm({ ...form, campusId, campusName: camp?.name || '' });
  };

  const handleSave = async () => {
    if (!form.name || !form.collegeId) return alert('Course name and College are required');
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div className="flex gap-3">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
              <option value="">All Streams</option>
              {MAIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => { setForm(empty); setEditId(''); setModal(true); }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition shrink-0">
              <Plus size={16} /> Add Course
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: any) => (
            <div key={c._id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{c.icon || '📚'}</div>
                <div className="flex gap-1">
                  {c.courseType && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.courseType === 'UG' ? 'bg-purple-100 text-purple-700' :
                      c.courseType === 'PG' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{c.courseType}</span>
                  )}
                  {c.mainCategory && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{c.mainCategory}</span>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-gray-800 text-base break-words">{c.name}</h3>
              {c.degreeType && <p className="text-xs text-green-600 font-semibold mt-1">{c.degreeType}</p>}
              {c.specialization && <p className="text-xs text-gray-500 mt-0.5">→ {c.specialization}</p>}
              <p className="text-sm text-gray-500 mt-1">{c.collegeName || '—'}</p>
              {c.campusName && <p className="text-xs text-gray-400">📍 {c.campusName}</p>}
              <p className="text-sm text-gray-400 mt-1">Duration: {c.duration || 'N/A'}</p>
              <div className="flex gap-2 mt-4">
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
      </div>

      {/* Course Form Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Course' : 'Add Course'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* College Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">College *</label>
            <select value={form.collegeId} onChange={e => handleCollegeChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Select College</option>
              {colleges.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* Campus Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Campus</label>
            <select value={form.campusId || ''} onChange={e => handleCampusChange(e.target.value)}
              disabled={!form.collegeId}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-50 disabled:text-gray-400">
              <option value="">Select Campus (optional)</option>
              {campuses.map((c: any) => <option key={c._id} value={c._id}>{c.name} — {c.city}</option>)}
            </select>
          </div>

          {/* Main Category */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Main Stream *</label>
            <select value={form.mainCategory || ''} onChange={e => setForm({ ...form, mainCategory: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Select Stream</option>
              {MAIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Course Type */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Level *</label>
            <div className="flex flex-wrap gap-2">
              {COURSE_TYPES.map(type => (
                <button key={type} type="button"
                  onClick={() => setForm({ ...form, courseType: type })}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                    form.courseType === type
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Degree Type */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Degree Type</label>
            <input placeholder="e.g. B.Tech, MBBS, MBA, BCA" value={form.degreeType || ''}
              onChange={e => setForm({ ...form, degreeType: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          {/* Course Name + Auto Detection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Course Name *</label>
            <input placeholder="e.g. B.Tech Computer Science and Engineering" value={form.name || ''}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />

            {/* Auto-Detection Suggestion */}
            {autoDetect && autoDetect.confidence > 0 && (
              <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                    <Sparkles size={14} /> AI Detection ({autoDetect.confidence}% confidence)
                  </span>
                  <button type="button" onClick={applyAutoDetect}
                    className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700 transition flex items-center gap-1">
                    <Check size={12} /> Apply
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {autoDetect.mainCategory && <span className="bg-white px-2 py-1 rounded-lg border border-blue-100">✓ {autoDetect.mainCategory}</span>}
                  {autoDetect.courseType && <span className="bg-white px-2 py-1 rounded-lg border border-blue-100">✓ {autoDetect.courseType}</span>}
                  {autoDetect.degreeType && <span className="bg-white px-2 py-1 rounded-lg border border-blue-100">✓ {autoDetect.degreeType}</span>}
                  {autoDetect.specialization && <span className="bg-white px-2 py-1 rounded-lg border border-blue-100">✓ {autoDetect.specialization}</span>}
                  {autoDetect.entranceExam && <span className="bg-white px-2 py-1 rounded-lg border border-blue-100">🎯 {autoDetect.entranceExam}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Specialization</label>
            <input placeholder="e.g. Artificial Intelligence & ML" value={form.specialization || ''}
              onChange={e => setForm({ ...form, specialization: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          {/* Duration & Icon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</label>
              <input placeholder="e.g. 4 Years" value={form.duration || ''}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Icon</label>
              <input placeholder="🩺" value={form.icon || ''}
                onChange={e => setForm({ ...form, icon: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Eligibility</label>
            <input placeholder="e.g. 10+2 with PCM, 50% marks" value={form.eligibility || ''}
              onChange={e => setForm({ ...form, eligibility: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
            <textarea rows={3} placeholder="About the course..." value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <button onClick={handleSave}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition mt-2">
            {editId ? 'Update Course' : 'Add Course'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this course?"
        onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}