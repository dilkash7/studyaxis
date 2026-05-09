'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';

const CATEGORIES = ['News', 'Admission', 'Career', 'Education', 'Exam', 'Tips', 'Abroad', 'Scholarship'];
const CAT_COLORS: Record<string, string> = {
  News: 'bg-blue-100 text-blue-700', Admission: 'bg-green-100 text-green-700',
  Career: 'bg-purple-100 text-purple-700', Education: 'bg-orange-100 text-orange-700',
  Exam: 'bg-red-100 text-red-700', Tips: 'bg-cyan-100 text-cyan-700',
  Abroad: 'bg-indigo-100 text-indigo-700', Scholarship: 'bg-yellow-100 text-yellow-700',
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', coverImage: '', category: 'News', tags: '', isPublished: false, metaTitle: '', metaDescription: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => axios.get('/api/blogs', { headers }).then(r => setBlogs(r.data));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ title: '', slug: '', content: '', excerpt: '', coverImage: '', category: 'News', tags: '', isPublished: false, metaTitle: '', metaDescription: '' }); setEditing(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.title || !form.content) return alert('Title and content required');
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing) { await axios.put(`/api/blogs/${editing._id}`, data, { headers }); }
      else { await axios.post('/api/blogs', data, { headers }); }
      resetForm(); load();
    } catch { alert('Failed to save'); }
  };

  const handleEdit = (b: any) => {
    setForm({ title: b.title, slug: b.slug, content: b.content, excerpt: b.excerpt || '', coverImage: b.coverImage || '', category: b.category, tags: (b.tags || []).join(', '), isPublished: b.isPublished, metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '' });
    setEditing(b); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    await axios.delete(`/api/blogs/${id}`, { headers }); load();
  };

  const togglePublish = async (b: any) => {
    await axios.put(`/api/blogs/${b._id}`, { isPublished: !b.isPublished }, { headers }); load();
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";

  return (
    <AdminLayout title="Blog / News">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{blogs.length} posts • {blogs.filter(b => b.isPublished).length} published</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition">
          <Plus size={14} /> New Post
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={resetForm}><X size={18} className="text-gray-400" /></button>
            </div>
            <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inp} />
            <input placeholder="Slug (auto-generated if empty)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inp} />
            <input placeholder="Excerpt (short summary)" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className={inp} />
            <textarea placeholder="Content..." rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className={inp} />
            <input placeholder="Cover Image URL" value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className={inp} />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inp}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className={inp} />
            </div>
            <details className="bg-gray-50 rounded-xl p-3">
              <summary className="text-xs font-bold text-gray-500 cursor-pointer">SEO Settings</summary>
              <div className="mt-2 space-y-2">
                <input placeholder="Meta Title" value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} className={inp} />
                <input placeholder="Meta Description" value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} className={inp} />
              </div>
            </details>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} /> Publish immediately</label>
            <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition">
              {editing ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {blogs.map(b => (
          <div key={b._id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${!b.isPublished ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{b.title}</h3>
                  {b.isPublished ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Published</span> : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Draft</span>}
                </div>
                {b.excerpt && <p className="text-xs text-gray-500 mb-2 truncate">{b.excerpt}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[b.category] || CAT_COLORS.News}`}>{b.category}</span>
                  <span className="text-xs text-gray-400">by {b.author || 'Admin'}</span>
                  <span className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs text-gray-400">👁 {b.views || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePublish(b)} title={b.isPublished ? 'Unpublish' : 'Publish'} className={`p-1.5 rounded-lg transition ${b.isPublished ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>{b.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                <button onClick={() => handleEdit(b)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(b._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
        {blogs.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No blog posts. Click "New Post" to start writing.</p>}
      </div>
    </AdminLayout>
  );
}
