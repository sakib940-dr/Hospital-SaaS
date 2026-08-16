import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Field, Input, useToast } from "../components/ui/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { clearPendingSignup } from "../lib/pendingSignup.js";

export default function LoginPage() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const shownPendingError = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const emailConfirmed = new URLSearchParams(location.search).get("signup") === "confirmed";

  useEffect(() => {
    if (auth.pendingSignupError && shownPendingError.current !== auth.pendingSignupError) {
      shownPendingError.current = auth.pendingSignupError;
      const message = String(auth.pendingSignupError.message || "").toLowerCase();
      toast.error(message.includes("subdomain") || message.includes("duplicate")
        ? "নির্বাচিত subdomainটি আর available নেই। নতুন তথ্য দিয়ে আবার Signup করুন।"
        : auth.pendingSignupError.message || "হাসপাতালের workspace তৈরি করা যায়নি।");
    }
  }, [auth.pendingSignupError, toast]);

  useEffect(() => {
    if (auth.loading || !auth.user || auth.pendingSignupError) return;
    const destination = auth.role === "super-admin"
      ? "/super-admin"
      : auth.pendingSignupCompleted || auth.role === "none"
        ? "/onboarding"
        : "/admin";
    navigate(destination, { replace: true });
  }, [auth.loading, auth.user, auth.role, auth.pendingSignupCompleted, auth.pendingSignupError, navigate]);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    const { error } = await auth.signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      const message = String(error.message || "").toLowerCase();
      toast.error(message.includes("invalid login")
        ? "ইমেইল বা পাসওয়ার্ড সঠিক নয়।"
        : error.message || "লগইন করা যায়নি।");
    } else {
      toast.success("লগইন সফল হয়েছে।");
    }
  }

  async function restartSignup() {
    clearPendingSignup();
    auth.clearPendingSignupError();
    await auth.signOut();
    navigate("/signup", { replace: true });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface-subtle p-5">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <img src="/favicon.svg" alt="" className="size-12" />
        <h1 className="mt-5 text-3xl">লগইন</h1>
        <p className="mt-2 text-primary-500">হাসপাতাল অ্যাডমিন ও প্ল্যাটফর্ম অ্যাডমিনের জন্য একই ফর্ম।</p>
        {emailConfirmed && <p className="mt-3 rounded-lg bg-success-light p-3 text-sm text-success-dark">ইমেইল ভেরিফাই হয়েছে। এখন login করলে আপনার hospital workspace তৈরি হবে।</p>}
        {location.state?.from && <p className="mt-3 rounded-lg bg-primary-50 p-3 text-sm text-primary-600">চালিয়ে যেতে লগইন করুন।</p>}
        {auth.pendingSignupError ? (
          <div className="mt-5 rounded-xl border border-danger/20 bg-danger-light p-4">
            <p className="font-semibold text-danger-dark">Workspace তৈরি সম্পূর্ণ হয়নি</p>
            <p className="mt-1 text-sm text-danger-dark">Signup তথ্য নতুন করে দিয়ে আবার চেষ্টা করুন। আপনার verified account নিরাপদ থাকবে।</p>
            <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={restartSignup}>আবার Signup করুন</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="ইমেইল" required><Input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
            <Field label="পাসওয়ার্ড" required><Input type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
            <Button type="submit" className="w-full" loading={loading}>লগইন করুন</Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-primary-500">নতুন হাসপাতাল? <Link to="/signup" className="font-semibold text-primary-800 underline decoration-accent decoration-2 underline-offset-4">Signup করুন</Link></p>
      </Card>
    </main>
  );
}
