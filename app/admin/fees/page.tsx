'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyFee = { label: '', amount: '' };
const empty = {
  collegeId: '', collegeName: '', courseId: '', courseName: '',
  bookingAmount: '', totalFee: '', eligibility: '', extraInfo: '',
  loanAvailable: false, yearWiseFees: [{ label: 'Year 1', amount: '' }],
};

export default function FeesPage() {
  const [feesList, setFeesList] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    const [f, cl, co] = await Promise.all([
      axios.get('/api/fees'),
      axios.get('/api/colleges'),
      axios.get('/api/courses'),
    ]);
    setFeesList(f.data);
    setColleges(cl.data);
    setCourses(co.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCollegeChange = (collegeId: string) => {
    const col = colleges.find((c: any) => c._id === collegeId);
    const fc = courses.filter((c: any) => c.collegeId === collegeId);
    setFilteredCourses(fc);
    setForm({ ...form, collegeId, collegeName: col?.name || '', courseId: '', courseName: '' });
  };

  const handleCourseChange = (courseId: string) => {
    const co = courses.find((c: any) => c._id === courseId);
    setForm({ ...form, courseId, courseName: co?.name || '' });
  };

  const addYearRow = () => {
    const next = form.yearWiseFees.length + 1;
    setForm({ ...form, yearWiseFees: [...form.yearWiseFees, { label: `Year ${next}`, amount: '' }] });
  };

  const updateYearRow = (i: number, key: string, val: string) => {
    const rows = [...form.yearWiseFees];
    rows[i] = { ...rows[i], [key]: val };
    setForm({ ...form, yearWiseFees: rows });
  };

  const removeYearRow = (i: number) => {
    setForm({ ...form, yearWiseFees: form.yearWiseFees.filter((_: any, idx: number) => idx !== i) });
  };

  const handleSave = async () => {
    if (!form.courseId) return alert('Please select a course');
    try {
      if (editId) await axios.put(`/api/fees/${editId}`, form, { headers });
      else await axios.post('/api/fees', form, { headers });
      setModal(false); setForm(empty); setEditId(''); fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error saving fees');
    }
  };

  const handleEdit = (f: any) => {
    const fc = courses.filter((c: any) => c.collegeId === f.collegeId);
    setFilteredCourses(fc);
    setForm(f);
    setEditId(f._id);
    setModal(true);
  };

  const handleDelete = async () => {
    await axios.delete(`/api/fees/${deleteId}`, { headers });
    setDeleteId(''); fetchAll();
  };

  return (
    <AdminLayout title="Fees Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{feesList.length} fee structures</p>
        <button onClick={() => { setForm(empty); setEditId(''); setFilteredCourses([]); setModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          <Plus size={16} /> Add Fees
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['College', 'Course', 'Booking', 'Total Fee', 'Loan', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {feesList.map((f: any) => (
              <tr key={f._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{f.collegeName || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{f.courseName || '—'}</td>
                <td className="px-4 py-3 text-green-600 font-semibold">{f.bookingAmount || '—'}</td>
                <td className="px-4 py-3 text-green-600 font-semibold">{f.totalFee || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${f.loanAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {f.loanAvailable ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(f)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"><Pencil size={15} /></button>
                  <button onClick={() => setDeleteId(f._id)} className="p-1 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {feesList.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No fees added yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Fees' : 'Add Fees'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College *</label>
            <select value={form.collegeId} onChange={e => handleCollegeChange(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Select College</option>
              {colleges.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select value={form.courseId} onChange={e => handleCourseChange(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={!form.collegeId}>
              <option value="">Select Course</option>
              {filteredCourses.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {form.collegeId && filteredCourses.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">No courses found for this college. Add courses first.</p>
            )}
          </div>

          {[
            { key: 'bookingAmount', label: 'Booking Amount', placeholder: '₹10,000' },
            { key: 'totalFee', label: 'Total Fee', placeholder: '₹3,00,000' },
            { key: 'eligibility', label: 'Eligibility', placeholder: 'NEET required, 50% PCB' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input placeholder={f.placeholder} value={form[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Year/Semester Fees</label>
              <button onClick={addYearRow} className="text-xs text-green-600 font-medium hover:underline">+ Add Row</button>
            </div>
            {form.yearWiseFees?.map((row: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder="Year 1" value={row.label}
                  onChange={e => updateYearRow(i, 'label', e.target.value)}
                  className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                <input placeholder="₹50,000" value={row.amount}
                  onChange={e => updateYearRow(i, 'amount', e.target.value)}
                  className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                <button onClick={() => removeYearRow(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Info</label>
            <textarea rows={2} placeholder="Loan available, hostel included, etc." value={form.extraInfo || ''}
              onChange={e => setForm({ ...form, extraInfo: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.loanAvailable}
              onChange={e => setForm({ ...form, loanAvailable: e.target.checked })}
              className="w-4 h-4 accent-green-600" />
            Loan Available
          </label>

          <button onClick={handleSave}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
            {editId ? 'Update Fees' : 'Add Fees'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this fee structure?"
        onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}