'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import Link from 'next/link';
import { Award, Search, Calendar, IndianRupee, GraduationCap, ChevronRight, X, Filter } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  Merit: 'bg-blue-100 text-blue-700', Government: 'bg-green-100 text-green-700',
  Private: 'bg-purple-100 text-purple-700', Minority: 'bg-orange-100 text-orange-700',
  Sports: 'bg-red-100 text-red-700', 'Income-Based': 'bg-yellow-100 text-yellow-700',
  International: 'bg-indigo-100 text-indigo-700', Research: 'bg-teal-100 text-teal-700',
};

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetch('/api/scholarships').then(r => r.json()).then(data => {
      setScholarships(Array.isArray(data) ? data : data?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = scholarships.filter(s => {
    if (!s.active && s.active !== undefined) return false;
    const matchSearch = !search || [s.name, s.description, s.provider].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const types = [...new Set(scholarships.map(s => s.type).filter(Boolean))].sort();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block bg-amber-100 text-amber-700 text-sm px-4 py-1 rounded-full font-medium mb-3">Financial Aid</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">🎓 Scholarships & Financial Aid</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Explore merit, government, and private scholarships to fund your education</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search scholarships..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm" />
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setTypeFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${typeFilter === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              All
            </button>
            {types.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${typeFilter === t ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">{filtered.length} scholarship{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Scholarship Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16"><div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length > 0 ? filtered.map(s => (
            <div key={s._id} className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-md transition group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h2 className="font-bold text-gray-800 text-lg">{s.name}</h2>
                    {s.type && <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${TYPE_COLORS[s.type] || 'bg-gray-100 text-gray-600'}`}>{s.type}</span>}
                  </div>
                  {s.provider && <p className="text-sm text-green-600 font-medium mb-2">by {s.provider}</p>}
                  {s.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {s.amount && (
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg font-bold">
                        <IndianRupee size={10} /> {s.amount}
                      </span>
                    )}
                    {s.deadline && (
                      <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg font-medium">
                        <Calendar size={10} /> Deadline: {new Date(s.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {s.eligibility && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">
                        <GraduationCap size={10} /> {s.eligibility.slice(0, 50)}
                      </span>
                    )}
                  </div>

                  {s.documentsRequired?.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">📄 Documents Required ({s.documentsRequired.length})</summary>
                      <ul className="mt-1 text-xs text-gray-500 space-y-0.5 pl-4">
                        {s.documentsRequired.map((d: string, i: number) => <li key={i}>• {d}</li>)}
                      </ul>
                    </details>
                  )}
                </div>
                <Award size={32} className="text-amber-200 shrink-0 group-hover:text-amber-400 transition" />
              </div>

              {s.applyLink && (
                <a href={s.applyLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition">
                  Apply Now <ChevronRight size={13} />
                </a>
              )}
            </div>
          )) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Award size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">No scholarships match your search</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
