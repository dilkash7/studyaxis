'use client';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { Briefcase, TrendingUp, BookOpen, Users, Target, Award } from 'lucide-react';

const STREAMS = [
  { name: 'Engineering & Technology', icon: '⚙️', careers: ['Software Engineer', 'Data Scientist', 'AI/ML Engineer', 'Cloud Architect', 'DevOps Engineer', 'Cybersecurity Analyst'], salary: '₹4-25 LPA', growth: 'Very High' },
  { name: 'Medical & Healthcare', icon: '🏥', careers: ['Doctor (MBBS)', 'Surgeon', 'Dentist (BDS)', 'Physiotherapist', 'Pharmacist', 'Nurse'], salary: '₹5-30 LPA', growth: 'High' },
  { name: 'Business & Management', icon: '📊', careers: ['Business Analyst', 'Marketing Manager', 'HR Manager', 'Financial Analyst', 'Consultant', 'Entrepreneur'], salary: '₹4-20 LPA', growth: 'High' },
  { name: 'Law & Legal Studies', icon: '⚖️', careers: ['Corporate Lawyer', 'Criminal Lawyer', 'Legal Advisor', 'Judge', 'Patent Attorney', 'Legal Researcher'], salary: '₹3-15 LPA', growth: 'Moderate' },
  { name: 'Design & Architecture', icon: '🎨', careers: ['UI/UX Designer', 'Architect', 'Interior Designer', 'Graphic Designer', 'Product Designer', 'Game Designer'], salary: '₹3-18 LPA', growth: 'High' },
  { name: 'Commerce & Finance', icon: '💰', careers: ['CA', 'Investment Banker', 'Auditor', 'Tax Consultant', 'Stock Broker', 'Financial Planner'], salary: '₹4-25 LPA', growth: 'High' },
  { name: 'Arts & Humanities', icon: '📚', careers: ['Teacher', 'Journalist', 'Content Writer', 'Psychologist', 'Social Worker', 'Civil Services (IAS/IPS)'], salary: '₹3-12 LPA', growth: 'Moderate' },
  { name: 'Agriculture & Food', icon: '🌾', careers: ['Agricultural Scientist', 'Food Technologist', 'Agronomist', 'Farm Manager', 'Soil Scientist', 'Horticulturist'], salary: '₹3-10 LPA', growth: 'Moderate' },
];

const TIPS = [
  { icon: Target, title: 'Identify Your Strengths', desc: 'Take aptitude tests and understand your interests before choosing a career path.' },
  { icon: BookOpen, title: 'Research Thoroughly', desc: 'Study job market trends, salary expectations, and growth opportunities in your field.' },
  { icon: Users, title: 'Network Early', desc: 'Connect with professionals, attend seminars, and build relationships in your industry.' },
  { icon: TrendingUp, title: 'Upskill Constantly', desc: 'Learn new technologies, get certifications, and stay updated with industry trends.' },
  { icon: Award, title: 'Gain Experience', desc: 'Do internships, freelance projects, and participate in hackathons during college.' },
  { icon: Briefcase, title: 'Build Your Portfolio', desc: 'Document your projects, achievements, and skills to stand out to employers.' },
];

export default function CareerGuidancePage() {
  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Briefcase size={28} className="text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Career Guidance</h1>
          </div>
          <p className="text-gray-500 max-w-xl mx-auto">Explore career paths across streams. Find the right career based on your interests and skills.</p>
        </div>

        {/* Career Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {TIPS.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <t.icon size={20} className="text-purple-600 mb-2" />
              <h3 className="font-bold text-gray-800 text-sm mb-1">{t.title}</h3>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Stream Cards */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Career Paths by Stream</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STREAMS.map(s => (
            <div key={s.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{s.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">💰 {s.salary}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.growth === 'Very High' ? 'bg-purple-100 text-purple-700' : s.growth === 'High' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>📈 {s.growth}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.careers.map(c => (
                  <span key={c} className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-100">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
