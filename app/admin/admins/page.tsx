'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Trash2, Pencil, Activity, Clock, Shield, User, LogOut } from 'lucide-react';

const PERMISSIONS = ['dashboard', 'colleges', 'campuses', 'courses', 'fees', 'categories', 'media', 'brochures', 'leads', 'locations', 'chatbot', 'settings', 'studentRecords', 'admins'];
const empty = { name: '', email: '', password: '', role: 'admin', permissions: ['dashboard', 'colleges', 'leads'] };

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-100 text-green-700',
  logout: 'bg-gray-100 text-gray-700',
  create: 'bg-blue-100 text-blue-700',
  update: 'bg-yellow-100 text-yellow-700',
  delete: 'bg-red-100 text-red-700',
  upload: 'bg-purple-100 text-purple-700',
  export: 'bg-indigo-100 text-indigo-700',
  permission_change: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState({ module: '', action: '' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAdmins = async () => {
    const r = await axios.get('/api/admins', { headers });
    setAdmins(r.data);
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams();
      if (logFilter.module) params.set('module', logFilter.module);
      if (logFilter.action) params.set('action', logFilter.action);
      params.set('limit', '100');
      const r = await axios.get(`/api/admin-logs?${params.toString()}`, { headers });
      setLogs(r.data.data || []);
    } catch { setLogs([]); }
    finally { setLogsLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);
  useEffect(() => { if (showLogs) fetchLogs(); }, [showLogs, logFilter]);

  const togglePermission = (p: string) => {
    const perms = form.permissions.includes(p)
      ? form.permissions.filter((x: string) => x !== p)
      : [...form.permissions, p];
    setForm({ ...form, permissions: perms });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return alert('Name and email required');
    try {
      if (editId) await axios.put(`/api/admins/${editId}`, form, { headers });
      else {
        if (!form.password) return alert('Password required');
        await axios.post('/api/admins', form, { headers });
      }
      setModal(false); setForm(empty); setEditId(''); fetchAdmins();
    } catch (err: any) { alert(err.response?.data?.error || 'Error saving admin'); }
  };

  const handleEdit = (a: any) => { setForm({ ...a, password: '' }); setEditId(a._id); setModal(true); };
  const handleDelete = async () => { await axios.delete(`/api/admins/${deleteId}`, { headers }); setDeleteId(''); fetchAdmins(); };

  return (
    <AdminLayout title="Admin Team">
      {/* Tab toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setShowLogs(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${!showLogs ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <User size={16} /> Team ({admins.length})
        </button>
        <button onClick={() => setShowLogs(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${showLogs ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Activity size={16} /> Activity Log
        </button>
        {!showLogs && (
          <button onClick={() => { setForm(empty); setEditId(''); setModal(true); }}
            className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
            <Plus size={16} /> Add Admin
          </button>
        )}
      </div>

      {/* ── TEAM VIEW ── */}
      {!showLogs && (
        <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>{['Name', 'Email', 'Role', 'Permissions', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((a: any) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">{a.name[0]?.toUpperCase()}</div>
                    <div>
                      <p>{a.name}</p>
                      {a.lastLogin && <p className="text-[10px] text-gray-400">Last: {new Date(a.lastLogin).toLocaleDateString()}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{a.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(a.permissions || []).slice(0, 3).map((p: string) => (
                        <span key={p} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                      {(a.permissions || []).length > 3 && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{a.permissions.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(a)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600" title="Edit"><Pencil size={15} /></button>
                      <button onClick={async () => {
                        if (!confirm('Forcefully log this admin out?')) return;
                        try {
                          await axios.post(`/api/admins/${a._id}/force-logout`, {}, { headers });
                          alert('Admin forcefully logged out.');
                          fetchAdmins();
                        } catch (err: any) { alert(err.response?.data?.error || 'Failed to force logout'); }
                      }} className="p-1 hover:bg-orange-50 rounded-lg text-orange-500" title="Force Logout">
                        <LogOut size={15} />
                      </button>
                      <button onClick={() => setDeleteId(a._id)} className="p-1 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ACTIVITY LOG VIEW ── */}
      {showLogs && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select value={logFilter.module} onChange={e => setLogFilter({ ...logFilter, module: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
              <option value="">All Modules</option>
              {['auth', 'colleges', 'campuses', 'courses', 'fees', 'categories', 'media', 'brochures', 'student-records', 'admins', 'leads', 'settings'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={logFilter.action} onChange={e => setLogFilter({ ...logFilter, action: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
              <option value="">All Actions</option>
              {['login', 'logout', 'create', 'update', 'delete', 'upload', 'export'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  {['Admin', 'Action', 'Module', 'Description', 'Time', 'IP'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logsLoading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No activity logs found</td></tr>
                ) : logs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{log.adminName || '—'}</p>
                      <p className="text-xs text-gray-400">{log.adminEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${ACTION_COLORS[log.action] || ACTION_COLORS.other}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{log.module}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">{log.description || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1"><Clock size={12} />{new Date(log.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{log.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Admin' : 'Add Admin'}>
        <div className="space-y-3">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'john@studyaxis.com' },
            { key: 'password', label: editId ? 'New Password (leave blank to keep)' : 'Password', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map(p => (
                <label key={p} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer capitalize">
                  <input type="checkbox" checked={form.permissions?.includes(p)} onChange={() => togglePermission(p)} className="w-4 h-4 accent-green-600" />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
            {editId ? 'Update Admin' : 'Add Admin'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this admin?" onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}