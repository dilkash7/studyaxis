'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import InquiryForm from '@/components/frontend/InquiryForm';
import Loader from '@/components/ui/Loader';
import {
  MapPin, Star, Building2, BookOpen, ChevronRight, FileText,
  Download, Camera, DollarSign, GraduationCap, Home, ClipboardList,
  Award, HelpCircle, ChevronDown, ExternalLink, Shield,
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
  const [college, setCollege] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [brochures, setBrochures] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/colleges/${id}`),
      axios.get(`/api/courses?collegeId=${id}`),
      axios.get(`/api/fees?collegeId=${id}`).catch(() => ({ data: [] })),
      axios.get(`/api/media?collegeId=${id}`),
      axios.get(`/api/brochures?collegeId=${id}`),
      axios.get(`/api/campuses?collegeId=${id}`),
      axios.get(`/api/college-details/${id}`).catch(() => ({ data: { sections: [], faqs: [] } })),
    ]).then(([c, co, f, m, b, ca, d]) => {
      setCollege(c.data);
      setCourses(co.data || []);
      setFees(Array.isArray(f.data) ? f.data : []);
      setMedia(m.data?.data || []);
      setBrochures(b.data?.data || []);
      setCampuses(ca.data?.data || []);
      setDetail(d.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const getSection = (type: string) =>
    detail?.sections?.find((s: any) => s.sectionType === type && s.active !== false);

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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />
      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-green-600 transition">Home</Link>
          <ChevronRight size={14} />
          <Link href={college.type === 'india' ? '/india' : '/abroad'} className="hover:text-green-600 transition">
            {college.type === 'india' ? '🇮🇳 India' : '🌍 Abroad'}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium break-words">{college.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Banner */}
            <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-green-400 to-green-700 shadow-lg">
              {college.image ? (
                <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">🏫</div>
              )}
            </div>

            {/* College Header Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">{college.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <MapPin size={14} className="text-green-500" /> {college.city || college.country || 'N/A'}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Star size={14} className="text-yellow-500" fill="currentColor" /> {college.rating || 4.0}
                </span>
                {college.established && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                    <Building2 size={14} className="text-blue-500" /> Est. {college.established}
                  </span>
                )}
                {college.accreditation && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                    <Shield size={14} className="text-yellow-600" /> {college.accreditation}
                  </span>
                )}
              </div>
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

                {/* COURSES TAB */}
                {activeTab === 'courses' && (
                  <div className="space-y-3">
                    {courses.length > 0 ? courses.map((c: any) => (
                      <Link key={c._id} href={`/course/${c._id}`}
                        className="flex items-center gap-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-400 rounded-xl p-4 transition group">
                        <span className="text-2xl shrink-0">{c.icon || '📚'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 group-hover:text-green-600 text-sm">{c.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {c.courseType && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.courseType === 'UG' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>{c.courseType}</span>}
                            {c.duration && <span className="text-xs text-gray-500">{c.duration}</span>}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-green-500 shrink-0" />
                      </Link>
                    )) : <p className="text-gray-400 text-center py-8">No courses listed yet</p>}
                  </div>
                )}

                {/* FEES TAB */}
                {activeTab === 'fees' && (
                  <div className="space-y-4">
                    {fees.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                              <th className="px-3 py-2 text-left">Course</th>
                              <th className="px-3 py-2 text-left">Category</th>
                              <th className="px-3 py-2 text-left">Total Fee</th>
                              <th className="px-3 py-2 text-left">Booking</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {fees.map((f: any) => (
                              <tr key={f._id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-800">{f.courseName || '—'}</td>
                                <td className="px-3 py-2">{f.admissionCategoryName ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{f.admissionCategoryName}</span> : '—'}</td>
                                <td className="px-3 py-2 text-green-600 font-bold">{f.totalFee || '—'}</td>
                                <td className="px-3 py-2 text-gray-600">{f.bookingAmount || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : college.fees ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                        <p className="text-2xl font-extrabold text-green-600">{college.fees}</p>
                        <p className="text-gray-500 text-sm mt-1">Starting fees (approx)</p>
                      </div>
                    ) : <p className="text-gray-400 text-center py-8">Fee details not available</p>}
                    {fees.some((f: any) => f.feeStructureImage) && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-2">📄 Fee Structure Poster</h3>
                        {fees.filter((f: any) => f.feeStructureImage).map((f: any) => (
                          <img key={f._id} src={f.feeStructureImage} alt="Fee Structure" className="rounded-xl border max-w-full cursor-pointer hover:opacity-90" onClick={() => setLightbox(f.feeStructureImage)} />
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
                            <div className="relative rounded-xl overflow-hidden bg-gray-100">
                              <img src={item.mediaUrl} alt={item.title} className="w-full object-cover group-hover:scale-105 transition duration-300" />
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Preview" className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
        </div>
      )}

      <Footer />
    </div>
  );
}