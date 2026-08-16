import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CalendarClock, CalendarDays, Copy, ExternalLink, Globe2, MessageSquareText, Stethoscope, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Skeleton, StatCard, useToast } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";

const dateKey = (date) => {
  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
};

const formatDate = (value) => value ? new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "তারিখ দেওয়া হয়নি";
const formatTime = (value) => value ? new Date(`2000-01-01T${value}`).toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" }) : "সময় নিশ্চিত নয়";

function getVisitorUrl(subdomain) {
  if (!subdomain) return "";
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || window.location.hostname).replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (rootDomain.endsWith(".vercel.app") || rootDomain === "localhost") {
    const protocol = rootDomain === "localhost" ? window.location.protocol : "https:";
    const port = rootDomain === "localhost" && window.location.port ? `:${window.location.port}` : "";
    return `${protocol}//${rootDomain}${port}/${subdomain}`;
  }
  return `https://${subdomain}.${rootDomain}`;
}

function AppointmentList({ rows, emptyTitle, emptyDescription }) {
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} icon={CalendarCheck2} />;
  return <div className="divide-y divide-primary-100">{rows.slice(0, 5).map((row) => <div key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700"><CalendarDays className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate font-semibold text-primary-900">{row.name}</p><p className="text-sm text-primary-500">{formatDate(row.preferred_date)} · {formatTime(row.preferred_time)}</p></div><Badge variant={row.status === "approved" ? "success" : row.status === "rejected" ? "danger" : "warning"}>{row.status === "approved" ? "অনুমোদিত" : row.status === "rejected" ? "প্রত্যাখ্যাত" : "Pending"}</Badge></div>)}</div>;
}

export default function DashboardOverview() {
  const { hospitalId } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!supabase || !hospitalId) {
      setData({ doctors: 0, services: 0, reviews: 0, appointments: [], allAppointments: 0, hospital: null });
      return;
    }
    let active = true;
    Promise.all([
      supabase.from("doctors").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId),
      supabase.from("services").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId),
      supabase.from("appointments").select("id,name,mobile,status,preferred_date,preferred_time,created_at,doctors(name)", { count: "exact" }).eq("hospital_id", hospitalId).order("preferred_date", { ascending: true, nullsFirst: false }),
      supabase.from("hospitals").select("id,name,subdomain,status").eq("id", hospitalId).maybeSingle(),
    ]).then(([doctors, services, reviews, appointments, hospital]) => {
      if (!active) return;
      const error = [doctors, services, reviews, appointments, hospital].find((result) => result.error)?.error;
      if (error) toast.error("Dashboard-এর কিছু তথ্য লোড করা যায়নি।");
      setData({ doctors: doctors.count || 0, services: services.count || 0, reviews: reviews.count || 0, appointments: appointments.data || [], allAppointments: appointments.count || 0, hospital: hospital.data || null });
    });
    return () => { active = false; };
  }, [hospitalId]);

  const dashboard = useMemo(() => {
    if (!data) return null;
    const today = dateKey(new Date());
    const todayRows = data.appointments.filter((row) => row.preferred_date === today);
    const upcomingRows = data.appointments.filter((row) => row.preferred_date > today && row.status !== "rejected");
    const pending = data.appointments.filter((row) => row.status === "pending").length;
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = dateKey(date);
      return {
        key,
        label: new Intl.DateTimeFormat("bn-BD", { weekday: "short" }).format(date),
        count: data.appointments.filter((row) => dateKey(row.created_at) === key).length,
      };
    });
    return { todayRows, upcomingRows, pending, days, weeklyTotal: days.reduce((sum, day) => sum + day.count, 0) };
  }, [data]);

  if (!data || !dashboard) return <div className="space-y-5"><Skeleton className="h-10 w-52" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((number) => <Skeleton key={number} className="h-32" />)}</div><Skeleton className="h-80" /></div>;

  const visitorUrl = getVisitorUrl(data.hospital?.subdomain);
  const maxWeekly = Math.max(1, ...dashboard.days.map((day) => day.count));

  async function copyVisitorUrl() {
    try {
      await navigator.clipboard.writeText(visitorUrl);
      toast.success("ওয়েবসাইটের লিংক কপি হয়েছে।");
    } catch {
      toast.error("লিংক কপি করা যায়নি। URL নির্বাচন করে copy করুন।");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="caption font-semibold text-primary-600">আজকের কার্যক্রম</p><h1 className="mt-1 text-3xl">Hospital Dashboard</h1><p className="mt-2 text-primary-500">Appointment ও website activity এক নজরে দেখুন।</p></div><Link to="/admin/appointments"><Button variant="secondary"><CalendarDays className="size-4" /> সব appointment</Button></Link></div>

      {visitorUrl && <Card className="mt-6 overflow-hidden border-primary-200"><div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700"><Globe2 className="size-6" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl">আপনার ওয়েবসাইট</h2><Badge variant={data.hospital?.status === "active" ? "success" : "warning"}>{data.hospital?.status === "active" ? "Live" : "Trial"}</Badge></div><p className="mt-1 text-sm text-primary-500">Slug: <strong className="text-primary-700">{data.hospital.subdomain}</strong></p><a href={visitorUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate font-semibold text-primary-800 underline decoration-accent decoration-2 underline-offset-4">{visitorUrl}</a></div><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={copyVisitorUrl}><Copy className="size-4" /> লিংক কপি</Button><Button size="sm" onClick={() => window.open(visitorUrl, "_blank", "noopener,noreferrer")}><ExternalLink className="size-4" /> ওয়েবসাইট খুলুন</Button></div></div></Card>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="আজকের Appointment" value={dashboard.todayRows.length} icon={CalendarCheck2} helper="আজ নির্ধারিত রোগী" />
        <StatCard label="Upcoming Appointment" value={dashboard.upcomingRows.length} icon={CalendarClock} helper="আজকের পরের নির্ধারিত রোগী" />
        <StatCard label="All Appointments" value={data.allAppointments} icon={CalendarDays} helper="এখন পর্যন্ত মোট অনুরোধ" />
        <StatCard label="Pending Approval" value={dashboard.pending} icon={UsersRound} helper="আপনার সিদ্ধান্তের অপেক্ষায়" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="caption font-semibold text-primary-600">গত ৭ দিন</p><h2 className="mt-1 text-xl">Weekly Analytics</h2><p className="mt-1 text-sm text-primary-500">প্রতিদিন পাওয়া নতুন appointment request</p></div><div className="text-right"><p className="text-3xl font-bold text-primary-900">{dashboard.weeklyTotal}</p><p className="text-xs text-primary-500">এই সপ্তাহে</p></div></div>
          <div className="mt-8 grid h-52 grid-cols-7 items-end gap-2" aria-label="সাপ্তাহিক appointment chart">{dashboard.days.map((day) => <div key={day.key} className="flex h-full flex-col justify-end text-center"><span className="mb-2 text-xs font-semibold text-primary-600">{day.count}</span><div className="mx-auto w-full max-w-10 rounded-t-lg bg-primary-700 transition-all" style={{ height: `${Math.max(4, (day.count / maxWeekly) * 100)}%` }} /><span className="mt-2 text-xs text-primary-500">{day.label}</span></div>)}</div>
        </Card>

        <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-primary-100 p-5"><div><p className="caption font-semibold text-primary-600">Today</p><h2 className="mt-1 text-xl">আজকের Appointments</h2></div><Badge>{dashboard.todayRows.length} জন</Badge></div><AppointmentList rows={dashboard.todayRows} emptyTitle="আজ কোনো appointment নেই" emptyDescription="আজকের জন্য নতুন appointment এলে এখানে দেখা যাবে।" /></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_.55fr]">
        <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-primary-100 p-5"><div><p className="caption font-semibold text-primary-600">পরবর্তী সময়সূচি</p><h2 className="mt-1 text-xl">Upcoming Appointments</h2></div><Link to="/admin/appointments" className="text-sm font-semibold text-primary-700">সব দেখুন →</Link></div><AppointmentList rows={dashboard.upcomingRows} emptyTitle="কোনো upcoming appointment নেই" emptyDescription="ভবিষ্যৎ তারিখের appointment এখানে দেখা যাবে।" /></Card>
        <Card className="p-5"><p className="caption font-semibold text-primary-600">Hospital content</p><h2 className="mt-1 text-xl">প্রোফাইল সারাংশ</h2><dl className="mt-5 space-y-4"><div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-primary-500"><Stethoscope className="size-4" />ডাক্তার</dt><dd className="font-bold">{data.doctors}</dd></div><div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-primary-500"><Globe2 className="size-4" />সার্ভিস</dt><dd className="font-bold">{data.services}</dd></div><div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-primary-500"><MessageSquareText className="size-4" />রিভিউ</dt><dd className="font-bold">{data.reviews}</dd></div></dl></Card>
      </div>
    </div>
  );
}
