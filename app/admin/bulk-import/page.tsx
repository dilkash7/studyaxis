'use client';
import { useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Save, Download, Trash2, Eye } from 'lucide-react';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [editedRows, setEditedRows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [colleges, setColleges] = useState<any[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  // Load colleges for assignment
  useState(() => {
    axios.get('/api/colleges', { headers }).then(r => setColleges(r.data || [])).catch(() => {});
  });

  const handleUpload = async () => {
    if (!file) return setError('Select an Excel/CSV file');
    setLoading(true); setError(''); setResult(null); setSaved(false);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post('/api/ocr', fd, { headers, timeout: 60000 });
      setResult(res.data);
      setEditedRows(res.data.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed');
    } finally { setLoading(false); }
  };

  const updateRow = (i: number, field: string, value: string) => {
    setEditedRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };
  const removeRow = (i: number) => setEditedRows(prev => prev.filter((_, idx) => idx !== i));

  const handleBulkSave = async () => {
    if (!editedRows.length) return;
    setSaving(true);
    let successCount = 0;
    for (const row of editedRows) {
      try {
        await axios.post('/api/courses', {
          name: row.normalizedName || row.rawName,
          collegeId: selectedCollege || undefined,
          collegeName: row.collegeName || colleges.find((c: any) => c._id === selectedCollege)?.name || '',
          mainCategory: row.stream || '',
          courseType: row.degreeType || '',
          specialization: row.specialization || '',
          duration: row.duration || '',
          eligibility: row.eligibility || '',
          source: 'bulk-import',
        }, { headers });
        successCount++;
      } catch {}
    }
    setSaving(false);
    setSaved(true);
    setError('');
    alert(`✅ Successfully imported ${successCount}/${editedRows.length} courses`);
  };

  const exportCSV = () => {
    if (!editedRows.length) return;
    const csvHeaders = ['Course', 'College', 'Stream', 'Degree', 'Specialization', 'Duration', 'Fee', 'Confidence'];
    const rows = editedRows.map(r => [
      r.normalizedName, r.collegeName || '', r.stream, r.degreeType, r.specialization, r.duration, r.fee?.display || '', r.confidence + '%'
    ]);
    const csv = [csvHeaders.join(','), ...rows.map(r => r.map((v: string) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `bulk_import_${Date.now()}.csv`; a.click();
  };

  const ConfBadge = ({ value }: { value: number }) => {
    const color = value >= 85 ? 'bg-green-100 text-green-700' : value >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
    return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${color}`}>{value}%</span>;
  };

  return (
    <AdminLayout title="Bulk Import">
      <p className="text-gray-500 text-sm mb-6">Upload Excel/CSV with course data → Preview → Edit → Save all to database</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Upload size={16} className="text-green-600" /> Upload File</h3>
            <div className="border-2 border-dashed border-green-200 rounded-xl p-5 text-center hover:border-green-400 transition cursor-pointer"
              onClick={() => document.getElementById('bulk-file')?.click()}>
              <input id="bulk-file" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { setFile(e.target.files?.[0] || null); setResult(null); setSaved(false); }} />
              {file ? (
                <div className="flex items-center gap-2 justify-center">
                  <FileSpreadsheet size={20} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)}KB)</span>
                </div>
              ) : (
                <div>
                  <FileSpreadsheet size={32} className="mx-auto text-green-300 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload Excel or CSV</p>
                  <p className="text-xs text-gray-400 mt-1">Columns: Course, College, Fee, Duration, Stream...</p>
                </div>
              )}
            </div>

            {/* College Assignment */}
            <div className="mt-3">
              <label className="text-xs font-bold text-gray-500 block mb-1">Assign to College (optional)</label>
              <select value={selectedCollege} onChange={e => setSelectedCollege(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">— Select College —</option>
                {colleges.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <button onClick={handleUpload} disabled={loading || !file}
              className={`w-full mt-3 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 text-white' : 'bg-green-600 text-white hover:bg-green-700'} disabled:opacity-50`}>
              {loading ? <><span className="animate-spin">⏳</span> Processing...</> : <><Upload size={14} /> Import & Preview</>}
            </button>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>

          {/* Expected Format */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-3">📋 Expected Columns</h3>
            <div className="space-y-1.5 text-xs">
              {[
                { col: 'Course / Program', req: true },
                { col: 'College / Institution', req: false },
                { col: 'Fee / Amount', req: false },
                { col: 'Duration / Years', req: false },
                { col: 'Stream / Branch', req: false },
                { col: 'UG/PG / Type', req: false },
                { col: 'Eligibility', req: false },
                { col: 'Seats / Intake', req: false },
              ].map(c => (
                <div key={c.col} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                  <span className="text-gray-700">{c.col}</span>
                  <span className={`text-[10px] font-bold ${c.req ? 'text-red-500' : 'text-gray-400'}`}>{c.req ? 'Required' : 'Optional'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!result && !loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center py-20">
              <FileSpreadsheet size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Upload an Excel/CSV file to preview data</p>
            </div>
          )}

          {result && editedRows.length > 0 && (
            <>
              {/* Stats Bar */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700">{editedRows.length} courses ready</span>
                  {result.columnMapping && <span className="text-xs text-green-600">✅ Columns auto-mapped</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={exportCSV} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition">
                    <Download size={12} /> CSV
                  </button>
                  <button onClick={handleBulkSave} disabled={saving || saved}
                    className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition disabled:opacity-50">
                    <Save size={12} /> {saving ? 'Saving...' : saved ? '✅ Saved' : 'Save All to DB'}
                  </button>
                </div>
              </div>

              {/* Editable Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 w-8">#</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Course</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">College</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Stream</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Duration</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Fee</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 w-14">Conf</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedRows.map((r, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                          <td className="px-3 py-2">
                            <input value={r.normalizedName || ''} onChange={e => updateRow(i, 'normalizedName', e.target.value)}
                              className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none py-0.5" />
                          </td>
                          <td className="px-3 py-2">
                            <input value={r.collegeName || ''} onChange={e => updateRow(i, 'collegeName', e.target.value)}
                              className="w-full text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none py-0.5" />
                          </td>
                          <td className="px-3 py-2">
                            <input value={r.stream || ''} onChange={e => updateRow(i, 'stream', e.target.value)}
                              className="w-full text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none py-0.5" />
                          </td>
                          <td className="px-3 py-2">
                            <input value={r.duration || ''} onChange={e => updateRow(i, 'duration', e.target.value)}
                              className="w-full text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none py-0.5" />
                          </td>
                          <td className="px-3 py-2 text-xs font-bold text-green-700">{r.fee?.display || '—'}</td>
                          <td className="px-3 py-2"><ConfBadge value={r.confidence || 0} /></td>
                          <td className="px-3 py-2">
                            <button onClick={() => removeRow(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
