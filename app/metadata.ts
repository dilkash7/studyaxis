import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StudyAxis - Find Your Perfect College',
  description: 'Discover best colleges in India and abroad. Search, compare, and apply to your dream college.',
  keywords: 'colleges, courses, admission, education, India, abroad',
  openGraph: {
    title: 'StudyAxis - Find Your Perfect College',
    description: 'Discover best colleges in India and abroad',
    url: 'https://studyaxis.com',
    siteName: 'StudyAxis',
    images: [
      {
        url: 'https://res.cloudinary.com/studyaxis/image/upload/v1/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyAxis - Find Your Perfect College',
    description: 'Discover best colleges in India and abroad',
    images: ['https://res.cloudinary.com/studyaxis/image/upload/v1/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  alternates: {
    canonical: 'https://studyaxis.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
