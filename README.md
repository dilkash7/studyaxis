# StudyAxis — EdTech Admission Platform (SaaS Edition)

> The definitive full-stack Next.js EdTech platform. Features a dual-sided ecosystem (Admin CRM + Student Portal), secure document uploads, mock payment gateways, and deterministic AI counseling.

## 🚀 The Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | MongoDB Atlas + Mongoose ORM |
| Auth & Security | Stateless JWTs + Next.js Edge Middleware + IP Rate Limiting |
| Testing | Jest + React Testing Library |
| Styling | Tailwind CSS |
| Infrastructure | Vercel (Cron Jobs + Edge Networking) |

## 📁 Architecture Highlights

```
app/
├── (frontend)        # Public SaaS Marketing & College Profiles
├── student/          # The Secure Student SaaS Portal
│   ├── apply/        # Formal Application Pipeline
│   ├── applications/ # Track Admissions + Cloudinary Document Uploads
│   ├── dashboard/    # Wishlist + Profile Management
│   └── login/        # JWT Authentication
├── admin/            # The Super Admin Ecosystem
│   ├── analytics/    # Real-time Web Heatmaps
│   ├── audit-logs/   # Immutable Admin Action Tracking
│   ├── colleges/     # CRUD + Slug generation
│   └── applications/ # Kanban-style Application tracking
├── api/              # 60+ Unified API Routes
│   ├── cron/         # Nightly DB Cleanup (Vercel Cron)
│   ├── student/pay   # Mock Razorpay/Stripe Checkout Integration
│   └── chatbot-ai/   # Deterministic Edge Counseling
```

## 🔒 Security Posture
* **Next.js Edge Middleware (`proxy.ts`):** All `/admin` and `/student` routes are natively intercepted at the network edge using HTTP-only cookies, entirely preventing unauthorized client-side flashing.
* **In-Memory Rate Limiter:** Sensitive paths (like `/api/auth` and `/api/leads`) are strictly throttled (e.g. 5 requests/minute) using a custom IP hashing map to prevent brute force and DDoS logic.
* **HSTS & Clickjacking Headers:** Globals configured inside `next.config.ts`.
* **Stateful Admin Sessions:** Super Admins can instantly invalidate the JWTs of suspended staff members.

## 🎓 The Student Portal Workflow
Instead of basic "Lead Forms", users now go through a proper SaaS conversion loop:
1. **Authentication:** The user registers a `student` account.
2. **Wishlist (Heart Icon):** They dynamically save colleges to their dashboard.
3. **Formal Application:** They trigger `/student/apply/[id]`, which intelligently pre-fills their academic profile and sends an immutable admission record.
4. **Document Sync:** If an application goes into "Documents Pending", the student can securely upload their Marksheets via Cloudinary directly from their dashboard.
5. **Checkout Gateway:** The moment the application is "Accepted", a Mock Payment Gateway appears so they can "Pay ₹1,500 Seat Booking Fee".

## 🤖 The AI Admissions Bot
A robust, deterministic chatbot built into the frontend that does not rely on expensive OpenAI tokens. It uses a structured hierarchy to guide students through:
* `Stream -> Degree -> Specialization -> Budget -> Academic Score -> Location`
* It instantly matches the student against the MongoDB `Course` and `Fees` schemas and outputs actionable College cards.

## 🏃 Getting Started & Testing

1. **Install Dependencies**
```bash
npm install
```

2. **Run the Development Server**
```bash
npm run dev
```

3. **Run Unit Tests (Jest)**
```bash
npx jest --forceExit
```

4. **Production Build Diagnostics**
```bash
npm run build
```

*(Ensure all `.env.local` variables, including `CRON_SECRET` and `JWT_SECRET`, are ported over to Vercel before deploying).*
