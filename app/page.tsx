import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import HeroSection from '@/components/frontend/HeroSection';
import ServicesSection from '@/components/frontend/ServicesSection';
import InquiryForm from '@/components/frontend/InquiryForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      <Navbar />
      <HeroSection />
      <ServicesSection />

      {/* Trust Stats Bar */}
      <section className="py-10 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '500+', label: 'Colleges Listed', icon: '🏫' },
            { value: '50+', label: 'Courses Available', icon: '📚' },
            { value: '10K+', label: 'Students Guided', icon: '🎓' },
            { value: '95%', label: 'Satisfaction Rate', icon: '⭐' },
          ].map(s => (
            <div key={s.label} className="group">
              <span className="text-3xl block mb-1">{s.icon}</span>
              <p className="text-3xl font-extrabold text-gray-900 group-hover:text-green-600 transition">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* College Finder Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm px-4 py-1 rounded-full font-medium mb-4">Smart Search</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Find Your Perfect College</h2>
          <p className="text-gray-600 mb-8 text-lg">Get personalized college recommendations based on your preferences, budget, and marks.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/college-finder" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition transform hover:scale-105 shadow-lg shadow-blue-600/20">
              🎓 Smart College Finder
            </Link>
            <Link href="/search" className="inline-flex items-center justify-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl transition">
              🔍 Advanced Search
            </Link>
          </div>
        </div>
      </section>

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

      {/* Popular Streams */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-purple-100 text-purple-700 text-sm px-4 py-1 rounded-full font-medium mb-4">Popular Streams</span>
            <h2 className="text-3xl font-extrabold text-gray-900">Explore by Stream</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { name: 'Medical (MBBS)', icon: '🩺', color: 'from-red-400 to-red-600', href: '/search?stream=Medical' },
              { name: 'Engineering', icon: '⚙️', color: 'from-blue-400 to-blue-600', href: '/search?stream=Engineering' },
              { name: 'Management (MBA)', icon: '📊', color: 'from-green-400 to-green-600', href: '/search?stream=Management' },
              { name: 'Law (LLB)', icon: '⚖️', color: 'from-yellow-500 to-orange-500', href: '/search?stream=Law' },
              { name: 'Pharmacy', icon: '💊', color: 'from-teal-400 to-teal-600', href: '/search?stream=Pharmacy' },
              { name: 'Nursing', icon: '🏥', color: 'from-pink-400 to-pink-600', href: '/search?stream=Nursing' },
              { name: 'Arts & Science', icon: '🎨', color: 'from-indigo-400 to-indigo-600', href: '/search?stream=Arts' },
              { name: 'Education (B.Ed)', icon: '📖', color: 'from-amber-400 to-amber-600', href: '/search?stream=Education' },
            ].map(s => (
              <Link key={s.name} href={s.href}
                className={`group bg-gradient-to-br ${s.color} text-white rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-bold text-sm">{s.name}</p>
              </Link>
            ))}
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
              {['Free career counselling', 'College shortlisting', 'Application assistance', 'Visa & document help', 'Scholarship guidance', 'Post-admission support'].map(item => (
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
    </div>
  );
}