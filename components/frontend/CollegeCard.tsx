import Link from 'next/link';
import { MapPin, IndianRupee, Star } from 'lucide-react';

export default function CollegeCard({ college }: { college: any }) {
  return (
    <Link href={`/college/${college._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition group cursor-pointer">
        <div className="h-48 bg-gradient-to-br from-green-400 to-green-700 relative overflow-hidden">
          {college.image ? (
            <img src={college.image} alt={college.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🏫</div>
          )}
          {college.featured && (
            <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">⭐ Featured</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1 group-hover:text-green-600 transition">{college.name}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
            <MapPin size={14} />
            <span>{college.city || college.country || 'India'}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
              <IndianRupee size={14} />
              <span>{college.fees || 'Contact Us'}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <Star size={14} fill="currentColor" />
              <span>{college.rating || 4.0}</span>
            </div>
          </div>
          {college.courses?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {college.courses.slice(0, 3).map((c: string) => (
                <span key={c} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}