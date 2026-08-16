# Supabase SQL run order

Clean Supabase project-এ SQL Editor থেকে ঠিক এই ক্রমে run করুন:

1. `00_base_schema.sql`
2. `01_multi_tenant_migration.sql`
3. `02_rls_policies.sql`
4. Authentication → Users-এ প্রথম user তৈরি করুন।
5. `03_bootstrap_super_admin.example.sql`-এ user UUID বসিয়ে run করুন।

প্রতিটি file আলাদা query হিসেবে run করুন। প্রথম তিনটি সফল হওয়ার আগে application deploy করলেও database feature কাজ করবে না।

## Existing Supabase project হলে

- আগে schema backup নিন।
- `00_base_schema.sql` safe `IF NOT EXISTS` ব্যবহার করে, তাই run করা যাবে।
- তারপর `01` এবং `02` run করুন।
- WhatsApp-এর `social_links` column-সহ latest change `01`-এ আছে।

## Run করবেন না

- `.env` বা service-role key SQL Editor-এ paste করবেন না।
- `scripts/rls-smoke-test.mjs` SQL Editor-এ run করবেন না; এটি local Node test।
