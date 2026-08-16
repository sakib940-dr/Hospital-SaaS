import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { resolveTenant } from "../lib/resolveTenant.js";
import { supabase } from "../lib/supabaseClient.js";

const HospitalContext = createContext(null);

export function HospitalProvider({ children }) {
  const tenant = useMemo(() => resolveTenant(), []);
  const [state, setState] = useState({ status: tenant.mode === "hospital" ? "loading" : "idle", hospital: null, error: null });
  useEffect(() => {
    if (tenant.mode !== "hospital") return;
    let active = true;
    async function load() {
      if (!supabase) { if (active) setState({ status: "configuration", hospital: null, error: null }); return; }
      const { data, error } = await supabase.from("hospitals").select("*").eq(tenant.lookupType, tenant.value).maybeSingle();
      if (!active) return;
      if (error) setState({ status: "error", hospital: null, error });
      else if (!data) setState({ status: "not-found", hospital: null, error: null });
      else if (data.status === "suspended") setState({ status: "suspended", hospital: data, error: null });
      else setState({ status: "found", hospital: data, error: null });
    }
    load();
    return () => { active = false; };
  }, [tenant]);
  return <HospitalContext.Provider value={{ tenant, ...state }}>{children}</HospitalContext.Provider>;
}

export function useHospital() {
  const value = useContext(HospitalContext);
  if (!value) throw new Error("useHospital must be used inside HospitalProvider");
  return value;
}
