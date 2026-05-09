'use client';
import { useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { Phone, CheckCircle, Send } from 'lucide-react';

export default function CallbackPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', course: '', message: '', callbackTime: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return alert('Name and phone required');
    setLoading(true);
    try {
      await fetch('/api/whatsapp-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, callback: true, source: 'Callback Page' }),
      });
      setSubmitted(true);
    } catch { alert('Failed. Please try again.'); }
    setLoading(false);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";

  if (submitted) return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Callback Scheduled!</h2>
        <p className="text-gray-500 mb-6">Our counsellor will call you shortly. Check WhatsApp for updates.</p>
        <a href="/" className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition">Back to Home</a>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone size={24} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Request a Callback</h1>
            <p className="text-sm text-gray-500">Fill the form and our expert counsellor will call you within 30 minutes.</p>
          </div>
          <div className="space-y-3">
            <input placeholder="Your Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} />
            <input placeholder="Phone Number *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp} />
            <input placeholder="Email (optional)" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} />
            <input placeholder="Course Interested In" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} className={inp} />
            <input type="datetime-local" value={form.callbackTime} onChange={e => setForm(f => ({ ...f, callbackTime: e.target.value }))} className={inp} />
            <textarea placeholder="Any specific questions?" rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={inp} />
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Send size={14} /> {loading ? 'Submitting...' : 'Request Callback'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
