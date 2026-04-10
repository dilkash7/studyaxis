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

export default function AbroadPage() {
  const [colleges, setColleges] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/locations?type=country').then(r => setCountries(r.data));
    fetchColleges('');
  }, []);

  const fetchColleges = async (country: string) => {
    setLoading(true);
    const url = country ? `/api/colleges?type=abroad&country=${country}` : '/api/colleges?type=abroad';
    const res = await axios.get(url);
    setColleges(res.data);
    setLoading(false);
  };

  const handleCountry = (country: string) => {
    setSelectedCountry(country);
    fetchColleges(country);
  };

  const filtered = colleges.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-14 px-6 text-center">
        <div className="text-5xl mb-3">🌍</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Study Abroad</h1>
        <p className="text-blue-100 text-lg">Top universities in Russia, Uzbekistan and more</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search universities by name..."
            className="w-full md:w-96 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm" />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => handleCountry('')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedCountry === '' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'}`}>
            All Countries
          </button>
          {countries.map((l: any) => (
            <button key={l._id} onClick={() => handleCountry(l.name)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedCountry === l.name ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'}`}>
              {l.flag} {l.name}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            <p className="text-gray-500 text-sm mb-6">{filtered.length} universities found</p>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">🌍</div>
                <p className="text-xl font-medium">No universities found</p>
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