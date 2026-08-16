-- 1. Supabase Dashboard → Authentication → Users থেকে প্রথম user তৈরি করুন।
-- 2. নিচের UUID-টি সেই user-এর UUID দিয়ে replace করুন।
-- 3. শুধু replace করার পর SQL Editor-এ run করুন।

insert into public.super_admins (user_id)
values ('REPLACE_WITH_AUTH_USER_UUID')
on conflict (user_id) do nothing;
