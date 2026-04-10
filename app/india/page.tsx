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

export default function IndiaPage() {
  const [colleges, setColleges] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/locations?type=city').then(r => setCities(r.data));
    fetchColleges('');
  }, []);

  const fetchColleges = async (city: string) => {
    setLoading(true);
    const url = city ? `/api/colleges?type=india&city=${city}` : '/api/colleges?type=india';
    const res = await axios.get(url);
    setColleges(res.data);
    setLoading(false);
  };

  const handleCity = (city: string) => {
    setSelectedCity(city);
    fetchColleges(city);
  };

  const filtered = colleges.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fff7ed 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white py-14 px-6 text-center">
        <div className="text-5xl mb-3">🇮🇳</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Study in India</h1>
        <p className="text-orange-100 text-lg">Top colleges for MBBS, Engineering & more</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search colleges by name..."
            className="w-full md:w-96 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
        </div>

        {/* City Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => handleCity('')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedCity === '' ? 'bg-orange-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-400'}`}>
            All Cities
          </button>
          {cities.map((l: any) => (
            <button key={l._id} onClick={() => handleCity(l.name)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedCity === l.name ? 'bg-orange-500 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-400'}`}>
              {l.name}
            </button>
          ))}
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