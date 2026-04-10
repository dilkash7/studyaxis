'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import InquiryForm from '@/components/frontend/InquiryForm';
import WhatsAppButton from '@/components/frontend/WhatsAppButton';
import FAQChatbot from '@/components/frontend/FAQChatbot';
import CounsellingBot from '@/components/frontend/CounsellingBot';
import Loader from '@/components/ui/Loader';
import { MapPin, Star, Building2, BookOpen, ChevronRight, FileText } from 'lucide-react';

export default function CollegeDetailPage() {
  const { id } = useParams();
  const [college, setCollege] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/colleges/${id}`),
      axios.get(`/api/courses?collegeId=${id}`),
    ]).then(([c, co]) => {
      setCollege(c.data);
      setCourses(co.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /><Loader />
    </div>
  );

  if (!college) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">
        <p className="text-6xl mb-4">🏫</p>
        <p className="text-xl font-medium">College not found</p>
        <Link href="/" className="text-green-600 hover:underline text-sm mt-2 block">← Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-green-600 transition">Home</Link>
          <ChevronRight size={14} />
          <Link href={college.type === 'india' ? '/india' : '/abroad'}
            className="hover:text-green-600 transition">
            {college.type === 'india' ? '🇮🇳 Study in India' : '🌍 Study Abroad'}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-xs">{college.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Banner Image */}
            <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-green-400 to-green-700 shadow-lg">
              {college.image ? (
                <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">🏫</div>
              )}
            </div>

            {/* College Info Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">{college.name}</h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <MapPin size={14} className="text-green-500" />
                  {college.city || college.country || 'N/A'}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  {college.rating || 4.0} Rating
                </span>
                {college.established && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                    <Building2 size={14} className="text-blue-500" />
                    Est. {college.established}
                  </span>
                )}
                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${college.type === 'india' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {college.type === 'india' ? '🇮🇳 India' : '🌍 Abroad'}
                </span>
                {college.featured && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-semibold">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Brochure Button */}
              {college.brochureUrl && (
                <a href={college.brochureUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition">
                  <FileText size={16} />
                  📄 View Brochure
                </a>
              )}
            </div>

            {/* About */}
            {college.description && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">About the College</h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{college.description}</p>
              </div>
            )}

            {/* Courses */}
            {courses.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-green-500" />
                  Courses Offered
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.map((c: any) => (
                    <Link key={c._id} href={`/course/${c._id}`}
                      className="flex items-center gap-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-400 rounded-xl p-4 transition group">
                      <span className="text-2xl sm:text-3xl shrink-0">{c.icon || '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition text-sm truncate">{c.name}</h3>
                        <p className="text-xs text-gray-500">{c.duration || 'Duration N/A'}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-green-500 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Fees */}
            {college.fees && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">💰 Fee Structure</h2>
                <p className="text-2xl sm:text-3xl font-extrabold text-green-600">{college.fees}</p>
                <p className="text-gray-500 text-sm mt-1">Starting fees (approx)</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <InquiryForm preselectedCollege={college.name} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
      <CounsellingBot />
      <FAQChatbot />
    </div>
  );
}