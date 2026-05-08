'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle, Sparkles, ChevronDown, ChevronUp, Plus, X, Upload, AlertTriangle } from 'lucide-react';

const STEPS = ['📍 Location', '🏫 College', '🏢 Campus', '📚 Course', '💰 Fees'];
const FEE_CATEGORIES = ['Karnataka', 'Non-Karnataka', 'Merit', 'Management', 'NRI', 'Scholarship', 'Hostel', 'Transport', 'Exam Fee', 'Miscellaneous'];

export default function QuickAddPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [success, setSuccess] = useState('');
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true });
  const [ai, setAi] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [dupes, setDupes] = useState<any[]>([]);
  const [dupeType, setDupeType] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  // Forms
  const [locForm, setLocForm] = useState({ name: '', type: 'city', flag: '' });
  const [colForm, setColForm] = useState({ name: '', locationId: '', city: '', country: '', type: 'india', fees: '', image: '', description: '', established: '' });
  const [campForm, setCampForm] = useState({ name: '', collegeId: '', city: '', state: '', address: '' });
  const [courseForm, setCourseForm] = useState({ name: '', collegeId: '', collegeName: '', duration: '', description: '', icon: '', mainCategory: '', courseType: '', degreeType: '', specialization: '', entranceExam: '', eligibility: '' });
  const [feesForm, setFeesForm] = useState({ collegeId: '', collegeName: '', courseId: '', courseName: '', feeCategory: 'Karnataka', bookingAmount: '', totalFee: '', eligibility: '', loanAvailable: false, yearWiseFees: [{ label: 'Year 1', amount: '' }], extraInfo: '' });

  const fetchAll = async () => {
    try {
      const [l, c, ca, co] = await Promise.all([
        axios.get('/api/locations'), axios.get('/api/colleges'),
        axios.get('/api/campuses', { headers }), axios.get('/api/courses'),
      ]);
      setLocations(l.data); setColleges(c.data);
      setCampuses(ca.data?.data || []); setCourses(co.data);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, []);

  const show = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const toggle = (i: number) => setOpenSections(p => ({ ...p, [i]: !p[i] }));
  const inp = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";
  const lbl = "block text-xs font-semibold text-gray-500 uppercase mb-1";

  // Duplicate detection
  const checkDuplicates = async (type: string, name: string, collegeId?: string) => {
    if (!name || name.length < 3) { setDupes([]); setDupeType(''); return; }
    try {
      const r = await axios.post('/api/duplicates', { type, name, collegeId });
      setDupes(r.data.duplicates || []); setDupeType(type);
    } catch { setDupes([]); }
  };

  // Duplicate warning component
  const DupeWarning = () => dupes.length > 0 ? (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
      <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-amber-600" /><span className="text-xs font-bold text-amber-800">Possible duplicates found:</span></div>
      {dupes.map((d: any, i: number) => (
        <div key={i} className="text-xs text-amber-700 flex items-center gap-2 py-1">
          <span className="font-medium">{d.name}</span>
          <span className="text-amber-500">({d.score}% match)</span>
          {d.city && <span className="text-amber-400">• {d.city}</span>}
          {d.collegeName && <span className="text-amber-400">• {d.collegeName}</span>}
        </div>
      ))}
    </div>
  ) : null;

  // AI Auto-detect
  const autoDetect = async (name: string) => {
    if (!name || name.length < 2) { setAi(null); return; }
    setAiLoading(true);
    try {
      const r = await axios.post('/api/classify', { courseName: name, collegeName: courseForm.collegeName });
      setAi(r.data);
    } catch {} finally { setAiLoading(false); }
  };

  const acceptAI = () => {
    if (!ai) return;
    setCourseForm(f => ({
      ...f,
      mainCategory: ai.mainCategory || f.mainCategory,
      courseType: ai.courseType || f.courseType,
      degreeType: ai.degreeType || f.degreeType,
      specialization: ai.specialization || f.specialization,
      entranceExam: ai.entranceExam || f.entranceExam,
      duration: ai.duration || f.duration,
      eligibility: ai.eligibility || f.eligibility,
    }));
    show('✨ AI suggestions applied!');
  };

  // Handlers
  const addLocation = async () => {
    if (!locForm.name) return alert('Name required');
    await axios.post('/api/locations', locForm, { headers });
    setLocForm({ name: '', type: 'city', flag: '' }); fetchAll();
    show('✅ Location added!'); toggle(0); toggle(1);
  };

  const addCollege = async () => {
    if (!colForm.name) return alert('College name required');
    await axios.post('/api/colleges', colForm, { headers });
    setColForm({ name: '', locationId: '', city: '', country: '', type: 'india', fees: '', image: '', description: '', established: '' });
    fetchAll(); show('✅ College added!'); toggle(1); toggle(2);
  };

  const addCampus = async () => {
    if (!campForm.name || !campForm.collegeId) return alert('Campus name & college required');
    await axios.post('/api/campuses', campForm, { headers });
    setCampForm({ name: '', collegeId: '', city: '', state: '', address: '' });
    fetchAll(); show('✅ Campus added!'); toggle(2); toggle(3);
  };

  const addCourse = async () => {
    if (!courseForm.name || !courseForm.collegeId) return alert('Course name & college required');
    await axios.post('/api/courses', courseForm, { headers });
    setCourseForm({ name: '', collegeId: '', collegeName: '', duration: '', description: '', icon: '', mainCategory: '', courseType: '', degreeType: '', specialization: '', entranceExam: '', eligibility: '' });
    setAi(null); fetchAll(); show('✅ Course added!'); toggle(3); toggle(4);
  };

  const addFees = async () => {
    if (!feesForm.courseId) return alert('Please select a course');
    await axios.post('/api/fees', feesForm, { headers });
    setFeesForm({ collegeId: '', collegeName: '', courseId: '', courseName: '', feeCategory: 'Karnataka', bookingAmount: '', totalFee: '', eligibility: '', loanAvailable: false, yearWiseFees: [{ label: 'Year 1', amount: '' }], extraInfo: '' });
    fetchAll(); show('✅ Fees added!');
  };

  const handleLocationChange = (id: string) => {
    const loc = locations.find(l => l._id === id);
    if (loc) setColForm({ ...colForm, locationId: id, city: loc.type === 'city' ? loc.name : '', country: loc.type === 'country' ? loc.name : '', type: loc.type === 'city' ? 'india' : 'abroad' });
  };

  const SectionHeader = ({ idx, title }: { idx: number; title: string }) => (
    <button onClick={() => toggle(idx)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition rounded-xl">
      <div className="flex items-center gap-3">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${openSections[idx] ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{idx + 1}</span>
        <span className="font-bold text-gray-800">{title}</span>
      </div>
      {openSections[idx] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
    </button>
  );

  return (
    <AdminLayout title="Smart Quick Add">
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-medium animate-pulse">
          <CheckCircle size={18} /> {success}
        </div>
      )}
      <p className="text-gray-500 text-sm mb-6">Complete workflow — add everything from one page</p>

      <div className="max-w-3xl space-y-3">
        {/* 1. LOCATION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader idx={0} title={STEPS[0]} />
          {openSections[0] && (
            <div className="p-5 pt-0 space-y-3">
              <div><label className={lbl}>Location Name *</label><input placeholder="e.g. Mangalore" value={locForm.name} onChange={e => setLocForm({ ...locForm, name: e.target.value })} className={inp} /></div>
              <div><label className={lbl}>Type</label><select value={locForm.type} onChange={e => setLocForm({ ...locForm, type: e.target.value })} className={inp}><option value="city">🇮🇳 City</option><option value="country">🌍 Country</option></select></div>
              {locForm.type === 'country' && <div><label className={lbl}>Flag</label><input placeholder="🇷🇺" value={locForm.flag} onChange={e => setLocForm({ ...locForm, flag: e.target.value })} className={inp} /></div>}
              <button onClick={addLocation} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition text-sm">Add Location</button>
              {locations.length > 0 && <div className="flex flex-wrap gap-1.5 pt-2">{locations.map(l => <span key={l._id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${l.type === 'city' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{l.flag} {l.name}</span>)}</div>}
            </div>
          )}
        </div>

        {/* 2. COLLEGE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader idx={1} title={STEPS[1]} />
          {openSections[1] && (
            <div className="p-5 pt-0 space-y-3">
              <div><label className={lbl}>College Name *</label><input placeholder="Yenepoya University" value={colForm.name} onChange={e => setColForm({ ...colForm, name: e.target.value })} onBlur={() => checkDuplicates('college', colForm.name)} className={inp} />{dupeType === 'college' && <DupeWarning />}</div>
              <div><label className={lbl}>Location *</label>
                <select value={colForm.locationId} onChange={e => handleLocationChange(e.target.value)} className={inp}>
                  <option value="">Select Location</option>
                  <optgroup label="🇮🇳 Cities">{locations.filter(l => l.type === 'city').map(l => <option key={l._id} value={l._id}>{l.name}</option>)}</optgroup>
                  <optgroup label="🌍 Countries">{locations.filter(l => l.type === 'country').map(l => <option key={l._id} value={l._id}>{l.flag} {l.name}</option>)}</optgroup>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Established</label><input placeholder="2002" value={colForm.established} onChange={e => setColForm({ ...colForm, established: e.target.value })} className={inp} /></div>
                <div><label className={lbl}>Image URL</label><input placeholder="https://..." value={colForm.image} onChange={e => setColForm({ ...colForm, image: e.target.value })} className={inp} /></div>
              </div>
              <div><label className={lbl}>Description</label><textarea rows={2} value={colForm.description} onChange={e => setColForm({ ...colForm, description: e.target.value })} className={inp} /></div>
              <button onClick={addCollege} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition text-sm">Add College</button>
            </div>
          )}
        </div>

        {/* 3. CAMPUS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader idx={2} title={STEPS[2]} />
          {openSections[2] && (
            <div className="p-5 pt-0 space-y-3">
              <div><label className={lbl}>College *</label><select value={campForm.collegeId} onChange={e => setCampForm({ ...campForm, collegeId: e.target.value })} className={inp}><option value="">Select College</option>{colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
              <div><label className={lbl}>Campus Name *</label><input placeholder="Main Campus" value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} className={inp} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>City</label><input placeholder="Mangalore" value={campForm.city} onChange={e => setCampForm({ ...campForm, city: e.target.value })} className={inp} /></div>
                <div><label className={lbl}>State</label><input placeholder="Karnataka" value={campForm.state} onChange={e => setCampForm({ ...campForm, state: e.target.value })} className={inp} /></div>
              </div>
              <div><label className={lbl}>Address</label><input placeholder="Full address" value={campForm.address} onChange={e => setCampForm({ ...campForm, address: e.target.value })} className={inp} /></div>
              <button onClick={addCampus} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition text-sm">Add Campus</button>
            </div>
          )}
        </div>

        {/* 4. COURSE + AI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader idx={3} title={STEPS[3]} />
          {openSections[3] && (
            <div className="p-5 pt-0 space-y-3">
              <div><label className={lbl}>College *</label><select value={courseForm.collegeId} onChange={e => { const c = colleges.find(x => x._id === e.target.value); setCourseForm({ ...courseForm, collegeId: e.target.value, collegeName: c?.name || '' }); }} className={inp}><option value="">Select College</option>{colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
              <div>
                <label className={lbl}>Course Name * <span className="text-green-600 normal-case">(AI auto-detects as you type)</span></label>
                <input placeholder="e.g. B.Tech Computer Science" value={courseForm.name}
                  onChange={e => { setCourseForm({ ...courseForm, name: e.target.value }); autoDetect(e.target.value); }}
                  onBlur={() => checkDuplicates('course', courseForm.name, courseForm.collegeId)}
                  className={inp} />
                {dupeType === 'course' && <DupeWarning />}
              </div>

              {/* AI Suggestion Card */}
              {ai && ai.confidence > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Sparkles size={16} className="text-purple-600" /><span className="text-sm font-bold text-purple-800">AI Detected ({ai.confidence}% confidence)</span></div>
                    <button onClick={acceptAI} className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-bold hover:bg-purple-700 transition">✓ Accept All</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {ai.mainCategory && <div><span className="text-gray-500">Stream:</span> <span className="font-bold text-gray-800">{ai.mainCategory}</span></div>}
                    {ai.courseType && <div><span className="text-gray-500">Level:</span> <span className="font-bold text-gray-800">{ai.courseType}</span></div>}
                    {ai.degreeType && <div><span className="text-gray-500">Degree:</span> <span className="font-bold text-gray-800">{ai.degreeType}</span></div>}
                    {ai.specialization && <div><span className="text-gray-500">Specialization:</span> <span className="font-bold text-gray-800">{ai.specialization}</span></div>}
                    {ai.duration && <div><span className="text-gray-500">Duration:</span> <span className="font-bold text-gray-800">{ai.duration}</span></div>}
                    {ai.eligibility && <div className="col-span-2"><span className="text-gray-500">Eligibility:</span> <span className="font-bold text-gray-800">{ai.eligibility}</span></div>}
                    {ai.entranceExam && <div><span className="text-gray-500">Entrance:</span> <span className="font-bold text-gray-800">{ai.entranceExam}</span></div>}
                  </div>
                </div>
              )}
              {aiLoading && <p className="text-xs text-purple-500 animate-pulse">🤖 AI analyzing...</p>}

              {/* Manual fields */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Stream</label><input placeholder="Engineering" value={courseForm.mainCategory} onChange={e => setCourseForm({ ...courseForm, mainCategory: e.target.value })} className={inp} /></div>
                <div><label className={lbl}>Level</label><select value={courseForm.courseType} onChange={e => setCourseForm({ ...courseForm, courseType: e.target.value })} className={inp}><option value="">Select</option>{['UG', 'PG', 'Diploma', 'Doctorate', 'Certificate'].map(l => <option key={l}>{l}</option>)}</select></div>
                <div><label className={lbl}>Degree Type</label><input placeholder="B.Tech" value={courseForm.degreeType} onChange={e => setCourseForm({ ...courseForm, degreeType: e.target.value })} className={inp} /></div>
                <div><label className={lbl}>Specialization</label><input placeholder="Computer Science" value={courseForm.specialization} onChange={e => setCourseForm({ ...courseForm, specialization: e.target.value })} className={inp} /></div>
                <div><label className={lbl}>Duration</label><input placeholder="4 Years" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} className={inp} /></div>
                <div><label className={lbl}>Entrance Exam</label><input placeholder="JEE/KCET" value={courseForm.entranceExam} onChange={e => setCourseForm({ ...courseForm, entranceExam: e.target.value })} className={inp} /></div>
              </div>
              <div><label className={lbl}>Eligibility</label><input placeholder="10+2 with PCM" value={courseForm.eligibility} onChange={e => setCourseForm({ ...courseForm, eligibility: e.target.value })} className={inp} /></div>
              <div><label className={lbl}>Description</label><textarea rows={2} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} className={inp} /></div>
              <button onClick={addCourse} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition text-sm">Add Course</button>
            </div>
          )}
        </div>

        {/* 5. FEES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader idx={4} title={STEPS[4]} />
          {openSections[4] && (
            <div className="p-5 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>College *</label><select value={feesForm.collegeId} onChange={e => { const c = colleges.find(x => x._id === e.target.value); setFeesForm({ ...feesForm, collegeId: e.target.value, collegeName: c?.name || '', courseId: '', courseName: '' }); }} className={inp}><option value="">Select</option>{colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                <div><label className={lbl}>Course *</label><select value={feesForm.courseId} onChange={e => { const c = courses.find(x => x._id === e.target.value); setFeesForm({ ...feesForm, courseId: e.target.value, courseName: c?.name || '' }); }} className={inp} disabled={!feesForm.collegeId}><option value="">Select</option>{courses.filter(c => c.collegeId === feesForm.collegeId).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
              </div>
              <div><label className={lbl}>Fee Category</label><select value={feesForm.feeCategory} onChange={e => setFeesForm({ ...feesForm, feeCategory: e.target.value })} className={inp}>{FEE_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Booking Amount</label><input placeholder="₹10,000" value={feesForm.bookingAmount} onChange={e => setFeesForm({ ...feesForm, bookingAmount: e.target.value })} className={inp} /></div>
                <div><label className={lbl}>Total Fee</label><input placeholder="₹3,00,000" value={feesForm.totalFee} onChange={e => setFeesForm({ ...feesForm, totalFee: e.target.value })} className={inp} /></div>
              </div>
              <div><label className={lbl}>Eligibility</label><input placeholder="NEET 50%" value={feesForm.eligibility} onChange={e => setFeesForm({ ...feesForm, eligibility: e.target.value })} className={inp} /></div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className={lbl}>Year-wise Fees</label><button onClick={() => setFeesForm({ ...feesForm, yearWiseFees: [...feesForm.yearWiseFees, { label: `Year ${feesForm.yearWiseFees.length + 1}`, amount: '' }] })} className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1"><Plus size={12} /> Add Row</button></div>
                {feesForm.yearWiseFees.map((row, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="Year 1" value={row.label} onChange={e => { const r = [...feesForm.yearWiseFees]; r[i] = { ...r[i], label: e.target.value }; setFeesForm({ ...feesForm, yearWiseFees: r }); }} className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                    <input placeholder="₹50,000" value={row.amount} onChange={e => { const r = [...feesForm.yearWiseFees]; r[i] = { ...r[i], amount: e.target.value }; setFeesForm({ ...feesForm, yearWiseFees: r }); }} className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                    <button onClick={() => setFeesForm({ ...feesForm, yearWiseFees: feesForm.yearWiseFees.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={feesForm.loanAvailable} onChange={e => setFeesForm({ ...feesForm, loanAvailable: e.target.checked })} className="w-4 h-4 accent-green-600" /> Loan Available</label>
              <button onClick={addFees} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition text-sm">Add Fees</button>
            </div>
          )}
        </div>

        {/* 6. BULK IMPORT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader idx={5} title="📦 Bulk Import" />
          {openSections[5] && (
            <BulkImportSection colleges={colleges} headers={headers} onSuccess={(msg: string) => { show(msg); fetchAll(); }} inp={inp} lbl={lbl} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Bulk Import as separate component to keep main component clean
function BulkImportSection({ colleges, headers, onSuccess, inp, lbl }: any) {
  const [bulkCollegeId, setBulkCollegeId] = useState('');
  const [bulkCollegeName, setBulkCollegeName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleBulkImport = async () => {
    if (!bulkCollegeId || !bulkText.trim()) return alert('Select college and enter course names');
    const names = bulkText.split('\n').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) return alert('Enter at least one course name');

    setImporting(true);
    try {
      const r = await axios.post('/api/bulk-import', {
        courses: names, collegeId: bulkCollegeId, collegeName: bulkCollegeName,
      }, { headers });
      setResult(r.data);
      onSuccess(`✅ Imported ${r.data.imported} courses!`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Import failed');
    } finally { setImporting(false); }
  };

  return (
    <div className="p-5 pt-0 space-y-3">
      <div><label className={lbl}>College *</label>
        <select value={bulkCollegeId} onChange={e => { setBulkCollegeId(e.target.value); const c = colleges.find((x: any) => x._id === e.target.value); setBulkCollegeName(c?.name || ''); }} className={inp}>
          <option value="">Select College</option>
          {colleges.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className={lbl}>Course Names <span className="normal-case text-green-600">(one per line — AI auto-classifies each)</span></label>
        <textarea rows={8} placeholder={"B.Tech Computer Science\nMBBS\nMBA Finance\nBCA\nB.Sc Nursing\nPharm.D"} value={bulkText} onChange={e => setBulkText(e.target.value)} className={inp} />
      </div>
      <button onClick={handleBulkImport} disabled={importing} className={`w-full py-2.5 rounded-xl font-bold transition text-sm ${importing ? 'bg-gray-400 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
        {importing ? '⏳ Importing...' : `🚀 Import ${bulkText.split('\n').filter(n => n.trim()).length} Courses`}
      </button>
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <p className="font-bold text-green-800">✅ {result.imported} imported, {result.errors} errors</p>
          {result.results?.map((r: any, i: number) => (
            <div key={i} className="text-xs text-green-700 py-0.5">{r.name} — {r.confidence}% confidence</div>
          ))}
          {result.errorDetails?.map((e: any, i: number) => (
            <div key={i} className="text-xs text-red-600 py-0.5">❌ {e.name}: {e.error}</div>
          ))}
        </div>
      )}
    </div>
  );
}