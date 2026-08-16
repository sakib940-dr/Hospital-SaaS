import { createClient } from "@supabase/supabase-js";

const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "TEST_ADMIN_A_EMAIL", "TEST_ADMIN_A_PASSWORD", "TEST_ADMIN_B_EMAIL", "TEST_ADMIN_B_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing test variables: ${missing.join(", ")}`);

const client = () => createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const a = client();
const b = client();

async function signIn(target, email, password) {
  const { error } = await target.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data, error: membershipError } = await target.from("hospital_admins").select("hospital_id").single();
  if (membershipError || !data?.hospital_id) throw membershipError || new Error(`${email} has no hospital membership`);
  return data.hospital_id;
}

const hospitalA = await signIn(a, process.env.TEST_ADMIN_A_EMAIL, process.env.TEST_ADMIN_A_PASSWORD);
const hospitalB = await signIn(b, process.env.TEST_ADMIN_B_EMAIL, process.env.TEST_ADMIN_B_PASSWORD);
if (hospitalA === hospitalB) throw new Error("The two test admins must belong to different hospitals");

async function verifyTenantIsolation(target, ownHospital, otherHospital, label) {
  const marker = `RLS smoke ${label} ${Date.now()}`;
  const own = await target.from("services").insert({ hospital_id: ownHospital, name: { bn: marker, en: marker }, is_active: false }).select("id").single();
  if (own.error) throw new Error(`${label} could not create own row: ${own.error.message}`);
  const cross = await target.from("services").insert({ hospital_id: otherHospital, name: { bn: marker, en: marker }, is_active: false }).select("id").single();
  if (!cross.error) throw new Error(`${label} cross-tenant INSERT unexpectedly succeeded`);
  const visible = await target.from("services").select("id,hospital_id").eq("id", own.data.id).single();
  if (visible.error || visible.data.hospital_id !== ownHospital) throw new Error(`${label} could not read own row`);
  const cleanup = await target.from("services").delete().eq("id", own.data.id).eq("hospital_id", ownHospital);
  if (cleanup.error) throw new Error(`${label} cleanup failed: ${cleanup.error.message}`);
  console.log(`PASS: ${label} can manage own tenant and cannot insert into the other tenant`);
}

await verifyTenantIsolation(a, hospitalA, hospitalB, "Admin A");
await verifyTenantIsolation(b, hospitalB, hospitalA, "Admin B");
await a.auth.signOut();
await b.auth.signOut();
console.log("RLS smoke test passed.");
