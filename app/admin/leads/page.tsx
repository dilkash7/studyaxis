'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import { Trash2, Download, Search } from 'lucide-react';

const STATUSES = ['New', 'Contacted', 'Interested', 'Paid', 'Admitted'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [editLead, setEditLead] = useState<any>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchLeads = async () => {
    const params: any = {};
    if (filterStatus) params.status = filterStatus;
    if (search) params.search = search;
    const res = await axios.get('/api/leads', { headers, params });
    setLeads(res.data);
  };

  useEffect(() => { fetchLeads(); }, [filterStatus, search]);

  const handleDelete = async () => {
    await axios.delete(`/api/leads/${deleteId}`, { headers });
    setDeleteId('');
    fetchLeads();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await axios.put(`/api/leads/${id}`, { status }, { headers });
    fetchLeads();
  };

  const handleExport = () => {
    window.open('/api/export', '_blank');
  };

  return (
    <AdminLayout title="CRM / Leads">
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-64" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Name', 'Phone', 'Email', 'Course', 'Location', 'College', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((l: any) => (
                <tr key={l._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-gray-600">{l.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{l.email || '-'}</td>
                  <td className="px-4 py-3">{l.course || '-'}</td>
                  <td className="px-4 py-3">{l.location || '-'}</td>
                  <td className="px-4 py-3">{l.college || '-'}</td>
                  <td className="px-4 py-3">
                    <select value={l.status}
                      onChange={(e) => handleStatusChange(l._id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteId(l._id)} className="p-1 hover:bg-red-50 rounded-lg text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="text-center py-12 text-gray-400">No leads found</div>
          )}
        </div>
      </div>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this lead permanently?"
        onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}