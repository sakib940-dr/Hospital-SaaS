# AI Development Handoff

## Project identity

- Product: হাসপাতাল ক্লাউড — multi-tenant Hospital SaaS
- Stack: React 18, Vite 8, Tailwind CSS 3, Supabase, React Router 7, Recharts 3
- Language: visitor/admin UI primarily Bengali; code identifiers English
- Visual system: forest green, mustard accent, off-white surfaces; see `DESIGN_SYSTEM.md`

## Architecture

- `src/App.jsx`: lazy route tree and role guards
- `src/context/AuthContext.jsx`: Supabase session, `super-admin`/`hospital-admin` role, `hospitalId`
- `src/lib/pendingSignup.js`: email-confirmation-এর মাঝের signup intent এবং onboarding prefill sessionStorage-এ রাখে
- `src/context/HospitalContext.jsx`: hostname/subdomain → tenant lookup
- `src/pages/visitor/VisitorSite.jsx`: public tenant website
- `src/pages/hospital-admin/`: tenant-scoped admin modules
- `src/pages/super-admin/`: platform management
- `src/lib/api/`: tenant-aware data access
- `api/add-custom-domain.js`: server-only Vercel function
- `supabase/`: ordered schema/migration/RLS files

## Non-negotiable security rules

1. Every tenant data query/write must scope by `hospital_id` or protected RLS/RPC.
2. Never put `SUPABASE_SERVICE_ROLE_KEY` or `VERCEL_API_TOKEN` under `src/` or a `VITE_` variable.
3. Public links must accept only `http:`/`https:`; phone/WhatsApp values must be sanitized.
4. New SQL must use safe/re-runnable patterns and preserve RLS.
5. Auth UI checks are not a security boundary; database RLS is mandatory.

## Implemented features

- Marketing and dynamic tenant visitor sites
- WhatsApp click-to-chat with analytics event
- Google Maps embed/share-link fallback
- Google Business review CTA and admin setting
- Doctors, services, costs, gallery, reviews, hospital info CRUD
- Appointment request/approve/reject workflow
- Hospital/platform analytics
- Onboarding, dynamic SEO, custom domains
- Self-serve signup: debounced subdomain check, Supabase Auth, tenant RPC, email-confirmation fallback
- Temporary Vercel tenant preview: root deployment URL-তে `/{hospital-subdomain}` path visitor site দেখায়; own domain যোগ হলে normal wildcard subdomain ব্যবহার করুন
- Marketing pricing/social-proof sections, trial countdown, polished empty states
- Multi-tenant RLS and storage policies

## Manual external-state work still required

- Run Supabase SQL in documented order.
- Create Auth users and bootstrap first super admin.
- Configure Vercel variables, root domain and wildcard DNS.
- Run `npm run test:rls` after preparing two test tenant admins.
- Real custom-domain and DNS verification requires Vercel/Supabase credentials.

## Before changing code

Read `START_HERE_BN.md`, `DESIGN_SYSTEM.md`, `README.md`, relevant page/API, and all migrations affected by the task. Preserve existing user changes. After edits run:

```bash
npm test
npm run build
npm audit
```

Update this file when architecture, SQL order, dependencies, security boundaries or major completed features change.
