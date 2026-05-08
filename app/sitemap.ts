import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';

export default async function sitemap() {
  try {
    await connectDB();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studyaxis.com';
    
    // Static routes
    const staticRoutes = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/india`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/abroad`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/apply`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];
    
    // Dynamic college routes
    const colleges = await College.find({ active: true }).select('_id slug');
    const collegeRoutes = colleges.map((college) => ({
      url: `${baseUrl}/college/${college.slug || college._id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    
    // Dynamic course routes
    const courses = await Course.find({ active: true }).select('_id slug');
    const courseRoutes = courses.map((course) => ({
      url: `${baseUrl}/course/${course.slug || course._id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
    
    return [...staticRoutes, ...collegeRoutes, ...courseRoutes];
  } catch (error) {
    console.error('Sitemap error:', error);
    return [];
  }
}
