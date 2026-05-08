'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, File, Search, X, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import axios from 'axios';
import FileUploader from '@/components/ui/FileUploader';

const DOC_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'marks-card', label: 'Marks Card' },
  { value: 'cet-rank-card', label: 'CET Rank Card' },
  { value: 'neet-scorecard', label: 'NEET Scorecard' },
  { value: 'transfer-certificate', label: 'Transfer Certificate' },
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'student-photo', label: 'Student Photo' },
  { value: 'signature', label: 'Signature' },
  { value: 'birth-certificate', label: 'Birth Certificate' },
  { value: 'admission-letter', label: 'Admission Letter' },
  { value: 'medical-report', label: 'Medical Report' },
  { value: 'id-proof', label: 'ID Proof' },
  { value: 'other', label: 'Other' },
];

const VERIFY_COLORS: Record<string, { icon: any; color: string }> = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  verified: { icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-700' },
};

export default function StudentRecordsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [colleges, setColleges] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [docForm, setDocForm] = useState({ documentType: 'marks-card', fileUrl: '', fileName: '', adminNotes: '' });

  const [formData, setFormData] = useState({
    collegeId: '', campusId: '', courseId: '',
    firstName: '', lastName: '', email: '', phoneNumber: '',
    dateOfBirth: '', address: '', city: '', state: '',
    admissionYear: new Date().getFullYear(), admissionNumber: '', status: 'Active',
  });

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const getHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

  useEffect(() => {
    const token = getToken();
    if (!token) { window.location.href = '/admin/login'; return; }
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const [studentsRes, collegesRes] = await Promise.all([
        axios.get('/api/student-records', { headers: getHeaders() }),
        axios.get('/api/colleges', { headers: getHeaders() }),
      ]);
      if (studentsRes.data.success) setStudents(studentsRes.data.data);
      setColleges(collegesRes.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!formData.collegeId) { setCampuses([]); setCourses([]); return; }
    axios.get(`/api/campuses?collegeId=${formData.collegeId}`, { headers: getHeaders() }).then(r => setCampuses(r.data.data || []));
    axios.get(`/api/courses?collegeId=${formData.collegeId}`, { headers: getHeaders() }).then(r => setCourses(r.data || []));
  }, [formData.collegeId]);

  async function fetchStudents() {
    try {
      const res = await axios.get(`/api/student-records${searchTerm ? `?search=${searchTerm}` : ''}`, { headers: getHeaders() });
      if (res.data.success) setStudents(res.data.data);
    } catch (error) { console.error(error); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.courseId) return alert('Please select a course');
    try {
      const method = editingId ? 'put' : 'post';
      const url = editingId ? `/api/student-records/${editingId}` : '/api/student-records';
      const res = await axios({ method, url, data: formData, headers: getHeaders() });
      if (res.data.success) { fetchStudents(); setShowForm(false); setEditingId(null); resetForm(); }
    } catch (error: any) { alert(error.response?.data?.error || 'Error saving student'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this student record?')) return;
    try { await axios.delete(`/api/student-records/${id}`, { headers: getHeaders() }); fetchStudents(); }
    catch (error) { console.error(error); }
  }

  async function handleDocUpload() {
    if (!docForm.fileUrl || !selectedStudent) return alert('Please upload a file first');
    try {
      await axios.post(`/api/student-records/${selectedStudent._id}/documents`, docForm, { headers: getHeaders() });
      const res = await axios.get(`/api/student-records/${selectedStudent._id}/documents`, { headers: getHeaders() });
      setSelectedStudent({ ...selectedStudent, documents: res.data.data });
      setShowDocUpload(false);
      setDocForm({ documentType: 'marks-card', fileUrl: '', fileName: '', adminNotes: '' });
      fetchStudents();
    } catch (error: any) { alert(error.response?.data?.error || 'Error uploading document'); }
  }

  async function handleVerify(docId: string, status: string) {
    if (!selectedStudent) return;
    try {
      await axios.put(`/api/student-records/${selectedStudent._id}/documents`, {
        documentId: docId, verificationStatus: status,
      }, { headers: getHeaders() });
      const res = await axios.get(`/api/student-records/${selectedStudent._id}/documents`, { headers: getHeaders() });
      setSelectedStudent({ ...selectedStudent, documents: res.data.data });
    } catch (error: any) { alert(error.response?.data?.error || 'Error updating'); }
  }

  async function handleDeleteDoc(docId: string) {
    if (!confirm('Delete this document?') || !selectedStudent) return;
    try {
      await axios.delete(`/api/student-records/${selectedStudent._id}/documents?docId=${docId}`, { headers: getHeaders() });
      const res = await axios.get(`/api/student-records/${selectedStudent._id}/documents`, { headers: getHeaders() });
      setSelectedStudent({ ...selectedStudent, documents: res.data.data });
    } catch (error) { console.error(error); }
  }

  function resetForm() {
    setFormData({ collegeId: '', campusId: '', courseId: '', firstName: '', lastName: '', email: '', phoneNumber: '', dateOfBirth: '', address: '', city: '', state: '', admissionYear: new Date().getFullYear(), admissionNumber: '', status: 'Active' });
  }

  if (loading) return <div className="flex flex-col items-center justify-center h-[60vh] gap-4"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  const inp = "w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Admitted Students</h1><p className="text-sm text-gray-500">Manage student records & documents</p></div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchStudents()} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={() => { setEditingId(null); resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shrink-0 font-medium"><Plus size={18} /> Add Student</button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-800">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase">Education</h3>
                <select value={formData.collegeId} onChange={e => setFormData({ ...formData, collegeId: e.target.value, campusId: '', courseId: '' })} className={inp} required><option value="">Select College</option>{colleges.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
                <select value={formData.campusId} onChange={e => setFormData({ ...formData, campusId: e.target.value })} className={inp} disabled={!formData.collegeId}><option value="">Select Campus</option>{campuses.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
                <select value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })} className={inp} required disabled={!formData.collegeId}><option value="">Select Course</option>{courses.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase">Personal Info</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="First Name *" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={inp} required />
                  <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={inp} />
                </div>
                <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inp} required />
                <input type="tel" placeholder="Phone *" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className={inp} required />
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase">Admission</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Year" value={formData.admissionYear} onChange={e => setFormData({ ...formData, admissionYear: parseInt(e.target.value) })} className={inp} required />
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inp}><option>Active</option><option>Graduated</option><option>Dropped-Out</option><option>On-Leave</option><option>Suspended</option></select>
                </div>
                <input type="text" placeholder="Admission Number (auto)" value={formData.admissionNumber} onChange={e => setFormData({ ...formData, admissionNumber: e.target.value })} className={inp} />
                <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className={inp} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button type="submit" className="px-8 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md">{editingId ? 'Update' : 'Register'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/50 border-b border-gray-100">
              {['Student', 'Contact', 'College/Course', 'Admission', 'Docs', 'Status', 'Actions'].map(h => <th key={h} className="px-5 py-4 text-left font-bold text-gray-600">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-400"><p className="text-4xl mb-4">📭</p><p className="font-medium">No student records found</p></td></tr>
              ) : students.map(s => (
                <tr key={s._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">{s.firstName[0]}{s.lastName?.[0]}</div>
                      <div><p className="font-bold text-gray-800">{s.firstName} {s.lastName}</p><p className="text-xs text-gray-400">ID: {s._id.slice(-6).toUpperCase()}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><p className="text-gray-700">{s.email}</p><p className="text-xs text-gray-500">{s.phoneNumber}</p></td>
                  <td className="px-5 py-3"><p className="font-semibold text-gray-800">{s.collegeName}</p><span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">{s.courseName}</span></td>
                  <td className="px-5 py-3"><p className="text-gray-700 font-mono text-xs">{s.admissionNumber}</p><p className="text-xs text-gray-500">Year: {s.admissionYear}</p></td>
                  <td className="px-5 py-3"><span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold">{s.documents?.length || 0} docs</span></td>
                  <td className="px-5 py-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{s.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelectedStudent(s); setShowDocuments(true); }} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Documents"><File size={16} /></button>
                      <button onClick={async () => { const cid = s.collegeId?._id || s.collegeId || ''; setEditingId(s._id); setFormData({ collegeId: cid, campusId: s.campusId?._id || s.campusId || '', courseId: s.courseId?._id || s.courseId || '', firstName: s.firstName, lastName: s.lastName || '', email: s.email, phoneNumber: s.phoneNumber, dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : '', address: s.address || '', city: s.city || '', state: s.state || '', admissionYear: s.admissionYear, admissionNumber: s.admissionNumber, status: s.status }); if (cid) { try { const [campR, courseR] = await Promise.all([axios.get(`/api/campuses?collegeId=${cid}`, { headers: getHeaders() }), axios.get(`/api/courses?collegeId=${cid}`, { headers: getHeaders() })]); setCampuses(campR.data.data || []); setCourses(courseR.data || []); } catch {} } setShowForm(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(s._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Modal */}
      {showDocuments && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Documents</h2>
                <p className="text-sm text-gray-500">{selectedStudent.firstName} {selectedStudent.lastName}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowDocUpload(!showDocUpload)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"><Upload size={14} /> Upload</button>
                <button onClick={() => { setShowDocuments(false); setShowDocUpload(false); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
              </div>
            </div>

            {/* Upload Form */}
            {showDocUpload && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 space-y-3">
                <select value={docForm.documentType} onChange={e => setDocForm({ ...docForm, documentType: e.target.value })} className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-white">
                  {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <FileUploader label="Upload Document" accept="image/*,.pdf,.zip" folder="studyaxis/student-docs"
                  onUploadComplete={r => setDocForm({ ...docForm, fileUrl: r.url, fileName: r.original_filename || '' })} />
                <input placeholder="Admin notes (optional)" value={docForm.adminNotes} onChange={e => setDocForm({ ...docForm, adminNotes: e.target.value })} className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-white" />
                <button onClick={handleDocUpload} disabled={!docForm.fileUrl} className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Save Document</button>
              </div>
            )}

            {/* Document List */}
            <div className="space-y-3">
              {selectedStudent.documents?.length > 0 ? selectedStudent.documents.map((doc: any) => {
                const v = VERIFY_COLORS[doc.verificationStatus || 'pending'];
                const VIcon = v.icon;
                return (
                  <div key={doc._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shrink-0"><File size={18} /></div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{doc.fileName || 'Document'}</p>
                        <p className="text-xs text-gray-500 capitalize">{(doc.documentType || '').replace(/-/g, ' ')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${v.color}`}><VIcon size={10} />{doc.verificationStatus || 'pending'}</span>
                          {doc.adminNotes && <span className="text-[10px] text-gray-400">📝 {doc.adminNotes}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleVerify(doc._id, 'verified')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Verify"><CheckCircle size={16} /></button>
                      <button onClick={() => handleVerify(doc._id, 'rejected')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Reject"><XCircle size={16} /></button>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-blue-600 text-xs font-bold hover:bg-blue-50">View</a>
                      <button onClick={() => handleDeleteDoc(doc._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400">No documents uploaded yet</p>
                  <button onClick={() => setShowDocUpload(true)} className="mt-2 text-sm text-blue-600 font-medium hover:underline">Upload first document →</button>
                </div>
              )}
            </div>

            <button onClick={() => { setShowDocuments(false); setShowDocUpload(false); }} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
