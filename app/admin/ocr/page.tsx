'use client';
import { useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Sparkles, Upload, FileText, AlertTriangle, CheckCircle, Clock,
  Trash2, Save, Eye, Download, FileSpreadsheet, File, Check, X,
  ChevronDown, Edit2,
} from 'lucide-react';

const SUPPORTED = '.jpg,.jpeg,.png,.webp,.bmp,.tiff,.pdf,.xlsx,.xls,.csv';

export default function OCRScannerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [editedCourses, setEditedCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length > 0) {
      setFiles(fileList);
      const first = fileList[0];
      if (first.type.startsWith('image/')) setPreview(URL.createObjectURL(first));
      else setPreview('');
      setImageUrl('');
      setResult(null);
      setError('');
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <File size={20} className="text-red-500" />;
    if (file.name.match(/\.xlsx?$/i) || file.name.match(/\.csv$/i)) return <FileSpreadsheet size={20} className="text-green-600" />;
    return <FileText size={20} className="text-blue-500" />;
  };

  const handleScan = async () => {
    if (!files.length && !imageUrl) { setError('Upload files or enter URL'); return; }
    setScanning(true); setError(''); setResult(null);

    try {
      let res;
      if (files.length > 0) {
        // Process first file (batch coming later)
        const fd = new FormData();
        fd.append('file', files[0]);
        res = await axios.post('/api/ocr', fd, { headers, timeout: 120000 });
      } else {
        res = await axios.post('/api/ocr', { imageUrl }, { headers, timeout: 120000 });
      }
      setResult(res.data);
      setEditedCourses(res.data.courses || []);
      setActiveTab('results');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Processing failed');
    } finally { setScanning(false); }
  };

  const updateCourse = (i: number, field: string, value: any) => {
    setEditedCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };
  const removeCourse = (i: number) => setEditedCourses(prev => prev.filter((_, idx) => idx !== i));
  const approveAll = () => setEditedCourses(prev => prev.map(c => ({ ...c, needsReview: false, confidence: Math.max(c.confidence, 90) })));

  const exportCSV = () => {
    if (!editedCourses.length) return;
    const headers = ['Course', 'Stream', 'Degree', 'Specialization', 'Duration', 'Fee', 'Confidence', 'Source'];
    const rows = editedCourses.map(c => [
      c.normalizedName, c.stream, c.degreeType, c.specialization, c.duration,
      c.fee?.display || '', c.confidence + '%', c.source || 'ocr',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map((v: string) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `ocr_results_${Date.now()}.csv`; a.click();
  };

  const publishToDB = async () => {
    if (!editedCourses.length) return;
    try {
      const res = await axios.post('/api/ocr/publish', {
        courses: editedCourses,
        collegeId: result?.college?._id,
        collegeName: result?.college?.name
      }, { headers });
      if (res.data.success) {
        alert(`Successfully published ${res.data.published} courses!`);
        setEditedCourses([]);
        setActiveTab('upload');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to publish');
    }
  };

  const ConfBadge = ({ value }: { value: number }) => {
    const color = value >= 85 ? 'bg-green-100 text-green-700' : value >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
    return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${color}`}>{value}%</span>;
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400";

  return (
    <AdminLayout title="AI Document Intelligence">
      <p className="text-gray-500 text-sm mb-4">Upload brochures, PDFs, or Excel sheets → AI extracts courses, fees, colleges → You review + save</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'upload' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>📤 Upload</button>
        <button onClick={() => setActiveTab('results')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'results' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>📊 Results {editedCourses.length > 0 && `(${editedCourses.length})`}</button>
      </div>

      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Upload size={16} className="text-purple-600" /> Upload Source</h3>

              {/* Supported formats */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['JPG/PNG', 'PDF', 'Excel', 'CSV'].map(f => (
                  <span key={f} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">{f}</span>
                ))}
              </div>

              <div className="border-2 border-dashed border-purple-200 rounded-xl p-5 text-center hover:border-purple-400 transition cursor-pointer" onClick={() => document.getElementById('ocr-file')?.click()}>
                <input id="ocr-file" type="file" accept={SUPPORTED} multiple className="hidden" onChange={handleFileChange} />
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-xl" />
                ) : files.length > 0 ? (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        {getFileIcon(f)}
                        <span className="text-sm text-gray-700 truncate flex-1">{f.name}</span>
                        <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)}KB</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <FileText size={28} className="mx-auto text-purple-300 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload (Images, PDF, Excel, CSV)</p>
                    <p className="text-xs text-gray-400 mt-1">Max 20MB • Excel gives highest accuracy</p>
                  </div>
                )}
              </div>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or URL</span></div>
              </div>
              <input placeholder="https://... (direct image URL)" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setFiles([]); setPreview(''); }} className={inp} />

              <button onClick={handleScan} disabled={scanning} className={`w-full mt-3 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${scanning ? 'bg-gray-400 text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'}`}>
                {scanning ? <><span className="animate-spin">⏳</span> Processing...</> : <><Sparkles size={14} /> Analyze Document</>}
              </button>

              {error && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
            </div>

            {/* Engine Priority */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-3">🔧 Engine Priority</h3>
              <div className="space-y-2 text-xs">
                {[
                  { icon: '📊', label: 'Excel/CSV Import', acc: '95%', color: 'bg-green-100 text-green-700' },
                  { icon: '📄', label: 'PDF Text Parser', acc: '85%', color: 'bg-blue-100 text-blue-700' },
                  { icon: '🔍', label: 'Table Detection', acc: '80%', color: 'bg-purple-100 text-purple-700' },
                  { icon: '👁️', label: 'Tesseract OCR', acc: '65%', color: 'bg-yellow-100 text-yellow-700' },
                ].map(e => (
                  <div key={e.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2">{e.icon} {e.label}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${e.color}`}>{e.acc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="space-y-4">
            {!result && !scanning && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center py-20">
                <Sparkles size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">Upload a document to see AI-extracted data</p>
                <p className="text-xs text-gray-300 mt-2">Best results: Excel → PDF → Image</p>
              </div>
            )}

            {result && (
              <>
                <div className={`rounded-2xl p-4 ${result.confidence?.reviewRequired ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.confidence?.reviewRequired ? <AlertTriangle size={16} className="text-yellow-600" /> : <CheckCircle size={16} className="text-green-600" />}
                      <span className="text-sm font-bold">{result.confidence?.summary}</span>
                    </div>
                    <ConfBadge value={result.confidence?.overall || 0} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Clock size={16} className="text-blue-600" /> Metrics</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500">Engine</span><p className="font-bold text-gray-800">{result.engine}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500">Time</span><p className="font-bold text-gray-800">{result.processingTimeMs}ms</p></div>
                    <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500">File Type</span><p className="font-bold text-gray-800">{result.fileType}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500">Courses</span><p className="font-bold text-gray-800">{editedCourses.length}</p></div>
                    {result.tableDetected && (
                      <div className="bg-purple-50 rounded-lg p-2.5 col-span-2"><span className="text-purple-500">📊 Table Detected</span><p className="font-bold text-purple-700">{result.tableRows} rows @ {result.tableConfidence}% accuracy</p></div>
                    )}
                  </div>
                  {result.deduplication?.duplicatesRemoved > 0 && (
                    <div className="mt-3 bg-blue-50 rounded-lg p-2.5 text-xs text-blue-700">✨ {result.deduplication.duplicatesRemoved} duplicate(s) auto-merged</div>
                  )}
                </div>

                {/* Column Mapping (Excel) */}
                {result.columnMapping && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">📋 Auto Column Mapping</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.columnMapping).map(([orig, mapped]) => (
                        <div key={orig} className="flex items-center gap-2 text-xs bg-green-50 rounded-lg px-2 py-1.5">
                          <span className="text-gray-500 truncate">{orig}</span>
                          <span className="text-green-600">→</span>
                          <span className="font-bold text-green-700">{mapped as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* RESULTS TAB — Editable Review Grid */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {editedCourses.length > 0 && (
            <>
              {/* Action Bar */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <span className="text-sm font-bold text-gray-700">{editedCourses.length} courses extracted</span>
                <div className="flex gap-2">
                  <button onClick={approveAll} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition"><Check size={12} /> Approve All</button>
                  <button onClick={exportCSV} className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition"><Download size={12} /> Export CSV</button>
                  <button onClick={publishToDB} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm"><Save size={12} /> Publish to DB</button>
                </div>
              </div>

              {/* College Info */}
              {result?.college && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">🏫 Detected College</h3>
                  <p className="font-bold text-gray-800">{result.college.name}</p>
                  {result.college.website && <p className="text-xs text-blue-500">🌐 {result.college.website}</p>}
                </div>
              )}

              {/* Editable Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 w-8">#</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Course</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Stream</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Degree</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Duration</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500">Fee</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 w-16">Conf</th>
                        <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-500 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedCourses.map((c, i) => (
                        <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50/50 ${c.needsReview ? 'bg-yellow-50/30' : ''}`}>
                          <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                          <td className="px-3 py-2">
                            <input value={c.normalizedName || ''} onChange={e => updateCourse(i, 'normalizedName', e.target.value)}
                              className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none py-0.5" />
                          </td>
                          <td className="px-3 py-2">
                            <input value={c.stream || ''} onChange={e => updateCourse(i, 'stream', e.target.value)}
                              className="w-full text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none py-0.5" />
                          </td>
                          <td className="px-3 py-2">
                            <input value={c.degreeType || ''} onChange={e => updateCourse(i, 'degreeType', e.target.value)}
                              className="w-full text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none py-0.5" />
                          </td>
                          <td className="px-3 py-2">
                            <input value={c.duration || ''} onChange={e => updateCourse(i, 'duration', e.target.value)}
                              className="w-full text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none py-0.5" />
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-xs font-bold text-green-700">{c.fee?.display || '—'}</span>
                          </td>
                          <td className="px-3 py-2"><ConfBadge value={c.confidence || 0} /></td>
                          <td className="px-3 py-2">
                            <button onClick={() => removeCourse(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fees Section */}
              {result?.fees?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">💰 Detected Fees ({result.fees.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.fees.map((f: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-xs text-gray-600 truncate block max-w-[200px]">{f.label}</span>
                          <span className="text-xs text-gray-400">{f.category}</span>
                        </div>
                        <span className="text-sm font-bold text-green-700">{f.display}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result?.warnings?.map((w: string, i: number) => (
                <div key={i} className="bg-yellow-50 rounded-lg px-4 py-2.5 text-xs text-yellow-700 flex items-center gap-1.5 border border-yellow-100">
                  <AlertTriangle size={12} /> {w}
                </div>
              ))}

              {/* Normalized Text */}
              {result?.normalizedText && (
                <details className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <summary className="font-bold text-sm text-gray-700 cursor-pointer flex items-center gap-2"><Eye size={14} className="text-gray-400" /> View Extracted Text</summary>
                  <pre className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">{result.normalizedText}</pre>
                </details>
              )}
            </>
          )}

          {editedCourses.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No results yet. Upload and scan a document first.</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
