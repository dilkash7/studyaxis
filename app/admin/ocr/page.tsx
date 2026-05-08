'use client';
import { useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Sparkles, Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function OCRScannerPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setImageUrl('');
    }
  };

  const handleScan = async () => {
    setScanning(true); setError(''); setResult(null);
    try {
      let res;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        res = await axios.post('/api/ocr', fd, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      } else if (imageUrl) {
        res = await axios.post('/api/ocr', { imageUrl }, { headers });
      } else {
        setError('Upload an image or enter a URL'); setScanning(false); return;
      }
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'OCR scan failed');
    } finally { setScanning(false); }
  };

  const inp = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400";

  return (
    <AdminLayout title="AI Brochure Scanner">
      <p className="text-gray-500 text-sm mb-6">Upload a brochure or fee sheet image — AI extracts courses, fees, and contacts automatically</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Upload size={18} className="text-purple-600" /> Upload Source</h3>

          {/* File Upload */}
          <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center hover:border-purple-400 transition cursor-pointer" onClick={() => document.getElementById('ocr-file')?.click()}>
            <input id="ocr-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl mb-2" />
            ) : (
              <div>
                <FileText size={32} className="mx-auto text-purple-300 mb-2" />
                <p className="text-sm text-gray-500">Click to upload brochure image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP supported</p>
              </div>
            )}
          </div>

          {/* OR URL */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400 uppercase">or paste URL</span></div>
          </div>
          <input placeholder="https://... (direct image URL)" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setFile(null); setPreview(''); }} className={inp} />

          {/* Scan Button */}
          <button onClick={handleScan} disabled={scanning} className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${scanning ? 'bg-gray-400 text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'}`}>
            {scanning ? (
              <><span className="animate-spin">⏳</span> Scanning with AI...</>
            ) : (
              <><Sparkles size={16} /> Scan with Google Vision AI</>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><Sparkles size={18} className="text-purple-600" /> AI Results</h3>

          {!result && !scanning && (
            <div className="text-center py-16 text-gray-300">
              <Sparkles size={48} className="mx-auto mb-3" />
              <p className="text-sm">Upload an image to see AI-extracted data</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Confidence */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${result.confidence >= 70 ? 'bg-green-500' : result.confidence >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${result.confidence}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-700">{result.confidence}%</span>
              </div>

              {/* Courses */}
              {result.courses?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">📚 Detected Courses ({result.courses.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.courses.map((c: any, i: number) => (
                      <div key={i} className="bg-purple-50 border border-purple-100 rounded-lg p-2.5">
                        <p className="text-sm font-bold text-purple-800">{c.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {c.mainCategory && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{c.mainCategory}</span>}
                          {c.courseType && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{c.courseType}</span>}
                          {c.duration && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{c.duration}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fees */}
              {result.fees?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">💰 Detected Fees ({result.fees.length})</h4>
                  <div className="space-y-1">
                    {result.fees.map((f: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-600 truncate max-w-[60%]">{f.label}</span>
                        <span className="text-sm font-bold text-green-700">{f.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {(result.contactInfo?.phones?.length > 0 || result.contactInfo?.emails?.length > 0) && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">📞 Contact Info</h4>
                  <div className="space-y-1 text-xs text-gray-700">
                    {result.contactInfo.phones.map((p: string, i: number) => <p key={i}>📱 {p}</p>)}
                    {result.contactInfo.emails.map((e: string, i: number) => <p key={i}>📧 {e}</p>)}
                    {result.contactInfo.websites?.slice(0, 3).map((w: string, i: number) => <p key={i}>🌐 {w}</p>)}
                  </div>
                </div>
              )}

              {/* Raw Text */}
              <details className="mt-2">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">View raw extracted text</summary>
                <pre className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">{result.rawText}</pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
