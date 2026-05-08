'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Loader, Star, MapPin, IndianRupee, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

// ── Hierarchical Course Data ──────────────────────────────
const STREAM_DATA: Record<string, Record<string, string[]>> = {
  Engineering: {
    'B.Tech': ['Computer Science', 'AI & ML', 'Mechanical', 'Civil', 'Electronics', 'Electrical', 'Data Science', 'Cyber Security', 'Information Technology', 'Robotics', 'Aerospace'],
    'B.E': ['Computer Science', 'Mechanical', 'Civil', 'Electronics', 'Electrical'],
    'Diploma': ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics'],
    'M.Tech': ['Computer Science', 'AI & ML', 'Data Science', 'Structural Engineering', 'VLSI', 'Embedded Systems'],
    'Polytechnic': ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'Computer Science'],
  },
  Medical: {
    'MBBS': ['General Medicine'],
    'BDS': ['Dental Surgery'],
    'BAMS': ['Ayurvedic Medicine'],
    'BHMS': ['Homeopathic Medicine'],
    'MD': ['General Medicine', 'Pediatrics', 'Dermatology', 'Radiology', 'Orthopedics', 'Gynecology'],
    'MS': ['General Surgery', 'Orthopedics', 'ENT', 'Ophthalmology'],
  },
  Management: {
    'BBA': ['General', 'Finance', 'Marketing', 'HR', 'International Business'],
    'MBA': ['Finance', 'Marketing', 'HR', 'Operations', 'Business Analytics', 'International Business', 'Healthcare Management'],
    'BMS': ['General Management'],
  },
  'Computer Applications': {
    'BCA': ['General', 'Data Science', 'Cloud Computing'],
    'MCA': ['General', 'AI & ML', 'Data Science'],
  },
  Commerce: {
    'B.Com': ['General', 'Accounting & Finance', 'Banking & Insurance', 'Taxation'],
    'M.Com': ['Accounting', 'Finance', 'Banking'],
    'CA Foundation': ['Chartered Accountancy'],
  },
  Law: {
    'BA LLB': ['Constitutional Law', 'Corporate Law', 'Criminal Law'],
    'BBA LLB': ['Corporate Law', 'Business Law'],
    'LLB': ['General Law', 'Criminal Law'],
    'LLM': ['Corporate Law', 'Constitutional Law', 'International Law'],
  },
  Pharmacy: {
    'B.Pharm': ['Pharmacy'],
    'D.Pharm': ['Pharmacy'],
    'M.Pharm': ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry'],
    'Pharm.D': ['Clinical Pharmacy'],
  },
  Nursing: {
    'BSc Nursing': ['General Nursing'],
    'GNM': ['General Nursing & Midwifery'],
    'ANM': ['Auxiliary Nursing'],
    'MSc Nursing': ['Medical-Surgical', 'Pediatric', 'Community Health'],
  },
  'Allied Health Sciences': {
    'BPT': ['Physiotherapy'],
    'BOT': ['Occupational Therapy'],
    'BSc MLT': ['Medical Lab Technology'],
    'BSc Radiology': ['Radiology & Imaging'],
  },
  Science: {
    'BSc': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Biotechnology', 'Microbiology', 'Computer Science', 'Statistics'],
    'MSc': ['Physics', 'Chemistry', 'Mathematics', 'Biotechnology', 'Microbiology'],
  },
  Arts: {
    'BA': ['English', 'History', 'Political Science', 'Psychology', 'Sociology', 'Economics', 'Journalism'],
    'MA': ['English', 'History', 'Psychology', 'Sociology', 'Economics'],
  },
  Design: {
    'B.Des': ['Fashion Design', 'Interior Design', 'Graphic Design', 'Product Design', 'UI/UX Design'],
    'M.Des': ['Industrial Design', 'Communication Design'],
  },
  Agriculture: {
    'BSc Agriculture': ['Agriculture', 'Horticulture', 'Forestry'],
    'MSc Agriculture': ['Agronomy', 'Soil Science', 'Plant Pathology'],
  },
  'Hotel Management': {
    'BHM': ['Hotel Management', 'Catering Technology'],
    'BHMCT': ['Hotel Management & Catering'],
  },
  Aviation: {
    'BBA Aviation': ['Aviation Management'],
    'Pilot Training': ['Commercial Pilot License'],
    'AME': ['Aircraft Maintenance Engineering'],
  },
  Paramedical: {
    'DMLT': ['Medical Lab Technology'],
    'BMLT': ['Medical Lab Technology'],
    'BSc Cardiac Care': ['Cardiac Care Technology'],
    'BSc OT Technology': ['Operation Theatre Technology'],
  },
  Education: {
    'B.Ed': ['Education'],
    'D.Ed': ['Elementary Education'],
    'M.Ed': ['Education'],
  },
};

const BUDGET_OPTIONS = [
  { label: 'Below ₹1 Lakh', min: 0, max: 100000 },
  { label: '₹1–3 Lakhs', min: 100000, max: 300000 },
  { label: '₹3–5 Lakhs', min: 300000, max: 500000 },
  { label: '₹5–10 Lakhs', min: 500000, max: 1000000 },
  { label: '₹10–25 Lakhs', min: 1000000, max: 2500000 },
  { label: 'No budget limit', min: 0, max: 100000000 },
];

const STREAMS = Object.keys(STREAM_DATA);

interface SmartCollegeFinderProps {
  onComplete?: (results: any) => void;
}

export default function SmartCollegeFinder({ onComplete }: SmartCollegeFinderProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const [formData, setFormData] = useState({
    mainStream: '',
    degreeType: '',
    specialization: '',
    budgetMin: 0,
    budgetMax: 100000000,
    budgetLabel: '',
    marksPercentage: 60,
    neetScore: 0,
    entranceExam: '',
    country: 'India',
    state: '',
    city: '',
  });

  const totalSteps = 6;

  const getDegreeTypes = () => {
    if (!formData.mainStream || !STREAM_DATA[formData.mainStream]) return [];
    return Object.keys(STREAM_DATA[formData.mainStream]);
  };

  const getSpecializations = () => {
    if (!formData.mainStream || !formData.degreeType) return [];
    return STREAM_DATA[formData.mainStream]?.[formData.degreeType] || [];
  };

  const isMedicalStream = ['Medical', 'Nursing', 'Pharmacy', 'Paramedical', 'Allied Health Sciences'].includes(formData.mainStream);

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.mainStream;
      case 2: return !!formData.degreeType;
      case 3: return !!formData.budgetLabel;
      case 4: return true; // marks are optional
      case 5: return !!formData.country;
      case 6: return true; // review step
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSearch();
  };

  const handlePrev = () => {
    if (showResults) { setShowResults(false); return; }
    if (step > 1) setStep(step - 1);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/search/advanced', {
        mainCategory: formData.mainStream,
        degreeType: formData.degreeType,
        specialization: formData.specialization || undefined,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        eligibility: formData.marksPercentage,
        country: formData.country === 'India' ? 'India' : undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
      });
      setResults(res.data.success ? (res.data.data || []) : []);
    } catch {
      setResults([]);
    }
    setLoading(false);
    setShowResults(true);
    if (onComplete) onComplete(formData);
  };

  // ── Results View ──
  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">🎓 Your College Recommendations</h2>
          <p className="text-gray-500">
            {results.length > 0
              ? `Found ${results.length} colleges for ${formData.degreeType} in ${formData.mainStream}`
              : 'No exact matches found. Try adjusting your filters.'}
          </p>
          {/* Summary chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[formData.mainStream, formData.degreeType, formData.specialization, formData.budgetLabel, formData.country].filter(Boolean).map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">{tag}</span>
            ))}
          </div>
        </div>

        {results.length > 0 ? (
          <div className="space-y-4 mb-8">
            {results.map((college: any) => (
              <Link key={college._id} href={`/college/${college._id}`} className="block">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition p-5 sm:p-6 flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-32 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-700 shrink-0">
                    {college.image ? (
                      <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🏫</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-800 text-lg break-words">{college.name}</h3>
                      {college.matchScore != null && (
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                          college.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                          college.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {college.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={13} /> {college.city || college.country || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Star size={13} className="text-yellow-500" fill="currentColor" /> {college.rating || 4.0}</span>
                      {college.fees && (
                        <span className="flex items-center gap-1 text-green-600 font-semibold"><IndianRupee size={13} /> {college.fees}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 mb-8">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl font-medium text-gray-400 mb-2">No colleges found</p>
            <p className="text-gray-400 text-sm">Try selecting a broader specialization or increasing your budget</p>
          </div>
        )}

        <div className="flex justify-between">
          <button onClick={handlePrev}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition">
            <ChevronLeft size={20} /> Modify Filters
          </button>
          <Link href="/search"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition">
            Advanced Search <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Wizard Steps ──
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-blue-600">Step {step} of {totalSteps}</span>
          <span className="text-sm text-gray-500 font-medium">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
        {/* Step labels */}
        <div className="flex justify-between mt-3">
          {['Stream', 'Program', 'Budget', 'Marks', 'Location', 'Find'].map((label, i) => (
            <span key={label} className={`text-[10px] font-bold uppercase tracking-wider ${
              i + 1 <= step ? 'text-blue-600' : 'text-gray-300'
            }`}>{label}</span>
          ))}
        </div>
      </div>

      {/* ── STEP 1: Main Stream ── */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Which field interests you?</h2>
          <p className="text-gray-500 text-sm mb-6">Select your main stream of study</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {STREAMS.map((stream) => (
              <button key={stream}
                onClick={() => setFormData({ ...formData, mainStream: stream, degreeType: '', specialization: '' })}
                className={`p-3 border-2 rounded-xl transition-all text-left text-sm font-medium ${
                  formData.mainStream === stream
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}>
                {stream}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Degree Type + Specialization ── */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Select your program</h2>
          <p className="text-gray-500 text-sm mb-6">Choose degree type {formData.degreeType && 'and specialization'}</p>

          {/* Degree Type */}
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Degree / Program</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {getDegreeTypes().map((degree) => (
                <button key={degree}
                  onClick={() => setFormData({ ...formData, degreeType: degree, specialization: '' })}
                  className={`p-3 border-2 rounded-xl transition-all text-sm font-medium ${
                    formData.degreeType === degree
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}>
                  {degree}
                </button>
              ))}
            </div>
          </div>

          {/* Specialization (appears after degree selection) */}
          {formData.degreeType && getSpecializations().length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                Specialization <span className="text-gray-400 font-normal normal-case">(Optional)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {getSpecializations().map((spec) => (
                  <button key={spec}
                    onClick={() => setFormData({ ...formData, specialization: formData.specialization === spec ? '' : spec })}
                    className={`p-2.5 border-2 rounded-xl transition-all text-xs font-medium ${
                      formData.specialization === spec
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-150 hover:border-gray-300 text-gray-600'
                    }`}>
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Budget ── */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">What's your budget?</h2>
          <p className="text-gray-500 text-sm mb-6">Select your annual fee budget</p>
          <div className="space-y-3">
            {BUDGET_OPTIONS.map((opt) => (
              <button key={opt.label}
                onClick={() => setFormData({ ...formData, budgetMin: opt.min, budgetMax: opt.max, budgetLabel: opt.label })}
                className={`w-full p-4 text-left border-2 rounded-2xl transition-all flex items-center justify-between ${
                  formData.budgetLabel === opt.label
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                <span className="font-bold text-gray-800">{opt.label}</span>
                {formData.budgetLabel === opt.label && <CheckCircle2 size={20} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 4: Academic Performance ── */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Your academic performance</h2>
          <p className="text-gray-500 text-sm mb-6">Help us match eligible colleges for you</p>
          <div className="space-y-6 bg-gray-50 rounded-2xl p-5">
            <div>
              <label className="flex items-center justify-between text-sm font-bold mb-3">
                <span className="text-gray-600">Marks / Percentage</span>
                <span className="text-blue-600 text-lg">{formData.marksPercentage}%</span>
              </label>
              <input type="range" min="0" max="100" value={formData.marksPercentage}
                onChange={(e) => setFormData({ ...formData, marksPercentage: parseInt(e.target.value) })}
                className="w-full accent-blue-600 h-2" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
            </div>

            {isMedicalStream && (
              <div>
                <label className="flex items-center justify-between text-sm font-bold mb-3">
                  <span className="text-gray-600">NEET Score (Optional)</span>
                  <span className="text-blue-600 text-lg">{formData.neetScore}</span>
                </label>
                <input type="range" min="0" max="720" value={formData.neetScore}
                  onChange={(e) => setFormData({ ...formData, neetScore: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 h-2" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0</span><span>360</span><span>720</span></div>
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">Entrance Exam (Optional)</label>
              <input type="text" placeholder="e.g. NEET, JEE, CET, KCET..."
                value={formData.entranceExam}
                onChange={(e) => setFormData({ ...formData, entranceExam: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 5: Location ── */}
      {step === 5 && (
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Where would you like to study?</h2>
          <p className="text-gray-500 text-sm mb-6">Select country and optionally narrow by state/city</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {['India', 'Abroad'].map((c) => (
                <button key={c}
                  onClick={() => setFormData({ ...formData, country: c })}
                  className={`p-5 border-2 rounded-2xl transition-all text-center ${
                    formData.country === c
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <p className="text-3xl mb-1">{c === 'India' ? '🇮🇳' : '🌍'}</p>
                  <p className="font-bold text-gray-800">{c}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">State (Optional)</label>
              <input type="text" placeholder="e.g. Karnataka, Maharashtra..."
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">City (Optional)</label>
              <input type="text" placeholder="e.g. Bangalore, Mangalore, Mumbai..."
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 6: Review & Search ── */}
      {step === 6 && (
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Review your preferences</h2>
          <p className="text-gray-500 text-sm mb-6">Confirm everything looks correct before searching</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 space-y-3">
            {[
              { label: 'Stream', value: formData.mainStream },
              { label: 'Program', value: formData.degreeType },
              { label: 'Specialization', value: formData.specialization || 'Any' },
              { label: 'Budget', value: formData.budgetLabel },
              { label: 'Marks', value: `${formData.marksPercentage}%` },
              ...(isMedicalStream && formData.neetScore ? [{ label: 'NEET Score', value: String(formData.neetScore) }] : []),
              { label: 'Location', value: [formData.city, formData.state, formData.country].filter(Boolean).join(', ') },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-0">
                <span className="text-sm text-gray-500 font-medium">{label}</span>
                <span className="text-sm font-bold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
        <button onClick={handlePrev} disabled={step === 1}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition">
          <ChevronLeft size={20} /> Previous
        </button>
        <button onClick={handleNext} disabled={loading || !canProceed()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition shadow-md disabled:opacity-50">
          {loading ? (
            <><Loader className="animate-spin" size={18} /> Finding...</>
          ) : step === totalSteps ? (
            <>🔍 Find Colleges</>
          ) : (
            <>Next <ChevronRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
}
