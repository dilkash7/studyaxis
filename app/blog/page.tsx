'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { Calendar, Eye, Tag, Search } from 'lucide-react';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    fetch('/api/blogs').then(r => r.json()).then(data => {
      setBlogs(data.filter((b: any) => b.isPublished));
    });
  }, []);

  const filtered = blogs.filter(b => {
    const matchSearch = !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || b.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(blogs.map(b => b.category).filter(Boolean))];

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📰 Blog & News</h1>
          <p className="text-gray-500">Latest updates on admissions, exams, career tips, and education news.</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCatFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!catFilter ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${catFilter === c ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(b => (
            <article key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
              {b.coverImage && (
                <div className="h-44 overflow-hidden">
                  <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{b.category}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} />{new Date(b.publishedAt || b.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition">{b.title}</h2>
                {b.excerpt && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{b.excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>By {b.author || 'Admin'}</span>
                  <span className="flex items-center gap-1"><Eye size={10} />{b.views || 0} views</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No articles found.</p>}
      </div>
      <Footer />
    </div>
  );
}
