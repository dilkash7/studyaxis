# 📖 QUICK REFERENCE GUIDE - StudyAxis 2.0

## 🚀 Quick Start

```bash
# Install and run
npm install
npm run dev

# Build for production
npm run build
npm start

# Open in browser
http://localhost:3000
```

---

## 📁 PROJECT STRUCTURE

```
e:\studyaxis\
├── app/
│   ├── admin/                 # Admin dashboard pages
│   │   ├── campuses/
│   │   ├── categories/
│   │   ├── media/
│   │   ├── brochures/
│   │   └── student-records/  (SUPERADMIN)
│   ├── api/                   # API routes
│   │   ├── campuses/
│   │   ├── categories/
│   │   ├── media/
│   │   ├── brochures/
│   │   ├── student-records/
│   │   └── search/
│   ├── college-finder/        # College finder page
│   └── college/[id]/          # College detail page (ENHANCED)
├── components/
│   ├── admin/                 # Admin components
│   ├── frontend/
│   │   ├── SmartCollegeFinder.tsx
│   │   ├── AdvancedSearch.tsx
│   │   └── CollegeFinder.tsx
│   └── ui/                    # Reusable UI components
├── models/                    # Mongoose schemas
├── lib/                       # Utilities
│   ├── constants.ts
│   ├── types.ts
│   ├── validation.ts
│   └── cloudinary.ts
└── public/                    # Static files
```

---

## 🗄️ DATABASE MODELS

### NEW MODELS
```typescript
// Campus - Multi-location support
Campus { collegeId, campusName, location, city, state, address, phoneNumber, email, description, active }

// AdmissionCategory - Dynamic categories
AdmissionCategory { collegeId, name, shortCode, eligibilityNotes, cutoffPercentage, applicableFor }

// CollegeMedia - Photo gallery
CollegeMedia { collegeId, campusId, mediaUrl, mediaType, title, description, displayOrder, active }

// CollegeBrochure - Document management
CollegeBrochure { collegeId, campusId, fileUrl, documentType, title, description, downloadCount }

// StudentRecord - Student management (SUPERADMIN)
StudentRecord { collegeId, campusId, courseId, firstName, email, phoneNumber, admissionNumber, documents }
```

### ENHANCED MODELS
```typescript
// College - Added: campuses[], categories[], media[], brochures[], slug, SEO fields
// Course - Added: courseType, campusId, full descriptions, slug
// Fees - Added: categoryId, campusId, fee components
// Admin - Added: detailed permissions, studentRecords access control
```

---

## 🔌 API ENDPOINTS

### Campuses
```
GET    /api/campuses                 - List all
POST   /api/campuses                 - Create
GET    /api/campuses/[id]            - Get one
PUT    /api/campuses/[id]            - Update
DELETE /api/campuses/[id]            - Delete
```

### Categories
```
GET    /api/categories               - List all
POST   /api/categories               - Create
GET    /api/categories/[id]          - Get one
PUT    /api/categories/[id]          - Update
DELETE /api/categories/[id]          - Delete
```

### Media
```
GET    /api/media                    - List all
POST   /api/media                    - Upload
GET    /api/media/[id]               - Get one
PUT    /api/media/[id]               - Update
DELETE /api/media/[id]               - Delete
```

### Brochures
```
GET    /api/brochures                - List all
POST   /api/brochures                - Upload
GET    /api/brochures/[id]           - Get one (tracks views)
PUT    /api/brochures/[id]           - Update
DELETE /api/brochures/[id]           - Delete
PATCH  /api/brochures/[id]           - Track download
```

### Student Records (SUPERADMIN ONLY)
```
GET    /api/student-records          - List all (with pagination)
POST   /api/student-records          - Create
GET    /api/student-records/[id]     - Get one
PUT    /api/student-records/[id]     - Update
DELETE /api/student-records/[id]     - Delete

POST   /api/student-records/[id]/documents      - Upload document
GET    /api/student-records/[id]/documents      - List documents
DELETE /api/student-records/[id]/documents      - Delete document
```

### Search
```
POST   /api/search/advanced          - Search with filters
```

---

## 🛡️ AUTHENTICATION

### Add Bearer Token to Request
```typescript
const response = await axios.get('/api/student-records', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
```

### Check Permission
```typescript
// In API routes
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
const admin = verifyToken(token);

if (admin.role !== 'superadmin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

---

## 📝 VALIDATION

### Email
```typescript
import { isValidEmail } from '@/lib/validation';
isValidEmail('user@example.com'); // true
```

### Phone
```typescript
import { isValidPhone } from '@/lib/validation';
isValidPhone('9876543210'); // true
```

### URL
```typescript
import { isValidUrl } from '@/lib/validation';
isValidUrl('https://example.com'); // true
```

### Generate Slug
```typescript
import { generateSlug } from '@/lib/validation';
generateSlug('My College Name'); // 'my-college-name'
```

### Generate Admission Number
```typescript
import { generateAdmissionNumber } from '@/lib/validation';
generateAdmissionNumber(); // 'ADM20260507123456'
```

---

## ☁️ CLOUDINARY

### Upload File
```typescript
import { uploadToCloudinary } from '@/lib/cloudinary';
const result = await uploadToCloudinary(file, 'colleges/media');
// Returns: { public_id, secure_url, url }
```

### Delete File
```typescript
import { deleteFromCloudinary } from '@/lib/cloudinary';
await deleteFromCloudinary('colleges/media/abc123');
```

### Get Image URL with Transformation
```typescript
import { getCloudinaryUrl } from '@/lib/cloudinary';
const url = getCloudinaryUrl('colleges/media/abc123', {
  width: 300,
  height: 300,
  crop: 'fill'
});
```

---

## 🎨 COMPONENTS

### SmartCollegeFinder
```typescript
<SmartCollegeFinder
  onComplete={(formData) => {
    console.log(formData);
    // { country, courses[], educationLevel, budget, performance, location }
  }}
/>
```

### AdvancedSearch
```typescript
<AdvancedSearch
  onSearch={(results) => {
    console.log(results);
    // Returns: colleges with match scores
  }}
/>
```

### CollegeFinder
```typescript
<CollegeFinder />
// Includes SmartCollegeFinder + AdvancedSearch mode switcher
```

---

## 🔧 CONSTANTS

```typescript
import { COURSE_TYPES, ADMISSION_CATEGORIES, MEDIA_TYPES } from '@/lib/constants';

// Usage
COURSE_TYPES.UG       // 'UG'
COURSE_TYPES.PG       // 'PG'
MEDIA_TYPES.CAMPUS    // 'campus'
```

---

## 📊 PAGINATION

```typescript
// Request with pagination
const response = await axios.get('/api/student-records?page=1&limit=20');

// Response includes
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  }
}
```

---

## 🧪 TESTING

```bash
# Test API endpoint
curl -X GET "http://localhost:3000/api/campuses" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test with body
curl -X POST "http://localhost:3000/api/campuses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "collegeId": "college123",
    "name": "Main Campus",
    "city": "Bangalore"
  }'
```

---

## 📲 MOBILE OPTIMIZATION

### Breakpoints
```typescript
// Mobile: 320px
// Tablet: 768px (md)
// Desktop: 1024px (lg)

// Example Tailwind classes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  // Mobile: 1 column
  // Tablet: 2 columns
  // Desktop: 3 columns
</div>
```

---

## 🐛 COMMON ISSUES

### Issue: StudentRecords Access Denied
**Solution**: Ensure JWT token is from superadmin account
```typescript
// Check in API route
if (admin.role !== 'superadmin') throw new Error('Unauthorized');
```

### Issue: Cloudinary Upload Fails
**Solution**: Verify credentials in .env.local
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-name
CLOUDINARY_API_KEY=your-actual-key
CLOUDINARY_API_SECRET=your-actual-secret
```

### Issue: Media Not Displaying
**Solution**: Check Cloudinary URLs are valid
```typescript
// Test URL in browser
https://res.cloudinary.com/your-name/image/upload/YOUR_PUBLIC_ID
```

### Issue: Build Fails
**Solution**: Check TypeScript errors
```bash
npm run build  # Shows all errors
tsc --noEmit   # Check types only
```

---

## 📚 USEFUL LINKS

- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Mongoose Docs**: https://mongoosejs.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🎯 COMMON TASKS

### Add New Admin Page
1. Create file: `app/admin/feature/page.tsx`
2. Import AdminLayout component
3. Add permission check
4. Create form and table
5. Add API integration
6. Update Sidebar navigation

### Add New API Endpoint
1. Create folder: `app/api/feature/`
2. Create `route.ts` with GET/POST
3. Create `[id]/route.ts` for PUT/DELETE
4. Add authentication check
5. Import and test

### Add New Frontend Component
1. Create file: `components/frontend/Feature.tsx`
2. Use hooks (useState, useEffect)
3. Style with Tailwind CSS
4. Make mobile responsive
5. Export and use in pages

---

## ✅ CHECKLIST BEFORE COMMITTING

- [ ] Code compiles without errors
- [ ] TypeScript types are correct
- [ ] No console.log() in production code
- [ ] API tested manually
- [ ] Mobile responsive tested
- [ ] Security checks passed
- [ ] Comments added where needed
- [ ] No sensitive data in code

---

## 🚀 DEPLOYMENT

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Push to GitHub
git add .
git commit -m "Your message"
git push

# Vercel deployment
# Auto-deploys on push to main branch
```

---

## 📞 GETTING HELP

1. Check this Quick Reference Guide
2. Read IMPLEMENTATION_GUIDE.md
3. Check COMPLETION_SUMMARY.md
4. Review inline code comments
5. Check error logs in browser console
6. Check server logs in terminal

---

**Version**: 2.0.0  
**Last Updated**: May 7, 2026  
**Quick Reference v1.0** ✅
