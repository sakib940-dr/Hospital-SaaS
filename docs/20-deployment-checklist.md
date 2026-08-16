# Step 20 — Deployment & soft-launch checklist

## প্রথম deployment

- [ ] Supabase backup নিন।
- [ ] `01_multi_tenant_migration.sql`, তারপর `02_rls_policies.sql` রান করুন।
- [ ] Vercel environment variables Production/Preview—দুই environment-এ সঠিকভাবে দিন।
- [ ] Root domain এবং wildcard `*.hospitalcloud.com` Vercel project-এ যুক্ত করুন।
- [ ] একটি super-admin Auth user ও `super_admins` row তৈরি করুন।
- [ ] Login, onboarding, visitor appointment, appointment approve/reject এবং custom domain flow test করুন।

## Soft launch: ২–৩টি হাসপাতাল

1. একটি পরিচিত ছোট হাসপাতাল দিয়ে onboarding সম্পন্ন করুন।
2. দ্বিতীয় hospital দিয়ে cross-tenant visibility এবং RLS smoke test করুন।
3. তৃতীয় hospital-এ custom domain/DNS flow পরীক্ষা করুন।
4. ৭–১৪ দিন সীমিত ব্যবহার চালিয়ে appointment delivery, mobile usability এবং admin workflow feedback নিন।
5. Critical issue না থাকলে wildcard signup/marketing traffic ধীরে খুলুন।

## Post-launch monitoring

- Supabase Auth failure, API error এবং database/storage usage।
- Vercel function error rate ও custom-domain API response।
- Appointment submission বনাম admin action count।
- Analytics event volume ও unexpected bot spikes।
- LCP/INP/CLS, বিশেষ করে image-heavy visitor gallery।
- Supabase security advisor এবং dependency audit মাসে অন্তত একবার।
- Weekly DB backup restore drill ও rollback owner নির্ধারণ।
