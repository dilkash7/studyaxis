'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { BookOpen, MapPin, Search, CheckCircle, Clock, XCircle, CreditCard, Heart, User as UserIcon, LogOut, File, Upload, FileText, Check, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import FileUploader from '@/components/ui/FileUploader';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      router.push('/student/login');
      return;
    }

    axios.get('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setData(res.data);
      setLoading(false);
    })
    .catch(() => {
      localStorage.removeItem('studentToken');
      router.push('/student/login');
      // Intentionally not setting loading to false so the spinner stays until redirect completes
    });
  }, [router]);

  const [uploadRecordId, setUploadRecordId] = useState<string | null>(null);
  const [docTypeToUpload, setDocTypeToUpload] = useState('marks-card');

  // Ticket states
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' });
  const [replyMessage, setReplyMessage] = useState('');
  const [activeTicket, setActiveTicket] = useState<any>(null);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.post('/api/student/tickets', ticketForm, { headers: { Authorization: `Bearer ${token}` } });
      setData({ ...data, tickets: [res.data.ticket, ...(data.tickets || [])] });
      setTicketForm({ subject: '', message: '' });
      alert('Message sent successfully!');
    } catch {
      alert('Failed to send message.');
    }
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.post('/api/student/tickets', { ticketId: activeTicket._id, message: replyMessage }, { headers: { Authorization: `Bearer ${token}` } });
      
      const updatedTickets = data.tickets.map((t: any) => t._id === activeTicket._id ? res.data.ticket : t);
      setData({ ...data, tickets: updatedTickets });
      setActiveTicket(res.data.ticket);
      setReplyMessage('');
    } catch {
      alert('Failed to send reply.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    router.push('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.put('/api/student/profile', editForm, { headers: { Authorization: `Bearer ${token}` } });
      setData({ ...data, user: res.data.user });
      setShowEdit(false);
    } catch {
      alert('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDocUpload = async (uploadRes: any) => {
    if (!uploadRecordId || !docTypeToUpload) return;
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.post('/api/student/student-records/documents', {
        recordId: uploadRecordId,
        documentType: docTypeToUpload,
        fileUrl: uploadRes.url,
        fileName: uploadRes.original_filename || 'document',
        fileSize: uploadRes.bytes || 0
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Update local state
      if (res.data.success && data?.studentRecords) {
        const updatedRecords = data.studentRecords.map((rec: any) => {
          if (rec._id === uploadRecordId) {
            return { ...rec, documents: [...(rec.documents || []), res.data.document] };
          }
          return rec;
        });
        setData({ ...data, studentRecords: updatedRecords });
        setUploadRecordId(null);
        alert('Document uploaded successfully! It is now pending admin verification.');
      }
    } catch {
      alert('Failed to upload document. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { user, applications } = data;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 mt-1">Track your admissions, view saved colleges, and update your profile.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition shadow-xs text-sm font-bold"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile & Saved */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditForm({ name: user.name, phone: user.phone, city: user.city || '', highestQualification: user.highestQualification || '' });
                  setShowEdit(true);
                }}
                className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 py-2 rounded-xl text-sm font-bold transition border border-gray-200"
              >
                Edit Profile
              </button>
            </div>

            {/* Saved Colleges */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Heart size={18} className="text-red-500" /> Saved Colleges</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">{user.savedColleges.length}</span>
              </div>
              
              {user.savedColleges.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No colleges saved yet. Start exploring!</p>
              ) : (
                <div className="space-y-4">
                  {user.savedColleges.map((c: any) => (
                    <Link href={`/college/${c.slug}`} key={c._id} className="flex gap-3 items-center group cursor-pointer">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                        {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition">{c.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> {c.city}, {c.state}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notices & Messages */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-yellow-500" /> Notices & Messages</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">{data?.notices?.length || 0}</span>
              </div>
              
              {(!data?.notices || data.notices.length === 0) ? (
                <p className="text-sm text-gray-500 text-center py-4">No new notices.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {data.notices.map((n: any) => (
                    <div key={n._id} className={`p-3 rounded-xl border ${n.priority === 'urgent' ? 'border-red-200 bg-red-50' : n.priority === 'high' ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{n.title}</h3>
                        {n.targetEmails?.includes(user.email) && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">Direct Message</span>}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-3 mb-2">{n.content}</p>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-gray-500">{new Date(n.publishDate || n.createdAt).toLocaleDateString()}</span>
                        <span className="text-gray-400">By {n.createdBy || 'Admin'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Tickets */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-purple-500" /> Help & Support Chat</h2>
              
              {!activeTicket ? (
                <>
                  <form onSubmit={handleCreateTicket} className="mb-6 space-y-3">
                    <input required placeholder="Subject..." value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="w-full text-sm p-2.5 border border-gray-200 rounded-xl outline-none focus:border-purple-500 bg-gray-50" />
                    <textarea required placeholder="Message admin..." value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} rows={2} className="w-full text-sm p-2.5 border border-gray-200 rounded-xl outline-none focus:border-purple-500 bg-gray-50"></textarea>
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2">
                      <Send size={14} /> Send Message
                    </button>
                  </form>
                  
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Previous Chats</h3>
                    {data?.tickets?.length > 0 ? data.tickets.map((t: any) => (
                      <div key={t._id} onClick={() => setActiveTicket(t)} className="p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition group">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 truncate pr-2">{t.subject}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${t.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{t.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 flex justify-between">
                          <span>{t.messages?.length || 0} messages</span>
                          {t.unreadByStudent && <span className="text-red-500 font-bold">New Reply!</span>}
                        </p>
                      </div>
                    )) : <p className="text-xs text-gray-400">No support chats yet.</p>}
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-[400px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 truncate pr-4">{activeTicket.subject}</h3>
                    <button onClick={() => setActiveTicket(null)} className="text-xs text-gray-500 hover:text-gray-900 font-bold bg-gray-100 px-2 py-1 rounded-lg">Back</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                    {activeTicket.messages?.map((m: any, i: number) => (
                      <div key={i} className={`flex flex-col max-w-[90%] ${m.sender === 'student' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <span className="text-[10px] text-gray-400 mb-0.5 px-1">{m.senderName || m.sender}</span>
                        <div className={`p-3 rounded-2xl text-sm ${m.sender === 'student' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                          {m.content}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-0.5">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    ))}
                  </div>
                  
                  {activeTicket.status === 'Open' ? (
                    <form onSubmit={handleReplyTicket} className="flex gap-2">
                      <input required value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Type a reply..." className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-500" />
                      <button type="submit" className="bg-purple-600 text-white p-2.5 rounded-xl hover:bg-purple-700 transition shrink-0"><Send size={16} /></button>
                    </form>
                  ) : (
                    <div className="text-center p-2 bg-gray-50 rounded-xl text-xs text-gray-500">This ticket has been closed by an admin.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Admissions & Applications */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Admissions & Document Uploads */}
            {data?.studentRecords && data.studentRecords.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" /> My Official Admissions
                </h2>
                
                <div className="space-y-6">
                  {data.studentRecords.map((record: any) => (
                    <div key={record._id} className="border border-green-100 bg-green-50/30 rounded-xl p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{record.collegeId?.name || record.collegeName}</h3>
                          <p className="text-sm font-semibold text-gray-700 mt-1">{record.courseId?.name || record.courseName} (Class of {record.admissionYear})</p>
                          <p className="text-xs text-gray-500 mt-1">Admission No: {record.admissionNumber}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          {record.status}
                        </span>
                      </div>

                      {/* Documents Section */}
                      <div className="mt-5 border-t border-green-100 pt-5">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <FileText size={16} className="text-blue-600" /> Required Documents
                        </h4>

                        <div className="space-y-3 mb-5">
                          {record.documents?.length > 0 ? record.documents.map((doc: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><File size={16} /></div>
                                <div>
                                  <p className="text-sm font-bold text-gray-800">{doc.fileName || doc.documentType}</p>
                                  <p className="text-[10px] text-gray-500 uppercase">{doc.documentType.replace(/-/g, ' ')}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1
                                  ${doc.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' : 
                                    doc.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 
                                    'bg-yellow-100 text-yellow-700'}`}>
                                  {doc.verificationStatus === 'verified' ? <Check size={10}/> : doc.verificationStatus === 'rejected' ? <XCircle size={10}/> : <Clock size={10}/>}
                                  {doc.verificationStatus}
                                </span>
                                {doc.adminNotes && <span className="text-[10px] text-red-500 font-medium">Note: {doc.adminNotes}</span>}
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm text-gray-500 italic">No documents uploaded yet.</p>
                          )}
                        </div>

                        {/* Upload Controls */}
                        {uploadRecordId === record._id ? (
                          <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-3">
                            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Upload New Document</h5>
                            <select value={docTypeToUpload} onChange={e => setDocTypeToUpload(e.target.value)} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500">
                              <option value="marks-card">Marks Card</option>
                              <option value="aadhaar">Aadhaar Card</option>
                              <option value="student-photo">Student Photo</option>
                              <option value="transfer-certificate">Transfer Certificate</option>
                              <option value="other">Other</option>
                            </select>
                            <FileUploader 
                              label="Upload File"
                              accept="image/*,.pdf"
                              folder="studyaxis/student-docs"
                              onUploadComplete={handleDocUpload}
                            />
                            <button onClick={() => setUploadRecordId(null)} className="text-xs text-gray-500 hover:text-gray-700 font-medium mt-2">Cancel Upload</button>
                          </div>
                        ) : (
                          <button onClick={() => setUploadRecordId(record._id)} className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition flex items-center gap-2">
                            <Upload size={16} /> Add Document
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" /> My Applications
              </h2>

              {applications.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No applications yet</h3>
                  <p className="text-gray-500 mt-2 max-w-sm mx-auto">Find your dream college and apply directly through StudyAxis.</p>
                  <Link href="/search" className="inline-block mt-6 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition">
                    Explore Colleges
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app: any) => (
                    <Link href={`/student/applications/${app._id}`} key={app._id} className="block border border-gray-100 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition bg-white cursor-pointer group">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-gray-400 font-mono group-hover:text-blue-500 transition">{app.applicationNumber}</span>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                              ${app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                app.status === 'Enrolled' ? 'bg-emerald-100 text-emerald-800' :
                                app.status === 'Documents Pending' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                                'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">{app.collegeName || app.college?.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">Course: <span className="font-semibold text-gray-700">{app.course}</span></p>
                        </div>
                        
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Submitted</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(app.submittedAt))}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            View & Upload &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input required type="tel" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                <input type="text" value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Highest Qualification</label>
                <input type="text" value={editForm.highestQualification || ''} onChange={e => setEditForm({...editForm, highestQualification: e.target.value})} className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                <button disabled={savingProfile} type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
