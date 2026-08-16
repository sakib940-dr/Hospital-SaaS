import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button, Card, Field, Input, Skeleton, Textarea, useToast } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import { sanitizePhone } from "../../lib/validation.js";

const initial = {
  name_bn: "",
  name_en: "",
  motto_bn: "",
  motto_en: "",
  about_bn: "",
  about_en: "",
  address_bn: "",
  address_en: "",
  phone: "",
  phone_display: "",
  whatsapp: "",
  email: "",
  google_map_link: "",
};

export default function HospitalInfoPanel() {
  const { hospitalId } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase || !hospitalId) {
      setForm(initial);
      return;
    }
    supabase.from("hospital_info").select("*").eq("hospital_id", hospitalId).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(error.message);
      setForm({ ...initial, ...(data || {}), whatsapp: data?.social_links?.whatsapp || "" });
    });
  }, [hospitalId]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function save(event) {
    event.preventDefault();
    if (!supabase) return toast.error("Supabase কনফিগার করা নেই");
    setSaving(true);
    const payload = Object.fromEntries(Object.keys(initial).filter((key) => key !== "whatsapp").map((key) => [key, form[key]]));
    payload.social_links = {
      ...(form.social_links || {}),
      whatsapp: sanitizePhone(form.whatsapp) || null,
    };
    const { error } = await supabase.from("hospital_info").upsert(
      { id: 1, hospital_id: hospitalId, ...payload },
      { onConflict: "hospital_id,id" },
    );
    setSaving(false);
    error ? toast.error(error.message) : toast.success("হাসপাতালের তথ্য সেভ হয়েছে।");
  }

  if (!form) return <Skeleton className="h-72" />;

  const bilingual = [["name", "হাসপাতালের নাম"], ["motto", "ট্যাগলাইন"], ["about", "সংক্ষিপ্ত পরিচিতি"], ["address", "ঠিকানা"]];
  return (
    <div>
      <p className="caption font-semibold text-primary-600">প্রোফাইল</p>
      <h1 className="mt-1 text-3xl">হাসপাতাল তথ্য</h1>
      <Card className="mt-6 p-5 sm:p-7">
        <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
          {bilingual.map(([key, label]) => (
            <div key={key} className={key === "about" || key === "address" ? "grid gap-4 sm:col-span-2 sm:grid-cols-2" : "contents"}>
              <Field label={`${label} (বাংলা)`} required={key === "name"}>
                {key === "about" || key === "address"
                  ? <Textarea value={form[`${key}_bn`]} onChange={(event) => set(`${key}_bn`, event.target.value)} />
                  : <Input required={key === "name"} value={form[`${key}_bn`]} onChange={(event) => set(`${key}_bn`, event.target.value)} />}
              </Field>
              <Field label={`${label} (English)`}>
                {key === "about" || key === "address"
                  ? <Textarea value={form[`${key}_en`]} onChange={(event) => set(`${key}_en`, event.target.value)} />
                  : <Input value={form[`${key}_en`]} onChange={(event) => set(`${key}_en`, event.target.value)} />}
              </Field>
            </div>
          ))}
          <Field label="ফোন"><Input value={form.phone} onChange={(event) => set("phone", event.target.value)} /></Field>
          <Field label="প্রদর্শিত ফোন"><Input value={form.phone_display} onChange={(event) => set("phone_display", event.target.value)} /></Field>
          <Field label="WhatsApp নম্বর" hint="দেশের কোডসহ নম্বর দিন, যেমন +8801711123456">
            <Input inputMode="tel" value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} />
          </Field>
          <Field label="ইমেইল"><Input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} /></Field>
          <Field
            label="Google map link"
            hint={'Google Maps-এ “Share” → “Embed a map” থেকে iframe-এর src URL দিন। সাধারণ share link দিলেও visitor site-এ বাটন হিসেবে দেখাবে।'}
            className="sm:col-span-2"
          >
            <Input type="url" value={form.google_map_link} onChange={(event) => set("google_map_link", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}><Save className="size-4" /> সেভ করুন</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
