import { supabase } from "./supabaseClient.js";

const recentEvents = new Map();

function sessionId() {
  const key = "hospital-cloud-session-id";
  let value = sessionStorage.getItem(key);
  if (!value) { value = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`; sessionStorage.setItem(key, value); }
  return value;
}

export function trackEvent(hospitalId, eventType, entityType = null, entityId = null) {
  if (!supabase || !hospitalId || !eventType) return;
  const key = `${hospitalId}:${eventType}:${entityType || ""}:${entityId || ""}`;
  const now = Date.now();
  if (now - (recentEvents.get(key) || 0) < 2000) return;
  recentEvents.set(key, now);
  supabase.from("analytics_events").insert({ hospital_id: hospitalId, event_type: eventType, entity_type: entityType, entity_id: entityId == null ? null : String(entityId), session_id: sessionId() }).then(({ error }) => { if (error && import.meta.env.DEV) console.debug("Analytics event was not stored", error.message); }).catch(() => {});
}
