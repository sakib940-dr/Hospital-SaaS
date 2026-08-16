# Step 19 — Security & QA log

## Automated checks

- `npm test`: tenant resolver এবং sanitization-এর ৬টি test pass।
- Covered hostname cases: marketing root, super-admin hostname, tenant subdomain, custom domain এবং localhost `?hospital=` override।
- Covered input cases: lowercase/hyphen subdomain, malformed subdomain, phone, custom domain, control-character stripping এবং max length।
- Browser render test: component library preview loaded, accessible modal opened, console error ছিল না; preview file পরে সরানো হয়েছে।
- Secret grep: `SUPABASE_SERVICE_ROLE_KEY` ও `VERCEL_API_TOKEN` শুধু `api/` এবং example env/docs-এ আছে; `src/` client bundle-এ নেই।
- React Router ও Vite security upgrade-এর পর `npm audit` এবং `npm audit --omit=dev`—দুটোতেই `0 vulnerabilities`।

## Code-level fixes

- Appointment form-এ required name/mobile/date, phone regex, maximum lengths এবং control-character-safe text sanitizer আছে।
- Onboarding identity step skip করা যায় না; subdomain centralized sanitizer + regex দিয়ে lowercase, number ও single hyphen-এ সীমিত।
- Custom domain client এবং server—দুই জায়গায় validate হয়। Server endpoint bearer token যাচাই করে এবং caller-এর tenant membership/super-admin role নিশ্চিত করে।
- New tenant creation direct public insert নয়; authenticated `create_hospital_tenant()` security-definer RPC atomically hospital ও owner membership তৈরি করে।
- Storage write policy path-এর প্রথম folder UUID দিয়ে admin-এর tenant ownership যাচাই করে।

## দুই-tenant RLS smoke test setup

1. Supabase Authentication → Users-এ দুইটি test user তৈরি করুন।
2. SQL Editor-এ দুইটি trial hospital ও membership দিন (UUIDগুলো dashboard থেকে বসান):

```sql
insert into public.hospitals (name, subdomain, status)
values ('RLS Hospital A', 'rls-a', 'trial'), ('RLS Hospital B', 'rls-b', 'trial');

insert into public.hospital_admins (user_id, hospital_id, role)
select 'USER_A_UUID', id, 'owner' from public.hospitals where subdomain = 'rls-a';

insert into public.hospital_admins (user_id, hospital_id, role)
select 'USER_B_UUID', id, 'owner' from public.hospitals where subdomain = 'rls-b';
```

3. `.env.rls-test.example` কপি করে `.env.rls-test` বানান এবং test credentials দিন।
4. `npm run test:rls` চালান। Script প্রত্যেক admin-এর own-tenant INSERT/read এবং other-tenant INSERT block যাচাই করে; নিজের temporary row শেষে delete করে।
5. Test শেষে test users/hospitals Supabase dashboard থেকে remove করুন।

SQL Editor service role হিসেবে RLS bypass করে, তাই cross-tenant assertion SQL Editor থেকে নয়—উপরের signed-in anon-client script দিয়েই চালাতে হবে। এই workspace-এ live Supabase credentials না থাকায় remote RLS smoke test চালানো হয়নি।

## Manual browser states

- Unknown tenant: `http://localhost:5173/?hospital=does-not-exist`
- Suspended tenant: Supabase-এ test hospital status `suspended` করে তার slug দিয়ে visit করুন।
- Expected: unknown-এ “হাসপাতাল পাওয়া যায়নি”, suspended-এ “ওয়েবসাইটটি সাময়িকভাবে বন্ধ” state।
