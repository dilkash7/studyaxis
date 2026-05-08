'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Film, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface FileUploaderProps {
  onUploadComplete: (result: UploadResult) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  currentUrl?: string;
  showPreview?: boolean;
}

interface UploadResult {
  url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  original_filename?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploader({
  onUploadComplete,
  folder = 'studyaxis',
  accept = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip',
  maxSizeMB = 50,
  label = 'Upload File',
  currentUrl = '',
  showPreview = true,
}: FileUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = useCallback((type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} className="text-blue-500" />;
    if (type.startsWith('video/')) return <Film size={20} className="text-purple-500" />;
    return <FileText size={20} className="text-orange-500" />;
  }, []);

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size check
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Max: ${maxSizeMB}MB.`);
      setStatus('error');
      return;
    }

    setFileName(file.name);
    setFileType(file.type);
    setError('');
    setStatus('uploading');
    setProgress(0);

    // Show local preview for images
    if (isImage(file.type) && showPreview) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }

    // Upload
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);

    try {
      const res = await axios.post('/api/upload', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(pct);
          }
        },
      });

      if (res.data.success || res.data.url) {
        setStatus('success');
        setPreviewUrl(res.data.url);
        setProgress(100);
        onUploadComplete(res.data);
      } else {
        throw new Error(res.data.error || 'Upload failed');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Upload failed';
      setError(errMsg);
      setStatus('error');
      setProgress(0);
    }
  };

  const handleClear = () => {
    setStatus('idle');
    setPreviewUrl('');
    setFileName('');
    setFileType('');
    setError('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{label}</label>

      {/* Upload Area */}
      <div
        onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden
          ${status === 'error' ? 'border-red-300 bg-red-50/50' : ''}
          ${status === 'success' ? 'border-green-300 bg-green-50/50' : ''}
          ${status === 'uploading' ? 'border-blue-300 bg-blue-50/50 cursor-wait' : ''}
          ${status === 'idle' ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Progress Bar */}
        {status === 'uploading' && (
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }} />
        )}

        <div className="p-5">
          {/* Idle state */}
          {status === 'idle' && !previewUrl && (
            <div className="flex flex-col items-center gap-2 py-3">
              <Upload size={32} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Click to upload</p>
              <p className="text-xs text-gray-400">Images, Videos, PDFs, Docs — Max {maxSizeMB}MB</p>
            </div>
          )}

          {/* Uploading */}
          {status === 'uploading' && (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader size={28} className="animate-spin text-blue-500" />
              <p className="text-sm font-semibold text-blue-600">Uploading... {progress}%</p>
              <p className="text-xs text-gray-400">{fileName}</p>
            </div>
          )}

          {/* Success with preview */}
          {status === 'success' && previewUrl && (
            <div className="flex items-center gap-4">
              {isImage(fileType) && showPreview ? (
                <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
              ) : isVideo(fileType) ? (
                <div className="w-20 h-20 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Film size={24} className="text-purple-600" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center">
                  <FileText size={24} className="text-orange-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-green-600 shrink-0" />
                  <p className="text-sm font-bold text-green-700">Upload complete</p>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{fileName}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition shrink-0">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          )}

          {/* Existing URL (no new upload) */}
          {status === 'idle' && previewUrl && (
            <div className="flex items-center gap-4">
              {previewUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img src={previewUrl} alt="Current" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FileText size={24} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 font-medium">Current file</p>
                <p className="text-xs text-gray-400 truncate">{previewUrl.split('/').pop()}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition shrink-0">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-center gap-3 py-2">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">Upload failed</p>
                <p className="text-xs text-red-500 mt-0.5">{error}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="text-xs text-red-600 font-medium hover:underline shrink-0">Retry</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
