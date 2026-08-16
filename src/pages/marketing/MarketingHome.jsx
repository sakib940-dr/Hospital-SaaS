import { ArrowRight, CalendarCheck, Check, Globe2, Quote, ShieldCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Card } from "../../components/ui/index.js";

const features = [
  [Globe2, "নিজস্ব ওয়েবসাইট", "হাসপাতালের ব্র্যান্ড, তথ্য, ডাক্তার ও সেবা এক জায়গায়।"],
  [CalendarCheck, "অ্যাপয়েন্টমেন্ট", "রোগীর অনলাইন অনুরোধ দ্রুত দেখুন ও পরিচালনা করুন।"],
  [ShieldCheck, "নিরাপদ মাল্টি-টেন্যান্ট", "প্রতিটি হাসপাতালের তথ্য আলাদা ও role অনুযায়ী নিয়ন্ত্রিত।"],
];

const plans = [
  { name: "Starter", price: "১৪ দিন ফ্রি", description: "ছোট হাসপাতাল ও ক্লিনিকের শুরু করার জন্য", features: ["নিজস্ব visitor website", "ডাক্তার ও সেবা ব্যবস্থাপনা", "Appointment inbox"], recommended: false },
  { name: "Pro", price: "শীঘ্রই", description: "বাড়তে থাকা হাসপাতালের সম্পূর্ণ digital presence", features: ["Starter-এর সব সুবিধা", "Analytics dashboard", "Custom domain support", "Priority support"], recommended: true },
  { name: "Enterprise", price: "যোগাযোগ করুন", description: "Hospital group ও custom workflow-এর জন্য", features: ["Pro-এর সব সুবিধা", "একাধিক branch planning", "Custom onboarding", "Dedicated support"], recommended: false },
];

// PLACEHOLDER: Launch-এর আগে নিচের testimonialগুলো অনুমোদিত বাস্তব customer quote দিয়ে বদলাতে হবে।
const testimonials = [
  { name: "ডা. মাহমুদ হাসান", hospital: "নমুনা জেনারেল হাসপাতাল", quote: "এক জায়গা থেকে ওয়েবসাইট আর appointment request দেখা আমাদের টিমের কাজ অনেক সহজ করেছে।" },
  { name: "সাবিনা ইয়াসমিন", hospital: "ডেমো আই কেয়ার", quote: "বাংলায় তথ্য আপডেট করা সহজ, আর রোগীরাও মোবাইল থেকে প্রয়োজনীয় তথ্য দ্রুত পাচ্ছেন।" },
  { name: "মো. রায়হান কবির", hospital: "উদাহরণ মেডিকেল সেন্টার", quote: "সেটআপ দ্রুত হয়েছে এবং dashboard ব্যবহার করতে আলাদা technical training লাগেনি।" },
];

export default function MarketingHome() {
  return (
    <main className="min-h-screen bg-surface-subtle text-primary-900">
      <header className="border-b border-primary-100 bg-white/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3 font-bold"><img src="/favicon.svg" alt="" className="size-9" /><span>হাসপাতাল ক্লাউড</span></Link>
          <Link to="/login" className="inline-flex min-h-9 items-center rounded-lg bg-primary-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-800">লগইন</Link>
        </div>
      </header>

      <section className="bg-primary-900 px-5 py-18 text-white sm:px-8 lg:py-22">
        <div className="mx-auto max-w-4xl text-center">
          <p className="caption mb-3 font-semibold uppercase tracking-widest text-accent">হাসপাতাল ক্লাউড</p>
          <h1 className="text-white">প্রতিটা হাসপাতালের নিজের ওয়েবসাইট, ৫ মিনিটে।</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-100">হাসপাতালের ওয়েবসাইট, অ্যাডমিন প্যানেল, অ্যাপয়েন্টমেন্ট ও অ্যানালিটিক্স—একটি সহজ প্ল্যাটফর্মে।</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup"><Button variant="accent" size="lg">শুরু করুন <ArrowRight className="size-4" /></Button></Link>
            <a href="#features"><Button variant="secondary" size="lg" className="border-white/25 bg-transparent text-white hover:bg-white/10">ফিচার দেখুন</Button></a>
          </div>
          <p className="mt-4 text-sm text-primary-200">১৪ দিনের ট্রায়াল · Payment card লাগবে না</p>
        </div>
      </section>

      <section id="features" className="px-5 py-15 sm:px-8 lg:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl"><p className="caption font-semibold text-primary-600">যা থাকছে</p><h2 className="mt-2">দৈনন্দিন কাজের সরল সমাধান</h2></div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">{features.map(([Icon, title, text]) => <Card key={title} className="p-5"><span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary-700"><Icon className="size-5" /></span><h3 className="mt-4 text-xl">{title}</h3><p className="mt-2 text-primary-500">{text}</p></Card>)}</div>
        </div>
      </section>

      <section id="plans" className="bg-white px-5 py-15 sm:px-8 lg:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center"><p className="caption font-semibold text-primary-600">প্ল্যান</p><h2 className="mt-2">আপনার হাসপাতালের সঙ্গে বাড়ে</h2><p className="mt-3 text-primary-500">Starter দিয়ে ঝুঁকিহীনভাবে শুরু করুন। প্রয়োজন অনুযায়ী পরে plan বেছে নিন।</p></div>
          <div className="mt-9 grid items-stretch gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative flex h-full flex-col p-6 ${plan.recommended ? "border-2 border-accent shadow-md" : ""}`}>
                {plan.recommended && <Badge variant="accent" className="absolute right-5 top-5">সবচেয়ে জনপ্রিয়</Badge>}
                <h3 className="text-2xl">{plan.name}</h3>
                <p className="mt-4 text-3xl font-bold text-primary-900">{plan.price}</p>
                <p className="mt-2 min-h-12 text-primary-500">{plan.description}</p>
                <ul className="my-6 flex-1 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-primary-700"><Check className="mt-0.5 size-4 shrink-0 text-success" />{feature}</li>)}</ul>
                <Link to="/signup" className="block"><Button variant={plan.recommended ? "accent" : "secondary"} className="w-full">শুরু করুন</Button></Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-15 sm:px-8 lg:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl"><p className="caption font-semibold text-primary-600">Social proof preview</p><h2 className="mt-2">হাসপাতাল টিমের কাজ সহজ করার জন্য</h2></div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => <Card key={item.name} className="p-6"><div className="flex items-center justify-between"><Quote className="size-8 text-accent" /><span className="flex text-accent">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-4 fill-current" />)}</span></div><blockquote className="mt-5 text-primary-700">“{item.quote}”</blockquote><div className="mt-5 border-t border-primary-100 pt-4"><p className="font-semibold">{item.name}</p><p className="text-sm text-primary-500">{item.hospital}</p></div></Card>)}
          </div>
        </div>
      </section>

      <section className="bg-primary-800 px-5 py-13 text-center text-white sm:px-8"><h2 className="text-white">আপনার হাসপাতালকে online-এ প্রস্তুত করুন</h2><p className="mt-3 text-primary-100">আজই ১৪ দিনের trial workspace তৈরি করুন।</p><Link to="/signup" className="mt-6 inline-block"><Button variant="accent" size="lg">ফ্রি শুরু করুন <ArrowRight className="size-4" /></Button></Link></section>
      <footer className="bg-primary-900 px-5 py-8 text-center text-sm text-primary-200">© {new Date().getFullYear()} হাসপাতাল ক্লাউড</footer>
    </main>
  );
}
