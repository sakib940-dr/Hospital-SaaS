import { notConfiguredError, supabase } from "../supabaseClient.js";

const missing = () => ({ data: null, error: notConfiguredError() });

export async function createAppointment(hospitalId, appointment) {
  if (!supabase) return missing();
  return supabase.from("appointments").insert({ ...appointment, hospital_id: hospitalId, status: "pending" }).select().single();
}

export async function getAppointments(hospitalId, status = "all") {
  if (!supabase) return missing();
  let query = supabase.from("appointments").select("*, doctors(name)").eq("hospital_id", hospitalId).order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  return query;
}

export async function updateAppointmentStatus(hospitalId, id, status, adminNote = "") {
  if (!supabase) return missing();
  return supabase.from("appointments").update({ status, admin_note: adminNote.trim() || null, reviewed_at: new Date().toISOString() }).eq("hospital_id", hospitalId).eq("id", id).select().single();
}

export async function getPendingAppointmentCount(hospitalId) {
  if (!supabase) return { count: 0, error: notConfiguredError() };
  return supabase.from("appointments").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId).eq("status", "pending");
}
