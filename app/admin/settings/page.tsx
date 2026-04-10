'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Save, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/settings/homepage').then(r => setForm(r.data));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await axios.post('/api/settings/homepage', form, { headers });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl bg-white rounded-2xl shadow p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Global Settings</h3>
          <a href="/admin/homepage" className="flex items-center gap-1 text-sm text-green-600 hover:underline">
            <ExternalLink size={14} /> Full Homepage Settings
          </a>
        </div>

        <div className="space-y-4">
          {[
            { key: 'siteName', label: 'Website Name', placeholder: 'StudyAxis' },
            { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
            { key: 'whatsapp', label: 'WhatsApp Number', placeholder: '919876543210' },
            { key: 'email', label: 'Email Address', placeholder: 'info@studyaxis.in' },
            { key: 'address', label: 'Office Address', placeholder: 'Mangalore, Karnataka' },
          ].map(f => (
            <div key={f.key}>
              <label className={labelClass}>{f.label}</label>
              <input placeholder={f.placeholder} value={form[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className={inputClass} />
            </div>
          ))}

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-60 mt-2">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <p className="text-green-600 text-sm font-medium">✅ Settings saved!</p>}
        </div>
      </div>
    </AdminLayout>
  );
}