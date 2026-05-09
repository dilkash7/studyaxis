'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { GraduationCap, X, RotateCcw } from 'lucide-react';
import Link from 'next/link';

type Message = {
  from: 'user' | 'bot';
  text: string;
  type?: string;
  options?: string[];
  results?: any[];
  whatsappUrl?: string;
};

export default function CounsellingBot() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '' });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const callAI = async (currentStep: number, currentAnswers: any) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/chatbot-ai', { step: currentStep, answers: currentAnswers });
      const data = res.data;
      setMessages(prev => [...prev, {
        from: 'bot',
        text: data.message,
        type: data.type,
        options: data.options,
        results: data.results,
        whatsappUrl: data.whatsappUrl,
      }]);
      if (data.nextStep !== undefined) setStep(data.nextStep);
      if (data.type === 'lead_form') setShowLeadForm(true);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: "Sorry, something went wrong. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    setMessages([]);
    setStep(0);
    setAnswers({});
    setShowLeadForm(false);
    setLeadForm({ name: '', phone: '' });
    await callAI(0, {});
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) startChat();
  }, [open]);
  const pathname = usePathname();

  if (!mounted) return null;
  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  const handleOption = async (option: string) => {
    setMessages(prev => [...prev, { from: 'user', text: option }]);
    const newAnswers = { ...answers };

    // Map steps to answer keys based on new hierarchical flow
    if (step === 1) newAnswers.stream = option;
    else if (step === 2) newAnswers.degree = option;
    else if (step === 3) newAnswers.specialization = option;
    else if (step === 4) newAnswers.budget = option;
    else if (step === 5) newAnswers.score = option;
    else if (step === 6) newAnswers.location = option;
    else if (step === 7) newAnswers.wantsHelp = option;

    setAnswers(newAnswers);
    await callAI(step, newAnswers);
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.name || !leadForm.phone) return alert('Please fill both fields');
    setMessages(prev => [...prev, { from: 'user', text: `${leadForm.name} — ${leadForm.phone}` }]);
    setShowLeadForm(false);
    const newAnswers = { ...answers, leadName: leadForm.name, leadPhone: leadForm.phone };
    setAnswers(newAnswers);
    await callAI(8, newAnswers);
  };

  // Step progress calculation
  const totalSteps = 6;
  const currentStepNum = Math.min(step, totalSteps);
  const progressPct = (currentStepNum / totalSteps) * 100;

  return (
    <>
      {/* Counselling Toggle — LEFT side */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-14 h-14 rounded-full shadow-lg shadow-green-600/30 flex items-center justify-center transition hover:scale-110"
        title="College Counsellor">
        {open ? <X size={20} /> : <GraduationCap size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ maxHeight: '75vh' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} />
              <div className="flex-1">
                <p className="font-semibold text-sm">College Counsellor</p>
                <p className="text-xs text-green-200">AI-powered • 6-step guided finder</p>
              </div>
              <button onClick={startChat} className="p-1.5 hover:bg-white/20 rounded-lg transition" title="Start over">
                <RotateCcw size={14} />
              </button>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-200">Active</span>
              </div>
            </div>
            {/* Progress bar */}
            {step > 0 && step <= totalSteps && (
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-green-200 mb-1">
                  <span>Step {currentStepNum}/{totalSteps}</span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="h-1 bg-green-800/40 rounded-full overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${m.from === 'user'
                  ? 'bg-green-600 text-white rounded-2xl rounded-br-none px-4 py-2 text-sm'
                  : 'bg-white rounded-2xl rounded-bl-none px-4 py-3 text-sm text-gray-800 shadow-sm border border-gray-100'}`}>

                  <p className="whitespace-pre-line leading-relaxed">
                    {m.text.split('**').map((part, idx) =>
                      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                    )}
                  </p>

                  {/* Options as pills */}
                  {m.type === 'options' && m.options && (
                    <div className="mt-3 space-y-1.5">
                      {m.options.map((opt, j) => (
                        <button key={j} onClick={() => handleOption(opt)}
                          disabled={loading}
                          className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition border border-green-200 disabled:opacity-50 active:scale-[0.98]">
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results */}
                  {m.type === 'results' && m.results && (
                    <div className="mt-3 space-y-3">
                      {m.results.map((r: any, j: number) => (
                        <div key={j} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <div className="flex items-start gap-2">
                            {r.image && <img src={r.image} alt={r.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{r.name}</p>
                              <p className="text-xs text-gray-500">📍 {r.location}</p>
                              <p className="text-xs text-gray-500">📚 {r.course}</p>
                              <p className="text-xs text-green-600 font-semibold">💰 {r.fees}</p>
                              <div className="flex gap-1 mt-1">
                                {r.loanAvailable && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">Loan</span>}
                                {r.scholarshipAvailable && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">Scholarship</span>}
                              </div>
                            </div>
                          </div>
                          <Link href={`/college/${r.slug || r._id}`}
                            className="mt-2 block w-full text-center bg-green-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-green-700 transition">
                            View College →
                          </Link>
                        </div>
                      ))}
                      <button onClick={() => handleOption('Yes, help me apply! 🙋')}
                        className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition border border-green-200">
                        Yes, help me apply! 🙋
                      </button>
                      <button onClick={() => handleOption('No, let me search again 🔄')}
                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm transition border border-gray-200">
                        🔄 Start a new search
                      </button>
                    </div>
                  )}

                  {m.whatsappUrl && (
                    <a href={m.whatsappUrl} target="_blank"
                      className="mt-3 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition">
                      💬 WhatsApp Us Now
                    </a>
                  )}

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

            {/* Loading dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-3 text-center">
            <p className="text-xs text-gray-400">Guided by AI • Use buttons to navigate</p>
          </div>
        </div>
      )}
    </>
  );
}