'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, Clock } from 'lucide-react';

const STATUS_COLORS: any = {
  New: '#3b82f6', Contacted: '#f59e0b', Interested: '#8b5cf6', Paid: '#10b981', Admitted: '#059669'
};

const ACTION_ICONS: Record<string, string> = {
  login: '🔐', create: '➕', update: '✏️', delete: '🗑️', upload: '📤',
};

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [colleges, setColleges] = useState(0);
  const [courses, setCourses] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    axios.get('/api/leads', { headers }).then((r) => setLeads(r.data)).catch(() => {});
    axios.get('/api/colleges').then((r) => setColleges(r.data.length)).catch(() => {});
    axios.get('/api/courses').then((r) => setCourses(r.data.length)).catch(() => {});
    axios.get('/api/admin-logs?limit=10', { headers }).then((r) => setLogs(r.data.data || [])).catch(() => {});
  }, []);

  const statusCounts = ['New', 'Contacted', 'Interested', 'Paid', 'Admitted'].map((s) => ({
    name: s, value: leads.filter((l) => l.status === s).length
  }));

  const admitted = leads.filter((l) => l.status === 'Admitted').length;
  const convRate = leads.length ? Math.round((admitted / leads.length) * 100) : 0;

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Leads" value={leads.length} icon="👥" color="bg-linear-to-br from-blue-500 to-blue-700" />
        <StatCard title="Admitted" value={admitted} icon="🎓" color="bg-linear-to-br from-green-500 to-green-700" />
        <StatCard title="Conversion" value={`${convRate}%`} icon="📈" color="bg-linear-to-br from-purple-500 to-purple-700" />
        <StatCard title="Colleges" value={colleges} icon="🏫" color="bg-linear-to-br from-orange-500 to-orange-700" />
        <StatCard title="Courses" value={courses} icon="📚" color="bg-linear-to-br from-teal-500 to-teal-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Pipeline */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Lead Pipeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusCounts}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {statusCounts.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto">
            {logs.length === 0 && <p className="text-sm text-gray-400">No activity yet</p>}
            {logs.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <span className="text-lg">{ACTION_ICONS[log.action] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">{log.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{log.adminName || 'System'}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {timeAgo(log.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl p-6 shadow mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Leads</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {['Name', 'Phone', 'Course', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.slice(0, 5).map((l: any) => (
                <tr key={l._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-gray-500">{l.phone}</td>
                  <td className="px-4 py-3">{l.course}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      l.status === 'New' ? 'bg-blue-100 text-blue-700' :
                      l.status === 'Admitted' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}