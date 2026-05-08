import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart College Finder – Get Personalized Recommendations',
  description: 'Answer a few questions and get personalized college recommendations based on your course, budget, marks, and preferences. Free smart counselling by StudyAxis.',
  openGraph: {
    title: 'Smart College Finder | StudyAxis',
    description: 'Get personalized college recommendations based on your profile.',
  },
};

export default function CollegeFinderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
