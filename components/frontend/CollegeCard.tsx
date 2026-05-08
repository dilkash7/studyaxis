'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MapPin, IndianRupee, Star, Building2, Heart, ArrowLeftRight } from 'lucide-react';

function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('wishlistColleges');
    if (saved) try { setIds(JSON.parse(saved)); } catch {}
  }, []);
  const toggle = (id: string) => {
    const updated = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    setIds(updated);
    localStorage.setItem('wishlistColleges', JSON.stringify(updated));
  };
  return { ids, toggle };
}

export default function CollegeCard({ college }: { college: any }) {
  const { ids: wishlist, toggle } = useWishlist();
  const isSaved = wishlist.includes(college._id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    toggle(college._id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const saved = localStorage.getItem('compareColleges');
    const current = saved ? JSON.parse(saved) : [];
    if (current.includes(college._id)) {
      window.location.href = '/compare';
      return;
    }
    if (current.length >= 3) { alert('Max 3 colleges for comparison'); return; }
    current.push(college._id);
    localStorage.setItem('compareColleges', JSON.stringify(current));
    window.location.href = '/compare';
  };

  return (
    <Link href={`/college/${college._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="h-48 bg-gradient-to-br from-green-400 to-green-700 relative overflow-hidden flex-shrink-0">
          {college.image ? (
            <img
              src={college.image}
              alt={college.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🏫</div>
          )}
          {college.featured && (
            <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}
          {/* Country badge */}
          <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${
            college.type === 'india' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {college.type === 'india' ? '🇮🇳 India' : '🌍 Abroad'}
          </span>

          {/* Wishlist + Compare buttons */}
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            <button onClick={handleCompare} title="Compare" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-blue-100 transition shadow-sm">
              <ArrowLeftRight size={14} className="text-blue-600" />
            </button>
            <button onClick={handleWishlist} title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'} className={`w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition shadow-sm ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-red-50'}`}>
              <Heart size={14} className={isSaved ? 'fill-current' : 'text-red-400'} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* College Name – NO truncation, always fully visible */}
          <h3 className="font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-green-600 transition break-words">
            {college.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
            <MapPin size={13} className="shrink-0" />
            <span>{[college.city, college.state, college.country].filter(Boolean).join(', ') || 'India'}</span>
          </div>

          {/* Campus info if available */}
          {college.campusName && (
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
              <Building2 size={12} className="shrink-0" />
              <span>{college.campusName}</span>
            </div>
          )}

          {/* Course tags – full names, no truncation */}
          {college.courses?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {college.courses.slice(0, 4).map((c: string) => (
                <span key={c} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 break-words">
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
              <IndianRupee size={13} />
              <span>{college.fees || 'Contact Us'}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Course type badge */}
              {college.courseType && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  college.courseType === 'UG'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {college.courseType}
                </span>
              )}
              <div className="flex items-center gap-1 text-yellow-500 text-sm">
                <Star size={13} fill="currentColor" />
                <span>{college.rating || 4.0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}