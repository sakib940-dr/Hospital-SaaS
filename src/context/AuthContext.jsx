import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearPendingSignup, getPendingSignup, saveOnboardingDraft } from "../lib/pendingSignup.js";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);
const pendingCompletionPromises = new Map();

async function resolveRole(userId) {
  if (!supabase || !userId) return { role: "none", hospitalId: null };
  const { data: superAdmin } = await supabase.from("super_admins").select("user_id").eq("user_id", userId).maybeSingle();
  if (superAdmin) return { role: "super-admin", hospitalId: null };
  const { data: hospitalAdmin } = await supabase.from("hospital_admins").select("hospital_id, role").eq("user_id", userId).limit(1).maybeSingle();
  if (hospitalAdmin) return { role: "hospital-admin", hospitalId: hospitalAdmin.hospital_id };
  return { role: "none", hospitalId: null };
}

async function finishPendingSignup(user) {
  const pending = getPendingSignup();
  if (!supabase || !user || !pending) return { completed: false };
  if (pending.email?.toLowerCase() !== user.email?.toLowerCase()) return { completed: false };

  if (!pendingCompletionPromises.has(user.id)) {
    const promise = (async () => {
      const existing = await resolveRole(user.id);
      if (existing.role === "hospital-admin") {
        saveOnboardingDraft({ name: pending.name, subdomain: pending.subdomain });
        clearPendingSignup();
        return { completed: true, hospitalId: existing.hospitalId };
      }

      const { data, error } = await supabase.rpc("create_hospital_tenant", {
        p_name: pending.name,
        p_subdomain: pending.subdomain,
      });
      if (error) return { completed: false, error };
      saveOnboardingDraft({ name: pending.name, subdomain: pending.subdomain });
      clearPendingSignup();
      return { completed: true, hospitalId: data };
    })().finally(() => pendingCompletionPromises.delete(user.id));
    pendingCompletionPromises.set(user.id, promise);
  }

  return pendingCompletionPromises.get(user.id);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState("none");
  const [hospitalId, setHospitalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSignupError, setPendingSignupError] = useState(null);
  const [pendingSignupCompleted, setPendingSignupCompleted] = useState(false);

  async function refreshRole(userId = session?.user?.id) {
    const result = await resolveRole(userId);
    setRole(result.role);
    setHospitalId(result.hospitalId);
    return result;
  }

  async function completePendingSignup(user = session?.user) {
    const result = await finishPendingSignup(user);
    if (result.error) setPendingSignupError(result.error);
    if (result.completed) {
      setPendingSignupCompleted(true);
      await refreshRole(user?.id);
    }
    return result;
  }

  useEffect(() => {
    let active = true;

    async function apply(nextSession) {
      if (!active) return;
      setLoading(true);
      setSession(nextSession);
      let result = await resolveRole(nextSession?.user?.id);

      if (nextSession?.user && result.role === "none") {
        const completion = await finishPendingSignup(nextSession.user);
        if (completion.error && active) setPendingSignupError(completion.error);
        if (completion.completed) {
          if (active) setPendingSignupCompleted(true);
          result = await resolveRole(nextSession.user.id);
        }
      }

      if (active) {
        setRole(result.role);
        setHospitalId(result.hospitalId);
        setLoading(false);
      }
    }

    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => apply(nextSession), 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    role,
    hospitalId,
    loading,
    pendingSignupError,
    pendingSignupCompleted,
    clearPendingSignupError: () => setPendingSignupError(null),
    completePendingSignup,
    signIn: async (email, password) => {
      if (!supabase) return { error: new Error("Supabase কনফিগার করা নেই") };
      return supabase.auth.signInWithPassword({ email, password });
    },
    signOut: async () => {
      setPendingSignupCompleted(false);
      return supabase?.auth.signOut();
    },
    refreshRole,
  }), [session, role, hospitalId, loading, pendingSignupError, pendingSignupCompleted]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
