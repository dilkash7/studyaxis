'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { LogOut, User as UserIcon, Clock, ShieldAlert } from 'lucide-react';

export default function WebUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleForceLogout = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to forcefully logout ${email}? Their active sessions will be terminated immediately.`)) return;
    try {
      await axios.post(`/api/users/${userId}/force-logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Student session forcefully invalidated.');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to force logout');
    }
  };

  return (
    <AdminLayout title="Web Portal Users">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-500 text-sm">Manage students who have registered on the main website.</p>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Student Name</th>
              <th className="px-4 py-3 text-left">Contact Info</th>
              <th className="px-4 py-3 text-left">Last Login</th>
              <th className="px-4 py-3 text-left">Session Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">No web users registered yet.</td></tr>
            ) : users.map((u: any) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {u.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {u._id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-600">{u.email}</p>
                  <p className="text-xs text-gray-400">{u.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {u.lastLogin ? (
                    <div className="flex items-center gap-1"><Clock size={12}/> {new Date(u.lastLogin).toLocaleString()}</div>
                  ) : 'Never'}
                </td>
                <td className="px-4 py-3">
                  {u.sessionToken ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Logged Out</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => handleForceLogout(u._id, u.email)} 
                    disabled={!u.sessionToken}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Forcefully terminate user session"
                  >
                    <LogOut size={14} /> Force Logout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
