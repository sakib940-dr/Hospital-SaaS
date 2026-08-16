# এখান থেকে শুরু করুন

এই zip-টি GitHub upload, Supabase setup, Vercel deploy এবং future AI development-এর জন্য সম্পূর্ণ handoff package। `node_modules`, generated `dist`, এবং secret `.env` ইচ্ছাকৃতভাবে নেই।

## ১. কম্পিউটারে চালানো

```bash
npm install
copy .env.example .env
npm run dev
```

`.env`-এ Supabase-এর Project URL ও anon key দিন। Secret service-role key client-side `.env`-এ `VITE_` prefix দিয়ে দেবেন না।

## ২. Supabase setup

Supabase SQL Editor-এ এই ক্রমে run করুন:

1. `supabase/00_base_schema.sql`
2. `supabase/01_multi_tenant_migration.sql`
3. `supabase/02_rls_policies.sql`
4. Supabase Authentication-এ প্রথম user তৈরি করুন।
5. `supabase/03_bootstrap_super_admin.example.sql`-এ UUID replace করে run করুন।

তারপর `.env`-এ:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_ROOT_DOMAIN=yourdomain.com
```

## ৩. GitHub-এ upload

GitHub-এ নতুন private repository তৈরি করুন। Zip extract করে `hospital-saas` folder-এর ভেতর terminal খুলুন:

```bash
git init
git add .
git commit -m "Initial Hospital SaaS handoff"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

`.gitignore` ইতিমধ্যে `node_modules`, `dist`, `.env` এবং logs বাদ দেয়। Push-এর আগে `git status` দেখে নিশ্চিত করুন `.env` নেই।

## ৪. Vercel deploy

1. Vercel → Add New Project → GitHub repository import করুন।
2. Root Directory: repository root (`hospital-saas` folder-এর content সরাসরি repo-তে থাকলে `.`)।
3. Framework: Vite; Build Command: `npm run build`; Output: `dist`।
4. Vercel Environment Variables-এ `.env.example` অনুযায়ী client ও server values দিন।
5. Deploy করুন।
6. Root domain ও wildcard `*.yourdomain.com` Vercel-এ add করুন।

## ৫. প্রথম login

- `/login` খুলুন।
- Super-admin user দিয়ে login করলে `/super-admin` যাবে।
- নতুন hospital তৈরি/Onboarding করতে hospital admin Auth user প্রয়োজন।
- Visitor local test: `http://localhost:5173/?hospital=your-subdomain`।

## ৬. Deploy-এর আগে checks

```bash
npm test
npm run build
npm audit
```

Expected: tests pass, build zero error/warning, audit 0 vulnerability।

## ৭. Future AI development

পরেরবার AI coding tool-এ পুরো extracted `hospital-saas/` folder upload করুন এবং প্রথম prompt-এ বলুন:

> `START_HERE_BN.md`, `AI_HANDOFF.md`, `DESIGN_SYSTEM.md`, এবং `supabase/README_BN.md` আগে পড়ে existing architecture ও RLS বজায় রেখে কাজ করো। কোনো service-role key client bundle-এ দেবে না। কাজ শেষে npm test ও npm run build চালাও।

Database structure বদলালে নতুন safe/re-runnable migration file যোগ করুন; পুরনো production migration silently rewrite করবেন না।
