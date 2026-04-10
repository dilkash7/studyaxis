'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import InquiryForm from '@/components/frontend/InquiryForm';
import WhatsAppButton from '@/components/frontend/WhatsAppButton';
import FAQChatbot from '@/components/frontend/FAQChatbot';
import CounsellingBot from '@/components/frontend/CounsellingBot';
import Loader from '@/components/ui/Loader';
import { ChevronRight, CheckCircle } from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/courses/${id}`).then(async r => {
      setCourse(r.data);
      const f = await axios.get(`/api/fees?courseId=${id}`);
      if (f.data.length > 0) setFees(f.data[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><Loader /></div>;
  if (!course) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="p-10 text-center text-gray-400">Course not found</div></div>;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          {course.collegeId && (
            <>
              <Link href={`/college/${course.collegeId}`} className="hover:text-green-600 truncate max-w-xs">
                {course.collegeName || 'College'}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-800 font-medium">{course.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Course Hero */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
              <div className="text-5xl sm:text-6xl mb-4">{course.icon || '📚'}</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">{course.name}</h1>
              {course.collegeName && (
                <Link href={`/college/${course.collegeId}`}
                  className="text-green-200 text-base hover:text-white transition">
                  🏫 {course.collegeName}
                </Link>
              )}
              {course.duration && (
                <div className="mt-4 inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                  ⏱ Duration: {course.duration}
                </div>
              )}
            </div>

            {/* Description */}
            {course.description && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">About this Course</h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{course.description}</p>
              </div>
            )}

            {/* Fees */}
            {fees ? (
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">💰 Fee Structure</h2>

                <div className="grid grid-cols-2 gap-4 mb-5">
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
                  <div className="mb-5">
                    <h3 className="font-bold text-gray-700 mb-3 text-sm">Year/Semester Wise Fees</h3>
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

                {fees.eligibility && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-yellow-800 mb-1 text-sm">📋 Eligibility</h3>
                    <p className="text-yellow-700 text-sm">{fees.eligibility}</p>
                  </div>
                )}

                {fees.loanAvailable && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle size={16} />
                    Bank Loan Available
                  </div>
                )}

                {fees.extraInfo && (
                  <p className="text-gray-500 text-sm mt-3 border-t pt-3">{fees.extraInfo}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                <p className="text-4xl mb-3">💰</p>
                <p className="font-medium">Fee details coming soon</p>
                <p className="text-sm mt-1">Contact us for fee information</p>
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
      <WhatsAppButton />
      <CounsellingBot />
      <FAQChatbot />
    </div>
  );
}