'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';

const CAT_COLORS: Record<string, string> = {
  General: 'bg-gray-100 text-gray-700', Admission: 'bg-green-100 text-green-700',
  Fees: 'bg-blue-100 text-blue-700', Scholarship: 'bg-amber-100 text-amber-700',
  Placement: 'bg-purple-100 text-purple-700', Hostel: 'bg-pink-100 text-pink-700',
  Visa: 'bg-indigo-100 text-indigo-700', Exam: 'bg-red-100 text-red-700',
  Course: 'bg-teal-100 text-teal-700',
};

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/faqs').then(r => r.json()).then(data => {
      setFaqs(Array.isArray(data) ? data : data?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = faqs.filter(f => {
    if (f.active === false) return false;
    const matchSearch = !search || [f.question, f.answer].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchCat = catFilter === 'all' || f.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))].sort();

  // Group by category
  const grouped = new Map<string, any[]>();
  filtered.forEach(f => {
    const cat = f.category || 'General';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(f);
  });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm px-4 py-1 rounded-full font-medium mb-3">Help Center</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Find answers about admissions, fees, scholarships, placements, and more</p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm" />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          <button onClick={() => setCatFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition ${catFilter === 'all' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            All ({filtered.length})
          </button>
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${catFilter === c ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16"><div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length > 0 ? (
          <div className="space-y-8">
            {[...grouped.entries()].map(([cat, items]) => (
              <div key={cat}>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${CAT_COLORS[cat] || CAT_COLORS.General}`}>{cat}</span>
                  {items.length} questions
                </h2>
                <div className="space-y-2">
                  {items.map(f => {
                    const isOpen = openId === f._id;
                    return (
                      <div key={f._id} className={`bg-white rounded-xl border transition ${isOpen ? 'border-green-300 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                        <button onClick={() => setOpenId(isOpen ? null : f._id)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left">
                          <span className={`font-medium text-sm ${isOpen ? 'text-green-700' : 'text-gray-800'}`}>{f.question}</span>
                          {isOpen ? <ChevronUp size={16} className="text-green-500 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 border-t border-gray-50">
                            <p className="text-sm text-gray-600 leading-relaxed pt-3 whitespace-pre-line">{f.answer}</p>
                            {f.collegeName && <p className="text-xs text-gray-400 mt-2">🏫 {f.collegeName}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <HelpCircle size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No FAQs match your search</p>
          </div>
        )}

        {/* Still have questions */}
        <div className="mt-12 text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Still have questions?</h3>
          <p className="text-gray-500 text-sm mb-4">Our counsellors are here to help you with everything</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="https://wa.me/919876543210" target="_blank"
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition">
              💬 Chat on WhatsApp
            </a>
            <a href="/callback" className="border-2 border-green-600 text-green-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 transition">
              📞 Request Callback
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
