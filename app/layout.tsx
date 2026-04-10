import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'StudyAxis – Find Your Dream College',
    template: '%s | StudyAxis',
  },
  description: 'Expert guidance for MBBS, Engineering & Abroad admissions. Find top colleges in India and abroad.',
  keywords: ['MBBS admission', 'engineering college', 'study abroad', 'education consultancy', 'Mangalore', 'Bangalore'],
  openGraph: {
    title: 'StudyAxis – Find Your Dream College',
    description: 'Expert guidance for MBBS, Engineering & Abroad admissions.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}