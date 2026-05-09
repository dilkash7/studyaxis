'use client';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { Plane, FileText, Clock, MapPin, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

const COUNTRIES = [
  { name: 'Russia', flag: '🇷🇺', visa: 'Student Visa / Invitation Letter', duration: '5-6 years', process: 'Invitation from university → Apply at embassy → Medical check → Visa stamping', docs: ['Passport', 'Invitation Letter', 'Photos', 'Medical Certificate', 'Bank Statement'], fee: '~₹5,000-8,000' },
  { name: 'Kyrgyzstan', flag: '🇰🇬', visa: 'Student Visa on Arrival', duration: '5-6 years', process: 'University admission → LOI → Visa on arrival at Bishkek airport', docs: ['Passport', 'LOI', 'Photos', 'Medical Certificate'], fee: '~₹3,000-5,000' },
  { name: 'Philippines', flag: '🇵🇭', visa: 'Student Visa (9F)', duration: '5-6 years', process: 'NOA from university → Apply at Philippine Embassy → Interview → Visa stamping', docs: ['Passport', 'NOA', 'Transcript', 'Photos', 'NBI Clearance', 'Medical'], fee: '~₹8,000-12,000' },
  { name: 'Georgia', flag: '🇬🇪', visa: 'Study Permit', duration: '6 years', process: 'University acceptance → Apply online → Residence permit on arrival', docs: ['Passport', 'Acceptance Letter', 'Bank Statement', 'Medical Insurance'], fee: '~₹5,000-7,000' },
  { name: 'Bangladesh', flag: '🇧🇩', visa: 'Student Visa', duration: '5 years', process: 'Admission confirmation → Apply at Bangladesh High Commission', docs: ['Passport', 'Admission Letter', 'Photos', 'Academic Certificates'], fee: '~₹2,000-4,000' },
  { name: 'Nepal', flag: '🇳🇵', visa: 'No visa required for Indians', duration: '5.5 years', process: 'Direct admission → No visa needed for Indian citizens', docs: ['Passport / Voter ID', 'Admission Letter'], fee: 'Free' },
  { name: 'UK', flag: '🇬🇧', visa: 'Tier 4 Student Visa', duration: 'Course duration', process: 'CAS from university → Online application → Biometrics → Decision', docs: ['Passport', 'CAS', 'IELTS', 'Financial Proof', 'TB Certificate'], fee: '~₹30,000-35,000' },
  { name: 'USA', flag: '🇺🇸', visa: 'F-1 Student Visa', duration: 'Course duration', process: 'I-20 from university → DS-160 → SEVIS fee → Embassy interview', docs: ['Passport', 'I-20', 'DS-160', 'SEVIS Receipt', 'Financial Docs', 'Academic Records'], fee: '~₹14,000 + SEVIS ₹28,000' },
];

const TIPS = [
  'Apply for visa at least 2-3 months before departure',
  'Keep all original documents and 2 sets of photocopies',
  'Carry proof of sufficient funds (6 months bank statement)',
  'Get medical insurance before departure',
  'Register with Indian Embassy on arrival',
  'Keep emergency contacts saved offline',
];

export default function VisaGuidancePage() {
  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Plane size={28} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Visa Guidance</h1>
          </div>
          <p className="text-gray-500 max-w-xl mx-auto">Complete visa guidance for studying abroad. Country-wise requirements, documents, and fees.</p>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <h2 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><AlertTriangle size={16} /> Important Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TIPS.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-blue-700"><CheckCircle size={14} className="shrink-0 mt-0.5" /> {t}</div>
            ))}
          </div>
        </div>

        {/* Country Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COUNTRIES.map(c => (
            <div key={c.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{c.flag}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{c.visa}</span>
                </div>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2"><Clock size={14} className="text-gray-400 mt-0.5 shrink-0" /><span><b>Duration:</b> {c.duration}</span></div>
                <div className="flex items-start gap-2"><MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" /><span><b>Process:</b> {c.process}</span></div>
                <div className="flex items-start gap-2"><DollarSign size={14} className="text-green-500 mt-0.5 shrink-0" /><span><b>Visa Fee:</b> {c.fee}</span></div>
                <div className="flex items-start gap-2"><FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div><b>Documents:</b><div className="flex flex-wrap gap-1 mt-1">{c.docs.map(d => <span key={d} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{d}</span>)}</div></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
