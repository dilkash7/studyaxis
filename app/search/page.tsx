'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin, Star } from 'lucide-react';

export default function AdvancedSearchPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ query: '', location: '', stream: '', type: '', minFee: '', maxFee: '', rating: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/colleges').then(r => r.json()),
      fetch('/api/fees').then(r => r.json()),
    ]).then(([c, f]) => { setColleges(c); setFees(f); setResults(c); });
  }, []);

  useEffect(() => {
    let r = [...colleges];
    if (filters.query) r = r.filter(c => [c.name, c.location, c.city].some(f => f?.toLowerCase().includes(filters.query.toLowerCase())));
    if (filters.location) r = r.filter(c => [c.location, c.city, c.state].some(f => f?.toLowerCase().includes(filters.location.toLowerCase())));
    if (filters.stream) r = r.filter(c => c.streams?.some((s: string) => s.toLowerCase().includes(filters.stream.toLowerCase())));
    if (filters.type) r = r.filter(c => c.type === filters.type);
    if (filters.rating) r = r.filter(c => (c.rating || 0) >= Number(filters.rating));
    if (filters.minFee || filters.maxFee) {
      const min = Number(filters.minFee) || 0;
      const max = Number(filters.maxFee) || Infinity;
      r = r.filter(c => {
        const cf = fees.filter(f => String(f.college) === String(c._id));
        if (!cf.length) return true;
        return cf.some(f => (f.amount || 0) >= min && (f.amount || 0) <= max);
      });
    }
    setResults(r);
  }, [filters, colleges, fees]);

  const locations = [...new Set(colleges.map(c => c.location || c.city).filter(Boolean))].sort();
  const streams = [...new Set(colleges.flatMap(c => c.streams || []).filter(Boolean))].sort();
  const clearFilters = () => setFilters({ query: '', location: '', stream: '', type: '', minFee: '', maxFee: '', rating: '' });
  const activeCount = Object.values(filters).filter(Boolean).length;
  const sel = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700";

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 Advanced College Search</h1>
          <p className="text-gray-500">Filter by location, stream, fees, rating, and more</p>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search colleges..." value={filters.query} onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition ${showFilters ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>
            <SlidersHorizontal size={14} /> Filters {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
        <div className="flex gap-6">
          {showFilters && (
            <div className="w-64 shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm sticky top-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-800">Filters</h3>
                  {activeCount > 0 && <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear</button>}
                </div>
                <div><label className="text-xs text-gray-500 font-medium mb-1 block">Location</label>
                  <select value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} className={sel}><option value="">All</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                <div><label className="text-xs text-gray-500 font-medium mb-1 block">Stream</label>
                  <select value={filters.stream} onChange={e => setFilters(f => ({ ...f, stream: e.target.value }))} className={sel}><option value="">All</option>{streams.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="text-xs text-gray-500 font-medium mb-1 block">Type</label>
                  <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className={sel}><option value="">All</option><option>Private</option><option>Government</option><option>Deemed</option><option>Abroad</option></select></div>
                <div><label className="text-xs text-gray-500 font-medium mb-1 block">Min Rating</label>
                  <select value={filters.rating} onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))} className={sel}><option value="">Any</option><option value="3">3+</option><option value="4">4+</option><option value="4.5">4.5+</option></select></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-gray-500 font-medium mb-1 block">Min Fee</label><input type="number" placeholder="₹" value={filters.minFee} onChange={e => setFilters(f => ({ ...f, minFee: e.target.value }))} className={sel} /></div>
                  <div><label className="text-xs text-gray-500 font-medium mb-1 block">Max Fee</label><input type="number" placeholder="₹" value={filters.maxFee} onChange={e => setFilters(f => ({ ...f, maxFee: e.target.value }))} className={sel} /></div>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-3">{results.length} colleges found</p>
            <div className="space-y-3">
              {results.map(c => (
                <Link key={c._id} href={`/college/${c._id}`} className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    {c.image ? <img src={c.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" /> : <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-2xl shrink-0">🏫</div>}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{c.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {c.location && <span className="flex items-center gap-1"><MapPin size={10} />{c.location}</span>}
                        {c.type && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{c.type}</span>}
                        {c.rating && <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500" />{c.rating}</span>}
                      </div>
                      {c.streams?.length > 0 && <div className="flex gap-1 mt-1.5 flex-wrap">{c.streams.slice(0, 4).map((s: string) => <span key={s} className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">{s}</span>)}</div>}
                    </div>
                  </div>
                </Link>
              ))}
              {results.length === 0 && <p className="text-center text-gray-400 py-10">No colleges match your filters.</p>}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}