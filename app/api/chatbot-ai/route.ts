import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';
import Fees from '@/models/Fees';

// ── Stream Hierarchy ──
const STREAMS = [
  { name: 'Engineering', icon: '⚙️', degrees: ['B.Tech', 'B.E', 'M.Tech', 'M.E', 'Diploma'] },
  { name: 'Medical', icon: '🏥', degrees: ['MBBS', 'BDS', 'BAMS', 'BHMS', 'MD', 'MS'] },
  { name: 'Management', icon: '📊', degrees: ['BBA', 'MBA', 'PGDM', 'BMS'] },
  { name: 'Commerce', icon: '💰', degrees: ['B.Com', 'M.Com', 'CA'] },
  { name: 'Computer Applications', icon: '💻', degrees: ['BCA', 'MCA'] },
  { name: 'Law', icon: '⚖️', degrees: ['BA LLB', 'BBA LLB', 'LLB', 'LLM'] },
  { name: 'Pharmacy', icon: '💊', degrees: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'Pharm.D'] },
  { name: 'Nursing', icon: '🩺', degrees: ['BSc Nursing', 'GNM', 'ANM', 'MSc Nursing'] },
  { name: 'Allied Health Sciences', icon: '🧬', degrees: ['BPT', 'BOT', 'BSc MLT', 'BSc Radiology'] },
  { name: 'Science', icon: '🔬', degrees: ['BSc', 'MSc'] },
  { name: 'Arts', icon: '🎨', degrees: ['BA', 'MA'] },
  { name: 'Design', icon: '✏️', degrees: ['B.Des', 'M.Des'] },
  { name: 'Agriculture', icon: '🌾', degrees: ['BSc Agriculture'] },
  { name: 'Aviation', icon: '✈️', degrees: ['Aviation', 'AME', 'Pilot Training'] },
  { name: 'Hotel Management', icon: '🏨', degrees: ['BHM', 'BHMCT'] },
  { name: 'Education', icon: '📖', degrees: ['B.Ed', 'D.Ed', 'M.Ed'] },
  { name: 'Paramedical', icon: '🏨', degrees: ['DMLT', 'BSc Cardiac Care', 'BSc OT Technology'] },
];

const SPECIALIZATIONS: Record<string, string[]> = {
  Engineering: ['Computer Science', 'AI & ML', 'Data Science', 'Cyber Security', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'Information Technology', 'Robotics', 'Aerospace', 'Biomedical', 'Chemical', 'VLSI', 'IoT', 'Cloud Computing'],
  Medical: ['General Medicine', 'General Surgery', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Gynecology', 'Radiology', 'ENT', 'Ophthalmology'],
  Management: ['Finance', 'Marketing', 'HR', 'Operations', 'Business Analytics', 'International Business', 'Healthcare Management'],
  Commerce: ['Accounting', 'Banking & Insurance', 'Taxation', 'Finance'],
  Law: ['Constitutional Law', 'Corporate Law', 'Criminal Law', 'International Law'],
  Science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Biotechnology', 'Microbiology'],
  Arts: ['Psychology', 'Sociology', 'Economics', 'Journalism & Media', 'English', 'Political Science'],
  Design: ['Fashion Design', 'Interior Design', 'Graphic Design', 'UI/UX Design'],
  'Computer Applications': ['Full Stack Development', 'Cloud Computing', 'Data Science', 'Cyber Security'],
};

const BUDGET_OPTIONS = [
  'Below ₹1 Lakh',
  '₹1L – ₹3L',
  '₹3L – ₹5L',
  '₹5L – ₹10L',
  '₹10L – ₹20L',
  'Above ₹20L',
  'No budget limit',
];

const SCORE_OPTIONS = [
  'Below 50%',
  '50% – 60%',
  '60% – 75%',
  '75% – 85%',
  'Above 85%',
  'Not sure / Waiting for results',
];

const LOCATION_OPTIONS = [
  'Karnataka',
  'Tamil Nadu',
  'Maharashtra',
  'Delhi NCR',
  'Any state in India',
  'Abroad',
];

/**
 * Step-based chatbot flow:
 * 0 → Select Stream (Engineering, Medical, etc.)
 * 1 → Select Degree (B.Tech, MBBS, etc.)
 * 2 → Select Specialization (AI/ML, Finance, etc.)
 * 3 → Budget Range
 * 4 → Academic Score
 * 5 → Location Preference
 * 6 → Show Results
 * 7 → Ask for help
 * 8 → Lead form
 * 9 → Lead saved + WhatsApp
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { step, answers } = await req.json();

    // ─── STEP 0: Welcome + Select Stream ───
    if (step === 0) {
      const streamOptions = STREAMS.map(s => `${s.icon} ${s.name}`);
      return NextResponse.json({
        message: "👋 Hi! I'm your **StudyAxis College Counsellor**.\n\nLet's find the perfect college for you in 5 quick steps!\n\n**Step 1/6:** What stream are you interested in?",
        type: 'options',
        options: streamOptions,
        nextStep: 1,
      });
    }

    // ─── STEP 1: Select Degree ───
    if (step === 1) {
      const streamName = (answers.stream || '').replace(/^[^\s]+\s/, ''); // Remove emoji
      const stream = STREAMS.find(s => s.name === streamName);
      const degrees = stream?.degrees || ['Other'];

      return NextResponse.json({
        message: `Great choice — **${streamName}**! 🎯\n\n**Step 2/6:** Which degree level are you looking for?`,
        type: 'options',
        options: degrees,
        nextStep: 2,
      });
    }

    // ─── STEP 2: Select Specialization ───
    if (step === 2) {
      const streamName = (answers.stream || '').replace(/^[^\s]+\s/, '');
      const specs = SPECIALIZATIONS[streamName];

      if (specs && specs.length > 0) {
        return NextResponse.json({
          message: `**${answers.degree}** — excellent! 📚\n\n**Step 3/6:** Any specific specialization?`,
          type: 'options',
          options: [...specs.slice(0, 10), 'Any / Not sure'],
          nextStep: 3,
        });
      }

      // No specializations for this stream, skip to budget
      return NextResponse.json({
        message: `**${answers.degree}** — excellent! 📚\n\n**Step 3/6:** What is your budget per year?`,
        type: 'options',
        options: BUDGET_OPTIONS,
        nextStep: 4, // Skip specialization step
      });
    }

    // ─── STEP 3: Budget ───
    if (step === 3) {
      return NextResponse.json({
        message: `**Step 4/6:** What is your approximate annual budget?`,
        type: 'options',
        options: BUDGET_OPTIONS,
        nextStep: 4,
      });
    }

    // ─── STEP 4: Academic Score ───
    if (step === 4) {
      return NextResponse.json({
        message: `**Step 5/6:** What are your academic marks / entrance exam score?`,
        type: 'options',
        options: SCORE_OPTIONS,
        nextStep: 5,
      });
    }

    // ─── STEP 5: Location ───
    if (step === 5) {
      return NextResponse.json({
        message: `**Step 6/6:** Where do you prefer to study?`,
        type: 'options',
        options: LOCATION_OPTIONS,
        nextStep: 6,
      });
    }

    // ─── STEP 6: Show Results ───
    if (step === 6) {
      const streamName = (answers.stream || '').replace(/^[^\s]+\s/, '');
      const degree = answers.degree || '';
      const specialization = answers.specialization || '';
      const location = answers.location || '';

      // Build course query
      const courseQuery: any = {};
      if (streamName) courseQuery.mainCategory = streamName;
      if (degree) courseQuery.degreeType = degree;
      if (specialization && specialization !== 'Any / Not sure') {
        courseQuery.specialization = { $regex: specialization, $options: 'i' };
      }

      // Also try matching by name for backward compatibility
      const nameRegex = [degree, specialization]
        .filter(Boolean)
        .filter(s => s !== 'Any / Not sure')
        .join('|');

      let courses = await Course.find(courseQuery).limit(30).lean();

      // Fallback: search by name if structured query returns nothing
      if (courses.length === 0 && nameRegex) {
        courses = await Course.find({
          name: { $regex: nameRegex, $options: 'i' },
        }).limit(30).lean();
      }

      const courseCollegeIds = courses.map((c: any) => c.collegeId?.toString()).filter(Boolean);
      const uniqueCollegeIds = [...new Set(courseCollegeIds)];

      // Build college filter
      const collegeFilter: any = { _id: { $in: uniqueCollegeIds } };
      if (location === 'Abroad') collegeFilter.type = 'abroad';
      else if (location !== 'Any state in India') {
        // Try to match state/city
        collegeFilter.$or = [
          { state: { $regex: location, $options: 'i' } },
          { city: { $regex: location, $options: 'i' } },
          { type: 'india' },
        ];
      }

      const colleges = await College.find(collegeFilter).limit(20).lean();
      const matchedCollegeIds = new Set(colleges.map((c: any) => c._id.toString()));

      // Get fees for matched colleges
      const results = await Promise.all(
        colleges.slice(0, 6).map(async (col: any) => {
          const course = courses.find(
            (c: any) => c.collegeId?.toString() === col._id.toString()
          );
          const fees = course
            ? await Fees.findOne({ courseId: (course as any)._id }).lean() as any
            : null;
          return {
            _id: col._id,
            name: col.name,
            location: [col.city, col.state].filter(Boolean).join(', ') || col.country || 'India',
            type: col.type,
            image: col.image,
            course: (course as any)?.name || `${degree} ${specialization || ''}`.trim(),
            fees: fees?.totalFee || col.fees || 'Contact Us',
            bookingAmount: fees?.bookingAmount || 'N/A',
            eligibility: fees?.eligibility || 'Contact for details',
            loanAvailable: fees?.loanAvailable || false,
            scholarshipAvailable: fees?.scholarshipAvailable || false,
          };
        })
      );

      if (results.length === 0) {
        return NextResponse.json({
          message: `😔 No exact matches found for **${degree} ${specialization || ''}** in **${location}**.\n\nSuggestions:\n• Try a different location\n• Increase your budget\n• Consider related courses\n\nWould you like help from a real counsellor?`,
          type: 'options',
          options: ['Yes, connect me with a counsellor! 📞', 'No, let me search again 🔄'],
          nextStep: 7,
        });
      }

      return NextResponse.json({
        message: `🎯 Found **${results.length} colleges** matching your preferences:\n\n📚 **${degree}${specialization && specialization !== 'Any / Not sure' ? ' — ' + specialization : ''}**\n📍 ${location}`,
        type: 'results',
        results,
        nextStep: 7,
      });
    }

    // ─── STEP 7: Want Help? ───
    if (step === 7) {
      const wantsHelp = answers.wantsHelp || '';
      if (
        wantsHelp.includes('Yes') ||
        wantsHelp.includes('help') ||
        wantsHelp.includes('apply') ||
        wantsHelp.includes('counsellor')
      ) {
        return NextResponse.json({
          message: "Great! Please share your details and our counsellor will contact you within 24 hours. 📞",
          type: 'lead_form',
          nextStep: 8,
        });
      }

      if (wantsHelp.includes('search again') || wantsHelp.includes('🔄')) {
        return NextResponse.json({
          message: "No problem! Let's start fresh. 🔄\n\n**Step 1/6:** What stream are you interested in?",
          type: 'options',
          options: STREAMS.map(s => `${s.icon} ${s.name}`),
          nextStep: 1,
        });
      }

      return NextResponse.json({
        message: "No problem! Feel free to explore our colleges. Good luck with your admission! 🌟\n\nYou can always come back for help.",
        type: 'end',
      });
    }

    // ─── STEP 8: Save Lead ───
    if (step === 8) {
      try {
        const { default: Lead } = await import('@/models/Lead');
        const streamName = (answers.stream || '').replace(/^[^\s]+\s/, '');
        await Lead.create({
          name: answers.leadName,
          phone: answers.leadPhone,
          course: `${answers.degree || ''} ${answers.specialization || ''}`.trim() || streamName,
          location: answers.location,
          source: 'AI Counsellor Bot',
          status: 'New',
        });
      } catch (leadErr) {
        console.error('Lead save error:', leadErr);
      }

      const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      const streamName = (answers.stream || '').replace(/^[^\s]+\s/, '');
      const msg = encodeURIComponent(
        `Hi StudyAxis! I need admission help.\nName: ${answers.leadName}\nPhone: ${answers.leadPhone}\nStream: ${streamName}\nDegree: ${answers.degree || 'N/A'}\nSpecialization: ${answers.specialization || 'N/A'}\nBudget: ${answers.budget || 'N/A'}\nLocation: ${answers.location || 'N/A'}`
      );

      return NextResponse.json({
        message: `✅ Thank you **${answers.leadName}**! Our counsellor will call you soon.\n\nYou can also WhatsApp us directly for faster response!`,
        type: 'end',
        whatsappUrl: whatsapp ? `https://wa.me/${whatsapp}?text=${msg}` : undefined,
      });
    }

    return NextResponse.json({ message: 'How can I help you?', type: 'end' });
  } catch (err) {
    console.error('Chatbot error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}