import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(url && anonKey);
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export function notConfiguredError() {
  return new Error("Supabase কনফিগার করা নেই। .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY দিন।");
}
