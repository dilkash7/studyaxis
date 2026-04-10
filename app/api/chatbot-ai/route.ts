import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';
import Fees from '@/models/Fees';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { step, answers } = await req.json();

    // Step-by-step questioning
    if (step === 0) {
      const courses = await Course.distinct('name');
      return NextResponse.json({
        message: "👋 Hi! I'm your StudyAxis counsellor. Let's find the perfect college for you!\n\nWhat course are you interested in?",
        type: 'options',
        options: [...new Set(courses)].slice(0, 8),
        nextStep: 1,
      });
    }

    if (step === 1) {
      return NextResponse.json({
        message: `Great choice — **${answers.course}**! 🎓\n\nWhere do you want to study?`,
        type: 'options',
        options: ['India', 'Abroad', 'Both'],
        nextStep: 2,
      });
    }

    if (step === 2) {
      return NextResponse.json({
        message: "What is your approximate budget per year?",
        type: 'options',
        options: ['Below ₹2L', '₹2L – ₹5L', '₹5L – ₹10L', 'Above ₹10L', 'No limit'],
        nextStep: 3,
      });
    }

    if (step === 3) {
      return NextResponse.json({
        message: "What are your academic marks / entrance score?",
        type: 'options',
        options: ['Below 50%', '50% – 60%', '60% – 75%', '75% – 85%', 'Above 85%'],
        nextStep: 4,
      });
    }

    if (step === 4) {
      // Filter colleges based on answers
      const { course, location, budget } = answers;

      const collegeFilter: any = {};
      if (location === 'India') collegeFilter.type = 'india';
      else if (location === 'Abroad') collegeFilter.type = 'abroad';

      const colleges = await College.find(collegeFilter).limit(20).lean();
      const courses = await Course.find({ name: { $regex: course, $options: 'i' } }).lean();
      const courseCollegeIds = courses.map((c: any) => c.collegeId?.toString());

      const matched = colleges.filter((col: any) =>
        courseCollegeIds.includes(col._id.toString())
      );

      // Get fees for matched colleges
      const results = await Promise.all(
        matched.slice(0, 5).map(async (col: any) => {
          const course_item = courses.find((c: any) => c.collegeId?.toString() === col._id.toString());
          const fees = course_item
            ? await Fees.findOne({ courseId: course_item._id }).lean() as any
            : null;
          return {
            _id: col._id,
            name: col.name,
            location: col.city || col.country,
            type: col.type,
            image: col.image,
            course: course_item?.name || course,
            fees: fees?.totalFee || col.fees || 'Contact Us',
            bookingAmount: fees?.bookingAmount || 'N/A',
            eligibility: fees?.eligibility || 'Contact us',
            loanAvailable: fees?.loanAvailable || false,
          };
        })
      );

      if (results.length === 0) {
        return NextResponse.json({
          message: `😔 No exact matches found for **${course}** in your criteria.\n\nSuggestions:\n• Try a nearby city\n• Increase your budget\n• Consider similar courses\n\nWould you like to speak with a counsellor?`,
          type: 'fallback',
          nextStep: 6,
        });
      }

      return NextResponse.json({
        message: `🎯 Based on your preferences, here are **${results.length} colleges** you can consider:`,
        type: 'results',
        results,
        nextStep: 5,
      });
    }

    if (step === 5) {
      return NextResponse.json({
        message: "Would you like help with the admission process?",
        type: 'options',
        options: ['Yes, help me apply! 🙋', 'No, just browsing'],
        nextStep: 6,
      });
    }

    if (step === 6) {
      if (answers.wantsHelp === 'Yes, help me apply! 🙋') {
        return NextResponse.json({
          message: "Great! Please share your details and our counsellor will contact you within 24 hours. 📞",
          type: 'lead_form',
          nextStep: 7,
        });
      }
      return NextResponse.json({
        message: "No problem! Feel free to explore our colleges. Good luck! 🌟",
        type: 'end',
      });
    }

    if (step === 7) {
      // Save lead
      const { Lead } = await import('@/models/Lead');
      await Lead.create({
        name: answers.leadName,
        phone: answers.leadPhone,
        course: answers.course,
        location: answers.location,
        source: 'AI Chatbot',
        status: 'New',
      });
      const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      const msg = encodeURIComponent(
        `Hi StudyAxis! I need admission help.\nName: ${answers.leadName}\nPhone: ${answers.leadPhone}\nCourse: ${answers.course}\nLocation: ${answers.location}`
      );
      return NextResponse.json({
        message: `✅ Thank you ${answers.leadName}! Our team will call you soon.\n\nYou can also WhatsApp us directly for faster response!`,
        type: 'end',
        whatsappUrl: `https://wa.me/${whatsapp}?text=${msg}`,
      });
    }

    return NextResponse.json({ message: 'How can I help you?', type: 'end' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}