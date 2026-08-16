# Step 18 — Optimization log

## সম্পন্ন

- `src/App.jsx`-এর visitor, onboarding, hospital-admin, super-admin এবং প্রত্যেক বড় route `React.lazy()` + `Suspense` দিয়ে আলাদা chunk-এ split করা হয়েছে।
- Doctor, gallery এবং admin list-এর below-the-fold image-এ `loading="lazy"` আছে। Header logo, login logo ও loading mark প্রথম viewport হওয়ায় eager রাখা হয়েছে।
- Tenant lookup, authentication এবং charts route-level code split-এর সঙ্গে সামঞ্জস্য রেখে module boundary-তে রাখা হয়েছে।
- Migration indexes review করা হয়েছে: `hospital_id`, `subdomain`, `custom_domain`, `hospitals.status`, `appointments(hospital_id,status)`, analytics এবং active/public content lookup covered।
- Production build-এ route chunks আলাদা হয়েছে এবং কোনো compile error নেই।

## Bundle review

Vite 8 security upgrade-এর পর শেষ measured build-এ দুইটি বড় shared/feature chunk ছিল:

- Main/shared application chunk: প্রায় `210 kB` raw / `70 kB` gzip। React Router, Supabase client/auth এবং shared UI এখানে আছে।
- Recharts categorical chart chunk: প্রায় `347 kB` raw / `101 kB` gzip। এটি শুধু analytics route-এ lazy-load হয়, visitor বা সাধারণ admin page-এর initial load block করে না।

## Manual/future

- Production data দিয়ে Core Web Vitals (LCP/INP/CLS) মাপা।
- Supabase image upload-এর সময় resize/WebP pipeline যোগ করা।
- Analytics routes বেশি ব্যবহৃত হলে lighter SVG chart implementation বিবেচনা করা।
- Vercel Analytics/Sentry প্রয়োজন হলে founder approval নিয়ে যুক্ত করা।
