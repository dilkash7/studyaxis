'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Loader from '@/components/ui/Loader';
import { ShieldAlert, Search, RefreshCw, Server, AlertTriangle } from 'lucide-react';

interface Log {
  _id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = () => {
    setLoading(true);
    axios.get(`/api/admin-logs?page=${page}&limit=50`)
      .then(res => {
        setLogs(res.data.data);
        setTotalPages(res.data.totalPages);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <AdminLayout title="Audit Logs & Security">
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">System Audit Trail</h2>
              <p className="text-sm text-gray-500">Immutable log of all administrative actions</p>
            </div>
          </div>
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? <Loader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold rounded-tl-xl">Timestamp</th>
                  <th className="p-4 font-semibold">Admin</th>
                  <th className="p-4 font-semibold">Action</th>
                  <th className="p-4 font-semibold">Module</th>
                  <th className="p-4 font-semibold text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.map(log => (
                  <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 whitespace-nowrap text-gray-500">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(log.createdAt))}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{log.adminName}</p>
                      <p className="text-xs text-gray-500">{log.adminEmail}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                        ${log.action.includes('delete') ? 'bg-red-100 text-red-700' : 
                          log.action.includes('update') ? 'bg-orange-100 text-orange-700' : 
                          log.action.includes('login') ? 'bg-blue-100 text-blue-700' : 
                          'bg-green-100 text-green-700'}`}
                      >
                        {log.action}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{log.description}</p>
                    </td>
                    <td className="p-4 uppercase tracking-wider text-xs font-bold text-gray-500">
                      {log.module}
                    </td>
                    <td className="p-4 text-right font-mono text-xs text-gray-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-bold text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white rounded-lg shadow-xs text-sm font-bold disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white rounded-lg shadow-xs text-sm font-bold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
