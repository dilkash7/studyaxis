'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { X, Plus, ArrowLeftRight, Star, MapPin, DollarSign, BookOpen, Building2 } from 'lucide-react';

interface CollegeData {
  _id: string;
  name: string;
  city?: string;
  country?: string;
  state?: string;
  type: string;
  fees?: string;
  image?: string;
  rating?: number;
  established?: string;
  description?: string;
}

export default function ComparePage() {
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [selected, setSelected] = useState<CollegeData[]>([]);
  const [courses, setCourses] = useState<Record<string, any[]>>({});
  const [searchOpen, setSearchOpen] = useState(-1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/colleges').then(r => setColleges(r.data));
    // Load saved comparison from localStorage
    const saved = localStorage.getItem('compareColleges');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        if (Array.isArray(ids) && ids.length > 0) {
          axios.get('/api/colleges').then(r => {
            const all = r.data;
            const matched = ids.map((id: string) => all.find((c: any) => c._id === id)).filter(Boolean);
            setSelected(matched);
            matched.forEach((c: any) => fetchCourses(c._id));
          });
        }
      } catch {}
    }
  }, []);

  const fetchCourses = async (collegeId: string) => {
    try {
      const r = await axios.get(`/api/courses?collegeId=${collegeId}`);
      setCourses(prev => ({ ...prev, [collegeId]: r.data }));
    } catch {}
  };

  const addCollege = (c: CollegeData) => {
    if (selected.length >= 3) return alert('Compare up to 3 colleges');
    if (selected.find(s => s._id === c._id)) return;
    const updated = [...selected, c];
    setSelected(updated);
    localStorage.setItem('compareColleges', JSON.stringify(updated.map(x => x._id)));
    fetchCourses(c._id);
    setSearchOpen(-1);
    setSearch('');
  };

  const removeCollege = (id: string) => {
    const updated = selected.filter(c => c._id !== id);
    setSelected(updated);
    localStorage.setItem('compareColleges', JSON.stringify(updated.map(x => x._id)));
  };

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    !selected.find(s => s._id === c._id)
  );

  const slots = [0, 1, 2];

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ArrowLeftRight size={28} className="text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Compare Colleges</h1>
          </div>
          <p className="text-gray-500">Select up to 3 colleges to compare side-by-side</p>
        </div>

        {/* Compare Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slots.map(i => {
            const college = selected[i];
            const collegeCourses = college ? (courses[college._id] || []) : [];

            if (!college) {
              return (
                <div key={i} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 min-h-[400px] flex flex-col items-center justify-center relative">
                  {searchOpen === i ? (
                    <div className="w-full space-y-3">
                      <input autoFocus placeholder="Search colleges..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {filtered.slice(0, 8).map(c => (
                          <button key={c._id} onClick={() => addCollege(c)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm text-gray-700 transition truncate">
                            {c.name} <span className="text-gray-400">• {c.city || c.country}</span>
                          </button>
                        ))}
                        {filtered.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No colleges found</p>}
                      </div>
                      <button onClick={() => { setSearchOpen(-1); setSearch(''); }} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setSearchOpen(i)} className="flex flex-col items-center gap-3 text-gray-400 hover:text-green-600 transition">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-green-400 transition">
                        <Plus size={24} />
                      </div>
                      <span className="text-sm font-medium">Add College</span>
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="relative">
                  <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 overflow-hidden">
                    {college.image && <img src={college.image} alt={college.name} className="w-full h-full object-cover opacity-80" />}
                  </div>
                  <button onClick={() => removeCollege(college._id)} className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center hover:bg-red-100 transition">
                    <X size={14} className="text-gray-600" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{college.name}</h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} /> {college.city || college.country || 'India'}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 text-xs">
                    <Star size={12} className="text-yellow-500" />
                    <span className="font-bold text-gray-700">{college.rating || 'N/A'}</span>
                  </div>

                  {/* Established */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Building2 size={12} /> Est. {college.established || 'N/A'}
                  </div>

                  {/* Fees */}
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign size={12} className="text-green-600" />
                    <span className="font-semibold text-green-700">{college.fees || 'Contact Us'}</span>
                  </div>

                  {/* Type */}
                  <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${college.type === 'india' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {college.type === 'india' ? '🇮🇳 India' : '🌍 Abroad'}
                  </span>

                  {/* Courses */}
                  <div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mb-1"><BookOpen size={12} /> Courses ({collegeCourses.length})</div>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {collegeCourses.slice(0, 6).map((c: any) => (
                        <p key={c._id} className="text-xs text-gray-600 truncate">• {c.name}</p>
                      ))}
                      {collegeCourses.length > 6 && <p className="text-xs text-green-600">+{collegeCourses.length - 6} more</p>}
                      {collegeCourses.length === 0 && <p className="text-xs text-gray-400">No courses listed</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
