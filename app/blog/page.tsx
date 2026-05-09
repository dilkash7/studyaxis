'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import Link from 'next/link';
import { Calendar, Eye, Tag, Search, ChevronRight, User } from 'lucide-react';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    fetch('/api/blogs').then(r => r.json()).then(data => {
      setBlogs((Array.isArray(data) ? data : data?.data || []).filter((b: any) => b.isPublished));
    });
  }, []);

  const filtered = blogs.filter(b => {
    const matchSearch = !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || b.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(blogs.map(b => b.category).filter(Boolean))];
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="inline-block bg-green-100 text-green-700 text-sm px-4 py-1 rounded-full font-medium mb-3">Education Insights</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Blog & News</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Latest updates on admissions, exams, career tips, and education news</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCatFilter('')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${!catFilter ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>All</button>
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${catFilter === c ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featured && (
          <Link href={`/blog/${featured.slug || featured._id}`} className="block mb-8 group">
            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-56 md:h-72 overflow-hidden">
                  {featured.coverImage ? (
                    <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-6xl">📰</div>
                  )}
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit mb-3">⭐ Featured</span>
                  <div className="flex items-center gap-3 mb-2 text-xs text-gray-400">
                    {featured.category && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{featured.category}</span>}
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(featured.publishedAt || featured.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-3 group-hover:text-green-600 transition">{featured.title}</h2>
                  {featured.excerpt && <p className="text-gray-500 mb-4 line-clamp-3">{featured.excerpt}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><User size={10} /> {featured.author || 'StudyAxis'}</span>
                    <span className="text-sm text-green-600 font-bold flex items-center gap-1 group-hover:underline">Read More <ChevronRight size={13} /></span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(b => (
            <Link key={b._id} href={`/blog/${b.slug || b._id}`}>
              <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group h-full flex flex-col">
                <div className="h-44 overflow-hidden shrink-0">
                  {b.coverImage ? (
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-4xl">📝</div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    {b.category && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{b.category}</span>}
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} />{new Date(b.publishedAt || b.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition">{b.title}</h2>
                  {b.excerpt && <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">{b.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                    <span className="flex items-center gap-1"><User size={10} /> {b.author || 'Admin'}</span>
                    <span className="flex items-center gap-1"><Eye size={10} />{b.views || 0}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 mt-4">
            <p className="text-5xl mb-3">📰</p>
            <p className="text-gray-400">No articles found</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
