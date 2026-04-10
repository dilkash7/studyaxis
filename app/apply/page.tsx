import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import InquiryForm from '@/components/frontend/InquiryForm';
import WhatsAppButton from '@/components/frontend/WhatsAppButton';
import FAQChatbot from '@/components/frontend/FAQChatbot';
import CounsellingBot from '@/components/frontend/CounsellingBot';

export default function ApplyPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      <Navbar />
      <div className="bg-gradient-to-br from-green-700 to-green-500 text-white py-14 px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Apply Now</h1>
        <p className="text-green-100 text-lg">Fill the form and get free guidance from our experts</p>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <InquiryForm />
      </div>
      <Footer />
      <WhatsAppButton />
      <CounsellingBot />
      <FAQChatbot />
    </div>
  );
}