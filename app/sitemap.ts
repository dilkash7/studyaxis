import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Course from '@/models/Course';

export default async function sitemap() {
  try {
    await connectDB();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studyaxis.com';
    
    // Static routes
    const staticRoutes = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/college-finder`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/india`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/abroad`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/scholarships`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
      { url: `${baseUrl}/apply`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
      { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
      { url: `${baseUrl}/career-guidance`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/visa-guidance`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/testimonials`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
      { url: `${baseUrl}/notices`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.4 },
      { url: `${baseUrl}/faqs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
      { url: `${baseUrl}/callback`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];
    
    // Dynamic college routes (Strictly slug only to prevent ObjectId leaks)
    const colleges = await College.find({ active: true, slug: { $exists: true, $ne: '' } }).select('slug updatedAt');
    const collegeRoutes = colleges.map((college) => ({
      url: `${baseUrl}/college/${college.slug}`,
      lastModified: college.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));
    
    // Dynamic course routes (Strictly slug only)
    const courses = await Course.find({ active: true, slug: { $exists: true, $ne: '' } }).select('slug updatedAt');
    const courseRoutes = courses.map((course) => ({
      url: `${baseUrl}/course/${course.slug}`,
      lastModified: course.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    // Dynamic blog routes (Mocking import since we might not have Blog model here yet, but assuming it exists or will be added)
    // If Blog model is available, we would do:
    // const blogs = await Blog.find({ active: true }).select('slug updatedAt');
    // const blogRoutes = blogs.map(b => ({ url: `${baseUrl}/blog/${b.slug}`, priority: 0.6 }));
    
    return [...staticRoutes, ...collegeRoutes, ...courseRoutes];
  } catch (error) {
    console.error('Sitemap error:', error);
    return [];
  }
}
