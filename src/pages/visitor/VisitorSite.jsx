import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Heart, MapPin, MessageCircle, Phone, Star, Stethoscope } from "lucide-react";
import SeoHead from "../../components/SeoHead.jsx";
import { Badge, Button, Card, Field, Input, Select, Skeleton, Textarea, useToast } from "../../components/ui/index.js";
import { useHospital } from "../../context/HospitalContext.jsx";
import { trackEvent } from "../../lib/analytics.js";
import { createAppointment } from "../../lib/api/appointments.js";
import { supabase } from "../../lib/supabaseClient.js";
import { isValidPhone, sanitizePhone, sanitizeText } from "../../lib/validation.js";

const text = (value, fallback = "") => typeof value === "string" ? value : value?.bn || value?.en || fallback;

function safeWebUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function isGoogleMapsEmbedUrl(value) {
  try {
    const url = new URL(value);
    const isGoogleHost = url.hostname === "google.com" || url.hostname.endsWith(".google.com");
    return url.protocol === "https:" && isGoogleHost && (url.pathname.includes("/maps/embed") || url.searchParams.get("output") === "embed");
  } catch {
    return false;
  }
}

function StatePage({ title, description }) {
  return <main className="grid min-h-screen place-items-center bg-surface-subtle p-5"><Card className="max-w-lg p-8 text-center"><img src="/favicon.svg" alt="" className="mx-auto size-14" /><h1 className="mt-5 text-3xl">{title}</h1><p className="mt-3 text-primary-500">{description}</p></Card></main>;
}

export default function VisitorSite() {
  const tenant = useHospital();
  const [content, setContent] = useState({ info: null, doctors: [], services: [], sliders: [], gallery: [], reviews: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant.status !== "found" || !supabase) return;
    let active = true;
    Promise.all([
      supabase.from("hospital_info").select("*").eq("hospital_id", tenant.hospital.id).maybeSingle(),
      supabase.from("doctors").select("*").eq("hospital_id", tenant.hospital.id).eq("is_active", true).order("sort_order"),
      supabase.from("services").select("*").eq("hospital_id", tenant.hospital.id).eq("is_active", true).order("sort_order"),
      supabase.from("slider_images").select("*").eq("hospital_id", tenant.hospital.id).eq("is_active", true).order("sort_order"),
      supabase.from("gallery_images").select("*").eq("hospital_id", tenant.hospital.id).eq("is_active", true).order("sort_order").limit(8),
      supabase.from("reviews").select("*").eq("hospital_id", tenant.hospital.id).eq("is_published", true).order("created_at", { ascending: false }).limit(6),
    ]).then(([info, doctors, services, sliders, gallery, reviews]) => { if (active) { setContent({ info: info.data, doctors: doctors.data || [], services: services.data || [], sliders: sliders.data || [], gallery: gallery.data || [], reviews: reviews.data || [] }); setLoading(false); } });
    return () => { active = false; };
  }, [tenant.status, tenant.hospital?.id]);

  if (tenant.status === "loading") return <StatePage title="হাসপাতালের তথ্য লোড হচ্ছে…" description="একটু অপেক্ষা করুন।" />;
  if (tenant.status === "configuration") return <StatePage title="সেটআপ সম্পূর্ণ নয়" description="Supabase environment variables যোগ করার পর tenant website দেখা যাবে।" />;
  if (tenant.status === "not-found") return <StatePage title="হাসপাতাল পাওয়া যায়নি" description="Subdomain বা domain ঠিক আছে কিনা যাচাই করুন।" />;
  if (tenant.status === "suspended") return <StatePage title="ওয়েবসাইটটি সাময়িকভাবে বন্ধ" description="সহায়তার জন্য প্ল্যাটফর্ম কর্তৃপক্ষের সঙ্গে যোগাযোগ করুন।" />;
  if (tenant.status === "error") return <StatePage title="তথ্য লোড করা যায়নি" description={tenant.error?.message || "আবার চেষ্টা করুন।"} />;
  if (tenant.status !== "found") return null;
  return <Site hospital={tenant.hospital} content={content} loading={loading} />;
}

function Site({ hospital, content, loading }) {
  const info = content.info || {};
  const name = hospital.name || info.name_bn || "হাসপাতাল";
  const whatsappNumber = String(info.social_links?.whatsapp || "").replace(/\D/g, "");
  const googleBusinessUrl = safeWebUrl(hospital.google_business_url);
  return (
    <main className="min-h-screen bg-surface-subtle">
      <SeoHead hospital={{ ...hospital, name }} />
      <header className="sticky top-0 z-30 border-b border-primary-100 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8"><a href="#home" className="flex items-center gap-3 font-bold text-primary-900">{hospital.logo_url ? <img src={hospital.logo_url} alt={`${name} লোগো`} className="size-10 rounded-lg object-cover" /> : <img src="/favicon.svg" alt="" className="size-10" />}<span className="max-w-48 leading-tight sm:max-w-none">{name}</span></a><a href="#appointment"><Button size="sm" variant="accent"><Calendar className="size-4" /> অ্যাপয়েন্টমেন্ট</Button></a></div></header>
      {content.sliders.length > 0 && <AutoSlider slides={content.sliders} />}
      <section id={content.sliders.length ? undefined : "home"} className={`bg-primary-900 px-5 text-white sm:px-8 ${content.sliders.length ? "py-10" : "py-15 lg:py-22"}`}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="caption font-semibold text-accent">আপনার সুস্থতার বিশ্বস্ত সঙ্গী</p>
            {content.sliders.length ? <h2 className="mt-3 text-white">{info.motto_bn || `${name}-এ মানসম্মত চিকিৎসা সেবা`}</h2> : <h1 className="mt-3 text-white">{info.motto_bn || `${name}-এ মানসম্মত চিকিৎসা সেবা`}</h1>}
            <p className="mt-5 max-w-2xl text-lg text-primary-100">{info.about_bn || "অভিজ্ঞ চিকিৎসক, আন্তরিক সেবা এবং সহজ অনলাইন অ্যাপয়েন্টমেন্ট।"}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#appointment"><Button variant="accent" size="lg">অ্যাপয়েন্টমেন্ট নিন</Button></a>
              {info.phone && <a href={`tel:${info.phone}`}><Button variant="secondary" size="lg" className="border-white/25 bg-transparent text-white hover:bg-white/10"><Phone className="size-4" /> কল করুন</Button></a>}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(hospital.id, "whatsapp_click")}
                >
                  <Button variant="secondary" size="lg" className="border-white/25 bg-transparent text-white hover:bg-white/10"><MessageCircle className="size-4" /> WhatsApp</Button>
                </a>
              )}
            </div>
          </div>
          <Card className="border-white/10 bg-white/10 p-6 text-white shadow-none backdrop-blur">
            <Stethoscope className="size-10 text-accent" />
            <h2 className="mt-4 text-2xl text-white">সেবার সময়</h2>
            <p className="mt-2 text-primary-100">অ্যাপয়েন্টমেন্টের আগে ফোন করে সময় নিশ্চিত করুন।</p>
            {info.address_bn && <p className="mt-4 flex gap-2 text-sm text-primary-100"><MapPin className="mt-0.5 size-4 shrink-0" />{info.address_bn}</p>}
          </Card>
        </div>
      </section>
      <section className="px-5 py-15 sm:px-8" id="services"><div className="mx-auto max-w-6xl"><SectionTitle eyebrow="আমাদের সেবা" title="প্রয়োজনীয় চিকিৎসা এক জায়গায়" />{loading ? <LoadingGrid /> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{content.services.map((service) => <Card key={service.id} tabIndex={0} onFocus={() => trackEvent(hospital.id, "service_view", "service", service.id)} onMouseEnter={() => trackEvent(hospital.id, "service_view", "service", service.id)} className="p-5"><span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary-700"><Stethoscope className="size-5" /></span><h3 className="mt-4 text-xl">{text(service.name)}</h3><p className="mt-2 text-primary-500">{text(service.description, "বিস্তারিত জানতে যোগাযোগ করুন।")}</p></Card>)}</div>}</div></section>
      <section className="bg-surface-muted px-5 py-15 sm:px-8" id="doctors"><div className="mx-auto max-w-6xl"><SectionTitle eyebrow="চিকিৎসক দল" title="অভিজ্ঞ ও যত্নশীল ডাক্তারবৃন্দ" />{loading ? <LoadingGrid /> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{content.doctors.map((doctor) => <Card key={doctor.id} onMouseEnter={() => trackEvent(hospital.id, "doctor_view", "doctor", doctor.id)} className="overflow-hidden">{doctor.photo ? <img src={doctor.photo} alt={text(doctor.name)} loading="lazy" className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-primary-50"><Stethoscope className="size-12 text-primary-300" /></div>}<div className="p-5"><Badge>{text(doctor.spec)}</Badge><h3 className="mt-3 text-xl">{text(doctor.name)}</h3><p className="mt-1 text-sm text-primary-500">{text(doctor.degree)}</p><Button variant="ghost" size="sm" className="mt-3 px-0" onClick={() => trackEvent(hospital.id, "doctor_save", "doctor", doctor.id)}><Heart className="size-4" /> পছন্দের তালিকায় রাখুন</Button></div></Card>)}</div>}</div></section>
      {content.gallery.length > 0 && <section className="px-5 py-15 sm:px-8"><div className="mx-auto max-w-6xl"><SectionTitle eyebrow="গ্যালারি" title="হাসপাতালের কিছু মুহূর্ত" /><div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">{content.gallery.map((item) => <figure key={item.id} className="overflow-hidden rounded-xl bg-primary-100"><img src={item.image} alt={text(item.caption, "হাসপাতালের ছবি")} loading="lazy" className="aspect-square size-full object-cover" /><figcaption className="sr-only">{text(item.caption)}</figcaption></figure>)}</div></div></section>}
      {(content.reviews.length > 0 || googleBusinessUrl) && (
        <section className="bg-white px-5 py-15 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionTitle eyebrow="রোগীদের মতামত" title="যারা সেবা নিয়েছেন" />
            {content.reviews.length > 0 && <div className="mt-8 grid gap-5 md:grid-cols-3">{content.reviews.map((review) => <Card key={review.id} className="p-5"><div className="flex text-accent">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="size-4" fill="currentColor" />)}</div><p className="mt-3 text-primary-600">“{text(review.text, review.comment)}”</p><p className="mt-3 text-sm font-semibold">{review.name}</p></Card>)}</div>}
            {googleBusinessUrl && (
              <a href={googleBusinessUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex">
                <Button variant="secondary"><Star className="size-4" /> Google-এ আমাদের রিভিউ দিন</Button>
              </a>
            )}
          </div>
        </section>
      )}
      <AppointmentForm hospitalId={hospital.id} doctors={content.doctors} />
      <ContactMap info={info} />
      <footer className="bg-primary-900 px-5 py-8 text-center text-sm text-primary-200">© {new Date().getFullYear()} {name}</footer>
    </main>
  );
}

function SectionTitle({ eyebrow, title }) { return <div className="max-w-2xl"><p className="caption font-semibold text-primary-600">{eyebrow}</p><h2 className="mt-2">{title}</h2></div>; }
function LoadingGrid() { return <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Card key={item} className="space-y-3 p-5"><Skeleton className="h-11 w-11" /><Skeleton className="h-6 w-2/3" /><Skeleton className="h-16" /></Card>)}</div>; }

function AutoSlider({ slides }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    setActive((current) => Math.min(current, slides.length - 1));
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const current = slides[active];
  if (!current) return null;
  const move = (direction) => setActive((index) => (index + direction + slides.length) % slides.length);
  return (
    <section id="home" className="relative overflow-hidden bg-primary-900" aria-roledescription="carousel" aria-label="হাসপাতালের ব্যানার">
      <img key={current.id} src={current.image} alt={text(current.caption, "হাসপাতালের ব্যানার")} className="h-[24rem] w-full object-cover sm:h-[32rem]" />
      <div className="absolute inset-0 bg-primary-900/55" />
      <div className="absolute inset-0 flex items-end"><div className="mx-auto w-full max-w-6xl px-5 pb-12 text-white sm:px-8 sm:pb-16"><p className="caption font-semibold text-accent">বিশ্বস্ত স্বাস্থ্যসেবা</p><h1 className="mt-3 max-w-3xl text-white">{text(current.caption)}</h1><a href="#appointment" className="mt-6 inline-flex"><Button variant="accent" size="lg">অ্যাপয়েন্টমেন্ট নিন</Button></a></div></div>
      {slides.length > 1 && <><button type="button" onClick={() => move(-1)} aria-label="আগের ব্যানার" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary-900 shadow-sm transition hover:bg-white sm:left-6"><ChevronLeft /></button><button type="button" onClick={() => move(1)} aria-label="পরের ব্যানার" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary-900 shadow-sm transition hover:bg-white sm:right-6"><ChevronRight /></button><div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">{slides.map((slide, index) => <button key={slide.id} type="button" onClick={() => setActive(index)} aria-label={`${index + 1} নম্বর ব্যানার দেখুন`} aria-current={index === active} className={`h-2.5 rounded-full transition-all ${index === active ? "w-8 bg-accent" : "w-2.5 bg-white/70"}`} />)}</div></>}
    </section>
  );
}

function ContactMap({ info }) {
  const mapLink = safeWebUrl(info.google_map_link);
  if (!mapLink) return null;
  const address = info.address_bn || info.address_en || "মানচিত্রে হাসপাতালের অবস্থান দেখুন";
  return (
    <section className="bg-surface-muted px-5 py-15 sm:px-8" aria-labelledby="contact-map-title">
      <div className="mx-auto max-w-6xl">
        <p className="caption font-semibold text-primary-600">যোগাযোগ</p>
        <h2 id="contact-map-title" className="mt-2">হাসপাতালের অবস্থান</h2>
        {isGoogleMapsEmbedUrl(mapLink) ? (
          <div className="mt-7 overflow-hidden rounded-xl border border-primary-100 bg-white shadow-card">
            <iframe
              title="হাসপাতালের Google Map"
              src={mapLink}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-80 w-full border-0 sm:h-96"
            />
          </div>
        ) : (
          <Card className="mt-7 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700"><MapPin className="size-5" /></span>
            <p className="flex-1 text-primary-600">{address}</p>
            <a href={mapLink} target="_blank" rel="noopener noreferrer"><Button variant="secondary">Google Maps-এ দেখুন</Button></a>
          </Card>
        )}
      </div>
    </section>
  );
}

function AppointmentForm({ hospitalId, doctors }) {
  const toast = useToast();
  const initial = useMemo(() => ({ name: "", mobile: "", doctor_id: "", preferred_date: "", preferred_time: "", problem: "" }), []);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault();
    const clean = { ...form, name: sanitizeText(form.name, 100), mobile: sanitizePhone(form.mobile), problem: sanitizeText(form.problem, 1000), doctor_id: form.doctor_id ? Number(form.doctor_id) : null };
    if (!clean.name || !isValidPhone(clean.mobile) || !clean.preferred_date) { toast.error("নাম, সঠিক ফোন নম্বর ও তারিখ দিন।"); return; }
    setLoading(true);
    const { error } = await createAppointment(hospitalId, clean);
    setLoading(false);
    if (error) toast.error(error.message || "অ্যাপয়েন্টমেন্ট পাঠানো যায়নি।");
    else { trackEvent(hospitalId, "appointment_submit", "appointment"); toast.success("অ্যাপয়েন্টমেন্ট অনুরোধ পাঠানো হয়েছে।"); setForm(initial); }
  }
  return <section id="appointment" className="bg-primary-900 px-5 py-15 sm:px-8"><Card className="mx-auto max-w-3xl p-5 sm:p-8"><p className="caption font-semibold text-primary-600">অনলাইন বুকিং</p><h2 className="mt-2">অ্যাপয়েন্টমেন্ট অনুরোধ</h2><form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="রোগীর নাম" required><Input required maxLength={100} placeholder="উদাহরণ: মো. কামাল হোসেন" value={form.name} onChange={(e) => set("name", e.target.value)} /></Field><Field label="মোবাইল নম্বর" required hint="দেশের কোডসহ ১০–১৬টি সংখ্যা দিন।"><Input required inputMode="tel" placeholder="উদাহরণ: 01711123456" pattern="[+0-9 -]{10,20}" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field><Field label="পছন্দের ডাক্তার" hint="নির্দিষ্ট ডাক্তার না চাইলে ‘যেকোনো ডাক্তার’ রাখুন।"><Select value={form.doctor_id} onChange={(e) => set("doctor_id", e.target.value)}><option value="">যেকোনো ডাক্তার</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{text(doctor.name)}</option>)}</Select></Field><Field label="পছন্দের তারিখ" required><Input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.preferred_date} onChange={(e) => set("preferred_date", e.target.value)} /></Field><Field label="পছন্দের সময়" hint="সময় নিশ্চিত না হলে খালি রাখতে পারেন।"><Input type="time" value={form.preferred_time} onChange={(e) => set("preferred_time", e.target.value)} /></Field><Field label="সমস্যার সংক্ষিপ্ত বিবরণ" hint="লক্ষণ বা appointment-এর কারণ সংক্ষেপে লিখুন।" className="sm:col-span-2"><Textarea maxLength={1000} placeholder="উদাহরণ: তিন দিন ধরে জ্বর ও মাথাব্যথা হচ্ছে।" value={form.problem} onChange={(e) => set("problem", e.target.value)} /></Field><div className="sm:col-span-2"><Button type="submit" loading={loading} variant="accent">অনুরোধ পাঠান</Button></div></form></Card></section>;
}
