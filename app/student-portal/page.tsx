'use client';
import { useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { Search, FileText, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';

const STATUS_ICONS: Record<string, any> = {
  Submitted: Clock, 'Under Review': Search, 'Documents Pending': FileText,
  'Interview Scheduled': Clock, Accepted: CheckCircle, Rejected: XCircle,
  'Fee Paid': CreditCard, Enrolled: CheckCircle, Cancelled: XCircle,
};
const STATUS_COLORS: Record<string, string> = {
  Submitted: 'text-blue-600', 'Under Review': 'text-yellow-600', 'Documents Pending': 'text-orange-600',
  'Interview Scheduled': 'text-purple-600', Accepted: 'text-green-600', Rejected: 'text-red-600',
  'Fee Paid': 'text-emerald-600', Enrolled: 'text-teal-600', Cancelled: 'text-gray-500',
};

const PIPELINE = ['Submitted', 'Under Review', 'Documents Pending', 'Interview Scheduled', 'Accepted', 'Fee Paid', 'Enrolled'];

export default function StudentPortalPage() {
  const [phone, setPhone] = useState('');
  const [appNumber, setAppNumber] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tab, setTab] = useState('applications');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!phone && !appNumber) return alert('Enter phone or application number');
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (phone) query.append('phone', phone);
      if (appNumber) query.append('appNumber', appNumber);
      
      const res = await fetch(`/api/student-portal?${query.toString()}`);
      const data = await res.json();
      
      if (data.applications && data.applications.length > 0) {
        setResults(data.applications);
        setDocuments(data.records || []);
        setPayments(data.payments || []);
      } else {
        setResults([]);
      }
    } catch { setResults([]); }
    setSearched(true);
    setLoading(false);
  };

  const getStageIndex = (status: string) => PIPELINE.indexOf(status);

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎓 Student Dashboard</h1>
          <p className="text-gray-500">Track your application status, documents, and payments.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-3">Find Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input placeholder="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <input placeholder="Application Number (SA-XXXXX)" value={appNumber} onChange={e => setAppNumber(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <button onClick={search} disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            <Search size={14} /> {loading ? 'Searching...' : 'Access Dashboard'}
          </button>
        </div>

        {searched && results.length === 0 && (
          <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
            No profile found. Please check your phone number or application number.
          </div>
        )}

        {results.length > 0 && (
          <div className="mb-6 flex overflow-x-auto border-b border-gray-200">
            <button onClick={() => setTab('applications')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab === 'applications' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Applications ({results.length})</button>
            <button onClick={() => setTab('documents')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab === 'documents' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Documents ({documents.length})</button>
            <button onClick={() => setTab('payments')} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab === 'payments' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Payments ({payments.length})</button>
          </div>
        )}

        {tab === 'applications' && results.map(app => {
          const stageIdx = getStageIndex(app.status);
          const Icon = STATUS_ICONS[app.status] || Clock;
          return (
            <div key={app._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{app.applicationNumber}</p>
                  <h3 className="font-bold text-gray-800 text-lg">{app.studentName}</h3>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 ${STATUS_COLORS[app.status] || 'text-gray-500'}`}>
                  <Icon size={16} />
                  <span className="font-bold text-xs">{app.status}</span>
                </div>
              </div>

              {/* Progress Pipeline */}
              <div className="flex items-center mb-6 overflow-x-auto py-2">
                {PIPELINE.map((stage, i) => (
                  <div key={stage} className="flex items-center min-w-[80px]">
                    <div className={`flex flex-col items-center ${i <= stageIdx ? 'text-green-600' : 'text-gray-300'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= stageIdx ? 'bg-green-600 text-white border-green-600' : i === stageIdx + 1 ? 'border-green-300 text-green-400' : 'border-gray-200 text-gray-300'}`}>
                        {i < stageIdx ? '✓' : i + 1}
                      </div>
                      <span className="text-[10px] mt-1 whitespace-nowrap font-medium text-center leading-tight">{stage}</span>
                    </div>
                    {i < PIPELINE.length - 1 && <div className={`w-8 h-0.5 mx-1 mt-[-16px] ${i < stageIdx ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['College', app.collegeName], ['Course', app.course], ['Submitted', new Date(app.submittedAt || app.createdAt).toLocaleDateString()]].filter(([, v]) => v).map(([k, v]) => (
                  <div key={String(k)} className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs text-gray-400 block mb-1">{k}</span>
                    <span className="font-medium text-gray-800 text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {tab === 'documents' && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Uploaded Documents</h3>
            {documents.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No documents found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc: any) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{doc.documentType || 'Document'}</p>
                        <p className={`text-xs font-bold mt-0.5 ${doc.status === 'Verified' ? 'text-green-600' : doc.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{doc.status || 'Pending'}</p>
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">View</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No payment records found.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((pay: any) => (
                  <div key={pay._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">₹{pay.amount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{pay.paymentType || 'Fee Payment'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${pay.status === 'Success' ? 'bg-green-100 text-green-700' : pay.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{pay.status}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(pay.date || pay.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
