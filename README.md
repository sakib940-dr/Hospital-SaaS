# হাসপাতাল ক্লাউড

“প্রতিটা হাসপাতালের নিজের ওয়েবসাইট, ৫ মিনিটে।”

একটি multi-tenant hospital website ও operations platform। একই deployment থেকে প্রতিটি হাসপাতাল subdomain/custom domain-এ নিজস্ব public website পায়; hospital admin ডাক্তার, সেবা, খরচ, গ্যালারি, রিভিউ, appointment ও analytics পরিচালনা করে; platform admin tenant lifecycle দেখে।

## কী কী তৈরি আছে

- Responsive marketing site ও tenant visitor site
- Dynamic tenant lookup, SEO title/description/favicon এবং analytics event tracking
- Hospital admin: overview, hospital info, doctors, services, costs, gallery, reviews, appointments, analytics, settings
- Super admin: overview, hospital create/search/suspend/activate এবং platform analytics
- Six-step onboarding wizard ও Supabase Storage logo upload
- Supabase Auth role resolution, route guards, multi-tenant migration ও RLS policies
- Authenticated Vercel custom-domain serverless API

## Local setup

প্রয়োজন: Node.js 20+, npm এবং একটি Supabase project।

```bash
npm install
copy .env.example .env
npm run dev
```

`.env`-এ অন্তত client-safe `VITE_SUPABASE_URL` ও `VITE_SUPABASE_ANON_KEY` দিন। Local marketing site: `http://localhost:5173/`; tenant test: `http://localhost:5173/?hospital=your-slug`।

Quality checks:

```bash
npm test
npm run build
```

## Database setup — এই ক্রমেই

1. `supabase/00_base_schema.sql` রান করুন। এটি package-এর self-contained base content schema।
2. `supabase/01_multi_tenant_migration.sql` রান করুন। এটি tenant/auth mapping/analytics tables, tenant columns, appointment fields, storage bucket এবং indexes তৈরি করে। Existing single-tenant rows `legacy` hospital-এর অধীনে সংরক্ষণ করে।
3. `supabase/02_rls_policies.sql` রান করুন। এটি helper/RPC functions, tenant policies এবং storage policies চালু করে।
4. Authentication → Users-এ founder-এর user তৈরি করুন। তার UUID দিয়ে প্রথম super admin করুন:

```sql
insert into public.super_admins (user_id) values ('YOUR_AUTH_USER_UUID');
```

5. `/login` দিয়ে ঢুকে role redirect যাচাই করুন। Hospital admin test করতে onboarding দিয়ে একটি tenant তৈরি করুন।

## Environment variables

| Variable | কোথায় | কাজ |
|---|---|---|
| `VITE_SUPABASE_URL` | Client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client | Public anon key; RLS দ্বারা সুরক্ষিত |
| `VITE_ROOT_DOMAIN` | Client | Root domain, যেমন `hospitalcloud.com` |
| `SUPABASE_URL` | Server | Custom-domain function-এর Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Membership check ও domain update |
| `VERCEL_API_TOKEN` | Server only | Vercel Domains API access |
| `VERCEL_PROJECT_ID` | Server only | Target Vercel project |
| `VERCEL_TEAM_ID` | Server only, optional | Team-owned Vercel project |

`SUPABASE_SERVICE_ROLE_KEY` বা `VERCEL_API_TOKEN` কখনো `VITE_` prefix দেবেন না এবং Git-এ commit করবেন না।

## Vercel deployment

1. Git repository Vercel-এ import করুন; Root Directory হিসেবে `hospital-saas` নির্বাচন করুন।
2. Framework Vite, Build Command `npm run build`, Output Directory `dist` রাখুন।
3. উপরের সব production environment variable Vercel Project Settings → Environment Variables-এ দিন।
4. Root domain যোগ করুন। Vercel-এর DNS নির্দেশ অনুযায়ী wildcard `*.hospitalcloud.com` record project-এর দিকে point করুন।
5. Deploy করুন। `vercel.json` static assets/API আগে resolve করে, তারপর SPA route-কে `index.html`-এ পাঠায়।
6. Custom domain যোগ করতে hospital admin → Settings ব্যবহার করুন এবং দেখানো CNAME দিন। DNS propagation সময় নিতে পারে।

## Auth flow manual verification

1. Supabase Auth-এ একটি super-admin এবং একটি hospital-admin user তৈরি করুন।
2. SQL-এ যথাক্রমে `super_admins` ও `hospital_admins` membership দিন।
3. `/login`-এ একই form দিয়ে super-admin login করলে `/super-admin`, hospital-admin login করলে `/admin` যেতে হবে।
4. Signed-out অবস্থায় protected URL খুললে `/login`-এ ফেরত যাবে; ভুল role অন্য dashboard খুলতে পারবে না।
5. দুই hospital user দিয়ে `docs/19-security-qa-checklist.md`-এর RLS test চালান।

## Launch docs

- `DESIGN_SYSTEM.md` — visual tokens ও component rules
- `docs/18-optimization-checklist.md` — performance log
- `docs/19-security-qa-checklist.md` — security/RLS QA
- `docs/20-deployment-checklist.md` — soft-launch ও monitoring
