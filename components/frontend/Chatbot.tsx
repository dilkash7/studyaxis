'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send } from 'lucide-react';
import Link from 'next/link';

type Message = {
  from: 'user' | 'bot';
  text: string;
  type?: string;
  options?: string[];
  results?: any[];
  whatsappUrl?: string;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '' });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    setMessages([]);
    setStep(0);
    setAnswers({});
    setShowLeadForm(false);
    await callAI(0, {});
  };

  useEffect(() => {
    if (open && messages.length === 0) startChat();
  }, [open]);

  const callAI = async (currentStep: number, currentAnswers: any) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/chatbot-ai', {
        step: currentStep,
        answers: currentAnswers,
      });
      const data = res.data;
      setMessages(prev => [...prev, {
        from: 'bot',
        text: data.message,
        type: data.type,
        options: data.options,
        results: data.results,
        whatsappUrl: data.whatsappUrl,
      }]);
      setStep(data.nextStep ?? currentStep + 1);
      if (data.type === 'lead_form') setShowLeadForm(true);
    } catch {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: "Sorry, something went wrong. Please try again!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOption = async (option: string) => {
    setMessages(prev => [...prev, { from: 'user', text: option }]);
    const newAnswers = { ...answers };
    if (step === 1) newAnswers.course = option;
    if (step === 2) newAnswers.location = option;
    if (step === 3) newAnswers.budget = option;
    if (step === 4) newAnswers.score = option;
    if (step === 5) newAnswers.wantsHelp = option;
    setAnswers(newAnswers);
    await callAI(step, newAnswers);
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.name || !leadForm.phone) return;
    setMessages(prev => [...prev, { from: 'user', text: `Name: ${leadForm.name}, Phone: ${leadForm.phone}` }]);
    setShowLeadForm(false);
    const newAnswers = { ...answers, leadName: leadForm.name, leadPhone: leadForm.phone };
    setAnswers(newAnswers);
    await callAI(7, newAnswers);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text: input }]);
    setInput('');
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 z-50 bg-green-600 hover:bg-green-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition hover:scale-110">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-44 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200" style={{ maxHeight: '70vh' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 flex items-center gap-2">
            <MessageCircle size={18} />
            <div>
              <p className="font-semibold text-sm">StudyAxis Counsellor</p>
              <p className="text-xs text-green-200">AI-powered college guide</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              <span className="text-xs text-green-200">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${m.from === 'user'
                  ? 'bg-green-600 text-white rounded-2xl rounded-br-none px-4 py-2 text-sm'
                  : 'bg-white rounded-2xl rounded-bl-none px-4 py-3 text-sm text-gray-800 shadow-sm border border-gray-100'}`}>

                  {/* Text with bold support */}
                  <p className="whitespace-pre-line leading-relaxed">
                    {m.text.split('**').map((part, idx) =>
                      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                    )}
                  </p>

                  {/* Options */}
                  {m.type === 'options' && m.options && (
                    <div className="mt-3 space-y-2">
                      {m.options.map((opt, j) => (
                        <button key={j} onClick={() => handleOption(opt)}
                          className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition border border-green-200">
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* College Results */}
                  {m.type === 'results' && m.results && (
                    <div className="mt-3 space-y-3">
                      {m.results.map((r: any, j: number) => (
                        <div key={j} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <div className="flex items-start gap-2">
                            {r.image && (
                              <img src={r.image} alt={r.name}
                                className="w-12 h-12 rounded-lg object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{r.name}</p>
                              <p className="text-xs text-gray-500">📍 {r.location}</p>
                              <p className="text-xs text-gray-500">📚 {r.course}</p>
                              <p className="text-xs text-green-600 font-semibold">💰 {r.fees}</p>
                              {r.eligibility && <p className="text-xs text-gray-400">📋 {r.eligibility}</p>}
                              {r.loanAvailable && <p className="text-xs text-blue-500">✅ Loan Available</p>}
                            </div>
                          </div>
                          <Link href={`/college/${r._id}`}
                            className="mt-2 block w-full text-center bg-green-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-green-700 transition">
                            View College →
                          </Link>
                        </div>
                      ))}
                      {/* Ask if wants help */}
                      <button onClick={() => handleOption('Yes, help me apply! 🙋')}
                        className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition border border-green-200">
                        Yes, help me apply! 🙋
                      </button>
                      <button onClick={() => handleOption('No, just browsing')}
                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm transition border border-gray-200">
                        No, just browsing
                      </button>
                    </div>
                  )}

                  {/* WhatsApp button after lead saved */}
                  {m.whatsappUrl && (
                    <a href={m.whatsappUrl} target="_blank"
                      className="mt-3 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition">
                      💬 WhatsApp Us Now
                    </a>
                  )}

                  {/* Restart */}
                  {m.type === 'end' && (
                    <button onClick={startChat}
                      className="mt-3 w-full text-xs text-green-600 border border-green-200 py-1.5 rounded-lg hover:bg-green-50 transition">
                      🔄 Start Over
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Lead Form */}
            {showLeadForm && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="text-sm font-bold text-gray-800 mb-3">📝 Your Details</p>
                <input placeholder="Your Name" value={leadForm.name}
                  onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 mb-2" />
                <input placeholder="Phone Number" value={leadForm.phone}
                  onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 mb-3" />
                <button onClick={handleLeadSubmit}
                  className="w-full bg-green-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition">
                  Submit →
                </button>
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
            <button onClick={handleSend}
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}