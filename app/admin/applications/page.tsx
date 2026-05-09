'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Edit2, Trash2, Eye, X, FileText } from 'lucide-react';

const STATUSES = ['Submitted', 'Under Review', 'Documents Pending', 'Interview Scheduled', 'Accepted', 'Rejected', 'Fee Paid', 'Enrolled', 'Cancelled'];
const STATUS_COLORS: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-700', 'Under Review': 'bg-yellow-100 text-yellow-700',
  'Documents Pending': 'bg-orange-100 text-orange-700', 'Interview Scheduled': 'bg-purple-100 text-purple-700',
  Accepted: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700',
  'Fee Paid': 'bg-emerald-100 text-emerald-700', Enrolled: 'bg-teal-100 text-teal-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [viewApp, setViewApp] = useState<any>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };
  const load = () => axios.get('/api/applications', { headers }).then(r => setApps(r.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await axios.put(`/api/applications/${id}`, { status }, { headers }); load();
  };
  const handleDelete = async (id: string) => { if (confirm('Delete?')) { await axios.delete(`/api/applications/${id}`, { headers }); load(); } };

  const filtered = filter ? apps.filter(a => a.status === filter) : apps;

  return (
    <AdminLayout title="Application Tracking">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter('')} className={`px-3 py-1 rounded-lg text-xs font-medium ${!filter ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All ({apps.length})</button>
        {STATUSES.map(s => {
          const count = apps.filter(a => a.status === s).length;
          if (!count) return null;
          return <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-lg text-xs font-medium ${filter === s ? 'bg-green-600 text-white' : STATUS_COLORS[s] || 'bg-gray-100 text-gray-600'}`}>{s} ({count})</button>;
        })}
      </div>

      <div className="space-y-2">
        {filtered.map(a => (
          <div key={a._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-gray-800 text-sm">{a.studentName}</span>
                  <span className="text-xs text-gray-400 font-mono">{a.applicationNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status] || 'bg-gray-100'}`}>{a.status}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>📱 {a.phone}</span>
                  {a.collegeName && <span>🏫 {a.collegeName}</span>}
                  {a.course && <span>📚 {a.course}</span>}
                  <span>{new Date(a.submittedAt || a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <select value={a.status} onChange={e => updateStatus(a._id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => setViewApp(a)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={13} /></button>
                <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No applications.</p>}
      </div>

      {/* Detail Modal */}
      {viewApp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><FileText size={16} className="text-green-600" /> Application Details</h2>
              <button onClick={() => setViewApp(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['Application #', viewApp.applicationNumber],
                ['Name', viewApp.studentName],
                ['Phone', viewApp.phone],
                ['Email', viewApp.email],
                ['Father', viewApp.fatherName],
                ['DOB', viewApp.dateOfBirth ? new Date(viewApp.dateOfBirth).toLocaleDateString() : ''],
                ['College', viewApp.collegeName],
                ['Course', viewApp.course],
                ['Previous Qualification', viewApp.previousQualification],
                ['Percentage', viewApp.percentage],
                ['Entrance Exam', viewApp.entranceExam],
                ['Score', viewApp.entranceScore],
                ['Status', viewApp.status],
                ['Reviewed By', viewApp.reviewedBy],
                ['Submitted', new Date(viewApp.submittedAt || viewApp.createdAt).toLocaleString()],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
