# StudyAxis — Education Admission Platform

> AI-powered education consultancy platform for India & Abroad admissions. Full CRM, document intelligence, and student portal.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | MongoDB + Mongoose |
| Auth | JWT (admin RBAC) |
| OCR Engine | Google Cloud Vision (primary) + Tesseract.js (fallback) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Deployment | Vercel / VPS |

## 📁 Project Structure

```
app/
├── (frontend)        # Public pages
│   ├── page.tsx       # Homepage (dynamic sections)
│   ├── college/[id]   # College detail (11 tabs, slug support)
│   ├── search/        # Advanced search + filters
│   ├── blog/[slug]    # Blog with detail pages
│   ├── scholarships/  # Scholarship listing
│   ├── faqs/          # FAQ center
│   ├── notices/       # Notice board
│   ├── testimonials/  # Student testimonials
│   ├── compare/       # College comparison
│   └── ...
├── admin/             # Admin dashboard (28 modules)
│   ├── colleges/      # CRUD + slug generation
│   ├── courses/       # Stream-based categories
│   ├── fees/          # Year-wise, hostel, scholarship
│   ├── payments/      # Payment tracking
│   ├── bulk-import/   # CSV/Excel import
│   └── ...
├── api/               # 52 API routes
│   ├── colleges/      # Slug + ObjectId dual lookup
│   ├── ocr/           # Google Vision + Tesseract
│   ├── blogs/[id]     # Slug lookup + view counter
│   └── ...
components/
├── frontend/          # Navbar, Footer, HomepageDynamic, etc.
├── admin/             # Sidebar, admin components
├── ui/                # Shared UI components
lib/
├── mongodb.ts         # DB connection
├── auth.ts            # JWT auth + RBAC
├── objectId.ts        # ObjectId validation utilities
├── ocr/               # Vision OCR + Tesseract
│   └── visionOCR.ts   # Google Cloud Vision JWT engine
└── courseClassifier.ts # Auto slug + SEO generation
models/                # 25+ Mongoose schemas
```

## 🔧 Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_BASE_URL=https://studyaxis.com

# Google Cloud Vision OCR (optional, falls back to Tesseract)
GOOGLE_VISION_KEY_JSON={"type":"service_account",...}
# OR place google-vision-key.json in project root

# Cloudinary (media uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 🏃 Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

## 📊 Platform Features

### Public Frontend
- 🏫 College pages with 11 content tabs (Overview, Courses, Fees, Admission, Placements, Hostel, Gallery, Documents, Reviews, Scholarships, FAQ)
- 🔍 Advanced search with filters (stream, accreditation, location, rating)
- 🎓 Scholarship listings with type/deadline filters
- ❓ FAQ center with category grouping
- 📰 Blog system with detail pages and view tracking
- 💬 Student testimonials with ratings
- 🔔 Notice board with pinning and urgency
- ⚖️ College comparison
- 📱 Mobile-first responsive design

### Admin Dashboard (28 modules)
- College, Course, Fee, Campus CRUD
- Document AI (OCR: Vision + Tesseract)
- Payments, Applications, Student Records
- Bulk Import (CSV/Excel)
- Media Gallery, Brochures
- Reviews, Testimonials, Notices, FAQs
- Blog management with SEO fields
- Admin audit log + RBAC

### SEO & Performance
- Slug-based URLs with ObjectId→slug redirect
- JSON-LD schema (CollegeOrUniversity)
- Dynamic OpenGraph + Twitter cards
- Auto-generated sitemap (15 static + dynamic routes)
- robots.txt
- Breadcrumb with Schema.org markup

### Document Intelligence
- Google Cloud Vision OCR (primary, 90% accuracy)
- Tesseract.js fallback (65% accuracy)
- PDF text extraction + OCR fallback
- Excel/CSV intelligent column mapping
- Fee table detection with confidence scoring
- Duplicate detection (Jaccard similarity)

## 📝 API Pagination

```
GET /api/colleges?paginate=true&page=1&limit=20

Response: { data: [...], total: 150, page: 1, limit: 20, pages: 8 }
```

Without `paginate=true`, returns plain array for backward compatibility.
