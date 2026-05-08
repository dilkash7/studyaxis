import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study Abroad – Top International Universities',
  description: 'Explore affordable MBBS and Engineering programs abroad. Top universities in Russia, Uzbekistan, and other countries with complete guidance from StudyAxis.',
  openGraph: {
    title: 'Study Abroad – International Universities | StudyAxis',
    description: 'Affordable MBBS and Engineering abroad with expert guidance.',
  },
};

export default function AbroadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
