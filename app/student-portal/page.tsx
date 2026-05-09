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
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!phone && !appNumber) return alert('Enter phone or application number');
    setLoading(true);
    try {
      const query = phone ? `phone=${phone}` : '';
      const res = await fetch(`/api/applications?${query}`);
      let data = await res.json();
      if (appNumber) data = data.filter((a: any) => a.applicationNumber === appNumber);
      setResults(data);
    } catch { setResults([]); }
    setSearched(true);
    setLoading(false);
  };

  const getStageIndex = (status: string) => PIPELINE.indexOf(status);

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎓 Student Portal</h1>
          <p className="text-gray-500">Track your application status, payments, and admission progress.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-3">Find Your Application</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input placeholder="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <input placeholder="Application Number (SA-XXXXX)" value={appNumber} onChange={e => setAppNumber(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <button onClick={search} disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            <Search size={14} /> {loading ? 'Searching...' : 'Track Application'}
          </button>
        </div>

        {searched && results.length === 0 && (
          <div className="text-center py-10 text-gray-400">No application found. Please check your phone number or application number.</div>
        )}

        {results.map(app => {
          const stageIdx = getStageIndex(app.status);
          const Icon = STATUS_ICONS[app.status] || Clock;
          return (
            <div key={app._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{app.applicationNumber}</p>
                  <h3 className="font-bold text-gray-800 text-lg">{app.studentName}</h3>
                </div>
                <div className={`flex items-center gap-2 ${STATUS_COLORS[app.status] || 'text-gray-500'}`}>
                  <Icon size={18} />
                  <span className="font-bold text-sm">{app.status}</span>
                </div>
              </div>

              {/* Progress Pipeline */}
              <div className="flex items-center mb-6 overflow-x-auto">
                {PIPELINE.map((stage, i) => (
                  <div key={stage} className="flex items-center">
                    <div className={`flex flex-col items-center ${i <= stageIdx ? 'text-green-600' : 'text-gray-300'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= stageIdx ? 'bg-green-600 text-white border-green-600' : i === stageIdx + 1 ? 'border-green-300 text-green-400' : 'border-gray-200 text-gray-300'}`}>
                        {i < stageIdx ? '✓' : i + 1}
                      </div>
                      <span className="text-[9px] mt-1 whitespace-nowrap font-medium">{stage}</span>
                    </div>
                    {i < PIPELINE.length - 1 && <div className={`w-6 h-0.5 mx-0.5 mt-[-12px] ${i < stageIdx ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {[['College', app.collegeName], ['Course', app.course], ['Phone', app.phone], ['Submitted', new Date(app.submittedAt || app.createdAt).toLocaleDateString()]].filter(([, v]) => v).map(([k, v]) => (
                  <div key={String(k)} className="bg-gray-50 rounded-lg p-2">
                    <span className="text-xs text-gray-400 block">{k}</span>
                    <span className="font-medium text-gray-800 text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Footer />
    </div>
  );
}
