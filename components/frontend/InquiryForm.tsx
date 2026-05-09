'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { buildWhatsAppURL } from '@/lib/whatsapp';

interface HybridInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
}

function HybridInput({ label, placeholder, value, onChange, suggestions }: HybridInputProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (val.trim().length > 0) {
      const f = suggestions.filter(s => s.toLowerCase().includes(val.toLowerCase()));
      setFiltered(f);
      setOpen(f.length > 0);
    } else {
      setFiltered(suggestions);
      setOpen(suggestions.length > 0);
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      const f = value.trim()
        ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))
        : suggestions;
      setFiltered(f);
      setOpen(f.length > 0);
    }
  };

  const handleSelect = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => handleChange(e.target.value)}
        onFocus={handleFocus}
        autoComplete="off"
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
          {filtered.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-green-50 hover:text-green-700 transition first:rounded-t-xl last:rounded-b-xl border-b border-gray-50 last:border-0">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InquiryForm({
  preselectedCourse = '',
  preselectedCollege = '',
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    course: preselectedCourse,
    location: '',
    college: preselectedCollege,
    budget: '',
    stream: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      axios.get('/api/courses'),
      axios.get('/api/locations'),
      axios.get('/api/colleges'),
    ]).then(([co, lo, cl]) => {
      setCourses(co.data.map((c: any) => c.name).filter(Boolean));
      setLocations(lo.data.map((l: any) => l.name).filter(Boolean));
      setColleges(cl.data.map((c: any) => c.name).filter(Boolean));
    }).catch(() => {});
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return alert('Name and phone are required');
    setLoading(true);
    try {
      await axios.post('/api/leads', form);
      // Also create an application record for tracking in student portal
      if (form.college) {
        await axios.post('/api/applications', {
          studentName: form.name,
          phone: form.phone,
          email: form.email,
          collegeName: form.college,
          course: form.course,
          source: 'Website Lead Form',
        });
      }
      const url = buildWhatsAppURL(form);
      window.open(url, '_blank');
      setSuccess(true);
      setForm({ name: '', phone: '', email: '', course: '', location: '', college: '', budget: '', stream: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
        <p className="text-gray-500 text-sm mb-4">
          We've received your enquiry. Our team will contact you shortly on WhatsApp!
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-green-600 hover:underline font-medium">
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Get Free Counselling</h3>
        <p className="text-gray-500 text-sm mt-1">Fill the form — we'll contact you on WhatsApp</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
        <input
          type="text"
          placeholder="Your full name"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number *</label>
        <input
          type="tel"
          placeholder="+91 98765 43210"
          required
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
        <input
          type="email"
          placeholder="email@example.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Course — Hybrid */}
      <HybridInput
        label="Course Interested In"
        placeholder="e.g. MBBS, Engineering, Nursing..."
        value={form.course}
        onChange={val => setForm({ ...form, course: val })}
        suggestions={courses}
      />

      {/* Location — Hybrid */}
      <HybridInput
        label="Preferred Location"
        placeholder="e.g. Mangalore, Bangalore, Russia..."
        value={form.location}
        onChange={val => setForm({ ...form, location: val })}
        suggestions={locations}
      />

      {/* College — Hybrid */}
      <HybridInput
        label="Preferred College (Optional)"
        placeholder="Type any college name..."
        value={form.college}
        onChange={val => setForm({ ...form, college: val })}
        suggestions={colleges}
      />

      {/* Stream */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred Stream</label>
        <select value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
          <option value="">Select stream...</option>
          {['Medical', 'Engineering', 'Management', 'Law', 'Arts & Science', 'Pharmacy', 'Nursing', 'Education', 'Abroad'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Annual Budget</label>
        <select value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
          <option value="">Select budget range...</option>
          {['Under ₹1 Lakh', '₹1-3 Lakhs', '₹3-5 Lakhs', '₹5-10 Lakhs', '₹10-20 Lakhs', '₹20+ Lakhs'].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          '💬 Submit & Chat on WhatsApp'
        )}
      </button>
    </form>
  );
}