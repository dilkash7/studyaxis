'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const DEFAULT_SERVICES = [
  { icon: '🩺', title: 'MBBS in India', description: 'Top medical colleges with low fees and high success rate.', link: '/india' },
  { icon: '⚙️', title: 'Engineering', description: 'Premier engineering institutes across India and abroad.', link: '/india' },
  { icon: '✈️', title: 'Study in Russia', description: 'Affordable MBBS programs in top Russian universities.', link: '/abroad' },
  { icon: '🌏', title: 'Study in Uzbekistan', description: 'WHO recognized medical universities at lowest cost.', link: '/abroad' },
  { icon: '📋', title: 'Free Counselling', description: 'Expert guidance to choose the right college for you.', link: '/apply' },
  { icon: '📄', title: 'Document Help', description: 'Complete assistance with applications and documentation.', link: '/apply' },
];

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/services')
      .then(r => {
        setServices(r.data.length > 0 ? r.data : DEFAULT_SERVICES);
      })
      .catch(() => setServices(DEFAULT_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f0fdf4 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-green-100 text-green-700 text-sm px-4 py-1 rounded-full font-medium mb-4">What We Offer</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Our Services</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Everything you need for your admission journey — from selection to enrollment</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s: any, i: number) => (
              <div key={s._id || i}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group border border-gray-100 cursor-pointer">
                {s.image ? (
                  <img src={s.image} alt={s.title} className="w-12 h-12 rounded-xl object-cover mb-4" />
                ) : (
                  <div className="text-4xl mb-4">{s.icon || '🎓'}</div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                {s.link && (
                  <Link href={s.link}
                    className="inline-block mt-3 text-green-600 text-sm font-semibold hover:underline">
                    Learn more →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}