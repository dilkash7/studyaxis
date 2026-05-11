'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader, Image as ImageIcon, Upload, Link as LinkIcon, X, Search } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';

interface Media {
  _id: string;
  title: string;
  collegeName: string;
  mediaUrl: string;
  mediaType: string;
  active: boolean;
}

const MEDIA_TYPES = ['campus', 'infrastructure', 'lab', 'classroom', 'library', 'sports', 'hostel', 'cafeteria', 'auditorium', 'other'];

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    collegeId: '',
    campusId: '',
    title: '',
    description: '',
    mediaUrl: '',
    cloudinaryPublicId: '',
    mediaType: 'campus',
    displayOrder: 0,
    active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!formData.collegeId) { setCampuses([]); return; }
    axios.get(`/api/campuses?collegeId=${formData.collegeId}`)
      .then(res => setCampuses(res.data.data || []))
      .catch(() => setCampuses([]));
  }, [formData.collegeId]);

  async function fetchData() {
    try {
      const [mediaRes, colRes] = await Promise.all([
        axios.get('/api/media'),
        axios.get('/api/colleges'),
      ]);
      setMedia(mediaRes.data.data || []);
      setColleges(colRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const token = localStorage.getItem('token');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post('/api/upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.url) {
        setFormData(prev => ({ ...prev, mediaUrl: res.data.url, cloudinaryPublicId: res.data.public_id || '' }));
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.collegeId || !formData.title || !formData.mediaUrl) {
      alert('Please fill in College, Title, and upload/paste a media URL');
      return;
    }

    const token = localStorage.getItem('token');
    const college = colleges.find(c => c._id === formData.collegeId);
    const campus = campuses.find(c => c._id === formData.campusId);
    const payload = {
      ...formData,
      collegeName: college?.name || '',
      campusName: campus?.name || '',
    };

    try {
      await axios.post('/api/media', payload, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving media:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this media item?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/media/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  }

  function resetForm() {
    setFormData({
      collegeId: '', campusId: '', title: '', description: '',
      mediaUrl: '', cloudinaryPublicId: '', mediaType: 'campus',
      displayOrder: 0, active: true,
    });
  }

  const filtered = media.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    (m.collegeName || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <AdminLayout title="Media Gallery">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Media Gallery</h1>
            <p className="text-sm text-gray-500">{media.length} media items uploaded</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search media..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition font-medium shrink-0">
              <Plus size={18} /> Upload Media
            </button>
          </div>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Upload Media</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* College Dropdown */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">College *</label>
                  <select value={formData.collegeId}
                    onChange={(e) => setFormData({ ...formData, collegeId: e.target.value, campusId: '' })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                    <option value="">Select College</option>
                    {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Campus Dropdown */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Campus (Optional)</label>
                  <select value={formData.campusId}
                    onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                    disabled={!formData.collegeId}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50">
                    <option value="">All campuses</option>
                    {campuses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Title *</label>
                  <input type="text" placeholder="e.g. College Main Building" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Media Type</label>
                  <select value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    {MEDIA_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Upload Mode Toggle */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Media Source *</label>
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setUploadMode('file')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                      uploadMode === 'file' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                    }`}>
                    <Upload size={16} /> Upload from Device
                  </button>
                  <button type="button" onClick={() => setUploadMode('url')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                      uploadMode === 'url' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                    }`}>
                    <LinkIcon size={16} /> Paste URL
                  </button>
                </div>

                {uploadMode === 'file' ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf" className="hidden"
                      onChange={handleFileUpload} />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader className="animate-spin text-blue-600" size={32} />
                        <p className="text-sm text-gray-500">Uploading to Cloudinary...</p>
                      </div>
                    ) : formData.mediaUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={formData.mediaUrl} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
                        <p className="text-xs text-green-600 font-bold">✅ Uploaded! Click to change</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={40} className="text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">Click to upload image, video, or PDF</p>
                        <p className="text-xs text-gray-400">Supports JPG, PNG, MP4, PDF</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <input type="url" placeholder="https://res.cloudinary.com/..." value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                <textarea placeholder="Optional description..." value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows={2} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={!formData.mediaUrl}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md disabled:opacity-50">
                  Save Media
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {item.mediaUrl ? (
                  <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-300" />
                  </div>
                )}
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-black/60 text-white px-2 py-1 rounded-lg uppercase tracking-wider">
                  {item.mediaType}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-sm break-words">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.collegeName}</p>
                <div className="flex justify-end mt-3">
                  <button onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-20 text-gray-400">
              <ImageIcon size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No media uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
