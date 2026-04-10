'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const DEFAULT = {
  badge: "🎓 India's Trusted Education Consultancy",
  showBadge: true,
  heroTitle: 'Find the Right College\nfor Your Future',
  heroSubtitle: 'Expert guidance for MBBS, Engineering & Abroad admissions.',
  btn1Text: '🇮🇳 Study in India',
  btn1Link: '/india',
  btn2Text: '🌍 Study Abroad',
  btn2Link: '/abroad',
  heroImage: '',
  stats: [
    { value: '500+', label: 'Colleges' },
    { value: '10K+', label: 'Students' },
    { value: '15+', label: 'Countries' },
    { value: '98%', label: 'Success Rate' },
  ],
};

export default function HeroSection() {
  const [settings, setSettings] = useState<any>(DEFAULT);

  useEffect(() => {
    axios.get('/api/settings/homepage')
      .then(r => setSettings({ ...DEFAULT, ...r.data }))
      .catch(() => {});
  }, []);

  const lines = settings.heroTitle?.split('\n') || ['Find the Right College', 'for Your Future'];

  return (
    <section className="relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #065f46 0%, #047857 40%, #059669 70%, #10b981 100%)',
    }}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            {settings.showBadge && settings.badge && (
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full mb-6 font-medium border border-white/30">
                {settings.badge}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              {lines.map((line: string, i: number) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-10 leading-relaxed max-w-lg">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={settings.btn1Link || '/india'}
                className="bg-white text-green-700 font-bold px-8 py-4 rounded-2xl hover:bg-green-50 transition text-base shadow-xl text-center hover:-translate-y-0.5 transform">
                {settings.btn1Text}
              </Link>
              <Link href={settings.btn2Link || '/abroad'}
                className="border-2 border-white/70 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white hover:text-green-700 transition text-base text-center hover:-translate-y-0.5 transform">
                {settings.btn2Text}
              </Link>
            </div>

            {settings.stats?.length > 0 && (
              <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/20">
                {settings.stats.map((s: any, i: number) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-extrabold text-white">{s.value}</div>
                    <div className="text-green-200 text-sm mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side image or decorative card */}
          <div className="hidden lg:block">
            {settings.heroImage ? (
              <img src={settings.heroImage} alt="Hero"
                className="w-full h-96 object-cover rounded-3xl shadow-2xl border-4 border-white/20" />
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="space-y-4">
                  {[
                    { icon: '🩺', title: 'MBBS Admissions', desc: 'Top medical colleges' },
                    { icon: '⚙️', title: 'Engineering', desc: 'Premier institutes' },
                    { icon: '✈️', title: 'Study Abroad', desc: 'Russia, Uzbekistan & more' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/10 rounded-2xl p-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-white text-sm">{item.title}</p>
                        <p className="text-green-200 text-xs">{item.desc}</p>
                      </div>
                      <span className="ml-auto text-white/60">→</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-white/20 rounded-2xl p-4 text-center">
                  <p className="text-white font-bold">🎯 Free Counselling</p>
                  <p className="text-green-200 text-sm mt-1">Get expert guidance today</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}