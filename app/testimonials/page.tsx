'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { Quote, Star, GraduationCap, Search } from 'lucide-react';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/testimonials').then(r => r.json()).then(data => {
      setTestimonials((Array.isArray(data) ? data : data?.data || []).filter((t: any) => t.active !== false));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = testimonials.filter(t => {
    if (!search) return true;
    return [t.name, t.content, t.message, t.course, t.collegeName]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
  });

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.filter(t => t.rating).length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="inline-block bg-purple-100 text-purple-700 text-sm px-4 py-1 rounded-full font-medium mb-3">Success Stories</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">What Our Students Say</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Real experiences from students we've helped find their dream colleges</p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-purple-600">{testimonials.length}</p>
              <p className="text-xs text-gray-400">Reviews</p>
            </div>
            {avgRating && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star size={16} className="text-yellow-400" fill="currentColor" />
                  <span className="text-2xl font-extrabold text-gray-800">{avgRating}</span>
                </div>
                <p className="text-xs text-gray-400">Average</p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search testimonials..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" />
        </div>

        {loading ? (
          <div className="text-center py-16"><div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map(t => (
              <div key={t._id} className="break-inside-avoid bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
                <Quote size={20} className="text-purple-200 mb-2" />
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{t.content || t.message}</p>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(t.name || 'S')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{t.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {[t.course, t.collegeName, t.year].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                  </div>
                  {t.rating && (
                    <div className="flex items-center gap-0.5 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className={i < t.rating ? 'text-yellow-400' : 'text-gray-200'} fill={i < t.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  )}
                  {t.placementCompany && (
                    <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                      <GraduationCap size={10} /> Placed at {t.placementCompany}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Quote size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No testimonials match your search</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
