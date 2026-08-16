import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CircleDollarSign, Gauge, Images, Info, LayoutDashboard, LogOut, MessageSquareText, Settings, Stethoscope } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Badge, SidebarLayout, SidebarNavItem } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPendingAppointmentCount } from "../../lib/api/appointments.js";
import { supabase } from "../../lib/supabaseClient.js";

export default function HospitalAdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hospitalId, signOut } = useAuth();
  const [pending, setPending] = useState(0);
  const [trial, setTrial] = useState(null);
  useEffect(() => { if (hospitalId) getPendingAppointmentCount(hospitalId).then(({ count }) => setPending(count || 0)); }, [hospitalId, location.pathname]);
  useEffect(() => {
    if (!hospitalId || !supabase) return;
    supabase.from("hospitals").select("status, created_at").eq("id", hospitalId).maybeSingle().then(({ data }) => {
      if (!data || data.status !== "trial") return setTrial(null);
      const trialEndsAt = new Date(data.created_at).getTime() + (14 * 24 * 60 * 60 * 1000);
      setTrial({ daysLeft: Math.max(0, Math.ceil((trialEndsAt - Date.now()) / (24 * 60 * 60 * 1000))) });
    });
  }, [hospitalId]);
  const items = useMemo(() => [
    ["/admin", "Dashboard", LayoutDashboard], ["/admin/hospital-info", "হাসপাতাল তথ্য", Info], ["/admin/doctors", "ডাক্তার", Stethoscope], ["/admin/services", "সার্ভিস", Gauge], ["/admin/costs", "খরচ", CircleDollarSign], ["/admin/gallery", "গ্যালারি", Images], ["/admin/reviews", "রিভিউ", MessageSquareText], ["/admin/appointments", "অ্যাপয়েন্টমেন্ট", CalendarDays, pending], ["/admin/analytics", "Analytics", BarChart3], ["/admin/settings", "Settings", Settings],
  ], [pending]);
  const active = (path) => path === "/admin" ? location.pathname === path : location.pathname.startsWith(path);
  return <SidebarLayout brand="হাসপাতাল ক্লাউড" sidebar={<>{trial && <div className="mb-4 rounded-xl border border-accent/30 bg-white/10 p-3"><Badge variant="warning">ট্রায়াল — {trial.daysLeft} দিন বাকি</Badge><p className="mt-2 text-xs leading-relaxed text-primary-100">সব সুবিধা ব্যবহার করে setup সম্পূর্ণ করুন।</p></div>}{items.map(([path, label, icon, badge]) => <SidebarNavItem key={path} label={label} icon={icon} badge={badge} active={active(path)} onClick={() => navigate(path)} />)}<div className="my-3 border-t border-white/10" /><SidebarNavItem label="লগআউট" icon={LogOut} onClick={async () => { await signOut(); navigate("/login"); }} /></>}><Outlet /></SidebarLayout>;
}
