import { useEffect, useState } from "react";
import { Check, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Field, Input, Textarea, useToast } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { clearOnboardingDraft, getOnboardingDraft } from "../../lib/pendingSignup.js";
import { supabase } from "../../lib/supabaseClient.js";
import { isValidSubdomain, sanitizePhone, sanitizeSubdomain, sanitizeText } from "../../lib/validation.js";

const steps = ["পরিচয়", "লোগো", "প্রথম ডাক্তার", "প্রথম সার্ভিস", "যোগাযোগ", "রিভিউ ও প্রকাশ"];
const initial = { name: "", subdomain: "", logo_url: "", doctor_name_bn: "", doctor_name_en: "", doctor_spec_bn: "", doctor_spec_en: "", service_name_bn: "", service_name_en: "", service_description_bn: "", address_bn: "", address_en: "", phone: "", whatsapp: "" };

export default function OnboardingWizard() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({ ...initial, ...(getOnboardingDraft() || {}) }));
  const [hospitalId, setHospitalId] = useState(auth.hospitalId);
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (auth.hospitalId) setHospitalId(auth.hospitalId);
  }, [auth.hospitalId]);

  async function saveIdentity() {
    const name = sanitizeText(form.name, 120);
    const subdomain = sanitizeSubdomain(form.subdomain);
    if (!name || !isValidSubdomain(subdomain)) {
      toast.error("নাম এবং lowercase/hyphen-only subdomain দিন।");
      return false;
    }
    if (!supabase) {
      toast.error("Supabase কনফিগার করা নেই");
      return false;
    }
    if (!auth.user) {
      toast.error("Onboarding শুরু করতে লগইন করুন।");
      navigate("/login");
      return false;
    }

    setBusy(true);
    let id = hospitalId;
    if (id) {
      const { error } = await supabase.from("hospitals").update({ name, subdomain }).eq("id", id);
      if (error) {
        setBusy(false);
        toast.error(error.message);
        return false;
      }
    } else {
      const { data, error } = await supabase.rpc("create_hospital_tenant", { p_name: name, p_subdomain: subdomain });
      if (error) {
        setBusy(false);
        toast.error(error.message);
        return false;
      }
      id = data;
      setHospitalId(id);
    }
    setBusy(false);
    return true;
  }

  async function next() {
    if (step === 0 && !(await saveIdentity())) return;
    setStep((current) => Math.min(5, current + 1));
  }

  async function upload(file) {
    if (!hospitalId) return toast.error("আগে পরিচয় ধাপ সম্পন্ন করুন।");
    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "png";
    setBusy(true);
    const path = `${hospitalId}/logo.${extension}`;
    const { error } = await supabase.storage.from("hospital-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (error) toast.error(error.message);
    else {
      const url = supabase.storage.from("hospital-assets").getPublicUrl(path).data.publicUrl;
      set("logo_url", url);
      await supabase.from("hospitals").update({ logo_url: url }).eq("id", hospitalId);
      toast.success("লোগো আপলোড হয়েছে।");
    }
    setBusy(false);
  }

  async function publish() {
    if (!hospitalId) return;
    setBusy(true);
    const tasks = [
      supabase.from("hospitals").update({ name: sanitizeText(form.name, 120), subdomain: sanitizeSubdomain(form.subdomain), status: "active", logo_url: form.logo_url || null, onboarding_completed: true }).eq("id", hospitalId),
      supabase.from("hospital_info").upsert({ id: 1, hospital_id: hospitalId, name_bn: sanitizeText(form.name, 120), address_bn: sanitizeText(form.address_bn, 500) || null, address_en: sanitizeText(form.address_en, 500) || null, phone: sanitizePhone(form.phone) || null, social_links: { whatsapp: sanitizePhone(form.whatsapp) || null } }, { onConflict: "hospital_id,id" }),
    ];
    if (form.doctor_name_bn.trim()) tasks.push(supabase.from("doctors").insert({ hospital_id: hospitalId, name: { bn: sanitizeText(form.doctor_name_bn, 120), en: sanitizeText(form.doctor_name_en, 120) }, spec: { bn: sanitizeText(form.doctor_spec_bn, 120) || "সাধারণ চিকিৎসক", en: sanitizeText(form.doctor_spec_en, 120) }, is_active: true }));
    if (form.service_name_bn.trim()) tasks.push(supabase.from("services").insert({ hospital_id: hospitalId, name: { bn: sanitizeText(form.service_name_bn, 120), en: sanitizeText(form.service_name_en, 120) }, description: { bn: sanitizeText(form.service_description_bn, 1000), en: "" }, is_active: true }));
    const results = await Promise.all(tasks);
    setBusy(false);
    const error = results.find((result) => result.error)?.error;
    if (error) return toast.error(error.message);
    clearOnboardingDraft();
    await auth.refreshRole(auth.user.id);
    toast.success("হাসপাতালের website প্রকাশিত হয়েছে।");
    navigate("/admin", { replace: true });
  }

  return <main className="min-h-screen bg-surface-subtle px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl"><div className="mb-7"><p className="caption font-semibold text-primary-600">Setup wizard</p><h1 className="mt-1 text-3xl">হাসপাতাল সেটআপ</h1><div className="mt-6 grid grid-cols-6 gap-2">{steps.map((label, index) => <div key={label} className="min-w-0"><div className={`h-2 rounded-full ${index <= step ? "bg-accent" : "bg-primary-100"}`} /><p className={`mt-2 hidden truncate text-xs sm:block ${index === step ? "font-semibold text-primary-900" : "text-primary-500"}`}>{label}</p></div>)}</div></div><Card className="p-5 sm:p-8"><StepContent step={step} form={form} set={set} upload={upload} /><div className="mt-8 flex flex-wrap justify-between gap-3"><Button variant="secondary" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>পেছনে</Button><div className="flex gap-2">{step > 0 && step < 5 && <Button variant="ghost" onClick={next}>স্কিপ</Button>}{step < 5 ? <Button loading={busy} onClick={next}>পরের ধাপ</Button> : <Button variant="accent" loading={busy} onClick={publish}><Check className="size-4" /> পাবলিশ</Button>}</div></div></Card></div></main>;
}

function StepContent({ step, form, set, upload }) {
  if (step === 0) return <div><h2 className="text-2xl">হাসপাতালের পরিচয়</h2><p className="mt-2 text-primary-500">এই তথ্য visitor website-এর নাম ও address তৈরি করবে।</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="হাসপাতালের নাম" required hint="Official বা পরিচিত নামটি লিখুন।"><Input required maxLength={120} placeholder="উদাহরণ: সিরাজগঞ্জ জেনারেল হাসপাতাল" value={form.name} onChange={(event) => set("name", event.target.value)} /></Field><Field label="Subdomain" required hint="ছোট হাতের English letter, number ও hyphen; যেমন sirajganj-general"><Input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="উদাহরণ: sirajganj-general" value={form.subdomain} onChange={(event) => set("subdomain", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} /></Field></div></div>;
  if (step === 1) return <div><h2 className="text-2xl">লোগো</h2><p className="mt-2 text-primary-500">Square PNG/SVG/WebP সবচেয়ে ভালো দেখায়। Logo না থাকলে এই ধাপ skip করতে পারেন।</p>{form.logo_url && <img src={form.logo_url} alt="আপলোড করা লোগো" className="mt-5 size-24 rounded-xl object-cover" />}<label className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary-900 px-4 py-2.5 font-semibold text-white"><Upload className="size-4" /> ফাইল বাছুন<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} /></label></div>;
  if (step === 2) return <div><h2 className="text-2xl">প্রথম ডাক্তার</h2><p className="mt-2 text-primary-500">এখন একটি profile যোগ করুন; পরে Dashboard থেকে আরও ডাক্তার যোগ করতে পারবেন।</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="নাম (বাংলা)"><Input placeholder="উদাহরণ: ডা. মো. রহিম উদ্দিন" value={form.doctor_name_bn} onChange={(event) => set("doctor_name_bn", event.target.value)} /></Field><Field label="Name (English)"><Input placeholder="Example: Dr. Md. Rahim Uddin" value={form.doctor_name_en} onChange={(event) => set("doctor_name_en", event.target.value)} /></Field><Field label="বিশেষজ্ঞ (বাংলা)"><Input placeholder="উদাহরণ: মেডিসিন বিশেষজ্ঞ" value={form.doctor_spec_bn} onChange={(event) => set("doctor_spec_bn", event.target.value)} /></Field><Field label="Speciality (English)"><Input placeholder="Example: Medicine Specialist" value={form.doctor_spec_en} onChange={(event) => set("doctor_spec_en", event.target.value)} /></Field></div></div>;
  if (step === 3) return <div><h2 className="text-2xl">প্রথম সার্ভিস</h2><p className="mt-2 text-primary-500">রোগীরা সবচেয়ে বেশি যে সেবাটি খোঁজেন সেটি দিয়ে শুরু করুন।</p><div className="mt-5 space-y-4"><Field label="সেবার নাম (বাংলা)"><Input placeholder="উদাহরণ: জরুরি সেবা" value={form.service_name_bn} onChange={(event) => set("service_name_bn", event.target.value)} /></Field><Field label="Service name (English)"><Input placeholder="Example: Emergency Service" value={form.service_name_en} onChange={(event) => set("service_name_en", event.target.value)} /></Field><Field label="বিবরণ" hint="এক বা দুই বাক্যে সেবাটি বোঝান।"><Textarea placeholder="উদাহরণ: ২৪ ঘণ্টা অভিজ্ঞ চিকিৎসকের জরুরি সেবা পাওয়া যায়।" value={form.service_description_bn} onChange={(event) => set("service_description_bn", event.target.value)} /></Field></div></div>;
  if (step === 4) return <div><h2 className="text-2xl">ঠিকানা ও যোগাযোগ</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="ঠিকানা (বাংলা)" hint="পূর্ণ ঠিকানা দিন যাতে রোগীরা সহজে খুঁজে পান।"><Textarea placeholder="উদাহরণ: মেইন রোড, সিরাজগঞ্জ সদর, সিরাজগঞ্জ" value={form.address_bn} onChange={(event) => set("address_bn", event.target.value)} /></Field><Field label="Address (English)"><Textarea placeholder="Example: Main Road, Sirajganj Sadar, Sirajganj" value={form.address_en} onChange={(event) => set("address_en", event.target.value)} /></Field><Field label="ফোন" hint="দেশের কোডসহ দিলে click-to-call ভালো কাজ করে।"><Input inputMode="tel" placeholder="উদাহরণ: +8801711123456" value={form.phone} onChange={(event) => set("phone", event.target.value)} /></Field><Field label="WhatsApp"><Input inputMode="tel" placeholder="উদাহরণ: +8801711123456" value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} /></Field></div></div>;
  return <div><h2 className="text-2xl">রিভিউ ও প্রকাশ</h2><dl className="mt-5 grid gap-3 rounded-xl bg-primary-50 p-5 sm:grid-cols-2"><div><dt className="text-sm text-primary-500">নাম</dt><dd className="font-semibold">{form.name || "—"}</dd></div><div><dt className="text-sm text-primary-500">Subdomain</dt><dd className="font-semibold">{form.subdomain || "—"}</dd></div><div><dt className="text-sm text-primary-500">ডাক্তার</dt><dd>{form.doctor_name_bn || "স্কিপ করা হয়েছে"}</dd></div><div><dt className="text-sm text-primary-500">সার্ভিস</dt><dd>{form.service_name_bn || "স্কিপ করা হয়েছে"}</dd></div></dl><p className="mt-4 text-sm text-primary-500">পাবলিশ করলে website active হবে। পরে dashboard থেকে সব তথ্য বদলানো যাবে।</p></div>;
}
