'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { HelpCircle, X, Send } from 'lucide-react';

type QA = { question: string; answer: string; keywords: string[] };
type Message = { from: 'user' | 'bot'; text: string };

export default function FAQChatbot() {
  const [open, setOpen] = useState(false);
  const [qas, setQas] = useState<QA[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: '👋 Hi! I can answer your questions about admissions, fees, courses and more. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    axios.get('/api/chatbot').then(r => setQas(r.data)).catch(() => {});
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setInput('');

    const lower = userMsg.toLowerCase();
    const match = qas.find(qa =>
      qa.keywords?.some(k => lower.includes(k.toLowerCase())) ||
      qa.question.toLowerCase().includes(lower) ||
      lower.includes(qa.question.toLowerCase().slice(0, 10))
    );

    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: match?.answer || "I'm not sure about that. Please WhatsApp us or use the Counsellor (bottom left) for personalized help! 📞"
      }]);
    }, 400);
  };

  return (
    <>
      {/* FAQ Toggle — RIGHT side */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition hover:scale-110"
        title="FAQ / Support">
        {open ? <X size={20} /> : <HelpCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ maxHeight: '65vh' }}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center gap-2">
            <HelpCircle size={18} />
            <div>
              <p className="font-semibold text-sm">FAQ Assistant</p>
              <p className="text-xs text-blue-200">Quick answers to your questions</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-2xl text-sm max-w-[82%] leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Quick questions */}
            {messages.length === 1 && qas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 text-center">Quick questions:</p>
                {qas.slice(0, 4).map((qa, i) => (
                  <button key={i}
                    onClick={() => {
                      setMessages(prev => [
                        ...prev,
                        { from: 'user', text: qa.question },
                        { from: 'bot', text: qa.answer }
                      ]);
                    }}
                    className="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl border border-blue-100 transition">
                    {qa.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t bg-white p-3 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
            <button onClick={sendMessage}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}