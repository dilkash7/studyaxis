import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import HeroSection from '@/components/frontend/HeroSection';
import ServicesSection from '@/components/frontend/ServicesSection';
import WhatsAppButton from '@/components/frontend/WhatsAppButton';
import FAQChatbot from '@/components/frontend/FAQChatbot';
import CounsellingBot from '@/components/frontend/CounsellingBot';
import InquiryForm from '@/components/frontend/InquiryForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      <Navbar />
      <HeroSection />
      <ServicesSection />

      {/* Study Options */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-green-100 text-green-700 text-sm px-4 py-1 rounded-full font-medium mb-4">Destinations</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Where Do You Want to Study?</h2>
          <p className="text-gray-500 mb-12 text-lg">Choose your destination and explore top colleges</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/india" className="group bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-3xl p-10 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition text-left block">
              <div className="text-6xl mb-4">🇮🇳</div>
              <h3 className="text-3xl font-extrabold mb-2">Study in India</h3>
              <p className="text-orange-100 mb-6">Top MBBS & Engineering colleges in Bangalore, Mangalore, Chennai and more.</p>
              <span className="inline-block bg-white text-orange-600 font-bold px-6 py-2 rounded-full text-sm group-hover:bg-orange-50 transition">
                Explore Colleges →
              </span>
            </Link>
            <Link href="/abroad" className="group bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-3xl p-10 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition text-left block">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-3xl font-extrabold mb-2">Study Abroad</h3>
              <p className="text-blue-100 mb-6">Affordable MBBS in Russia, Uzbekistan and other top countries worldwide.</p>
              <span className="inline-block bg-white text-blue-600 font-bold px-6 py-2 rounded-full text-sm group-hover:bg-blue-50 transition">
                Explore Countries →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA + Form */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-green-100 text-green-700 text-sm px-4 py-1 rounded-full font-medium mb-4">Free Guidance</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-500 text-lg mb-6">Get free counselling from our experts. We guide you from selection to admission.</p>
            <ul className="space-y-3">
              {['Free career counselling', 'College shortlisting', 'Application assistance', 'Visa & document help'].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <InquiryForm />
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <CounsellingBot />
      <FAQChatbot />
    </div>
  );
}