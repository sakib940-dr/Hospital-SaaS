-- Hospital Cloud multi-tenant schema migration
-- Run once in Supabase SQL Editor. Every statement is safe to run again.

create extension if not exists "pgcrypto";

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subdomain text not null unique,
  custom_domain text unique,
  logo_url text,
  favicon_url text,
  plan text not null default 'starter',
  status text not null default 'trial',
  seo_title text,
  seo_description text,
  google_business_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'hospitals_status_check') then
    alter table public.hospitals add constraint hospitals_status_check check (status in ('trial','active','suspended'));
  end if;
end $$;

create table if not exists public.hospital_admins (
  user_id uuid not null references auth.users(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  primary key (user_id, hospital_id)
);

create table if not exists public.super_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  event_type text not null,
  entity_type text,
  entity_id text,
  session_id text not null,
  created_at timestamptz not null default now()
);

-- Preserve rows from the original single-tenant project under one legacy tenant.
insert into public.hospitals (id, name, subdomain, status, onboarding_completed)
values ('00000000-0000-0000-0000-000000000001', 'Legacy Hospital', 'legacy', 'suspended', true)
on conflict do nothing;

alter table if exists public.hospital_info add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.hospital_info add column if not exists social_links jsonb;
alter table if exists public.doctors add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.services add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.diseases add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.reviews add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.appointments add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.treatment_costs add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.investigation_costs add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.slider_images add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.gallery_categories add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table if exists public.gallery_images add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;

update public.hospital_info set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.doctors set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.services set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.diseases set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.reviews set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.appointments set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.treatment_costs set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.investigation_costs set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.slider_images set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.gallery_categories set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;
update public.gallery_images set hospital_id = '00000000-0000-0000-0000-000000000001' where hospital_id is null;

alter table if exists public.hospital_info alter column hospital_id set not null;
alter table if exists public.doctors alter column hospital_id set not null;
alter table if exists public.services alter column hospital_id set not null;
alter table if exists public.diseases alter column hospital_id set not null;
alter table if exists public.reviews alter column hospital_id set not null;
alter table if exists public.appointments alter column hospital_id set not null;
alter table if exists public.treatment_costs alter column hospital_id set not null;
alter table if exists public.investigation_costs alter column hospital_id set not null;
alter table if exists public.slider_images alter column hospital_id set not null;
alter table if exists public.gallery_categories alter column hospital_id set not null;
alter table if exists public.gallery_images alter column hospital_id set not null;

-- hospital_info used id=1 as a global singleton; it is now one singleton per tenant.
alter table if exists public.hospital_info drop constraint if exists hospital_info_pkey;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'hospital_info_hospital_id_id_pkey') then
    alter table public.hospital_info add constraint hospital_info_hospital_id_id_pkey primary key (hospital_id, id);
  end if;
end $$;

-- Gallery category IDs repeat between hospitals, so use a tenant-aware composite key/FK.
alter table if exists public.gallery_images drop constraint if exists gallery_images_category_id_fkey;
alter table if exists public.gallery_categories drop constraint if exists gallery_categories_pkey;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'gallery_categories_hospital_id_id_pkey') then
    alter table public.gallery_categories add constraint gallery_categories_hospital_id_id_pkey primary key (hospital_id, id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'gallery_images_tenant_category_fkey') then
    alter table public.gallery_images add constraint gallery_images_tenant_category_fkey foreign key (hospital_id, category_id) references public.gallery_categories(hospital_id, id) on delete cascade;
  end if;
end $$;

insert into public.gallery_categories (hospital_id, id, label, icon, sort_order)
select h.id, seed.id, seed.label::jsonb, seed.icon, seed.sort_order
from public.hospitals h
cross join (values
  ('hospital', '{"bn":"হাসপাতাল","en":"Hospital"}', 'Building2', 1),
  ('doctors', '{"bn":"ডাক্তার","en":"Doctors"}', 'Stethoscope', 2),
  ('staff', '{"bn":"স্টাফ","en":"Staff"}', 'Users', 3),
  ('ot', '{"bn":"অপারেশন থিয়েটার","en":"Operation Theatre"}', 'Microscope', 4),
  ('success', '{"bn":"সাফল্যের গল্প","en":"Success Stories"}', 'Award', 5)
) as seed(id, label, icon, sort_order)
on conflict (hospital_id, id) do nothing;

create or replace function public.seed_hospital_gallery_categories()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.gallery_categories (hospital_id, id, label, icon, sort_order) values
    (new.id, 'hospital', '{"bn":"হাসপাতাল","en":"Hospital"}', 'Building2', 1),
    (new.id, 'doctors', '{"bn":"ডাক্তার","en":"Doctors"}', 'Stethoscope', 2),
    (new.id, 'staff', '{"bn":"স্টাফ","en":"Staff"}', 'Users', 3),
    (new.id, 'ot', '{"bn":"অপারেশন থিয়েটার","en":"Operation Theatre"}', 'Microscope', 4),
    (new.id, 'success', '{"bn":"সাফল্যের গল্প","en":"Success Stories"}', 'Award', 5)
  on conflict (hospital_id, id) do nothing;
  return new;
end $$;
drop trigger if exists trg_seed_hospital_gallery_categories on public.hospitals;
create trigger trg_seed_hospital_gallery_categories after insert on public.hospitals
for each row execute function public.seed_hospital_gallery_categories();

alter table if exists public.appointments add column if not exists preferred_time time;
alter table if exists public.appointments add column if not exists admin_note text;
alter table if exists public.appointments add column if not exists reviewed_at timestamptz;
update public.appointments set status = 'approved' where status = 'confirmed';
update public.appointments set status = 'rejected' where status = 'cancelled';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_status_check') then
    alter table public.appointments add constraint appointments_status_check check (status in ('pending','approved','rejected'));
  end if;
end $$;

create unique index if not exists idx_hospitals_subdomain on public.hospitals(lower(subdomain));
create unique index if not exists idx_hospitals_custom_domain on public.hospitals(lower(custom_domain)) where custom_domain is not null;
create index if not exists idx_hospitals_status on public.hospitals(status);
create index if not exists idx_hospital_admins_user on public.hospital_admins(user_id);
create index if not exists idx_hospital_admins_hospital on public.hospital_admins(hospital_id);
create index if not exists idx_analytics_hospital_created on public.analytics_events(hospital_id, created_at desc);
create index if not exists idx_analytics_event_type on public.analytics_events(event_type);
create index if not exists idx_appointments_hospital_status on public.appointments(hospital_id, status);
create index if not exists idx_appointments_hospital_date on public.appointments(hospital_id, preferred_date);
create index if not exists idx_doctors_hospital_active on public.doctors(hospital_id, is_active);
create index if not exists idx_services_hospital_active on public.services(hospital_id, is_active);
create index if not exists idx_reviews_hospital_published on public.reviews(hospital_id, is_published);
create index if not exists idx_gallery_images_hospital_category on public.gallery_images(hospital_id, category_id);
create index if not exists idx_hospital_info_hospital on public.hospital_info(hospital_id);
create index if not exists idx_diseases_hospital on public.diseases(hospital_id);
create index if not exists idx_treatment_costs_hospital on public.treatment_costs(hospital_id);
create index if not exists idx_investigation_costs_hospital on public.investigation_costs(hospital_id);
create index if not exists idx_slider_images_hospital on public.slider_images(hospital_id);

insert into storage.buckets (id, name, public)
values ('hospital-assets', 'hospital-assets', true)
on conflict (id) do update set public = true;
