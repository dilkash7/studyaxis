'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Trash2, Save } from 'lucide-react';

const DEFAULT = {
  badge: "🎓 India's Trusted Education Consultancy",
  showBadge: true,
  heroTitle: 'Find the Right College\nfor Your Future',
  heroSubtitle: 'Expert guidance for MBBS, Engineering & Abroad admissions.',
  btn1Text: '🇮🇳 Study in India',
  btn1Link: '/india',
  btn2Text: '🌍 Study Abroad',
  btn2Link: '/abroad',
  heroImage: '',
  logoUrl: '',
  stats: [
    { value: '500+', label: 'Colleges' },
    { value: '10K+', label: 'Students' },
    { value: '15+', label: 'Countries' },
    { value: '98%', label: 'Success Rate' },
  ],
  siteName: 'StudyAxis',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'info@studyaxis.in',
  address: 'Mangalore, Karnataka',
  instagramUrl: '',
  developerName: '',
  developerUrl: '',
};

export default function HomepagePage() {
  const [form, setForm] = useState<any>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'buttons' | 'stats' | 'global'>('hero');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/settings/homepage').then(r => {
      setForm({ ...DEFAULT, ...r.data });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await axios.post('/api/settings/homepage', form, { headers });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/upload', fd, { headers });
      setForm({ ...form, [field]: res.data.url });
    } catch {
      alert('Upload failed. Please use URL instead.');
    } finally {
      setUploading(null);
    }
  };

  const updateStat = (i: number, key: string, val: string) => {
    const stats = [...form.stats];
    stats[i] = { ...stats[i], [key]: val };
    setForm({ ...form, stats });
  };

  const addStat = () => {
    setForm({ ...form, stats: [...(form.stats || []), { value: '', label: '' }] });
  };

  const removeStat = (i: number) => {
    setForm({ ...form, stats: form.stats.filter((_: any, idx: number) => idx !== i) });
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const tabs = [
    { key: 'hero', label: '🖼 Hero' },
    { key: 'buttons', label: '🔘 Buttons' },
    { key: 'stats', label: '📊 Stats' },
    { key: 'global', label: '⚙️ Global' },
  ];

  return (
    <AdminLayout title="Homepage Settings">
      <div className="max-w-3xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === t.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">

          {/* HERO TAB */}
          {activeTab === 'hero' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Hero Section</h3>

              <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.showBadge ?? true}
                  onChange={e => setForm({ ...form, showBadge: e.target.checked })}
                  className="w-4 h-4 accent-green-600" />
                Show Badge Text
              </label>

              {form.showBadge && (
                <div>
                  <label className={labelClass}>Badge Text</label>
                  <input value={form.badge || ''}
                    onChange={e => setForm({ ...form, badge: e.target.value })}
                    className={inputClass} />
                </div>
              )}

              <div>
                <label className={labelClass}>Hero Title</label>
                <textarea rows={2} value={form.heroTitle || ''}
                  onChange={e => setForm({ ...form, heroTitle: e.target.value })}
                  className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Use \n for line break</p>
              </div>

              <div>
                <label className={labelClass}>Hero Subtitle</label>
                <textarea rows={2} value={form.heroSubtitle || ''}
                  onChange={e => setForm({ ...form, heroSubtitle: e.target.value })}
                  className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Hero Image URL</label>
                <input placeholder="https://..." value={form.heroImage || ''}
                  onChange={e => setForm({ ...form, heroImage: e.target.value })}
                  className={`${inputClass} mb-2`} />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm text-gray-700 transition">
                    📁 Upload Image
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleUpload(e, 'heroImage')} />
                  </label>
                  {uploading === 'heroImage' && <span className="text-xs text-green-600">Uploading...</span>}
                </div>
                {form.heroImage && (
                  <img src={form.heroImage} className="mt-3 h-32 rounded-xl object-cover border" alt="Hero preview" />
                )}
              </div>

              <div>
                <label className={labelClass}>Logo URL</label>
                <input placeholder="https://..." value={form.logoUrl || ''}
                  onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                  className={`${inputClass} mb-2`} />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm text-gray-700 transition">
                    📁 Upload Logo
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleUpload(e, 'logoUrl')} />
                  </label>
                  {uploading === 'logoUrl' && <span className="text-xs text-green-600">Uploading...</span>}
                </div>
                {form.logoUrl && (
                  <img src={form.logoUrl} className="mt-3 h-12 object-contain border rounded-xl p-2" alt="Logo preview" />
                )}
              </div>
            </div>
          )}

          {/* BUTTONS TAB */}
          {activeTab === 'buttons' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Button Settings</h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Button 1 (Primary)</p>
                <div>
                  <label className={labelClass}>Button Text</label>
                  <input value={form.btn1Text || ''}
                    onChange={e => setForm({ ...form, btn1Text: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Button Link</label>
                  <input value={form.btn1Link || ''} placeholder="/india"
                    onChange={e => setForm({ ...form, btn1Link: e.target.value })}
                    className={inputClass} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Button 2 (Secondary)</p>
                <div>
                  <label className={labelClass}>Button Text</label>
                  <input value={form.btn2Text || ''}
                    onChange={e => setForm({ ...form, btn2Text: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Button Link</label>
                  <input value={form.btn2Link || ''} placeholder="/abroad"
                    onChange={e => setForm({ ...form, btn2Link: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Stats Section</h3>
                <button onClick={addStat}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
                  <Plus size={15} /> Add Stat
                </button>
              </div>

              {(form.stats || []).map((stat: any, i: number) => (
                <div key={i} className="flex gap-3 items-end bg-gray-50 rounded-xl p-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Value</label>
                    <input placeholder="500+" value={stat.value || ''}
                      onChange={e => updateStat(i, 'value', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Label</label>
                    <input placeholder="Colleges" value={stat.label || ''}
                      onChange={e => updateStat(i, 'label', e.target.value)}
                      className={inputClass} />
                  </div>
                  <button onClick={() => removeStat(i)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition mb-0.5">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {(!form.stats || form.stats.length === 0) && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No stats yet. Click "Add Stat".
                </div>
              )}
            </div>
          )}

          {/* GLOBAL TAB */}
          {activeTab === 'global' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Global Settings</h3>
              {[
                { key: 'siteName', label: 'Website Name', placeholder: 'StudyAxis' },
                { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
                { key: 'whatsapp', label: 'WhatsApp Number', placeholder: '919876543210' },
                { key: 'email', label: 'Email Address', placeholder: 'info@studyaxis.in' },
                { key: 'address', label: 'Office Address', placeholder: 'Mangalore, Karnataka' },
                { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/studyaxis' },
                { key: 'developerName', label: 'Developer Name', placeholder: 'Your Name' },
                { key: 'developerUrl', label: 'Developer Website', placeholder: 'https://yourwebsite.com' },
              ].map(f => (
                <div key={f.key}>
                  <label className={labelClass}>{f.label}</label>
                  <input placeholder={f.placeholder} value={form[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className={inputClass} />
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-60">
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && (
              <p className="text-green-600 text-sm font-medium">✅ Saved successfully!</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}