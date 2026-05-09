'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Search, Heart, ArrowLeftRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [settings, setSettings] = useState<any>({ siteName: 'StudyAxis', logoUrl: '', whatsapp: '919876543210' });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    axios.get('/api/settings/homepage').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  // Prevent hydration mismatch: render a stable skeleton on server
  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-bold text-green-600">StudyAxis</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">Home</Link>
            <Link href="/college-finder" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">🎓 Find College</Link>
            <Link href="/india" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">India</Link>
            <Link href="/abroad" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">Abroad</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-bold text-green-600">{settings.siteName || 'StudyAxis'}</span>
          )}
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search colleges, courses..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white" />
          </div>
        </form>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">Home</Link>
          <Link href="/college-finder" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">🎓 Find College</Link>
          <Link href="/india" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">India</Link>
          <Link href="/abroad" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">Abroad</Link>
          <Link href="/apply" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">Apply</Link>
          <Link href="/visa-guidance" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">Visa</Link>
          <Link href="/career-guidance" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">Careers</Link>
          <Link href="/blog" className="text-gray-600 hover:text-green-600 font-medium transition text-sm">Blog</Link>
          <Link href="/compare" className="text-gray-600 hover:text-green-600 font-medium transition text-sm flex items-center gap-1"><ArrowLeftRight size={13} /> Compare</Link>
          <Link href="/saved" className="text-gray-600 hover:text-red-500 font-medium transition text-sm flex items-center gap-1"><Heart size={13} /> Saved</Link>
          <Link href="/admin/login" className="text-gray-500 hover:text-green-600 text-xs border border-gray-200 px-3 py-1 rounded-full transition">Admin</Link>
          <a href={`https://wa.me/${settings.whatsapp || '919876543210'}`} target="_blank"
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition text-sm font-medium">
            <Phone size={14} /> Contact
          </a>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-gray-600">
            <Search size={20} />
          </button>
          <button onClick={() => setOpen(!open)} className="p-2">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {showSearch && (
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3 border-t">
          <div className="relative mt-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search colleges, courses..."
              autoFocus
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        </form>
      )}

      {open && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-2">
          {[
            { href: '/', label: 'Home' },
            { href: '/college-finder', label: '🎓 Find Your College' },
            { href: '/india', label: 'Study in India' },
            { href: '/abroad', label: 'Study Abroad' },
            { href: '/apply', label: 'Apply Now' },
            { href: '/visa-guidance', label: '✈️ Visa Guidance' },
            { href: '/career-guidance', label: '💼 Career Guidance' },
            { href: '/blog', label: '📰 Blog & News' },
            { href: '/callback', label: '📞 Request Callback' },
            { href: '/search', label: '🔍 Advanced Search' },
            { href: '/student-portal', label: '🎓 Student Portal' },
            { href: '/compare', label: '⚖️ Compare Colleges' },
            { href: '/saved', label: '❤️ Saved Colleges' },
            { href: '/admin/login', label: 'Admin Login' },
          ].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-gray-700 hover:text-green-600 font-medium py-2 text-sm border-b border-gray-50">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}