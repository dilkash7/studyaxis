'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import InquiryForm from '@/components/frontend/InquiryForm';
import Loader from '@/components/ui/Loader';
import {
  MapPin, Star, Building2, BookOpen, ChevronRight, FileText,
  Download, Camera, DollarSign, GraduationCap, Home, ClipboardList,
  Award, HelpCircle, ChevronDown, ExternalLink, Shield, MessageSquare,
} from 'lucide-react';

const TAB_CONFIG = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'fees', label: 'Fees', icon: DollarSign },
  { id: 'admission', label: 'Admission', icon: ClipboardList },
  { id: 'placement', label: 'Placements', icon: Award },
  { id: 'hostel', label: 'Hostel', icon: Home },
  { id: 'gallery', label: 'Gallery', icon: Camera },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'scholarships', label: 'Scholarships', icon: Award },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

function SourceBadge({ source }: { source?: any }) {
  if (!source) return null;
  const labels: Record<string, { text: string; color: string }> = {
    official: { text: 'Official College Source', color: 'bg-green-100 text-green-700' },
    admin: { text: 'Uploaded by Admin', color: 'bg-blue-100 text-blue-700' },
    student: { text: 'Student Uploaded', color: 'bg-purple-100 text-purple-700' },
    'third-party': { text: 'Third Party Source', color: 'bg-orange-100 text-orange-700' },
  };
  const label = labels[source.sourceType] || labels.admin;
  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${label.color}`}>
        {source.verified && '✅ '}{label.text}
      </span>
      {source.sourceUrl && (
        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">
          <ExternalLink size={10} /> Source
        </a>
      )}
    </div>
  );
}

export default function CollegeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [college, setCollege] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [brochures, setBrochures] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseTypeFilter, setCourseTypeFilter] = useState('all');

  useEffect(() => {
    // Step 1: Fetch college (works with both ObjectId and slug)
    axios.get(`/api/colleges/${id}`).then(async (c) => {
      const collegeData = c.data;
      setCollege(collegeData);
      // Step 2: Use the real ObjectId for all sub-API calls
      const realId = collegeData._id;
      const [co, f, m, b, ca, d, rv, sc] = await Promise.all([
        axios.get(`/api/courses?collegeId=${realId}`),
        axios.get(`/api/fees?collegeId=${realId}`).catch(() => ({ data: [] })),
        axios.get(`/api/media?collegeId=${realId}`),
        axios.get(`/api/brochures?collegeId=${realId}`),
        axios.get(`/api/campuses?collegeId=${realId}`),
        axios.get(`/api/college-details/${realId}`).catch(() => ({ data: { sections: [], faqs: [] } })),
        axios.get(`/api/reviews?collegeId=${realId}`).catch(() => ({ data: [] })),
        axios.get(`/api/scholarships?collegeId=${realId}`).catch(() => ({ data: [] })),
      ]);
      setCourses(co.data || []);
      setFees(Array.isArray(f.data) ? f.data : []);
      setMedia(m.data?.data || []);
      setBrochures(b.data?.data || []);
      setCampuses(ca.data?.data || []);
      setDetail(d.data);
      setReviews(Array.isArray(rv.data) ? rv.data : rv.data?.data || []);
      setScholarships(Array.isArray(sc.data) ? sc.data : sc.data?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const getSection = (type: string) =>
    detail?.sections?.find((s: any) => s.sectionType === type && s.active !== false);

  // Dynamic SEO + ObjectId→slug redirect (must be before early returns)
  useEffect(() => {
    if (college) {
      // Redirect ObjectId URLs to slug URLs
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(id));
      if (isObjectId && college.slug) {
        router.replace(`/college/${college.slug}`, { scroll: false });
      }

      document.title = `${college.metaTitle || college.name} — Courses, Fees, Admission | StudyAxis`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', college.metaDescription || `${college.name} — courses, fees, placements, admission process. ${college.city || ''} ${college.state || ''}`);

      // OG tags
      const setMeta = (prop: string, content: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
        el.setAttribute('content', content);
      };
      setMeta('og:title', college.metaTitle || college.name);
      setMeta('og:description', college.metaDescription || `${college.name} — courses, fees, admission`);
      setMeta('og:type', 'website');
      setMeta('og:url', `https://studyaxis.com/college/${college.slug || id}`);
      if (college.image) setMeta('og:image', college.image);
    }
  }, [college, id, router]);

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><Loader /></div>;
  if (!college) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="text-center py-20 text-gray-400">
        <p className="text-6xl mb-4">🏫</p>
        <p className="text-xl font-medium">College not found</p>
        <Link href="/" className="text-green-600 hover:underline text-sm mt-2 block">← Back to Home</Link>
      </div>
    </div>
  );

  // JSON-LD Schema (not a hook, safe after returns)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: college.name,
    url: college.website || `https://studyaxis.com/college/${college.slug || id}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: college.city,
      addressRegion: college.state,
      addressCountry: college.country || 'IN',
    },
    ...(college.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: college.rating, bestRating: 5 } } : {}),
    ...(college.established ? { foundingDate: college.established } : {}),
    ...(college.accreditation ? { hasCredential: { '@type': 'EducationalOccupationalCredential', credentialCategory: college.accreditation } } : {}),
    ...(college.image ? { image: college.image } : {}),
    ...(college.description ? { description: college.description.slice(0, 300) } : {}),
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      {/* Breadcrumb — SEO optimized */}
      <nav className="bg-white border-b px-4 sm:px-6 py-3" aria-label="Breadcrumb">
        <ol className="max-w-7xl mx-auto flex items-center gap-1.5 text-sm text-gray-500 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/" className="hover:text-green-600 transition" itemProp="item"><span itemProp="name">Home</span></Link>
            <meta itemProp="position" content="1" />
          </li>
          <ChevronRight size={12} className="text-gray-300" />
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href={college.type === 'india' ? '/india' : '/abroad'} className="hover:text-green-600 transition" itemProp="item">
              <span itemProp="name">{college.type === 'india' ? 'India' : 'Abroad'}</span>
            </Link>
            <meta itemProp="position" content="2" />
          </li>
          {college.state && (<><ChevronRight size={12} className="text-gray-300" />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href={`/search?state=${encodeURIComponent(college.state)}`} className="hover:text-green-600 transition" itemProp="item">
                <span itemProp="name">{college.state}</span>
              </Link>
              <meta itemProp="position" content="3" />
            </li>
          </>)}
          {college.city && (<><ChevronRight size={12} className="text-gray-300" />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href={`/search?city=${encodeURIComponent(college.city)}`} className="hover:text-green-600 transition" itemProp="item">
                <span itemProp="name">{college.city}</span>
              </Link>
              <meta itemProp="position" content="4" />
            </li>
          </>)}
          <ChevronRight size={12} className="text-gray-300" />
          <li className="text-gray-800 font-medium break-words truncate max-w-[200px] sm:max-w-none">{college.name}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* ── Premium Hero ── */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
              <div className="h-56 sm:h-72 bg-gradient-to-br from-green-600 to-green-800">
                {college.image ? (
                  <Image src={college.image} alt={college.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw" className="object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl opacity-50">🏫</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                <div className="flex flex-wrap gap-2 mb-2">
                  {college.accreditation && (
                    <span className="text-xs font-bold bg-yellow-400/90 text-yellow-900 px-2.5 py-0.5 rounded-full flex items-center gap-1"><Shield size={10} /> {college.accreditation}</span>
                  )}
                  {college.verified && (
                    <span className="text-xs font-bold bg-green-500/90 text-white px-2.5 py-0.5 rounded-full">✅ Verified</span>
                  )}
                  {college.type && (
                    <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">{college.type === 'india' ? '🇮🇳 India' : '🌍 Abroad'}</span>
                  )}
                </div>
                <h1 className="text-xl sm:text-3xl font-extrabold leading-tight mb-2 drop-shadow-lg">{college.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                  {(college.city || college.country) && (
                    <span className="flex items-center gap-1"><MapPin size={13} /> {[college.city, college.state, college.country].filter(Boolean).join(', ')}</span>
                  )}
                  <span className="flex items-center gap-1"><Star size={13} className="text-yellow-400" fill="currentColor" /> {college.rating || 4.0}/5</span>
                  {college.established && <span className="flex items-center gap-1"><Building2 size={13} /> Est. {college.established}</span>}
                  {courses.length > 0 && <span className="flex items-center gap-1"><BookOpen size={13} /> {courses.length} Courses</span>}
                </div>
                {college.updatedAt && (
                  <p className="text-[10px] text-white/50 mt-2">Last updated: {new Date(college.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {/* ── Sticky Action Bar ── */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 px-3 py-2.5 flex items-center gap-2 overflow-x-auto">
              <Link href={`/apply?college=${encodeURIComponent(college.name)}`}
                className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shrink-0">
                <GraduationCap size={13} /> Apply Now
              </Link>
              {college.brochureUrl && (
                <a href={college.brochureUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-purple-100 transition shrink-0">
                  <Download size={13} /> Brochure
                </a>
              )}
              <a href={`https://wa.me/919876543210?text=Hi, I'm interested in ${encodeURIComponent(college.name)}`} target="_blank"
                className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-100 transition shrink-0">
                💬 WhatsApp
              </a>
              <Link href={`/compare?colleges=${college._id}`}
                className="flex items-center gap-1.5 bg-gray-50 text-gray-600 border border-gray-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-100 transition shrink-0">
                ⚖️ Compare
              </Link>
              {college.website && (
                <a href={college.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 border border-gray-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition shrink-0 ml-auto">
                  <ExternalLink size={12} /> Website
                </a>
              )}
            </div>

            {/* ── Tab Navigation ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-thin">
                {TAB_CONFIG.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 shrink-0
                        ${isActive ? 'border-green-600 text-green-700 bg-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                      <Icon size={15} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-5 sm:p-6">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {college.description && <p className="text-gray-600 leading-relaxed">{college.description}</p>}
                    {getSection('about')?.content && (
                      <div dangerouslySetInnerHTML={{ __html: getSection('about').content }} className="prose prose-sm max-w-none text-gray-700" />
                    )}
                    {campuses.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Building2 size={16} /> Campuses</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {campuses.map((c: any) => (
                            <div key={c._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <h4 className="font-bold text-gray-800">{c.name}</h4>
                              <p className="text-sm text-gray-600">📍 {c.city}, {c.state}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <SourceBadge source={detail?.source} />
                  </div>
                )}

                {/* COURSES TAB — with search + filter */}
                {activeTab === 'courses' && (
                  <div className="space-y-4">
                    {courses.length > 0 ? (<>
                      {/* Search + Filter Bar */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input placeholder="Search courses..." value={courseSearch} onChange={e => setCourseSearch(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                        <div className="flex gap-1">
                          {['all', 'UG', 'PG', 'Diploma'].map(t => (
                            <button key={t} onClick={() => setCourseTypeFilter(t)}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition ${courseTypeFilter === t ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                              {t === 'all' ? 'All' : t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Course Table */}
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
                              <th className="px-3 py-2.5 text-left">Course</th>
                              <th className="px-3 py-2.5 text-left">Type</th>
                              <th className="px-3 py-2.5 text-left">Duration</th>
                              <th className="px-3 py-2.5 text-left">Stream</th>
                              <th className="px-3 py-2.5 text-left w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {courses
                              .filter((c: any) => {
                                const matchSearch = !courseSearch || c.name?.toLowerCase().includes(courseSearch.toLowerCase());
                                const matchType = courseTypeFilter === 'all' || c.courseType === courseTypeFilter;
                                return matchSearch && matchType;
                              })
                              .map((c: any) => (
                              <tr key={c._id} className="hover:bg-green-50/50 transition">
                                <td className="px-3 py-3">
                                  <Link href={`/course/${c._id}`} className="font-medium text-gray-800 hover:text-green-600 transition">
                                    {c.icon || '📚'} {c.name}
                                  </Link>
                                  {c.specialization && <p className="text-xs text-gray-400 mt-0.5">{c.specialization}</p>}
                                </td>
                                <td className="px-3 py-3">
                                  {c.courseType && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.courseType === 'UG' ? 'bg-purple-100 text-purple-700' : c.courseType === 'PG' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{c.courseType}</span>}
                                </td>
                                <td className="px-3 py-3 text-gray-600 text-xs">{c.duration || '—'}</td>
                                <td className="px-3 py-3 text-gray-500 text-xs">{c.mainCategory || c.stream || '—'}</td>
                                <td className="px-3 py-3">
                                  <Link href={`/course/${c._id}`} className="text-green-600 hover:text-green-700"><ChevronRight size={14} /></Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-400 text-right">
                        Showing {courses.filter((c: any) => {
                          const matchSearch = !courseSearch || c.name?.toLowerCase().includes(courseSearch.toLowerCase());
                          const matchType = courseTypeFilter === 'all' || c.courseType === courseTypeFilter;
                          return matchSearch && matchType;
                        }).length} of {courses.length} courses
                      </p>
                    </>) : <p className="text-gray-400 text-center py-8">No courses listed yet</p>}
                  </div>
                )}

                {/* FEES TAB — enhanced */}
                {activeTab === 'fees' && (
                  <div className="space-y-4">
                    {fees.length > 0 ? (<>
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
                              <th className="px-3 py-2.5 text-left">Course</th>
                              <th className="px-3 py-2.5 text-left">Category</th>
                              <th className="px-3 py-2.5 text-left">Total Fee</th>
                              <th className="px-3 py-2.5 text-left">Booking</th>
                              <th className="px-3 py-2.5 text-left">Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {fees.map((f: any) => (
                              <tr key={f._id} className="hover:bg-gray-50">
                                <td className="px-3 py-3 font-medium text-gray-800">{f.courseName || '—'}</td>
                                <td className="px-3 py-3">{f.admissionCategoryName ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{f.admissionCategoryName}</span> : '—'}</td>
                                <td className="px-3 py-3 text-green-600 font-bold whitespace-nowrap">{f.totalFee || '—'}</td>
                                <td className="px-3 py-3 text-gray-600">{f.bookingAmount || '—'}</td>
                                <td className="px-3 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {f.scholarshipAvailable && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">🎓 Scholarship</span>}
                                    {f.loanAvailable && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">🏦 Loan</span>}
                                    {f.yearWiseFees?.length > 0 && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">📅 {f.yearWiseFees.length}yr</span>}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Year-wise breakdown */}
                      {fees.some((f: any) => f.yearWiseFees?.length > 0) && (
                        <details className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <summary className="font-bold text-blue-800 text-sm cursor-pointer">📅 Year-Wise Fee Breakdown</summary>
                          <div className="mt-3 space-y-3">
                            {fees.filter((f: any) => f.yearWiseFees?.length > 0).map((f: any) => (
                              <div key={f._id}>
                                <p className="text-xs font-bold text-gray-700 mb-1">{f.courseName} {f.admissionCategoryName ? `(${f.admissionCategoryName})` : ''}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {f.yearWiseFees.map((y: any, i: number) => (
                                    <div key={i} className="bg-white rounded-lg px-3 py-2 border border-blue-100 text-center">
                                      <span className="text-xs text-gray-500 block">{y.label}</span>
                                      <span className="text-sm font-bold text-blue-700">{y.amount}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </>) : college.fees ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                        <p className="text-2xl font-extrabold text-green-600">{college.fees}</p>
                        <p className="text-gray-500 text-sm mt-1">Starting fees (approx)</p>
                      </div>
                    ) : <p className="text-gray-400 text-center py-8">Fee details not available</p>}
                    {fees.some((f: any) => f.feeStructureImage) && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-2">📄 Fee Structure Poster</h3>
                        {fees.filter((f: any) => f.feeStructureImage).map((f: any) => (
                          <div key={f._id} className="relative w-full max-w-2xl aspect-auto">
                            <Image src={f.feeStructureImage} alt="Fee Structure" width={800} height={600} className="rounded-xl border max-w-full cursor-pointer hover:opacity-90 object-contain" onClick={() => setLightbox(f.feeStructureImage)} />
                          </div>
                        ))}
                      </div>
                    )}
                    {getSection('scholarship') && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <h3 className="font-bold text-amber-800 mb-2">🎓 Scholarship Details</h3>
                        <div dangerouslySetInnerHTML={{ __html: getSection('scholarship').content }} className="prose prose-sm text-amber-900" />
                        <SourceBadge source={getSection('scholarship').source} />
                      </div>
                    )}
                  </div>
                )}

                {/* ADMISSION TAB */}
                {activeTab === 'admission' && (
                  <div className="space-y-4">
                    {getSection('admission-process') ? (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: getSection('admission-process').content }} className="prose prose-sm max-w-none" />
                        <SourceBadge source={getSection('admission-process').source} />
                      </>
                    ) : <p className="text-gray-400 text-center py-8">Admission process details coming soon</p>}
                    {getSection('eligibility') && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h3 className="font-bold text-blue-800 mb-2">📋 Eligibility</h3>
                        <div dangerouslySetInnerHTML={{ __html: getSection('eligibility').content }} className="prose prose-sm text-blue-900" />
                      </div>
                    )}
                    {getSection('documents-required') && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <h3 className="font-bold text-gray-800 mb-2">📄 Documents Required</h3>
                        <div dangerouslySetInnerHTML={{ __html: getSection('documents-required').content }} className="prose prose-sm" />
                      </div>
                    )}
                  </div>
                )}

                {/* PLACEMENTS TAB */}
                {activeTab === 'placement' && (
                  <div className="space-y-4">
                    {getSection('placement') ? (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: getSection('placement').content }} className="prose prose-sm max-w-none" />
                        <SourceBadge source={getSection('placement').source} />
                      </>
                    ) : <p className="text-gray-400 text-center py-8">Placement details coming soon</p>}
                  </div>
                )}

                {/* HOSTEL TAB */}
                {activeTab === 'hostel' && (
                  <div className="space-y-4">
                    {getSection('hostel') ? (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: getSection('hostel').content }} className="prose prose-sm max-w-none" />
                        <SourceBadge source={getSection('hostel').source} />
                      </>
                    ) : <p className="text-gray-400 text-center py-8">Hostel details coming soon</p>}
                  </div>
                )}

                {/* GALLERY TAB */}
                {activeTab === 'gallery' && (
                  <div>
                    {media.length > 0 ? (
                      <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                        {media.map((item: any) => (
                          <div key={item._id} className="break-inside-avoid group cursor-pointer"
                            onClick={() => setLightbox(item.mediaUrl)}>
                            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                              <Image src={item.mediaUrl} alt={item.title} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition duration-300" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end">
                                <div className="p-2 opacity-0 group-hover:opacity-100 transition">
                                  <p className="text-white text-xs font-medium">{item.title}</p>
                                  <span className="text-[10px] text-white/70 uppercase">{item.mediaType}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-gray-400 text-center py-8">No gallery images yet</p>}
                  </div>
                )}

                {/* DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                  <div className="space-y-3">
                    {brochures.length > 0 ? brochures.map((b: any) => (
                      <div key={b._id} className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 p-4 rounded-xl transition border border-gray-200">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm">{b.title}</h3>
                          <p className="text-xs text-gray-500 mt-1 capitalize">{b.documentType?.replace(/-/g, ' ')}</p>
                          <SourceBadge source={b.source} />
                        </div>
                        <a href={b.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition flex items-center gap-1.5 shrink-0">
                          <Download size={14} /> <span className="text-xs font-semibold hidden sm:inline">Download</span>
                        </a>
                      </div>
                    )) : <p className="text-gray-400 text-center py-8">No documents uploaded yet</p>}
                  </div>
                )}

                {/* FAQ TAB */}
                {activeTab === 'faq' && (
                  <div className="space-y-2">
                    {(detail?.faqs?.length > 0) ? detail.faqs.map((faq: any, i: number) => (
                      <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition">
                          <span className="font-medium text-gray-800 text-sm">{faq.question}</span>
                          <ChevronDown size={16} className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                        </button>
                        {openFaq === i && (
                          <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-2">{faq.answer}</div>
                        )}
                      </div>
                    )) : <p className="text-gray-400 text-center py-8">No FAQs available yet</p>}
                  </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.length > 0 ? reviews.filter((r: any) => r.approved !== false).map((r: any) => (
                      <div key={r._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-800 text-sm">{r.name || 'Student'}</span>
                              {r.verified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">✅ Verified</span>}
                            </div>
                            {r.course && <p className="text-xs text-gray-400 mb-2">{r.course} {r.year ? `• ${r.year}` : ''}</p>}
                            {r.rating && (
                              <div className="flex items-center gap-0.5 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400' : 'text-gray-200'} fill={i < r.rating ? 'currentColor' : 'none'} />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">{r.rating}/5</span>
                              </div>
                            )}
                            <p className="text-sm text-gray-600">{r.content || r.review || r.message}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <MessageSquare size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-gray-400">No reviews yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SCHOLARSHIPS TAB */}
                {activeTab === 'scholarships' && (
                  <div className="space-y-3">
                    {scholarships.length > 0 ? scholarships.map((s: any) => (
                      <div key={s._id} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 hover:shadow-sm transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm">{s.name}</h4>
                            {s.provider && <p className="text-xs text-green-600 font-medium">{s.provider}</p>}
                            {s.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {s.amount && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">₹ {s.amount}</span>}
                              {s.type && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s.type}</span>}
                              {s.deadline && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">⏰ {new Date(s.deadline).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <Award size={24} className="text-amber-300 shrink-0" />
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Award size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-gray-400">No scholarships listed for this college</p>
                        <a href="/scholarships" className="text-sm text-green-600 hover:underline mt-1 inline-block">Browse all scholarships →</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24"><InquiryForm preselectedCollege={college.name} /></div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}>
          <div className="relative w-full max-w-5xl h-full max-h-[90vh]">
            <Image src={lightbox} alt="Preview" fill className="object-contain" />
          </div>
        </div>
      )}

      <Footer />

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center gap-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
        <Link href={`/apply?college=${encodeURIComponent(college.name)}`}
          className="flex-1 bg-green-600 text-white text-center py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition">
          Apply Now
        </Link>
        <a href={`https://wa.me/919876543210?text=Hi, I'm interested in ${encodeURIComponent(college.name)}`} target="_blank"
          className="bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-100 transition">
          💬
        </a>
        {college.phoneNumber && (
          <a href={`tel:${college.phoneNumber}`}
            className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition">
            📞
          </a>
        )}
      </div>
    </div>
  );
}