'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin, Star, Shield, BookOpen, ChevronRight, X, ArrowUpDown, Building2 } from 'lucide-react';

type SortKey = 'name' | 'rating' | 'established';

export default function AdvancedSearchPage() {
  const searchParams = useSearchParams();
  const [colleges, setColleges] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [sort, setSort] = useState<SortKey>('rating');
  const [filters, setFilters] = useState({
    query: searchParams?.get('q') || '',
    city: searchParams?.get('city') || '',
    state: searchParams?.get('state') || '',
    stream: searchParams?.get('stream') || '',
    type: searchParams?.get('type') || '',
    rating: '',
    accreditation: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/colleges').then(r => r.json()),
      fetch('/api/courses').then(r => r.json()),
    ]).then(([c, co]) => {
      setColleges(c);
      setCourses(Array.isArray(co) ? co : []);
      setResults(c);
    });
  }, []);

  useEffect(() => {
    let r = [...colleges];
    if (filters.query) r = r.filter(c => [c.name, c.city, c.state, c.country, c.description].some(f => f?.toLowerCase().includes(filters.query.toLowerCase())));
    if (filters.city) r = r.filter(c => c.city?.toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.state) r = r.filter(c => c.state?.toLowerCase().includes(filters.state.toLowerCase()));
    if (filters.type) r = r.filter(c => c.type === filters.type);
    if (filters.rating) r = r.filter(c => (c.rating || 0) >= Number(filters.rating));
    if (filters.accreditation) r = r.filter(c => c.accreditation?.toLowerCase().includes(filters.accreditation.toLowerCase()));
    if (filters.stream) {
      const streamCollegeIds = new Set(courses.filter(co => co.mainCategory?.toLowerCase().includes(filters.stream.toLowerCase())).map(co => String(co.collegeId)));
      r = r.filter(c => streamCollegeIds.has(String(c._id)));
    }

    // Sort
    r.sort((a, b) => {
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sort === 'established') return (a.established || '9999').localeCompare(b.established || '9999');
      return 0;
    });

    setResults(r);
  }, [filters, colleges, courses, sort]);

  const cities = [...new Set(colleges.map(c => c.city).filter(Boolean))].sort();
  const states = [...new Set(colleges.map(c => c.state).filter(Boolean))].sort();
  const streams = [...new Set(courses.map(c => c.mainCategory).filter(Boolean))].sort();
  const clearFilters = () => setFilters({ query: '', city: '', state: '', stream: '', type: '', rating: '', accreditation: '' });
  const activeCount = Object.values(filters).filter(Boolean).length;
  const courseCountMap = new Map<string, number>();
  courses.forEach(c => courseCountMap.set(String(c.collegeId), (courseCountMap.get(String(c.collegeId)) || 0) + 1));

  const sel = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700";

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Find Your Perfect College</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Search {colleges.length}+ colleges by location, stream, rating, accreditation, and more</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-6 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search by college name, city, or state..." value={filters.query}
              onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold border transition shadow-sm ${showFilters ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            <SlidersHorizontal size={14} /> Filters {activeCount > 0 && <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{activeCount}</span>}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 shrink-0 hidden sm:block">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm sticky top-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-sm">Filters</h3>
                  {activeCount > 0 && <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1"><X size={10} /> Clear</button>}
                </div>

                <div><label className="text-xs text-gray-500 font-bold mb-1 block">State</label>
                  <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))} className={sel}>
                    <option value="">All States</option>{states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 font-bold mb-1 block">City</label>
                  <select value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} className={sel}>
                    <option value="">All Cities</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 font-bold mb-1 block">Stream</label>
                  <select value={filters.stream} onChange={e => setFilters(f => ({ ...f, stream: e.target.value }))} className={sel}>
                    <option value="">All Streams</option>{streams.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 font-bold mb-1 block">Type</label>
                  <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className={sel}>
                    <option value="">All</option>
                    <option value="india">🇮🇳 India</option>
                    <option value="abroad">🌍 Abroad</option>
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 font-bold mb-1 block">Min Rating</label>
                  <select value={filters.rating} onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))} className={sel}>
                    <option value="">Any</option>
                    <option value="3">3+ ⭐</option>
                    <option value="4">4+ ⭐</option>
                    <option value="4.5">4.5+ ⭐</option>
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 font-bold mb-1 block">Accreditation</label>
                  <select value={filters.accreditation} onChange={e => setFilters(f => ({ ...f, accreditation: e.target.value }))} className={sel}>
                    <option value="">Any</option>
                    <option value="NAAC">NAAC</option>
                    <option value="NBA">NBA</option>
                    <option value="NIRF">NIRF</option>
                    <option value="UGC">UGC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{results.length} college{results.length !== 1 ? 's' : ''} found</p>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={12} className="text-gray-400" />
                <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none text-gray-600">
                  <option value="rating">Top Rated</option>
                  <option value="name">A-Z</option>
                  <option value="established">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
                  <button key={k} onClick={() => setFilters(f => ({ ...f, [k]: '' }))}
                    className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1 hover:bg-green-100 transition">
                    {k}: {v} <X size={10} />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {results.map(c => {
                const courseCount = courseCountMap.get(String(c._id)) || 0;
                return (
                  <Link key={c._id} href={`/college/${c.slug || c._id}`}
                    className="group block bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg hover:border-green-200 transition-all">
                    <div className="flex items-start gap-4">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-3xl shrink-0">🏫</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition truncate">{c.name}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {(c.city || c.state) && (
                                <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={10} /> {[c.city, c.state].filter(Boolean).join(', ')}</span>
                              )}
                              {c.rating && (
                                <span className="flex items-center gap-1 text-xs text-gray-600"><Star size={10} className="text-yellow-500" fill="currentColor" /> {c.rating}</span>
                              )}
                              {c.established && (
                                <span className="flex items-center gap-1 text-xs text-gray-400"><Building2 size={10} /> {c.established}</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-green-500 transition shrink-0 mt-1" />
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.accreditation && (
                            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Shield size={8} /> {c.accreditation}</span>
                          )}
                          {c.verified && (
                            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Verified</span>
                          )}
                          {c.type && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{c.type === 'india' ? '🇮🇳 India' : '🌍 Abroad'}</span>
                          )}
                          {courseCount > 0 && (
                            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1"><BookOpen size={8} /> {courseCount} courses</span>
                          )}
                          {c.featured && (
                            <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">⭐ Featured</span>
                          )}
                        </div>

                        {c.description && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{c.description.slice(0, 150)}{c.description.length > 150 ? '...' : ''}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {results.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-gray-500 font-medium">No colleges match your filters</p>
                  <button onClick={clearFilters} className="text-sm text-green-600 hover:underline mt-2">Clear all filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}