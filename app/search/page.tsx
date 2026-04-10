'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import CollegeCard from '@/components/frontend/CollegeCard';
import WhatsAppButton from '@/components/frontend/WhatsAppButton';
import FAQChatbot from '@/components/frontend/FAQChatbot';
import CounsellingBot from '@/components/frontend/CounsellingBot';
import Loader from '@/components/ui/Loader';
import Link from 'next/link';
import { Search } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<any>({ colleges: [], courses: [] });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(q);

  useEffect(() => {
    if (q) { setQuery(q); doSearch(q); }
  }, [q]);

  const doSearch = async (val: string) => {
    if (!val.trim()) return;
    setLoading(true);
    const res = await axios.get(`/api/search?q=${encodeURIComponent(val)}`);
    setResults(res.data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-green-700 to-green-500 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-6">Search Colleges & Courses</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search colleges, courses, cities..."
              className="flex-1 px-4 sm:px-5 py-3 rounded-xl text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            <button type="submit"
              className="bg-white text-green-600 font-bold px-4 sm:px-6 py-3 rounded-xl hover:bg-green-50 transition flex items-center gap-2 shrink-0">
              <Search size={18} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? <Loader /> : (
          <>
            {q && (
              <p className="text-gray-500 text-sm mb-6">
                Found <strong>{results.colleges.length + results.courses.length}</strong> results for "<strong>{q}</strong>"
              </p>
            )}

            {results.colleges.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">🏫 Colleges ({results.colleges.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {results.colleges.map((c: any) => <CollegeCard key={c._id} college={c} />)}
                </div>
              </div>
            )}

            {results.courses.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">📚 Courses ({results.courses.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.courses.map((c: any) => (
                    <Link key={c._id} href={`/course/${c._id}`}
                      className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:border-green-400 hover:shadow-md transition group">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{c.icon || '📚'}</span>
                        <div>
                          <h3 className="font-bold text-gray-800 group-hover:text-green-600 text-sm">{c.name}</h3>
                          <p className="text-xs text-gray-500">{c.collegeName || '—'}</p>
                          <p className="text-xs text-gray-400">{c.duration || ''}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!loading && q && results.colleges.length === 0 && results.courses.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-medium">No results for "{q}"</p>
                <p className="text-sm mt-2">Try different keywords</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<Loader />}>
        <SearchResults />
      </Suspense>
      <Footer />
      <WhatsAppButton />
      <CounsellingBot />
      <FAQChatbot />
    </div>
  );
}