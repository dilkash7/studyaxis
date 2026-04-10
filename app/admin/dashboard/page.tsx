'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const STATUS_COLORS: any = {
  New: '#3b82f6', Contacted: '#f59e0b', Interested: '#8b5cf6', Paid: '#10b981', Admitted: '#059669'
};

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [colleges, setColleges] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    axios.get('/api/leads', { headers }).then((r) => setLeads(r.data));
    axios.get('/api/colleges').then((r) => setColleges(r.data.length));
  }, []);

  const statusCounts = ['New', 'Contacted', 'Interested', 'Paid', 'Admitted'].map((s) => ({
    name: s, value: leads.filter((l) => l.status === s).length
  }));

  const admitted = leads.filter((l) => l.status === 'Admitted').length;
  const convRate = leads.length ? Math.round((admitted / leads.length) * 100) : 0;

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Leads" value={leads.length} icon="👥" color="bg-gradient-to-br from-blue-500 to-blue-700" />
        <StatCard title="Admitted" value={admitted} icon="🎓" color="bg-gradient-to-br from-green-500 to-green-700" />
        <StatCard title="Conversion Rate" value={`${convRate}%`} icon="📈" color="bg-gradient-to-br from-purple-500 to-purple-700" />
        <StatCard title="Total Colleges" value={colleges} icon="🏫" color="bg-gradient-to-br from-orange-500 to-orange-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Lead Pipeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusCounts}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusCounts.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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