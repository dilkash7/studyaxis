import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LiveChat from '@/components/frontend/LiveChat';
import CounsellingBot from '@/components/frontend/CounsellingBot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "StudyAxis",
  description: "Find Your Dream College",
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
      <body className={inter.className}>{children}<CounsellingBot /><LiveChat /></body>
    </html>
  );
}