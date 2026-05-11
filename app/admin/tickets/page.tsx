'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { MessageSquare, Send, CheckCircle, Clock, X, Search } from 'lucide-react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const loadTickets = async () => {
    try {
      const res = await axios.get('/api/tickets', { headers });
      setTickets(res.data.tickets || []);
    } catch {
      console.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage) return;
    try {
      const res = await axios.post(`/api/tickets/${activeTicket._id}`, { message: replyMessage }, { headers });
      const updated = res.data.ticket;
      setTickets(tickets.map(t => t._id === updated._id ? updated : t));
      setActiveTicket(updated);
      setReplyMessage('');
    } catch {
      alert('Failed to send reply');
    }
  };

  const toggleStatus = async (ticket: any) => {
    const newStatus = ticket.status === 'Open' ? 'Closed' : 'Open';
    try {
      const res = await axios.put(`/api/tickets/${ticket._id}`, { status: newStatus }, { headers });
      const updated = res.data.ticket;
      setTickets(tickets.map(t => t._id === updated._id ? updated : t));
      if (activeTicket?._id === updated._id) setActiveTicket(updated);
    } catch {
      alert('Failed to update status');
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Support Tickets">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Sidebar List */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MessageSquare size={18} className="text-purple-600" /> Student Inquiries</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search tickets..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? <p className="text-center text-gray-400 py-10 text-sm">Loading tickets...</p> : 
             filteredTickets.length === 0 ? <p className="text-center text-gray-400 py-10 text-sm">No tickets found.</p> :
             filteredTickets.map(t => (
              <div key={t._id} onClick={() => { setActiveTicket(t); setReplyMessage(''); }} className={`p-4 rounded-xl border cursor-pointer transition ${activeTicket?._id === t._id ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-1 pr-2">{t.subject}</h3>
                  {t.unreadByAdmin && <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1"></span>}
                </div>
                <p className="text-xs text-gray-500 mb-2 truncate">{t.studentName}</p>
                <div className="flex justify-between items-center text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${t.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{t.status}</span>
                  <span className="text-gray-400">{new Date(t.lastMessageAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
          {activeTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-900">{activeTicket.subject}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{activeTicket.studentName} ({activeTicket.studentEmail})</p>
                </div>
                <button onClick={() => toggleStatus(activeTicket)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTicket.status === 'Open' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {activeTicket.status === 'Open' ? <><X size={14}/> Close Ticket</> : <><CheckCircle size={14}/> Reopen</>}
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {activeTicket.messages?.map((m: any, i: number) => (
                  <div key={i} className={`flex flex-col max-w-[80%] ${m.sender === 'admin' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <span className="text-[10px] text-gray-400 mb-1 px-2">{m.senderName || m.sender}</span>
                    <div className={`p-3.5 rounded-2xl text-sm ${m.sender === 'admin' ? 'bg-purple-600 text-white rounded-br-none shadow-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                      {m.content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-gray-100 bg-white">
                {activeTicket.status === 'Open' ? (
                  <form onSubmit={handleReply} className="flex gap-3">
                    <textarea value={replyMessage} onChange={e => setReplyMessage(e.target.value)} required rows={2} placeholder="Type your reply to the student..." className="flex-1 resize-none p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 bg-gray-50" />
                    <button type="submit" className="bg-purple-600 text-white px-5 rounded-xl hover:bg-purple-700 transition flex items-center justify-center shrink-0">
                      <Send size={18} />
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-3 bg-gray-50 rounded-xl text-sm text-gray-500 border border-dashed border-gray-200">
                    This ticket is closed. Reopen it to send a reply.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <MessageSquare size={48} className="opacity-20" />
              <p className="text-sm">Select a ticket from the list to start messaging.</p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
