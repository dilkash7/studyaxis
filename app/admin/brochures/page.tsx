'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader, FileText, Search, X, Upload, Link as LinkIcon, Download } from 'lucide-react';
import axios from 'axios';

interface Brochure {
  _id: string;
  title: string;
  collegeName: string;
  documentType: string;
  fileUrl: string;
  downloadCount: number;
  active: boolean;
}

const DOC_TYPES = [
  { value: 'fee-structure', label: 'Fee Structure' },
  { value: 'admission-brochure', label: 'Admission Brochure' },
  { value: 'hostel-brochure', label: 'Hostel Brochure' },
  { value: 'campus-brochure', label: 'Campus Brochure' },
  { value: 'placement-statistics', label: 'Placement Brochure' },
  { value: 'eligibility-brochure', label: 'Eligibility Brochure' },
  { value: 'scholarship-brochure', label: 'Scholarship Brochure' },
  { value: 'prospectus', label: 'Prospectus' },
  { value: 'academic-calendar', label: 'Academic Calendar' },
  { value: 'other', label: 'General Brochure' },
];

export default function BrochuresPage() {
  const [brochures, setBrochures] = useState<Brochure[]>([]);
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
    fileUrl: '',
    cloudinaryPublicId: '',
    fileName: '',
    documentType: 'fee-structure',
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
      const [brRes, colRes] = await Promise.all([
        axios.get('/api/brochures'),
        axios.get('/api/colleges'),
      ]);
      setBrochures(brRes.data.data || []);
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
      fd.append('folder', 'studyaxis/brochures');
      const res = await axios.post('/api/upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.url) {
        setFormData(prev => ({
          ...prev,
          fileUrl: res.data.url,
          cloudinaryPublicId: res.data.public_id || '',
          fileName: file.name,
        }));
      }
    } catch {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.collegeId || !formData.title || !formData.fileUrl) {
      alert('Please fill College, Title, and upload a file');
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
      await axios.post('/api/brochures', payload, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving brochure:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this brochure?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/brochures/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      console.error('Error deleting brochure:', error);
    }
  }

  function resetForm() {
    setFormData({
      collegeId: '', campusId: '', title: '', description: '',
      fileUrl: '', cloudinaryPublicId: '', fileName: '',
      documentType: 'fee-structure', active: true,
    });
  }

  const filtered = brochures.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.collegeName || '').toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-800">Brochures & Documents</h1>
          <p className="text-sm text-gray-500">{brochures.length} documents uploaded</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search brochures..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition font-medium shrink-0">
            <Plus size={18} /> Upload
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-800">Upload Brochure / Document</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">College *</label>
                <select value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value, campusId: '' })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                  <option value="">Select College</option>
                  {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
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
                <input type="text" placeholder="e.g. B.Tech Fee Structure 2025" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Document Type</label>
                <select value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Upload Mode */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">File *</label>
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setUploadMode('file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                    uploadMode === 'file' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                  }`}><Upload size={16} /> Upload File</button>
                <button type="button" onClick={() => setUploadMode('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                    uploadMode === 'url' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                  }`}><LinkIcon size={16} /> Paste URL</button>
              </div>

              {uploadMode === 'file' ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={handleFileUpload} />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader className="animate-spin text-blue-600" size={32} />
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : formData.fileUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={40} className="text-green-600" />
                      <p className="text-xs text-green-600 font-bold">✅ {formData.fileName || 'File uploaded'}</p>
                      <p className="text-xs text-gray-400">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={40} className="text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">Click to upload PDF, DOC, or image</p>
                    </div>
                  )}
                </div>
              ) : (
                <input type="url" placeholder="https://..." value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button type="submit" disabled={!formData.fileUrl}
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md disabled:opacity-50">
                Save Brochure
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Brochures Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-bold text-gray-600">Document</th>
                <th className="px-6 py-4 text-left font-bold text-gray-600">College</th>
                <th className="px-6 py-4 text-left font-bold text-gray-600">Type</th>
                <th className="px-6 py-4 text-left font-bold text-gray-600">Downloads</th>
                <th className="px-6 py-4 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                  <FileText size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No brochures uploaded</p>
                </td></tr>
              ) : filtered.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <FileText size={20} />
                      </div>
                      <span className="font-bold text-gray-800 break-words">{b.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.collegeName}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-bold">
                      {DOC_TYPES.find(d => d.value === b.documentType)?.label || b.documentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.downloadCount || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <a href={(b as any).fileUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Download size={18} />
                      </a>
                      <button onClick={() => handleDelete(b._id)}
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
