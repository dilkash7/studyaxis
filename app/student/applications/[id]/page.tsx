'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import Loader from '@/components/ui/Loader';
import { FileText, UploadCloud, CheckCircle, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StudentApplicationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState('10th Marksheet');

  const fetchApplication = async () => {
    const token = localStorage.getItem('studentToken');
    if (!token) { router.push('/student/login'); return; }

    try {
      // The dashboard route returns all applications, we can filter it or fetch by ID
      const res = await axios.get('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const targetApp = res.data.applications.find((a: any) => a._id === id);
      if (!targetApp) { router.push('/student/dashboard'); return; }
      setApp(targetApp);
    } catch {
      router.push('/student/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplication(); }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      // Direct Cloudinary Upload (Uses unsigned preset 'studyaxis_uploads')
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'studyaxis_uploads'); 

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
      });
      const cloudData = await cloudRes.json();

      if (!cloudData.secure_url) throw new Error('Upload failed');

      // Bind document to application
      const token = localStorage.getItem('studentToken');
      await axios.post('/api/student/upload-document', {
        applicationId: id,
        documentName: docName,
        documentUrl: cloudData.secure_url
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert('Document successfully attached to your application!');
      fetchApplication(); // Refresh UI
    } catch (err) {
      alert('Failed to upload document. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!app) return null;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        
        <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          
          <div className="border-b border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm font-bold text-gray-400 mb-1">Application ID: {app.applicationNumber}</p>
              <h1 className="text-2xl font-extrabold text-gray-900">{app.collegeName || app.college?.name}</h1>
              <p className="text-gray-600 font-medium">{app.course}</p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2
              ${app.status === 'Accepted' || app.status === 'Enrolled' ? 'bg-green-100 text-green-700' :
                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                app.status === 'Documents Pending' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'}`}>
              {app.status === 'Accepted' || app.status === 'Enrolled' ? <CheckCircle size={16} /> :
               app.status === 'Documents Pending' ? <AlertCircle size={16} /> : <Clock size={16} />}
              {app.status}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {app.reviewNotes && (
              <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-yellow-800 mb-1 flex items-center gap-2">
                  <AlertCircle size={16} /> Counsellor Feedback
                </h3>
                <p className="text-sm text-yellow-700">{app.reviewNotes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Document Upload Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" /> Attached Documents
                </h3>
                
                {app.documents && app.documents.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {app.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2">
                          <FileText size={14} /> {doc.name}
                        </a>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${doc.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {doc.verified ? 'Verified' : 'Pending Review'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-6 italic">No documents uploaded yet.</p>
                )}

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-400 transition bg-gray-50">
                  <UploadCloud size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-bold text-gray-700 mb-2">Upload Missing Documents</p>
                  
                  <select 
                    value={docName} 
                    onChange={e => setDocName(e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-lg p-2 mb-4 focus:ring-blue-500 outline-none"
                  >
                    <option>10th Marksheet</option>
                    <option>12th Marksheet</option>
                    <option>Aadhaar / ID Card</option>
                    <option>Migration Certificate</option>
                    <option>Entrance Scorecard</option>
                  </select>

                  <label className={`w-full block bg-blue-600 text-white font-bold py-2 rounded-xl cursor-pointer hover:bg-blue-700 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? 'Uploading...' : 'Select File'}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-2">Max size: 5MB (PDF/JPG)</p>
                </div>
              </div>

              {/* Application Details Summary */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Application Details</h3>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-sm text-gray-500">Applicant</span>
                      <span className="text-sm font-bold text-gray-900">{app.studentName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-sm text-gray-500">Submitted On</span>
                      <span className="text-sm font-bold text-gray-900">{new Date(app.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-sm text-gray-500">Prev. Qualification</span>
                      <span className="text-sm font-bold text-gray-900">{app.previousQualification} ({app.percentage}%)</span>
                    </div>
                  </div>
                </div>

                {/* Conditional Payment UI */}
                {(app.status === 'Accepted' || app.status === 'Under Review') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Secure Your Seat</h3>
                    <p className="text-sm text-blue-700 mb-4">Pay the standard application/booking fee to proceed to enrollment.</p>
                    <button 
                      onClick={async () => {
                        const token = localStorage.getItem('studentToken');
                        try {
                          await axios.post('/api/student/pay', { applicationId: app._id, amount: 1500 }, { headers: { Authorization: `Bearer ${token}` } });
                          alert('Payment successful! (Simulated)');
                          window.location.reload();
                        } catch { alert('Payment failed.'); }
                      }}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md transition"
                    >
                      Pay ₹1,500 Online
                    </button>
                  </div>
                )}
                {app.status === 'Fee Paid' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                    <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                    <h3 className="text-lg font-bold text-emerald-900">Payment Verified</h3>
                    <p className="text-sm text-emerald-700">Your application fee has been processed. Awaiting final enrollment confirmation.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
