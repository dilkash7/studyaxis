'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Award, Star, ChevronRight, Quote, Clock, Pin } from 'lucide-react';

export default function HomepageDynamic() {
  const [notices, setNotices] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/notices').then(r => r.json()).catch(() => []),
      fetch('/api/scholarships').then(r => r.json()).catch(() => []),
      fetch('/api/testimonials').then(r => r.json()).catch(() => []),
    ]).then(([n, s, t]) => {
      setNotices((Array.isArray(n) ? n : n?.data || []).filter((x: any) => x.isActive).slice(0, 3));
      setScholarships((Array.isArray(s) ? s : s?.data || []).filter((x: any) => x.active !== false).slice(0, 4));
      setTestimonials((Array.isArray(t) ? t : t?.data || []).filter((x: any) => x.active !== false).slice(0, 4));
    });
  }, []);

  const hasContent = notices.length > 0 || scholarships.length > 0 || testimonials.length > 0;
  if (!hasContent) return null;

  return (
    <>
      {/* Latest Notices */}
      {notices.length > 0 && (
        <section className="py-14 px-6 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-yellow-500" />
                <h2 className="text-2xl font-extrabold text-gray-900">Latest Notices</h2>
              </div>
              <Link href="/notices" className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notices.map(n => (
                <div key={n._id} className={`bg-white rounded-xl border p-4 hover:shadow-md transition ${n.pinned ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-2">
                    {n.pinned && <Pin size={12} className="text-yellow-500 mt-1 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{n.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        {n.category && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{n.category}</span>}
                        <span className="flex items-center gap-1"><Clock size={9} /> {new Date(n.publishDate || n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Scholarships */}
      {scholarships.length > 0 && (
        <section className="py-14 px-6 bg-gradient-to-br from-amber-50 to-yellow-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-amber-500" />
                <h2 className="text-2xl font-extrabold text-gray-900">Scholarships Available</h2>
              </div>
              <Link href="/scholarships" className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {scholarships.map(s => (
                <div key={s._id} className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{s.name}</h3>
                  {s.provider && <p className="text-xs text-green-600 font-medium mb-2">{s.provider}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {s.amount && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{s.amount}</span>}
                    {s.type && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s.type}</span>}
                    {s.deadline && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">⏰ {new Date(s.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-14 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-block bg-purple-100 text-purple-700 text-sm px-4 py-1 rounded-full font-medium mb-3">Success Stories</span>
              <h2 className="text-3xl font-extrabold text-gray-900">What Our Students Say</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {testimonials.map(t => (
                <div key={t._id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
                  <Quote size={20} className="text-green-300 mb-2" />
                  <p className="text-sm text-gray-600 line-clamp-4 mb-3">{t.content || t.message}</p>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{[t.course, t.collegeName, t.year].filter(Boolean).join(' • ')}</p>
                    {t.rating && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < t.rating ? 'text-yellow-400' : 'text-gray-200'} fill={i < t.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
