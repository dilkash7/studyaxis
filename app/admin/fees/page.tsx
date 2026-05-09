'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FileUploader from '@/components/ui/FileUploader';
import { Plus, Pencil, Trash2, Image, FileText } from 'lucide-react';

const emptyFee = { label: '', amount: '' };
const empty = {
  collegeId: '', collegeName: '', courseId: '', courseName: '',
  campusId: '', campusName: '',
  admissionCategoryName: '', categoryShortCode: '',
  bookingAmount: '', totalFee: '', eligibility: '', extraInfo: '',
  loanAvailable: false, loanDetails: '',
  scholarshipAvailable: false, scholarshipPercentage: '', scholarshipDetails: '', scholarshipEligibility: '',
  hostelFee: '', transportFee: '', examFee: '', uniformFee: '', cautionDeposit: '',
  applicationFee: '', developmentFee: '', libraryFee: '',
  feeStructureImage: '', feeStructurePdf: '',
  yearWiseFees: [{ label: 'Year 1', amount: '' }],
  source: { sourceType: 'admin', sourceUrl: '', uploadedBy: '', verified: false },
};

export default function FeesPage() {
  const [feesList, setFeesList] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [filteredCampuses, setFilteredCampuses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [showExtra, setShowExtra] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    const [f, cl, co, camp, cat] = await Promise.all([
      axios.get('/api/fees'),
      axios.get('/api/colleges'),
      axios.get('/api/courses'),
      axios.get('/api/campuses').then(r => r.data.data || []).catch(() => []),
      axios.get('/api/categories').then(r => r.data.data || r.data || []).catch(() => []),
    ]);
    setFeesList(f.data);
    setColleges(cl.data);
    setCourses(co.data);
    setCampuses(camp);
    setCategories(cat);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCollegeChange = (collegeId: string) => {
    const col = colleges.find((c: any) => c._id === collegeId);
    const fc = courses.filter((c: any) => c.collegeId === collegeId);
    const fcamp = campuses.filter((c: any) => c.collegeId === collegeId || (c.collegeId as any)?._id === collegeId);
    setFilteredCourses(fc);
    setFilteredCampuses(fcamp);
    setForm({ ...form, collegeId, collegeName: col?.name || '', courseId: '', courseName: '', campusId: '', campusName: '' });
  };

  const handleCourseChange = (courseId: string) => {
    const co = courses.find((c: any) => c._id === courseId);
    setForm({ ...form, courseId, courseName: co?.name || '' });
  };

  const addYearRow = () => {
    const next = form.yearWiseFees.length + 1;
    setForm({ ...form, yearWiseFees: [...form.yearWiseFees, { label: `Year ${next}`, amount: '' }] });
  };
  const updateYearRow = (i: number, key: string, val: string) => {
    const rows = [...form.yearWiseFees]; rows[i] = { ...rows[i], [key]: val };
    setForm({ ...form, yearWiseFees: rows });
  };
  const removeYearRow = (i: number) => {
    setForm({ ...form, yearWiseFees: form.yearWiseFees.filter((_: any, idx: number) => idx !== i) });
  };

  const handleSave = async () => {
    if (!form.courseId) return alert('Please select a course');
    try {
      if (editId) await axios.put(`/api/fees/${editId}`, form, { headers });
      else await axios.post('/api/fees', form, { headers });
      setModal(false); setForm(empty); setEditId(''); fetchAll();
    } catch (err: any) { alert(err.response?.data?.error || 'Error saving fees'); }
  };

  const handleEdit = (f: any) => {
    const fc = courses.filter((c: any) => c.collegeId === f.collegeId);
    setFilteredCourses(fc);
    setForm({ ...empty, ...f, source: f.source || empty.source });
    setEditId(f._id);
    setModal(true);
  };

  const handleDelete = async () => {
    await axios.delete(`/api/fees/${deleteId}`, { headers });
    setDeleteId(''); fetchAll();
  };

  const inp = "w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400";

  return (
    <AdminLayout title="Fees Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{feesList.length} fee structures</p>
        <button onClick={() => { setForm(empty); setEditId(''); setFilteredCourses([]); setShowExtra(false); setModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          <Plus size={16} /> Add Fees
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['College', 'Course', 'Category', 'Booking', 'Total Fee', 'Scholarship', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {feesList.map((f: any) => (
              <tr key={f._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{f.collegeName || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{f.courseName || '—'}</td>
                <td className="px-4 py-3">
                  {f.source?.verified ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 w-max">Verified</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold w-max">Unverified</span>
                  )}
                </td>
                <td className="px-4 py-3 text-green-600 font-semibold">{f.bookingAmount || '—'}</td>
                <td className="px-4 py-3 text-green-600 font-semibold">{f.totalFee || '—'}</td>
                <td className="px-4 py-3">
                  {f.scholarshipAvailable ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">{f.scholarshipPercentage ? `${f.scholarshipPercentage}%` : 'Yes'}</span> : '—'}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(f)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"><Pencil size={15} /></button>
                  <button onClick={() => setDeleteId(f._id)} className="p-1 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {feesList.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No fee structures added yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Fees' : 'Add Fees'}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {/* College */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College *</label>
            <select value={form.collegeId} onChange={e => handleCollegeChange(e.target.value)} className={inp}>
              <option value="">Select College</option>
              {colleges.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select value={form.courseId} onChange={e => handleCourseChange(e.target.value)} className={inp} disabled={!form.collegeId}>
              <option value="">Select Course</option>
              {filteredCourses.map((c: any) => <option key={c._id} value={c._id}>{c.name}{c.courseType ? ` (${c.courseType})` : ''}</option>)}
            </select>
          </div>
          {/* Campus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
            <select value={form.campusId || ''} onChange={e => { const camp = filteredCampuses.find((c: any) => c._id === e.target.value); setForm({ ...form, campusId: e.target.value, campusName: camp?.name || '' }); }} disabled={!form.collegeId} className={inp}>
              <option value="">All Campuses</option>
              {filteredCampuses.map((c: any) => <option key={c._id} value={c._id}>{c.name} — {c.city}</option>)}
            </select>
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admission Category</label>
            <input placeholder="e.g. Karnataka, NRI, Management Quota" value={form.admissionCategoryName || ''} onChange={e => setForm({ ...form, admissionCategoryName: e.target.value })} className={inp} list="cat-list" />
            <datalist id="cat-list">
              {['Karnataka', 'Non-Karnataka', 'Management Quota', 'Merit', 'NRI', 'International', 'Government Seat', 'Private Seat'].map(c => <option key={c} value={c} />)}
              {categories.map((c: any) => <option key={c._id} value={c.name} />)}
            </datalist>
          </div>
          {/* Core fees */}
          {[{ key: 'bookingAmount', label: 'Booking Amount', ph: '₹10,000' }, { key: 'totalFee', label: 'Total Fee', ph: '₹3,00,000' }, { key: 'eligibility', label: 'Eligibility', ph: 'NEET required, 50% PCB' }].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input placeholder={f.ph} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={inp} />
            </div>
          ))}
          {/* Year-wise */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Year/Semester Fees</label>
              <button onClick={addYearRow} className="text-xs text-green-600 font-medium hover:underline">+ Add Row</button>
            </div>
            {form.yearWiseFees?.map((row: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder="Year 1" value={row.label} onChange={e => updateYearRow(i, 'label', e.target.value)} className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                <input placeholder="₹50,000" value={row.amount} onChange={e => updateYearRow(i, 'amount', e.target.value)} className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                <button onClick={() => removeYearRow(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
              </div>
            ))}
          </div>

          {/* Scholarship Section */}
          <div className="border border-amber-200 rounded-xl p-3 bg-amber-50/50">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2 cursor-pointer">
              <input type="checkbox" checked={form.scholarshipAvailable} onChange={e => setForm({ ...form, scholarshipAvailable: e.target.checked })} className="w-4 h-4 accent-amber-600" />
              🎓 Scholarship Available
            </label>
            {form.scholarshipAvailable && (
              <div className="space-y-2 mt-2">
                <input placeholder="Scholarship % (e.g. 25)" type="number" value={form.scholarshipPercentage || ''} onChange={e => setForm({ ...form, scholarshipPercentage: e.target.value })} className={inp} />
                <input placeholder="Scholarship details" value={form.scholarshipDetails || ''} onChange={e => setForm({ ...form, scholarshipDetails: e.target.value })} className={inp} />
                <input placeholder="Eligibility for scholarship" value={form.scholarshipEligibility || ''} onChange={e => setForm({ ...form, scholarshipEligibility: e.target.value })} className={inp} />
              </div>
            )}
          </div>

          {/* Extra fees toggle */}
          <button onClick={() => setShowExtra(!showExtra)} className="text-sm text-blue-600 font-medium hover:underline">
            {showExtra ? '▲ Hide' : '▼ Show'} Additional Fees (Hostel, Transport, Exam...)
          </button>
          {showExtra && (
            <div className="grid grid-cols-2 gap-2">
              {[{ key: 'hostelFee', label: 'Hostel Fee' }, { key: 'transportFee', label: 'Transport Fee' }, { key: 'examFee', label: 'Exam Fee' }, { key: 'uniformFee', label: 'Uniform Fee' }, { key: 'cautionDeposit', label: 'Caution Deposit' }, { key: 'applicationFee', label: 'Application Fee' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-0.5">{f.label}</label>
                  <input placeholder="₹" value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              ))}
            </div>
          )}

          {/* Fee uploads */}
          <div className="grid grid-cols-2 gap-3">
            <FileUploader label="Fee Poster Image" accept="image/*" folder="studyaxis/fees" currentUrl={form.feeStructureImage}
              onUploadComplete={(r) => setForm({ ...form, feeStructureImage: r.url })} />
            <FileUploader label="Fee Structure PDF" accept=".pdf" folder="studyaxis/fees" currentUrl={form.feeStructurePdf}
              onUploadComplete={(r) => setForm({ ...form, feeStructurePdf: r.url })} />
          </div>

          {/* Source */}
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Source of Fees</label>
            <select value={form.source?.sourceType || 'admin'} onChange={e => setForm({ ...form, source: { ...form.source, sourceType: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 bg-white mb-2">
              <option value="official">Official College Source</option>
              <option value="admin">Admin Uploaded</option>
              <option value="student">Student Uploaded</option>
              <option value="third-party">Third Party</option>
            </select>
            <input placeholder="Source URL (optional)" value={form.source?.sourceUrl || ''} onChange={e => setForm({ ...form, source: { ...form.source, sourceUrl: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 bg-white mb-3" />
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-bold">
              <input type="checkbox" checked={form.source?.verified || false} onChange={e => setForm({ ...form, source: { ...form.source, verified: e.target.checked } })} className="w-4 h-4 accent-green-600" /> Mark Source as Verified & Authentic
            </label>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.loanAvailable} onChange={e => setForm({ ...form, loanAvailable: e.target.checked })} className="w-4 h-4 accent-green-600" /> Loan Available
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Info</label>
            <textarea rows={2} placeholder="Loan details, hostel included, etc." value={form.extraInfo || ''} onChange={e => setForm({ ...form, extraInfo: e.target.value })} className={inp} />
          </div>

          <button onClick={handleSave} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
            {editId ? 'Update Fees' : 'Add Fees'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} message="Delete this fee structure?" onConfirm={handleDelete} onCancel={() => setDeleteId('')} />
    </AdminLayout>
  );
}