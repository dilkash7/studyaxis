'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const empty = { question: '', answer: '', keywords: '' };

export default function ChatbotPage() {
  const [qas, setQas] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetch = async () => { const r = await axios.get('/api/chatbot'); setQas(r.data); };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    const payload = { ...form, keywords: form.keywords.split(',').map((k: string) => k.trim()) };
    if (editId) await axios.put('/api/chatbot', { id: editId, ...payload }, { headers });
    else await axios.post('/api/chatbot', payload, { headers });
    setModal(false); setForm(empty); setEditId(''); fetch();
  };

  const handleDelete = async () => {
    await axios.delete('/api/chatbot', { data: { id: deleteId }, headers });
    setDeleteId(''); fetch();
  };

  return (
    <AdminLayout title="Chatbot Q&A">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{qas.length} Q&A entries</p>
        <button onClick={() => { setForm(empty); setEditId(''); setModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          <Plus size={16} /> Add Q&A
        </button>
      </div>

      <div className="space-y-3">
        {qas.map((q: any) => (
          <div key={q._id} className="bg-white rounded-2xl shadow p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-800 mb-1">❓ {q.question}</p>
                <p className="text-gray-600 text-sm mb-2">💬 {q.answer}</p>
                <div className="flex flex-wrap gap-1">
                  {q.keywords?.map((k: string) => (
                    <span key={k} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{k}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setForm({ ...q, keywords: q.keywords?.join(', ') }); setEditId(q._id); setModal(true); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"><Pencil size={15} /></button>
                <button onClick={() => setDeleteId(q._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Q&A' : 'Add Q&A'}>
        <div className="space-y-3">
          <input placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          <textarea placeholder="Answer" rows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input placeholder="Keywords (comma separated: mbbs, fees, neet)" value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          <button onClick={handleSave} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
            {editId ? 'Update' : 'Add'} Q&A
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this Q&A?" onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}