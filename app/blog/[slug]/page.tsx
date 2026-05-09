'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import Link from 'next/link';
import { Calendar, User, Eye, ArrowLeft, Tag, Share2 } from 'lucide-react';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`).then(r => r.json()).then(data => {
      setBlog(data);
      // Update document title
      if (data?.title) {
        document.title = `${data.title} | StudyAxis Blog`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.excerpt || data.title);
      }
      // Fetch related
      if (data?.category) {
        fetch(`/api/blogs?category=${encodeURIComponent(data.category)}`).then(r => r.json()).then(all => {
          const list = Array.isArray(all) ? all : all?.data || [];
          setRelated(list.filter((b: any) => b._id !== data._id && b.isPublished).slice(0, 3));
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📰</p>
        <p className="text-xl text-gray-500 font-medium">Article not found</p>
        <Link href="/blog" className="text-green-600 hover:underline text-sm mt-2 inline-block">← Back to Blog</Link>
      </div>
      <Footer />
    </div>
  );

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />

      {/* Hero Image */}
      {blog.coverImage && (
        <div className="w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-green-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{blog.title}</span>
        </div>

        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {blog.category && <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">{blog.category}</span>}
            {blog.tags?.map((t: string) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1"><Tag size={9} /> {t}</span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">{blog.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1.5"><User size={13} /> {blog.author || 'StudyAxis'}</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Eye size={13} /> {blog.views || 0} views</span>
          </div>

          {/* Article Body */}
          {blog.content ? (
            <div className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }} />
          ) : (
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{blog.body || blog.excerpt || 'No content available.'}</p>
          )}

          {/* Share */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium flex items-center gap-1"><Share2 size={13} /> Share:</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + shareUrl)}`} target="_blank"
              className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-200 transition">WhatsApp</a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank"
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-200 transition">Twitter</a>
            <button onClick={() => navigator.clipboard?.writeText(shareUrl)}
              className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition">Copy Link</button>
          </div>
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-extrabold text-gray-800 mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r._id} href={`/blog/${r.slug || r._id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition group">
                  <div className="h-28 overflow-hidden">
                    {r.coverImage ? (
                      <img src={r.coverImage} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-2xl">📝</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-green-600 transition">{r.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.publishedAt || r.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link href="/blog" className="flex items-center gap-2 text-green-600 text-sm font-medium hover:underline mb-8">
          <ArrowLeft size={14} /> Back to all articles
        </Link>
      </div>
      <Footer />
    </div>
  );
}
