'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import CollegeCard from '@/components/frontend/CollegeCard';
import { Heart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('wishlistColleges');
    if (!saved) { setLoading(false); return; }
    try {
      const ids = JSON.parse(saved);
      if (!Array.isArray(ids) || ids.length === 0) { setLoading(false); return; }
      axios.get('/api/colleges').then(r => {
        const matched = ids.map((id: string) => r.data.find((c: any) => c._id === id)).filter(Boolean);
        setColleges(matched);
        setLoading(false);
      });
    } catch { setLoading(false); }
  }, []);

  const clearAll = () => {
    localStorage.removeItem('wishlistColleges');
    setColleges([]);
  };

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart size={28} className="text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Saved Colleges</h1>
              <p className="text-gray-500 text-sm">{colleges.length} colleges in your wishlist</p>
            </div>
          </div>
          {colleges.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition">
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">No saved colleges yet</h2>
            <p className="text-gray-400 mb-6">Click the ❤️ button on any college card to save it here</p>
            <a href="/" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">Browse Colleges</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((c: any) => (
              <CollegeCard key={c._id} college={c} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
