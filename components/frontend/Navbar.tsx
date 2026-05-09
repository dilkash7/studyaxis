'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Search, Heart, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

const NAV_LINKS = [
  { href: '/college-finder', label: 'Find College' },
  { href: '/search', label: 'Search' },
  { href: '/apply', label: 'Apply' },
];

const EXPLORE_LINKS = [
  { href: '/india', label: '🇮🇳 Study in India', desc: 'Top colleges across India' },
  { href: '/abroad', label: '🌍 Study Abroad', desc: 'MBBS, Engineering & more' },
  { href: '/scholarships', label: '🎓 Scholarships', desc: 'Merit, govt & private aid' },
  { href: '/visa-guidance', label: '✈️ Visa Guidance', desc: 'Step-by-step visa help' },
  { href: '/career-guidance', label: '💼 Career Guidance', desc: 'Expert career counselling' },
  { href: '/blog', label: '📰 Blog & News', desc: 'Latest education updates' },
  { href: '/faqs', label: '❓ FAQs', desc: 'Common questions answered' },
  { href: '/testimonials', label: '💬 Testimonials', desc: 'Student success stories' },
  { href: '/compare', label: '⚖️ Compare Colleges', desc: 'Side-by-side comparison' },
];

const MOBILE_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/college-finder', label: '🎓 Find Your College' },
  { href: '/search', label: '🔍 Advanced Search' },
  { href: '/india', label: '🇮🇳 Study in India' },
  { href: '/abroad', label: '🌍 Study Abroad' },
  { href: '/apply', label: '📝 Apply Now' },
  { href: '/scholarships', label: '🎓 Scholarships' },
  { href: '/visa-guidance', label: '✈️ Visa Guidance' },
  { href: '/career-guidance', label: '💼 Career Guidance' },
  { href: '/blog', label: '📰 Blog & News' },
  { href: '/faqs', label: '❓ FAQs' },
  { href: '/notices', label: '🔔 Notices' },
  { href: '/testimonials', label: '💬 Testimonials' },
  { href: '/callback', label: '📞 Request Callback' },
  { href: '/compare', label: '⚖️ Compare Colleges' },
  { href: '/saved', label: '❤️ Saved Colleges' },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [settings, setSettings] = useState<any>({ siteName: 'StudyAxis', logoUrl: '', whatsapp: '919876543210' });
  const router = useRouter();
  const pathname = usePathname();
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    axios.get('/api/settings/homepage').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  // Close explore on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setShowExplore(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); setShowSearch(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const isActive = (href: string) => pathname === href;

  if (!mounted) {
    return (
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">StudyAxis</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {settings.siteName || 'StudyAxis'}
            </span>
          )}
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search colleges, courses..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition" />
          </div>
        </form>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/') ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}>Home</Link>

          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive(l.href) ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}>
              {l.label}
            </Link>
          ))}

          {/* Explore Dropdown */}
          <div ref={exploreRef} className="relative">
            <button onClick={() => setShowExplore(!showExplore)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${showExplore ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}>
              Explore <ChevronDown size={13} className={`transition-transform ${showExplore ? 'rotate-180' : ''}`} />
            </button>
            {showExplore && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                {EXPLORE_LINKS.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setShowExplore(false)}
                    className="flex flex-col px-4 py-3 rounded-xl hover:bg-green-50 transition">
                    <span className="text-sm font-medium text-gray-800">{l.label}</span>
                    <span className="text-xs text-gray-400">{l.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/saved" className={`p-2 rounded-lg transition ${isActive('/saved') ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'}`}>
            <Heart size={16} />
          </Link>

          <a href={`https://wa.me/${settings.whatsapp || '919876543210'}`} target="_blank"
            className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition text-sm font-medium ml-1">
            <Phone size={13} /> Contact
          </a>
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center gap-1">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Search size={20} />
          </button>
          <button onClick={() => setOpen(!open)} className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {showSearch && (
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3 border-t border-gray-100">
          <div className="relative mt-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search colleges, courses..." autoFocus
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        </form>
      )}

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-0.5 max-h-[70vh] overflow-y-auto">
          {MOBILE_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`block py-2.5 px-3 rounded-xl text-sm font-medium transition ${isActive(l.href) ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'}`}>
              {l.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-100">
            <a href={`https://wa.me/${settings.whatsapp || '919876543210'}`} target="_blank"
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition w-full">
              <Phone size={14} /> WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}