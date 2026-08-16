import { createClient } from "@supabase/supabase-js";

const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const { hospitalId, domain: rawDomain } = request.body || {};
  const domain = String(rawDomain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!uuidPattern.test(String(hospitalId || "")) || !domainPattern.test(domain)) return response.status(400).json({ error: "Invalid hospitalId or domain" });
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "VERCEL_API_TOKEN", "VERCEL_PROJECT_ID"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) return response.status(500).json({ error: `Missing server configuration: ${missing.join(", ")}` });
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return response.status(401).json({ error: "Authentication required" });
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return response.status(401).json({ error: "Invalid session" });
  const [{ data: membership }, { data: superAdmin }] = await Promise.all([
    admin.from("hospital_admins").select("user_id").eq("user_id", authData.user.id).eq("hospital_id", hospitalId).maybeSingle(),
    admin.from("super_admins").select("user_id").eq("user_id", authData.user.id).maybeSingle(),
  ]);
  if (!membership && !superAdmin) return response.status(403).json({ error: "You cannot manage this hospital" });
  const query = process.env.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : "";
  const vercelResponse = await fetch(`https://api.vercel.com/v10/projects/${encodeURIComponent(process.env.VERCEL_PROJECT_ID)}/domains${query}`, { method: "POST", headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: domain }) });
  const vercelBody = await vercelResponse.json();
  if (!vercelResponse.ok && vercelBody.error?.code !== "domain_already_in_use") return response.status(vercelResponse.status).json({ error: vercelBody.error?.message || "Vercel rejected the domain" });
  const { error: updateError } = await admin.from("hospitals").update({ custom_domain: domain, updated_at: new Date().toISOString() }).eq("id", hospitalId);
  if (updateError) return response.status(500).json({ error: updateError.message });
  return response.status(200).json({ domain, verified: Boolean(vercelBody.verified), dns: { type: "CNAME", name: domain, value: "cname.vercel-dns.com" } });
}
