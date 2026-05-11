'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import Loader from '@/components/ui/Loader';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function FormalApplicationPage() {
  const { collegeId } = useParams();
  const searchParams = useSearchParams();
  const prefilledCourse = searchParams.get('course') || '';
  const router = useRouter();

  const [college, setCollege] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    studentName: '',
    phone: '',
    fatherName: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    course: prefilledCourse,
    previousQualification: '',
    percentage: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      router.push(`/student/login?redirect=/student/apply/${collegeId}`);
      return;
    }

    // Load College & User profile logic
    Promise.all([
      axios.get(`/api/colleges/${collegeId}`),
      axios.get(`/api/courses?college=${collegeId}&all=true`),
      axios.get('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([colRes, crsRes, userRes]) => {
      setCollege(colRes.data);
      setCourses(crsRes.data.data || []);
      const u = userRes.data.user;
      setForm(prev => ({
        ...prev,
        studentName: u.name || '',
        phone: u.phone || '',
        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
        gender: u.gender || 'Male',
        address: u.address || '',
        previousQualification: u.highestQualification || '',
        percentage: u.percentage || ''
      }));
    }).catch(err => {
      setError('Failed to load application data. Please ensure you are logged in.');
    }).finally(() => setLoading(false));
  }, [collegeId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    const token = localStorage.getItem('studentToken');
    try {
      await axios.post('/api/student/apply', {
        ...form,
        college: college._id,
        collegeName: college.name
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
      setTimeout(() => router.push('/student/dashboard'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit application.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">Your formal application to {college?.name} has been successfully recorded.</p>
          <p className="text-sm font-bold text-blue-600 animate-pulse">Redirecting to Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
            <h1 className="text-2xl font-extrabold mb-1">Formal Admission Application</h1>
            <p className="text-blue-100">Applying to: <span className="font-bold text-white">{college?.name}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 font-medium text-sm">
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Student Full Name</label>
                <input required type="text" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Father's Name</label>
                <input required type="text" value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
                <input required type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                <select required value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none bg-white">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Course of Interest</label>
                <select required value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none bg-white">
                  <option value="">Select a Course...</option>
                  {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Academic Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Previous Qualification (e.g. 12th PCM)</label>
                  <input required type="text" value={form.previousQualification} onChange={e => setForm({...form, previousQualification: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Percentage / CGPA</label>
                  <input required type="text" value={form.percentage} onChange={e => setForm({...form, percentage: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Permanent Address</label>
              <textarea required rows={3} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none"></textarea>
            </div>

            <button disabled={submitting} type="submit" className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50">
              {submitting ? 'Submitting Application...' : 'Submit Final Application'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
