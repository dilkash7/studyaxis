'use client';
import { useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Sparkles, Upload, FileText, AlertTriangle, CheckCircle, Clock, Trash2, Save, Eye } from 'lucide-react';

export default function OCRScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [editedCourses, setEditedCourses] = useState<any[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setImageUrl(''); setResult(null); }
  };

  const handleScan = async () => {
    setScanning(true); setError(''); setResult(null);
    try {
      let res;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        res = await axios.post('/api/ocr', fd, { headers });
      } else if (imageUrl) {
        res = await axios.post('/api/ocr', { imageUrl }, { headers });
      } else {
        setError('Upload an image or enter a URL'); setScanning(false); return;
      }
      setResult(res.data);
      setEditedCourses(res.data.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'OCR scan failed');
    } finally { setScanning(false); }
  };

  const updateCourse = (i: number, field: string, value: string) => {
    setEditedCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const removeCourse = (i: number) => {
    setEditedCourses(prev => prev.filter((_, idx) => idx !== i));
  };

  const ConfBadge = ({ value }: { value: number }) => {
    const color = value >= 85 ? 'bg-green-100 text-green-700' : value >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
    return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${color}`}>{value}%</span>;
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400";

  return (
    <AdminLayout title="AI Brochure Scanner">
      <p className="text-gray-500 text-sm mb-4">Upload brochure → AI extracts + normalizes → You review + save structured data</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Upload + Original Image */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Upload size={16} className="text-purple-600" /> Upload Source</h3>

            <div className="border-2 border-dashed border-purple-200 rounded-xl p-5 text-center hover:border-purple-400 transition cursor-pointer" onClick={() => document.getElementById('ocr-file')?.click()}>
              <input id="ocr-file" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-52 mx-auto rounded-xl" />
              ) : (
                <div>
                  <FileText size={28} className="mx-auto text-purple-300 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload (JPG, PNG, WEBP)</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                </div>
              )}
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or URL</span></div>
            </div>
            <input placeholder="https://... (direct image URL)" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setFile(null); setPreview(''); }} className={inp} />

            <button onClick={handleScan} disabled={scanning} className={`w-full mt-3 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${scanning ? 'bg-gray-400 text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'}`}>
              {scanning ? <><span className="animate-spin">⏳</span> Scanning...</> : <><Sparkles size={14} /> Scan with Tesseract AI</>}
            </button>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>

          {/* Metrics */}
          {result && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Clock size={16} className="text-blue-600" /> Scan Metrics</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500">Engine</span><p className="font-bold text-gray-800">{result.ocrEngine}</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500">Time</span><p className="font-bold text-gray-800">{result.processingTimeMs}ms</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500">OCR Raw</span><p className="font-bold text-gray-800">{Math.round(result.ocrConfidence)}%</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-gray-500">Overall</span><p className="font-bold text-gray-800"><ConfBadge value={result.confidence?.overall || 0} /></p></div>
              </div>
              {result.deduplication?.duplicatesRemoved > 0 && (
                <div className="mt-3 bg-blue-50 rounded-lg p-2.5 text-xs text-blue-700">
                  ✨ {result.deduplication.duplicatesRemoved} duplicate course(s) auto-merged
                </div>
              )}
              {result.warnings?.map((w: string, i: number) => (
                <div key={i} className="mt-2 bg-yellow-50 rounded-lg p-2.5 text-xs text-yellow-700 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> {w}
                </div>
              ))}
            </div>
          )}

          {/* Normalized Text */}
          {result?.normalizedText && (
            <details className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <summary className="font-bold text-gray-800 flex items-center gap-2 cursor-pointer"><Eye size={16} className="text-gray-500" /> Normalized Text</summary>
              <pre className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">{result.normalizedText}</pre>
            </details>
          )}
        </div>

        {/* RIGHT: AI Review Panel */}
        <div className="space-y-4">
          {!result && !scanning && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center py-20">
              <Sparkles size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Upload an image to see AI-extracted data</p>
            </div>
          )}

          {result && (
            <>
              {/* Confidence Banner */}
              <div className={`rounded-2xl p-4 ${result.confidence?.reviewRequired ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.confidence?.reviewRequired ? <AlertTriangle size={16} className="text-yellow-600" /> : <CheckCircle size={16} className="text-green-600" />}
                    <span className="text-sm font-bold">{result.confidence?.summary}</span>
                  </div>
                  <ConfBadge value={result.confidence?.overall || 0} />
                </div>
              </div>

              {/* College */}
              {result.college && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">🏫 Detected College</h3>
                  <p className="text-sm font-bold text-gray-800">{result.college.name}</p>
                  {result.college.campus && <p className="text-xs text-gray-500 mt-1">Campus: {result.college.campus}</p>}
                  {result.college.website && <p className="text-xs text-blue-600 mt-1">🌐 {result.college.website}</p>}
                  {result.college.phone && <p className="text-xs text-gray-500 mt-1">📱 {result.college.phone}</p>}
                  {result.college.email && <p className="text-xs text-gray-500 mt-1">📧 {result.college.email}</p>}
                </div>
              )}

              {/* Courses — EDITABLE */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📚 Detected Courses ({editedCourses.length})</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {editedCourses.map((c: any, i: number) => (
                    <div key={i} className={`rounded-xl p-3 border ${c.needsReview ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <input value={c.normalizedName} onChange={e => updateCourse(i, 'normalizedName', e.target.value)} className="flex-1 text-sm font-bold text-gray-800 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none pb-0.5" />
                        <div className="flex items-center gap-1 shrink-0">
                          <ConfBadge value={c.confidence} />
                          <button onClick={() => removeCourse(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.stream && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{c.stream}</span>}
                        {c.degreeType && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{c.degreeType}</span>}
                        {c.specialization && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{c.specialization}</span>}
                        {c.duration && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{c.duration}</span>}
                        {c.fee && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{c.fee.display}</span>}
                      </div>
                      {c.needsReview && <p className="text-xs text-yellow-600 mt-1.5">⚠️ Low confidence — please verify</p>}
                    </div>
                  ))}
                  {editedCourses.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No courses detected</p>}
                </div>
              </div>

              {/* Fees */}
              {result.fees?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">💰 Detected Fees ({result.fees.length})</h3>
                  <div className="space-y-1.5">
                    {result.fees.map((f: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-xs text-gray-600 truncate block max-w-[180px]">{f.label}</span>
                          <span className="text-xs text-gray-400">{f.category}</span>
                        </div>
                        <span className="text-sm font-bold text-green-700">{f.display}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dedup Log */}
              {result.deduplication?.mergeLog?.length > 0 && (
                <details className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <summary className="text-xs font-bold text-gray-500 uppercase cursor-pointer">🔗 Merge Log</summary>
                  <div className="mt-2 space-y-1">
                    {result.deduplication.mergeLog.map((log: string, i: number) => (
                      <p key={i} className="text-xs text-gray-500">{log}</p>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
