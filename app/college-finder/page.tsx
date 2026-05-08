'use client';

import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import WhatsAppButton from '@/components/frontend/WhatsAppButton';
import FAQChatbot from '@/components/frontend/FAQChatbot';
import CounsellingBot from '@/components/frontend/CounsellingBot';
import SmartCollegeFinder from '@/components/frontend/SmartCollegeFinder';

export default function CollegeFinderPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)' }}>
      <Navbar />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12 sm:py-16 px-4 sm:px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">🎓 Smart College Finder</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          Answer a few questions and get personalized college recommendations based on your course, budget, and marks
        </p>
      </div>

      {/* Finder */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <SmartCollegeFinder />
      </div>

      <Footer />
      <WhatsAppButton />
      <CounsellingBot />
      <FAQChatbot />
    </div>
  );
}
