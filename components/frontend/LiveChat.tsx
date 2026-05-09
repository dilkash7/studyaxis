'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Phone, ExternalLink } from 'lucide-react';

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    { from: 'bot', text: 'Hi! 👋 Welcome to StudyAxis. How can I help you today?' },
    { from: 'bot', text: 'Ask about admissions, courses, fees, or any college query.' },
  ]);
  const [input, setInput] = useState('');
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  const quickReplies = ['Admission Process', 'Fee Details', 'Available Courses', 'Talk to Counsellor'];

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { from: 'user', text }]);
    setInput('');
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = 'Thank you! Our counsellor will contact you shortly. You can also WhatsApp us for instant help.';
      if (lower.includes('admission') || lower.includes('apply')) reply = 'For admissions, visit our Apply page or use the Callback feature. We guide students for MBBS, Engineering, and Abroad programs.';
      else if (lower.includes('fee') || lower.includes('cost')) reply = 'Fee details vary by college and course. Use our Advanced Search to filter by budget, or check individual college pages.';
      else if (lower.includes('course') || lower.includes('program')) reply = 'We cover MBBS, BDS, B.Tech, MBA, and 50+ programs. Use College Finder for full listings.';
      else if (lower.includes('counsellor') || lower.includes('call')) reply = 'Our counsellor will call within 30 minutes! Visit /callback to schedule a preferred time.';
      else if (lower.includes('abroad') || lower.includes('visa')) reply = 'We provide guidance for studying in Russia, Georgia, Philippines, UK, USA, and more. Check our Visa Guidance page.';
      setMessages(m => [...m, { from: 'bot', text: reply }]);
    }, 600);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="fixed z-50 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition hover:scale-105"
      style={{ bottom: '24px', right: '24px' }}>
      <MessageCircle size={24} />
    </button>
  );

  return (
    <div className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
      style={{ bottom: '24px', right: '24px', width: '320px', height: '440px', maxHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><MessageCircle size={16} /></div>
          <div>
            <p className="font-bold text-sm">StudyAxis AI</p>
            <p className="text-xs text-green-100">Online • Instant replies</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition"><X size={16} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${m.from === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      {messages.length <= 3 && (
        <div className="px-3 py-2 flex flex-wrap gap-1 border-t border-gray-100 bg-white shrink-0">
          {quickReplies.map(q => (
            <button key={q} onClick={() => send(q)} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100 hover:bg-green-100 transition">{q}</button>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="px-3 py-1.5 flex gap-2 border-t border-gray-100 bg-white shrink-0">
        <a href="/callback" className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Phone size={10} /> Callback</a>
        <a href="/search" className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><ExternalLink size={10} /> Search</a>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white shrink-0">
        <input placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400" />
        <button onClick={() => send(input)} className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition"><Send size={14} /></button>
      </div>
    </div>
  );
}
