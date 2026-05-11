'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import InquiryForm from '@/components/frontend/InquiryForm';
import Loader from '@/components/ui/Loader';
import { ChevronRight, CheckCircle, MapPin, Download, FileText, GraduationCap, Clock, Users } from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [allFees, setAllFees] = useState<any[]>([]);
  const [campusAvailability, setCampusAvailability] = useState<any[]>([]);
  const [brochures, setBrochures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      axios.get(`/api/courses/${id}`),
      axios.get(`/api/fees?courseId=${id}`),
    ]).then(async ([courseRes, feesRes]) => {
      const courseData = courseRes.data;
      setCourse(courseData);
      setAllFees(Array.isArray(feesRes.data) ? feesRes.data : []);

      // Fetch all campuses where this course is available (same college, same course name)
      if (courseData.collegeId) {
        try {
          const campusRes = await axios.get(`/api/courses?collegeId=${courseData.collegeId}`);
          const relatedCourses = (Array.isArray(campusRes.data) ? campusRes.data : [])
            .filter((c: any) => c.name === courseData.name && c.campusName);
          const uniqueCampuses = Array.from(new Map(
            relatedCourses.map((c: any) => [c.campusName, { name: c.campusName, city: c.campusId?.city || '' }])
          ).values());
          setCampusAvailability(uniqueCampuses);
        } catch {}

        // Fetch brochures for this college
        try {
          const brRes = await axios.get(`/api/brochures?collegeId=${courseData.collegeId}`);
          setBrochures((brRes.data.data || brRes.data || []).slice(0, 6));
        } catch {}
      }

      setLoading(false);
      
      // Update SEO Meta Tags
      document.title = `${courseData.name} at ${courseData.collegeName || 'College'} — Fees, Admission | StudyAxis`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', `Get details about ${courseData.name} at ${courseData.collegeName}. Check fee structure, eligibility, admission process, and more.`);
      
      // Canonical enforcement
      const canonicalUrl = `https://studyaxis.in/course/${courseData.slug || id}`;
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
      
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><Loader /></div>;
  if (!course) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="p-10 text-center text-gray-400">Course not found</div></div>;

  // Generate Google Rich Results Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: course.name,
    description: course.description || `Study ${course.name} at ${course.collegeName}`,
    educationalCredentialAwarded: course.degreeType,
    timeToComplete: course.duration ? `P${parseInt(course.duration)}Y` : undefined,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: course.collegeName,
      url: `https://studyaxis.com/college/${course.collegeId}`
    },
    hasCourse: {
      '@type': 'Course',
      name: course.name,
      courseCode: course.specialization
    },
    educationalProgramMode: 'full-time'
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          {course.collegeId && (
            <>
              <Link href={`/college/${course.collegeId}`} className="hover:text-green-600 break-words">
                {course.collegeName || 'College'}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-800 font-medium break-words">{course.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Course Hero */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-5xl sm:text-6xl">{course.icon || '📚'}</span>
                {course.courseType && (
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{course.courseType}</span>
                )}
                {course.mainCategory && (
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{course.mainCategory}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 break-words">{course.name}</h1>
              {course.degreeType && (
                <p className="text-green-200 text-sm font-medium mb-1">🎓 {course.degreeType}{course.specialization ? ` — ${course.specialization}` : ''}</p>
              )}
              {course.collegeName && (
                <Link href={`/college/${course.collegeId}`}
                  className="text-green-200 text-base hover:text-white transition">
                  🏫 {course.collegeName}
                </Link>
              )}
              <div className="flex flex-wrap gap-3 mt-5">
                {course.duration && (
                  <div className="flex items-center gap-1.5 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                    <Clock size={14} /> {course.duration}
                  </div>
                )}
                {course.seats && (
                  <div className="flex items-center gap-1.5 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                    <Users size={14} /> {course.seats} Seats
                  </div>
                )}
              </div>
            </div>

            {/* Campus Availability */}
            {campusAvailability.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-green-600" /> Available At
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {campusAvailability.map((campus: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{campus.name}</p>
                        {campus.city && <p className="text-xs text-gray-500">{campus.city}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">About this Course</h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{course.description}</p>
              </div>
            )}

            {/* Eligibility */}
            {course.eligibility && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  <GraduationCap size={20} /> Eligibility
                </h2>
                <p className="text-yellow-700 text-sm">{course.eligibility}</p>
              </div>
            )}

            {/* Multi-Category Fee Structure */}
            {allFees.length > 0 ? (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">💰 Fee Structure</h2>

                {allFees.map((fees: any, idx: number) => (
                  <div key={fees._id || idx} className={`${idx > 0 ? 'mt-6 pt-6 border-t border-gray-100' : ''}`}>
                    {/* Category header */}
                    {fees.admissionCategoryName && (
                      <div className="mb-4">
                        <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                          {fees.admissionCategoryName}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Booking Amount</p>
                        <p className="text-xl sm:text-2xl font-extrabold text-green-600">{fees.bookingAmount || 'Contact Us'}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Total Fee</p>
                        <p className="text-xl sm:text-2xl font-extrabold text-blue-600">{fees.totalFee || 'Contact Us'}</p>
                      </div>
                    </div>

                    {fees.yearWiseFees?.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-bold text-gray-700 mb-3 text-sm">Year/Semester Wise</h3>
                        <div className="space-y-2">
                          {fees.yearWiseFees.map((y: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                              <span className="text-gray-700 font-medium text-sm">{y.label}</span>
                              <span className="text-green-600 font-bold text-sm">{y.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm">
                      {fees.loanAvailable && (
                        <div className="flex items-center gap-1.5 text-green-600 font-medium">
                          <CheckCircle size={16} /> Bank Loan Available
                        </div>
                      )}
                      {fees.scholarshipAvailable && (
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <CheckCircle size={16} /> Scholarships Available
                        </div>
                      )}
                    </div>

                    {fees.extraInfo && (
                      <p className="text-gray-500 text-sm mt-3 border-t pt-3">{fees.extraInfo}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                <p className="text-4xl mb-3">💰</p>
                <p className="font-medium">Fee details coming soon</p>
                <p className="text-sm mt-1">Contact us for fee information</p>
              </div>
            )}

            {/* Brochures */}
            {brochures.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" /> Brochures & Documents
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {brochures.map((b: any) => (
                    <a key={b._id} href={b.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-purple-50 rounded-xl px-4 py-3 border border-purple-100 hover:bg-purple-100 transition group">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm break-words">{b.title}</p>
                        <p className="text-xs text-purple-600">{b.documentType?.replace(/-/g, ' ')}</p>
                      </div>
                      <Download size={16} className="text-purple-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <InquiryForm preselectedCourse={course.name} preselectedCollege={course.collegeName || ''} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}