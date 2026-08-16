import { useEffect, useState } from "react";
import { CalendarClock, Gauge, MessageSquareText, Stethoscope } from "lucide-react";
import { Card, EmptyState, Skeleton, StatCard } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";

export default function DashboardOverview() {
  const { hospitalId } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!supabase || !hospitalId) { setData({ counts: [0, 0, 0, 0], reviews: [] }); return; }
    Promise.all([
      supabase.from("doctors").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId),
      supabase.from("services").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId).eq("status", "pending"),
      supabase.from("reviews").select("id,name,rating,comment,text,created_at").eq("hospital_id", hospitalId).order("created_at", { ascending: false }).limit(5),
    ]).then(([doctors, services, reviews, appointments, latest]) => setData({ counts: [doctors.count || 0, services.count || 0, reviews.count || 0, appointments.count || 0], reviews: latest.data || [] }));
  }, [hospitalId]);
  if (!data) return <div className="space-y-5"><Skeleton className="h-10 w-52" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((n) => <Skeleton key={n} className="h-32" />)}</div></div>;
  const stats = [["ডাক্তার", data.counts[0], Stethoscope], ["সার্ভিস", data.counts[1], Gauge], ["রিভিউ", data.counts[2], MessageSquareText], ["পেন্ডিং অ্যাপয়েন্টমেন্ট", data.counts[3], CalendarClock]];
  return <div><p className="caption font-semibold text-primary-600">ওভারভিউ</p><h1 className="mt-1 text-3xl">Dashboard</h1><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label,value,icon]) => <StatCard key={label} label={label} value={value} icon={icon} />)}</div><Card className="mt-6 overflow-hidden"><div className="border-b border-primary-100 p-5"><h2 className="text-xl">সাম্প্রতিক রিভিউ</h2></div>{data.reviews.length ? <div className="divide-y divide-primary-100">{data.reviews.map((review) => <div key={review.id} className="p-5"><div className="flex justify-between gap-3"><strong>{review.name}</strong><span className="text-accent">{"★".repeat(review.rating)}</span></div><p className="mt-1 text-sm text-primary-500">{typeof review.text === "object" ? review.text.bn || review.text.en : review.comment || "—"}</p></div>)}</div> : <EmptyState title="এখনো কোনো রিভিউ নেই" />}</Card></div>;
}
