-- Run after 01_multi_tenant_migration.sql

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.super_admins where user_id = auth.uid()) $$;

create or replace function public.my_hospital_ids()
returns setof uuid language sql stable security definer set search_path = public
as $$ select hospital_id from public.hospital_admins where user_id = auth.uid() $$;

revoke all on function public.is_super_admin() from public;
revoke all on function public.my_hospital_ids() from public;
grant execute on function public.is_super_admin() to anon, authenticated;
grant execute on function public.my_hospital_ids() to authenticated;

create or replace function public.create_hospital_tenant(p_name text, p_subdomain text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select hospital_id into new_id
  from public.hospital_admins
  where user_id = auth.uid()
  order by created_at asc
  limit 1;
  if new_id is not null then return new_id; end if;
  if length(trim(p_name)) < 2 or length(trim(p_name)) > 120 then raise exception 'Invalid hospital name'; end if;
  if lower(trim(p_subdomain)) !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Invalid subdomain'; end if;
  insert into public.hospitals(name, subdomain, status, onboarding_completed)
  values(trim(p_name), lower(trim(p_subdomain)), 'trial', false)
  returning id into new_id;
  insert into public.hospital_admins(user_id, hospital_id, role) values(auth.uid(), new_id, 'owner');
  return new_id;
end $$;
revoke all on function public.create_hospital_tenant(text, text) from public;
grant execute on function public.create_hospital_tenant(text, text) to authenticated;

alter table public.hospitals enable row level security;
alter table public.hospital_admins enable row level security;
alter table public.super_admins enable row level security;
alter table public.analytics_events enable row level security;
alter table public.hospital_info enable row level security;
alter table public.doctors enable row level security;
alter table public.services enable row level security;
alter table public.diseases enable row level security;
alter table public.reviews enable row level security;
alter table public.appointments enable row level security;
alter table public.treatment_costs enable row level security;
alter table public.investigation_costs enable row level security;
alter table public.slider_images enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_images enable row level security;

drop policy if exists "public read available hospitals" on public.hospitals;
create policy "public read available hospitals" on public.hospitals for select to anon, authenticated using (status in ('active','trial'));
drop policy if exists "hospital admin read own hospital" on public.hospitals;
create policy "hospital admin read own hospital" on public.hospitals for select to authenticated using (id in (select public.my_hospital_ids()));
drop policy if exists "hospital admin update own hospital" on public.hospitals;
create policy "hospital admin update own hospital" on public.hospitals for update to authenticated using (id in (select public.my_hospital_ids())) with check (id in (select public.my_hospital_ids()));
drop policy if exists "super admin full hospitals" on public.hospitals;
create policy "super admin full hospitals" on public.hospitals for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "user read own hospital memberships" on public.hospital_admins;
create policy "user read own hospital memberships" on public.hospital_admins for select to authenticated using (user_id = auth.uid() or public.is_super_admin());
drop policy if exists "super admin manage hospital memberships" on public.hospital_admins;
create policy "super admin manage hospital memberships" on public.hospital_admins for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "super admin read own role" on public.super_admins;
create policy "super admin read own role" on public.super_admins for select to authenticated using (user_id = auth.uid());
drop policy if exists "super admin manage roles" on public.super_admins;
create policy "super admin manage roles" on public.super_admins for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

-- Tenant content: public read, own-hospital admin manage, platform admin full access.
do $policies$
declare t text;
begin
  foreach t in array array['hospital_info','doctors','services','diseases','reviews','treatment_costs','investigation_costs','slider_images','gallery_categories','gallery_images']
  loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin manage own" on public.%I', t);
    execute format('create policy "admin manage own" on public.%I for all to authenticated using (hospital_id in (select public.my_hospital_ids())) with check (hospital_id in (select public.my_hospital_ids()))', t);
    execute format('drop policy if exists "super admin full access" on public.%I', t);
    execute format('create policy "super admin full access" on public.%I for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin())', t);
  end loop;
end $policies$;

drop policy if exists "public create appointment" on public.appointments;
create policy "public create appointment" on public.appointments for insert to anon, authenticated
with check (
  exists(select 1 from public.hospitals h where h.id = hospital_id and h.status in ('active','trial'))
  and status = 'pending'
  and (doctor_id is null or exists(select 1 from public.doctors d where d.id = doctor_id and d.hospital_id = hospital_id and d.is_active = true))
);
drop policy if exists "admin read own appointments" on public.appointments;
create policy "admin read own appointments" on public.appointments for select to authenticated using (hospital_id in (select public.my_hospital_ids()));
drop policy if exists "admin update own appointments" on public.appointments;
create policy "admin update own appointments" on public.appointments for update to authenticated using (hospital_id in (select public.my_hospital_ids())) with check (hospital_id in (select public.my_hospital_ids()));
drop policy if exists "super admin full appointments" on public.appointments;
create policy "super admin full appointments" on public.appointments for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "public create analytics event" on public.analytics_events;
create policy "public create analytics event" on public.analytics_events for insert to anon, authenticated
with check (exists(select 1 from public.hospitals h where h.id = hospital_id and h.status in ('active','trial')));
drop policy if exists "admin read own analytics" on public.analytics_events;
create policy "admin read own analytics" on public.analytics_events for select to authenticated using (hospital_id in (select public.my_hospital_ids()));
drop policy if exists "super admin full analytics" on public.analytics_events;
create policy "super admin full analytics" on public.analytics_events for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "hospital assets public read" on storage.objects;
create policy "hospital assets public read" on storage.objects for select using (bucket_id = 'hospital-assets');
drop policy if exists "hospital admin upload own assets" on storage.objects;
create policy "hospital admin upload own assets" on storage.objects for insert to authenticated
with check (bucket_id = 'hospital-assets' and (storage.foldername(name))[1]::uuid in (select public.my_hospital_ids()));
drop policy if exists "hospital admin update own assets" on storage.objects;
create policy "hospital admin update own assets" on storage.objects for update to authenticated
using (bucket_id = 'hospital-assets' and (storage.foldername(name))[1]::uuid in (select public.my_hospital_ids()))
with check (bucket_id = 'hospital-assets' and (storage.foldername(name))[1]::uuid in (select public.my_hospital_ids()));
drop policy if exists "hospital admin delete own assets" on storage.objects;
create policy "hospital admin delete own assets" on storage.objects for delete to authenticated
using (bucket_id = 'hospital-assets' and (storage.foldername(name))[1]::uuid in (select public.my_hospital_ids()));
drop policy if exists "super admin full hospital assets" on storage.objects;
create policy "super admin full hospital assets" on storage.objects for all to authenticated
using (bucket_id = 'hospital-assets' and public.is_super_admin()) with check (bucket_id = 'hospital-assets' and public.is_super_admin());
