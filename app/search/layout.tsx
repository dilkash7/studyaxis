import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Colleges & Courses',
  description: 'Search and filter colleges by course, city, budget, campus, and category. Find the best match for your education goals with StudyAxis.',
  openGraph: {
    title: 'Search Colleges | StudyAxis',
    description: 'Advanced search and filters for colleges and courses.',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
