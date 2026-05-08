'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import CollegeCard from '@/components/frontend/CollegeCard';
import WhatsAppButton from '@/components/frontend/WhatsAppButton';
import FAQChatbot from '@/components/frontend/FAQChatbot';
import CounsellingBot from '@/components/frontend/CounsellingBot';
import Loader from '@/components/ui/Loader';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function IndiaPage() {
  const [colleges, setColleges] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [courseType, setCourseType] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    axios.get('/api/locations?type=city').then(r => setCities(r.data));
    fetchColleges('', '');
  }, []);

  const fetchColleges = async (city: string, type: string) => {
    setLoading(true);
    let url = '/api/colleges?type=india';
    if (city) url += `&city=${city}`;
    const res = await axios.get(url);
    setColleges(res.data);
    setLoading(false);
  };

  const handleCity = (city: string) => {
    setSelectedCity(city);
    fetchColleges(city, courseType);
  };

  const handleCourseType = (type: string) => {
    setCourseType(type);
    fetchColleges(selectedCity, type);
  };

  const filtered = colleges.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fff7ed 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white py-12 sm:py-14 px-4 sm:px-6 text-center">
        <div className="text-5xl mb-3">🇮🇳</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Study in India</h1>
        <p className="text-orange-100 text-lg">Top colleges for MBBS, Engineering & more</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search + Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search colleges by name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-orange-400 transition shadow-sm sm:w-auto"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* Filter Section */}
        <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96 mb-6' : 'max-h-0'}`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            {/* Course Type Filter */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Course Level</label>
              <div className="flex flex-wrap gap-2">
                {['', 'UG', 'PG'].map(type => (
                  <button key={type} onClick={() => handleCourseType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      courseType === type
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-400'
                    }`}>
                    {type === '' ? 'All Levels' : type === 'UG' ? '🎓 Undergraduate' : '📚 Postgraduate'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* City Filter - horizontal scroll on mobile */}
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => handleCity('')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap shrink-0 ${
                selectedCity === '' ? 'bg-orange-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-400'
              }`}>
              All Cities
            </button>
            {cities.map((l: any) => (
              <button key={l._id} onClick={() => handleCity(l.name)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap shrink-0 ${
                  selectedCity === l.name ? 'bg-orange-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-400'
                }`}>
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Loader /> : (
          <>
            <p className="text-gray-500 text-sm mb-6">{filtered.length} colleges found</p>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">🏫</div>
                <p className="text-xl font-medium">No colleges found</p>
                <p className="text-sm mt-2">Try a different city or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((c: any) => <CollegeCard key={c._id} college={c} />)}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <WhatsAppButton />
      <CounsellingBot />
      <FAQChatbot />
    </div>
  );
}