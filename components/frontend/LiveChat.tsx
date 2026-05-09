'use client';
import { useState } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    { from: 'bot', text: 'Hi! 👋 Welcome to StudyAxis. How can I help you today?' },
    { from: 'bot', text: 'You can ask about admissions, courses, fees, or any college-related queries.' },
  ]);
  const [input, setInput] = useState('');

  const quickReplies = ['Admission Process', 'Fee Details', 'Available Courses', 'Talk to Counsellor'];

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { from: 'user', text }]);
    setInput('');
    // Auto-reply
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = 'Thank you for your query! Our counsellor will contact you shortly. Meanwhile, you can call us or WhatsApp for instant help.';
      if (lower.includes('admission') || lower.includes('apply')) reply = 'For admissions, please visit our Apply page or call our helpline. We guide students for MBBS, Engineering, and Abroad programs.';
      else if (lower.includes('fee') || lower.includes('cost') || lower.includes('price')) reply = 'Fee details vary by college and course. Use our College Finder to compare fees across institutions.';
      else if (lower.includes('course') || lower.includes('program')) reply = 'We help with MBBS, BDS, Engineering, MBA, and more. Check our courses page for full list.';
      else if (lower.includes('counsellor') || lower.includes('call') || lower.includes('talk')) reply = 'Our counsellor will call you within 30 minutes. Please share your phone number or use the Callback page.';
      setMessages(m => [...m, { from: 'bot', text: reply }]);
    }, 800);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition hover:scale-110 animate-bounce" style={{ animationDuration: '2s' }}>
      <MessageCircle size={24} />
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: '450px' }}>
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><MessageCircle size={16} /></div>
          <div>
            <p className="font-bold text-sm">StudyAxis Support</p>
            <p className="text-xs text-green-100">Online • Replies instantly</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-full p-1"><X size={16} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.from === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm'}`}>
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

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white shrink-0">
        <input placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400" />
        <button onClick={() => send(input)} className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition"><Send size={14} /></button>
      </div>
    </div>
  );
}
