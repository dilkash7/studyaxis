import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LiveChat from '@/components/frontend/LiveChat';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://studyaxis.com'),
  title: {
    default: 'StudyAxis – Find Your Dream College | MBBS, Engineering & Abroad Admissions',
    template: '%s | StudyAxis',
  },
  description: 'Expert guidance for MBBS, Engineering & Abroad admissions. Find top colleges in India and abroad with personalized recommendations, fee comparisons, and smart college finder.',
  keywords: ['MBBS admission', 'engineering college', 'study abroad', 'education consultancy', 'Mangalore', 'Bangalore', 'college finder', 'NEET counselling', 'medical admission India'],
  openGraph: {
    title: 'StudyAxis – Find Your Dream College',
    description: 'Expert guidance for MBBS, Engineering & Abroad admissions. Smart college finder with personalized recommendations.',
    type: 'website',
    siteName: 'StudyAxis',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyAxis – Find Your Dream College',
    description: 'Expert guidance for MBBS, Engineering & Abroad admissions.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://studyaxis.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}<LiveChat /></body>
    </html>
  );
}