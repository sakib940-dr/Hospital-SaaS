import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Card, Field, Input, useToast } from "../components/ui/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { clearPendingSignup, savePendingSignup } from "../lib/pendingSignup.js";
import { supabase } from "../lib/supabaseClient.js";
import { isValidSubdomain, sanitizeSubdomain } from "../lib/validation.js";

const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || "hospitalcloud.com";

function friendlyAuthError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("already registered") || message.includes("already been registered") || message.includes("user already exists")) {
    return "এই ইমেইলে আগে থেকেই account আছে। Login করুন অথবা অন্য ইমেইল ব্যবহার করুন।";
  }
  if (message.includes("password")) return "পাসওয়ার্ডটি যথেষ্ট শক্তিশালী নয়। অন্তত ৮ অক্ষরের পাসওয়ার্ড দিন।";
  if (message.includes("duplicate") || message.includes("subdomain")) return "এই subdomain ইতিমধ্যে নেওয়া হয়েছে। অন্য একটি বেছে নিন।";
  return error?.message || "Account তৈরি করা যায়নি। একটু পরে আবার চেষ্টা করুন।";
}

export default function SignupPage() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", subdomain: "", email: "", password: "", confirmPassword: "" });
  const [availability, setAvailability] = useState("idle");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAvailability("error");
      return undefined;
    }
    if (!form.subdomain || !isValidSubdomain(form.subdomain)) {
      setAvailability("idle");
      return undefined;
    }

    let active = true;
    setAvailability("checking");
    const timer = window.setTimeout(async () => {
      const { data, error } = await supabase.from("hospitals").select("id").eq("subdomain", form.subdomain).limit(1).maybeSingle();
      if (!active) return;
      if (error) setAvailability("error");
      else setAvailability(data ? "taken" : "available");
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [form.subdomain]);

  if (!auth.loading && auth.user && auth.role === "super-admin") return <Navigate to="/super-admin" replace />;
  if (!auth.loading && auth.user && auth.role === "hospital-admin" && !auth.pendingSignupCompleted) return <Navigate to="/admin" replace />;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!supabase) return toast.error("Supabase কনফিগার করা নেই। আগে environment variables সেট করুন।");
    const name = form.name.trim();
    const subdomain = sanitizeSubdomain(form.subdomain);
    const email = form.email.trim().toLowerCase();

    if (name.length < 2) return toast.error("হাসপাতালের সঠিক নাম লিখুন।");
    if (!isValidSubdomain(subdomain)) return toast.error("Subdomain-এ শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও hyphen ব্যবহার করুন।");
    if (availability !== "available") return toast.error(availability === "taken" ? "এই subdomain ইতিমধ্যে নেওয়া হয়েছে।" : "Subdomain availability যাচাই শেষ হওয়া পর্যন্ত অপেক্ষা করুন।");
    if (form.password.length < 8) return toast.error("পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।");
    if (form.password !== form.confirmPassword) return toast.error("পাসওয়ার্ড ও confirm password মিলছে না।");

    setSubmitting(true);
    const { data: existingTenant, error: availabilityError } = await supabase.from("hospitals").select("id").eq("subdomain", subdomain).limit(1).maybeSingle();
    if (availabilityError) {
      setSubmitting(false);
      toast.error("Subdomain availability যাচাই করা যায়নি। Internet connection দেখে আবার চেষ্টা করুন।");
      return;
    }
    if (existingTenant) {
      setAvailability("taken");
      setSubmitting(false);
      toast.error("এই subdomain ইতিমধ্যে নেওয়া হয়েছে। অন্য একটি বেছে নিন।");
      return;
    }

    savePendingSignup({ name, subdomain, email });
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: { emailRedirectTo: `${window.location.origin}/login?signup=confirmed` },
    });

    if (error) {
      clearPendingSignup();
      setSubmitting(false);
      toast.error(friendlyAuthError(error));
      return;
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      clearPendingSignup();
      setSubmitting(false);
      toast.error("এই ইমেইলে আগে থেকেই account আছে। Login করুন।");
      return;
    }

    if (!data.session) {
      setSubmitting(false);
      setConfirmationSent(true);
      toast.success("ভেরিফিকেশন ইমেইল পাঠানো হয়েছে।");
      return;
    }

    const completion = await auth.completePendingSignup(data.user);
    setSubmitting(false);
    if (completion.error) {
      toast.error(friendlyAuthError(completion.error));
      return;
    }
    toast.success("Account ও হাসপাতালের workspace তৈরি হয়েছে।");
    navigate("/onboarding", { replace: true });
  }

  if (confirmationSent) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface-subtle p-5">
        <Card className="w-full max-w-md p-6 text-center sm:p-8">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-light text-success-dark"><MailCheck className="size-8" /></span>
          <h1 className="mt-5 text-3xl">ইমেইল ভেরিফাই করুন</h1>
          <p className="mt-3 text-primary-500"><strong className="text-primary-700">{form.email}</strong> ঠিকানায় একটি verification link পাঠানো হয়েছে। Link-এ ক্লিক করার পর login করলে আপনার হাসপাতালের workspace তৈরি হবে।</p>
          <Link to="/login" className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary-800 underline decoration-accent decoration-2 underline-offset-4">Login পেজে যান</Link>
        </Card>
      </main>
    );
  }

  const availabilityMessage = {
    checking: <span className="inline-flex items-center gap-1 text-warning-dark"><Loader2 className="size-3.5 animate-spin" />যাচাই করা হচ্ছে…</span>,
    available: <span className="inline-flex items-center gap-1 text-success-dark"><CheckCircle2 className="size-3.5" />এই subdomain available</span>,
    taken: <span className="inline-flex items-center gap-1 text-danger"><XCircle className="size-3.5" />এই subdomain already taken</span>,
    error: <span className="text-danger">Availability যাচাই করা যায়নি। আবার চেষ্টা করুন।</span>,
  }[availability];

  return (
    <main className="grid min-h-screen place-items-center bg-surface-subtle p-5 py-10">
      <Card className="w-full max-w-xl p-6 sm:p-8">
        <img src="/favicon.svg" alt="" className="size-12" />
        <h1 className="mt-5 text-3xl">নতুন হাসপাতাল account</h1>
        <p className="mt-2 text-primary-500">১৪ দিনের ট্রায়াল শুরু করুন—কোনো payment তথ্য লাগবে না।</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="হাসপাতালের নাম" required><Input autoComplete="organization" required maxLength={120} placeholder="উদাহরণ: সিরাজগঞ্জ জেনারেল হাসপাতাল" value={form.name} onChange={(event) => update("name", event.target.value)} /></Field>
          <Field label="Subdomain" required hint={availabilityMessage || "যেমন: sirajganj-eye — পরে আপনার ওয়েবসাইটের ঠিকানায় ব্যবহার হবে।"}>
            <div className="flex rounded-lg border border-primary-200 bg-white focus-within:border-primary-400">
              <Input aria-label="Subdomain" required maxLength={63} placeholder="উদাহরণ: sirajganj-general" value={form.subdomain} onChange={(event) => update("subdomain", sanitizeSubdomain(event.target.value))} className="border-0 shadow-none" />
              <span className="flex items-center border-l border-primary-100 px-3 text-sm text-primary-400">.{rootDomain}</span>
            </div>
          </Field>
          <Field label="ইমেইল" required><Input type="email" autoComplete="email" required placeholder="উদাহরণ: admin@hospital.com" value={form.email} onChange={(event) => update("email", event.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="পাসওয়ার্ড" required hint="অন্তত ৮ অক্ষর; letter, number ও symbol মিলিয়ে দিন।"><Input type="password" autoComplete="new-password" required minLength={8} placeholder="শক্তিশালী পাসওয়ার্ড দিন" value={form.password} onChange={(event) => update("password", event.target.value)} /></Field>
            <Field label="পাসওয়ার্ড নিশ্চিত করুন" required><Input type="password" autoComplete="new-password" required minLength={8} placeholder="একই পাসওয়ার্ড আবার লিখুন" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} /></Field>
          </div>
          <Button type="submit" className="w-full" loading={submitting} disabled={availability !== "available"}>Account তৈরি করুন</Button>
        </form>
        <p className="mt-6 text-center text-sm text-primary-500">আগে থেকে account আছে? <Link to="/login" className="font-semibold text-primary-800 underline decoration-accent decoration-2 underline-offset-4">Login করুন</Link></p>
      </Card>
    </main>
  );
}
