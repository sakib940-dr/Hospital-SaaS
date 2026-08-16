import { useEffect, useState } from "react";
import { Building2, CirclePause, CirclePlay, TimerReset } from "lucide-react";
import { Badge, Card, EmptyState, Skeleton, StatCard } from "../../components/ui/index.js";
import { supabase } from "../../lib/supabaseClient.js";

export default function OverviewPage() {
  const [rows, setRows] = useState(null); const [error, setError] = useState("");
  useEffect(() => { if (!supabase) { setError("Supabase কনফিগার করা নেই"); setRows([]); return; } supabase.from("hospitals").select("id,name,subdomain,status,created_at").order("created_at", { ascending:false }).then(({data,error}) => { if(error) setError(error.message); setRows(data || []); }); }, []);
  if (rows === null) return <Skeleton className="h-80" />;
  const counts = { total:rows.length, active:rows.filter(r=>r.status==="active").length, trial:rows.filter(r=>r.status==="trial").length, suspended:rows.filter(r=>r.status==="suspended").length };
  return <div><p className="caption font-semibold text-primary-600">Platform</p><h1 className="mt-1 text-3xl">Super Admin Dashboard</h1>{error && <p className="mt-4 rounded-lg bg-danger-light p-3 text-danger-dark">{error}</p>}<div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total hospitals" value={counts.total} icon={Building2} /><StatCard label="Active" value={counts.active} icon={CirclePlay} /><StatCard label="Trial" value={counts.trial} icon={TimerReset} /><StatCard label="Suspended" value={counts.suspended} icon={CirclePause} /></div><Card className="mt-6 overflow-hidden"><div className="border-b border-primary-100 p-5"><h2 className="text-xl">সাম্প্রতিক ৫টি signup</h2></div>{rows.length ? <div className="divide-y divide-primary-100">{rows.slice(0,5).map(row => <div key={row.id} className="flex items-center justify-between gap-4 p-4"><div><strong>{row.name}</strong><p className="text-sm text-primary-500">{row.subdomain}</p></div><Badge variant={row.status === "active" ? "success" : row.status === "suspended" ? "danger" : "warning"}>{row.status}</Badge></div>)}</div> : <EmptyState title="কোনো হাসপাতাল নেই" />}</Card></div>;
}
