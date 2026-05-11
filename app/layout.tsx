import type { Metadata } from 'next';
import './globals.css';
import LiveChat from '@/components/frontend/LiveChat';
import CounsellingBot from '@/components/frontend/CounsellingBot';
import AnalyticsProvider from '@/components/frontend/AnalyticsProvider';

export const metadata: Metadata = {
  title: {
    default: "StudyAxis | Find Your Dream College",
    template: "%s | StudyAxis",
  },
  description: "Discover top colleges, compare courses, and apply directly to your dream university with the StudyAxis Student Portal.",
  keywords: ["College Admissions", "Top Universities in India", "B.Tech Admissions", "MBA Colleges", "StudyAxis", "Higher Education"],
  authors: [{ name: "StudyAxis" }],
  openGraph: {
    title: "StudyAxis | Find Your Dream College",
    description: "Discover top colleges, compare courses, and apply directly to your dream university.",
    url: "https://studyaxis.in",
    siteName: "StudyAxis",
    images: [
      {
        url: "https://studyaxis.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StudyAxis Admissions",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyAxis | Admissions Simplified",
    description: "Compare fees, placements, and apply directly through the StudyAxis portal.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider>
          {children}
          <CounsellingBot />
          <LiveChat />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
