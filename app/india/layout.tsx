import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study in India – Top MBBS & Engineering Colleges',
  description: 'Explore top colleges in India for MBBS, Engineering, MBA and more. Compare fees, campuses, and courses across Bangalore, Mangalore, Chennai and other cities.',
  openGraph: {
    title: 'Study in India – Top Colleges | StudyAxis',
    description: 'Find and compare top Indian colleges for MBBS, Engineering, MBA and more.',
  },
};

export default function IndiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
