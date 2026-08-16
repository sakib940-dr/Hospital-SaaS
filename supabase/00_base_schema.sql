-- Hospital Cloud base content schema
-- Clean Supabase project-এ এই ফাইলটি সবার আগে run করুন।
-- এরপর 01_multi_tenant_migration.sql এবং 02_rls_policies.sql run করতে হবে।

create extension if not exists "pgcrypto";

create table if not exists public.hospital_info (
  id integer primary key default 1,
  logo_url text,
  name_bn text,
  name_en text,
  about_bn text,
  about_en text,
  motto_bn text,
  motto_en text,
  intro_title_bn text,
  intro_title_en text,
  intro_paragraphs_bn jsonb,
  intro_paragraphs_en jsonb,
  experience_value_bn text,
  experience_value_en text,
  experience_label_bn text,
  experience_label_en text,
  total_doctors_value_bn text,
  total_doctors_value_en text,
  total_doctors_label_bn text,
  total_doctors_label_en text,
  total_patients_value_bn text,
  total_patients_value_en text,
  total_patients_label_bn text,
  total_patients_label_en text,
  total_surgeries_value_bn text,
  total_surgeries_value_en text,
  total_surgeries_label_bn text,
  total_surgeries_label_en text,
  total_staff_value_bn text,
  total_staff_value_en text,
  total_staff_label_bn text,
  total_staff_label_en text,
  address_bn text,
  address_en text,
  phone text,
  phone_display text,
  email text,
  google_map_link text,
  social_links jsonb,
  updated_at timestamptz default now(),
  constraint hospital_info_singleton check (id = 1)
);

insert into public.hospital_info (id) values (1) on conflict (id) do nothing;

create table if not exists public.doctors (
  id bigint generated always as identity primary key,
  photo text,
  name jsonb not null,
  degree jsonb,
  bmdc_number text,
  spec jsonb not null,
  medical_college jsonb,
  designation jsonb,
  exp text,
  fee integer,
  chamber jsonb,
  bio jsonb,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.services (
  id bigint generated always as identity primary key,
  name jsonb not null,
  description jsonb,
  icon text,
  image text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.diseases (
  id bigint generated always as identity primary key,
  name jsonb not null,
  symptoms jsonb not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating smallint not null check (rating between 1 and 5),
  text jsonb,
  comment text,
  reply jsonb,
  replied_at timestamptz,
  is_published boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null,
  age integer,
  gender text,
  problem text,
  doctor_id bigint references public.doctors(id),
  preferred_date date,
  lang text default 'bn',
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.treatment_costs (
  id bigint generated always as identity primary key,
  name jsonb not null,
  cost jsonb not null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.investigation_costs (
  id bigint generated always as identity primary key,
  name jsonb not null,
  cost jsonb not null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.slider_images (
  id bigint generated always as identity primary key,
  image text,
  icon text,
  caption jsonb not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.gallery_categories (
  id text primary key,
  label jsonb not null,
  icon text,
  sort_order integer default 0
);

insert into public.gallery_categories (id, label, icon, sort_order) values
  ('hospital', '{"bn":"হাসপাতাল","en":"Hospital"}', 'Building2', 1),
  ('doctors', '{"bn":"ডাক্তার","en":"Doctors"}', 'Stethoscope', 2),
  ('staff', '{"bn":"স্টাফ","en":"Staff"}', 'Users', 3),
  ('ot', '{"bn":"অপারেশন থিয়েটার","en":"Operation Theatre"}', 'Microscope', 4),
  ('success', '{"bn":"সাফল্যের গল্প","en":"Success Stories"}', 'Award', 5)
on conflict (id) do nothing;

create table if not exists public.gallery_images (
  id bigint generated always as identity primary key,
  category_id text references public.gallery_categories(id) on delete cascade,
  image text,
  caption jsonb not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_gallery_images_category on public.gallery_images(category_id);
create index if not exists idx_appointments_doctor on public.appointments(doctor_id);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_doctors_active on public.doctors(is_active);
create index if not exists idx_services_active on public.services(is_active);
