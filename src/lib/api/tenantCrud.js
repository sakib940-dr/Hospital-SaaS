import { notConfiguredError, supabase } from "../supabaseClient.js";

const missing = () => ({ data: null, error: notConfiguredError() });

export async function listTenantRows(table, hospitalId, { orderBy = "created_at", ascending = false, select = "*" } = {}) {
  if (!supabase) return missing();
  return supabase.from(table).select(select).eq("hospital_id", hospitalId).order(orderBy, { ascending });
}

export async function createTenantRow(table, hospitalId, record) {
  if (!supabase) return missing();
  return supabase.from(table).insert({ ...record, hospital_id: hospitalId }).select().single();
}

export async function updateTenantRow(table, hospitalId, id, updates) {
  if (!supabase) return missing();
  return supabase.from(table).update(updates).eq("hospital_id", hospitalId).eq("id", id).select().single();
}

export async function deleteTenantRow(table, hospitalId, id) {
  if (!supabase) return missing();
  return supabase.from(table).delete().eq("hospital_id", hospitalId).eq("id", id);
}

export async function uploadHospitalAsset(hospitalId, folder, file) {
  if (!supabase) return { url: null, error: notConfiguredError() };
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${hospitalId}/${folder}/${crypto.randomUUID?.() || Date.now()}.${extension}`;
  const uploaded = await supabase.storage.from("hospital-assets").upload(path, file, { upsert: false, contentType: file.type });
  if (uploaded.error) return { url: null, error: uploaded.error };
  return { url: supabase.storage.from("hospital-assets").getPublicUrl(path).data.publicUrl, error: null };
}
