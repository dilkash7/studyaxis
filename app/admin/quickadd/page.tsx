'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle } from 'lucide-react';

export default function QuickAddPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState<'location' | 'college' | 'course' | 'fees'>('location');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  // Forms
  const [locForm, setLocForm] = useState({ name: '', type: 'city', flag: '' });
  const [colForm, setColForm] = useState({ name: '', locationId: '', city: '', country: '', type: 'india', fees: '', image: '', description: '', established: '' });
  const [courseForm, setCourseForm] = useState({ name: '', collegeId: '', collegeName: '', duration: '', description: '', icon: '' });
  const [feesForm, setFeesForm] = useState({
    collegeId: '', collegeName: '', courseId: '', courseName: '',
    bookingAmount: '', totalFee: '', eligibility: '', loanAvailable: false,
    yearWiseFees: [{ label: 'Year 1', amount: '' }], extraInfo: ''
  });

  const fetchAll = async () => {
    const [l, c, co] = await Promise.all([
      axios.get('/api/locations'),
      axios.get('/api/colleges'),
      axios.get('/api/courses'),
    ]);
    setLocations(l.data);
    setColleges(c.data);
    setCourses(co.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Location handlers
  const handleAddLocation = async () => {
    if (!locForm.name) return alert('Name required');
    await axios.post('/api/locations', locForm, { headers });
    setLocForm({ name: '', type: 'city', flag: '' });
    fetchAll();
    showSuccess('✅ Location added!');
  };

  // College handlers
  const handleLocationChange = (locationId: string) => {
    const loc = locations.find((l: any) => l._id === locationId);
    if (loc) {
      setColForm({
        ...colForm, locationId,
        city: loc.type === 'city' ? loc.name : '',
        country: loc.type === 'country' ? loc.name : '',
        type: loc.type === 'city' ? 'india' : 'abroad',
      });
    }
  };

  const handleAddCollege = async () => {
    if (!colForm.name) return alert('College name required');
    await axios.post('/api/colleges', colForm, { headers });
    setColForm({ name: '', locationId: '', city: '', country: '', type: 'india', fees: '', image: '', description: '', established: '' });
    fetchAll();
    showSuccess('✅ College added!');
  };

  // Course handlers
  const handleCourseCollegeChange = (collegeId: string) => {
    const col = colleges.find((c: any) => c._id === collegeId);
    setCourseForm({ ...courseForm, collegeId, collegeName: col?.name || '' });
  };

  const handleAddCourse = async () => {
    if (!courseForm.name) return alert('Course name required');
    await axios.post('/api/courses', courseForm, { headers });
    setCourseForm({ name: '', collegeId: '', collegeName: '', duration: '', description: '', icon: '' });
    fetchAll();
    showSuccess('✅ Course added!');
  };

  // Fees handlers
  const handleFeesCollegeChange = (collegeId: string) => {
    const col = colleges.find((c: any) => c._id === collegeId);
    const fc = courses.filter((c: any) => c.collegeId === collegeId);
    setFilteredCourses(fc);
    setFeesForm({ ...feesForm, collegeId, collegeName: col?.name || '', courseId: '', courseName: '' });
  };

  const handleFeesCourseChange = (courseId: string) => {
    const co = courses.find((c: any) => c._id === courseId);
    setFeesForm({ ...feesForm, courseId, courseName: co?.name || '' });
  };

  const updateYearRow = (i: number, key: string, val: string) => {
    const rows = [...feesForm.yearWiseFees];
    rows[i] = { ...rows[i], [key]: val };
    setFeesForm({ ...feesForm, yearWiseFees: rows });
  };

  const handleAddFees = async () => {
    if (!feesForm.courseId) return alert('Please select a course');
    await axios.post('/api/fees', feesForm, { headers });
    setFeesForm({
      collegeId: '', collegeName: '', courseId: '', courseName: '',
      bookingAmount: '', totalFee: '', eligibility: '', loanAvailable: false,
      yearWiseFees: [{ label: 'Year 1', amount: '' }], extraInfo: ''
    });
    setFilteredCourses([]);
    fetchAll();
    showSuccess('✅ Fees added!');
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sections = ['location', 'college', 'course', 'fees'];

  return (
    <AdminLayout title="Quick Add">
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-medium">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      <p className="text-gray-500 text-sm mb-6">Add all data from one page — no navigation needed</p>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {sections.map(s => (
          <button key={s} onClick={() => setActiveSection(s as any)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition ${activeSection === s ? 'bg-green-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-700 hover:border-green-400'}`}>
            {s === 'location' ? '📍 Location' : s === 'college' ? '🏫 College' : s === 'course' ? '📚 Course' : '💰 Fees'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 max-w-2xl">

        {/* LOCATION */}
        {activeSection === 'location' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg mb-4">📍 Add Location</h3>
            <div>
              <label className={labelClass}>Location Name *</label>
              <input placeholder="e.g. Mangalore" value={locForm.name}
                onChange={e => setLocForm({ ...locForm, name: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={locForm.type} onChange={e => setLocForm({ ...locForm, type: e.target.value })}
                className={inputClass}>
                <option value="city">🇮🇳 City (India)</option>
                <option value="country">🌍 Country (Abroad)</option>
              </select>
            </div>
            {locForm.type === 'country' && (
              <div>
                <label className={labelClass}>Flag Emoji</label>
                <input placeholder="🇷🇺" value={locForm.flag}
                  onChange={e => setLocForm({ ...locForm, flag: e.target.value })}
                  className={inputClass} />
              </div>
            )}
            <button onClick={handleAddLocation}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
              Add Location
            </button>
            {locations.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Existing locations ({locations.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {locations.map((l: any) => (
                    <span key={l._id} className={`text-xs px-3 py-1 rounded-full font-medium ${l.type === 'city' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {l.flag} {l.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* COLLEGE */}
        {activeSection === 'college' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg mb-4">🏫 Add College</h3>
            <div>
              <label className={labelClass}>College Name *</label>
              <input placeholder="e.g. Yenepoya Medical College" value={colForm.name}
                onChange={e => setColForm({ ...colForm, name: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location *</label>
              <select value={colForm.locationId} onChange={e => handleLocationChange(e.target.value)}
                className={inputClass}>
                <option value="">Select Location</option>
                <optgroup label="🇮🇳 Cities">
                  {locations.filter(l => l.type === 'city').map((l: any) => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </optgroup>
                <optgroup label="🌍 Countries">
                  {locations.filter(l => l.type === 'country').map((l: any) => (
                    <option key={l._id} value={l._id}>{l.flag} {l.name}</option>
                  ))}
                </optgroup>
              </select>
              <p className="text-xs text-green-600 mt-1 cursor-pointer hover:underline"
                onClick={() => setActiveSection('location')}>
                + Add new location first
              </p>
            </div>
            {[
              { key: 'fees', label: 'Fees', placeholder: '₹50,000/year' },
              { key: 'image', label: 'Image URL', placeholder: 'https://...' },
              { key: 'established', label: 'Established Year', placeholder: '2002' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelClass}>{f.label}</label>
                <input placeholder={f.placeholder} value={(colForm as any)[f.key]}
                  onChange={e => setColForm({ ...colForm, [f.key]: e.target.value })}
                  className={inputClass} />
              </div>
            ))}
            <div>
              <label className={labelClass}>Description</label>
              <textarea rows={2} value={colForm.description}
                onChange={e => setColForm({ ...colForm, description: e.target.value })}
                className={inputClass} />
            </div>
            <button onClick={handleAddCollege}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
              Add College
            </button>
          </div>
        )}

        {/* COURSE */}
        {activeSection === 'course' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg mb-4">📚 Add Course</h3>
            <div>
              <label className={labelClass}>College *</label>
              <select value={courseForm.collegeId} onChange={e => handleCourseCollegeChange(e.target.value)}
                className={inputClass}>
                <option value="">Select College</option>
                {colleges.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-green-600 mt-1 cursor-pointer hover:underline"
                onClick={() => setActiveSection('college')}>
                + Add new college first
              </p>
            </div>
            {[
              { key: 'name', label: 'Course Name *', placeholder: 'MBBS' },
              { key: 'duration', label: 'Duration', placeholder: '5.5 years' },
              { key: 'icon', label: 'Icon Emoji', placeholder: '🩺' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelClass}>{f.label}</label>
                <input placeholder={f.placeholder} value={(courseForm as any)[f.key]}
                  onChange={e => setCourseForm({ ...courseForm, [f.key]: e.target.value })}
                  className={inputClass} />
              </div>
            ))}
            <div>
              <label className={labelClass}>Description</label>
              <textarea rows={2} value={courseForm.description}
                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                className={inputClass} />
            </div>
            <button onClick={handleAddCourse}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
              Add Course
            </button>
          </div>
        )}

        {/* FEES */}
        {activeSection === 'fees' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg mb-4">💰 Add Fees</h3>
            <div>
              <label className={labelClass}>College *</label>
              <select value={feesForm.collegeId} onChange={e => handleFeesCollegeChange(e.target.value)}
                className={inputClass}>
                <option value="">Select College</option>
                {colleges.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Course *</label>
              <select value={feesForm.courseId} onChange={e => handleFeesCourseChange(e.target.value)}
                className={inputClass} disabled={!feesForm.collegeId}>
                <option value="">Select Course</option>
                {filteredCourses.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {feesForm.collegeId && filteredCourses.length === 0 && (
                <p className="text-xs text-orange-500 mt-1 cursor-pointer hover:underline"
                  onClick={() => setActiveSection('course')}>
                  No courses for this college. + Add course first
                </p>
              )}
            </div>
            {[
              { key: 'bookingAmount', label: 'Booking Amount', placeholder: '₹10,000' },
              { key: 'totalFee', label: 'Total Fee', placeholder: '₹3,00,000' },
              { key: 'eligibility', label: 'Eligibility', placeholder: 'NEET 50%' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelClass}>{f.label}</label>
                <input placeholder={f.placeholder} value={(feesForm as any)[f.key]}
                  onChange={e => setFeesForm({ ...feesForm, [f.key]: e.target.value })}
                  className={inputClass} />
              </div>
            ))}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Year/Semester Fees</label>
                <button onClick={() => setFeesForm({
                  ...feesForm,
                  yearWiseFees: [...feesForm.yearWiseFees, { label: `Year ${feesForm.yearWiseFees.length + 1}`, amount: '' }]
                })} className="text-xs text-green-600 font-medium hover:underline">+ Add Row</button>
              </div>
              {feesForm.yearWiseFees.map((row, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input placeholder="Year 1" value={row.label}
                    onChange={e => updateYearRow(i, 'label', e.target.value)}
                    className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                  <input placeholder="₹50,000" value={row.amount}
                    onChange={e => updateYearRow(i, 'amount', e.target.value)}
                    className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                  <button onClick={() => setFeesForm({
                    ...feesForm,
                    yearWiseFees: feesForm.yearWiseFees.filter((_, idx) => idx !== i)
                  })} className="text-red-400 text-lg hover:text-red-600">×</button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={feesForm.loanAvailable}
                onChange={e => setFeesForm({ ...feesForm, loanAvailable: e.target.checked })}
                className="w-4 h-4 accent-green-600" />
              Loan Available
            </label>
            <button onClick={handleAddFees}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
              Add Fees
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}