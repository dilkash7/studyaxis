'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';

const CATEGORIES = ['General', 'Admission', 'Fees', 'Hostel', 'Placement', 'Exam', 'Scholarship', 'Abroad', 'Transport', 'Other'];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General', order: 0 });
  const [openId, setOpenId] = useState<string>('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };
  const load = () => axios.get('/api/faqs', { headers }).then(r => setFaqs(r.data));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ question: '', answer: '', category: 'General', order: 0 }); setEditing(null); setShowForm(false); };
  const handleSubmit = async () => {
    if (!form.question || !form.answer) return alert('Question and answer required');
    if (editing) await axios.put(`/api/faqs/${editing._id}`, form, { headers });
    else await axios.post('/api/faqs', form, { headers });
    resetForm(); load();
  };
  const handleEdit = (f: any) => { setForm({ question: f.question, answer: f.answer, category: f.category, order: f.order || 0 }); setEditing(f); setShowForm(true); };
  const handleDelete = async (id: string) => { if (confirm('Delete?')) { await axios.delete(`/api/faqs/${id}`, { headers }); load(); } };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";

  return (
    <AdminLayout title="FAQ Management">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{faqs.length} FAQs</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition"><Plus size={14} /> Add FAQ</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-3">
            <div className="flex justify-between"><h2 className="text-lg font-bold">{editing ? 'Edit' : 'New'} FAQ</h2><button onClick={resetForm}><X size={18} className="text-gray-400" /></button></div>
            <input placeholder="Question" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className={inp} />
            <textarea placeholder="Answer" rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} className={inp} />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inp}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
              <input type="number" placeholder="Order" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className={inp} />
            </div>
            <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm">{editing ? 'Update' : 'Create'} FAQ</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {faqs.map(f => (
          <div key={f._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => setOpenId(openId === f._id ? '' : f._id)}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {openId === f._id ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                <span className="font-medium text-gray-800 text-sm truncate">{f.question}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">{f.category}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button onClick={e => { e.stopPropagation(); handleEdit(f); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={12} /></button>
                <button onClick={e => { e.stopPropagation(); handleDelete(f._id); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={12} /></button>
              </div>
            </div>
            {openId === f._id && <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-50 pt-2">{f.answer}</div>}
          </div>
        ))}
        {faqs.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No FAQs yet.</p>}
      </div>
    </AdminLayout>
  );
}
