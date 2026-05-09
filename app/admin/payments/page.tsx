'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { DollarSign, Plus, Search, X, Download, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    student: '', phone: '', email: '', collegeName: '', course: '',
    amount: '', type: 'Application Fee', method: 'Online', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchPayments = () => {
    setLoading(true);
    axios.get('/api/payments', { headers }).then(r => {
      setPayments(Array.isArray(r.data) ? r.data : r.data?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(fetchPayments, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student || !form.phone || !form.amount) return alert('Student, Phone, Amount required');
    setSaving(true);
    try {
      await axios.post('/api/payments', { ...form, amount: Number(form.amount) }, { headers });
      setShowForm(false);
      setForm({ student: '', phone: '', email: '', collegeName: '', course: '', amount: '', type: 'Application Fee', method: 'Online', notes: '' });
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/api/payments/${id}`, { status, ...(status === 'Completed' ? { paidAt: new Date() } : {}) }, { headers });
      fetchPayments();
    } catch {}
  };

  const filtered = payments.filter(p => {
    const matchSearch = !search || [p.student, p.phone, p.receiptNumber, p.collegeName].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'Completed').length,
    pending: payments.filter(p => p.status === 'Pending').length,
    totalAmount: payments.filter(p => p.status === 'Completed').reduce((s, p) => s + (p.amount || 0), 0),
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      Completed: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700',
      Failed: 'bg-red-100 text-red-700', Refunded: 'bg-blue-100 text-blue-700', Cancelled: 'bg-gray-100 text-gray-600',
    };
    const icons: Record<string, any> = { Completed: <CheckCircle size={10} />, Pending: <Clock size={10} />, Failed: <XCircle size={10} /> };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{icons[status]} {status}</span>;
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400";

  return (
    <AdminLayout title="Payments">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50' },
          { label: 'Completed', value: stats.completed, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Revenue', value: `₹${stats.totalAmount.toLocaleString()}`, color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search by name, phone, receipt..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div className="flex gap-1">
          {['all', 'Pending', 'Completed', 'Failed', 'Refunded'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition ${statusFilter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition shrink-0">
          <Plus size={14} /> Record Payment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Receipt</th>
                <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Student</th>
                <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">College</th>
                <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Type</th>
                <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Amount</th>
                <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Method</th>
                <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Status</th>
                <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Date</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-2.5 text-xs font-mono text-purple-600">{p.receiptNumber}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-gray-800">{p.student}</p>
                    <p className="text-xs text-gray-400">{p.phone}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{p.collegeName || '—'}</td>
                  <td className="px-3 py-2.5"><span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{p.type}</span></td>
                  <td className="px-3 py-2.5 font-bold text-green-700">₹{p.amount?.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{p.method}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-2.5 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2.5">
                    {p.status === 'Pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(p._id, 'Completed')} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Mark Completed"><CheckCircle size={14} /></button>
                        <button onClick={() => updateStatus(p._id, 'Failed')} className="text-red-500 hover:bg-red-50 p-1 rounded" title="Mark Failed"><XCircle size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400 text-sm">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleSave}
            className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-3 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">Record Payment</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Student Name *</label><input required value={form.student} onChange={e => setForm({...form, student: e.target.value})} className={inp} /></div>
              <div><label className="text-xs font-bold text-gray-500">Phone *</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inp} /></div>
              <div><label className="text-xs font-bold text-gray-500">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inp} /></div>
              <div><label className="text-xs font-bold text-gray-500">College</label><input value={form.collegeName} onChange={e => setForm({...form, collegeName: e.target.value})} className={inp} /></div>
              <div><label className="text-xs font-bold text-gray-500">Course</label><input value={form.course} onChange={e => setForm({...form, course: e.target.value})} className={inp} /></div>
              <div><label className="text-xs font-bold text-gray-500">Amount (₹) *</label><input required type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className={inp} /></div>
              <div><label className="text-xs font-bold text-gray-500">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inp}>
                  {['Application Fee', 'Admission Fee', 'Tuition Fee', 'Hostel Fee', 'Exam Fee', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Method</label>
                <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className={inp}>
                  {['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'DD', 'Online'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={inp} rows={2} /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:opacity-50">
              {saving ? 'Saving...' : '💰 Record Payment'}
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
