import { useEffect, useState } from "react";
import { Globe2, Save, Star } from "lucide-react";
import { Button, Card, Field, Input, Skeleton, useToast } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import { isValidDomain, sanitizeDomain } from "../../lib/validation.js";

function validWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function SettingsPanel() {
  const { hospitalId, session } = useAuth();
  const toast = useToast();
  const [domain, setDomain] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  const [dns, setDns] = useState(null);
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessReady, setBusinessReady] = useState(false);

  useEffect(() => {
    if (!supabase || !hospitalId) {
      setBusinessReady(true);
      return;
    }
    supabase.from("hospitals").select("google_business_url").eq("id", hospitalId).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(error.message);
      setGoogleBusinessUrl(data?.google_business_url || "");
      setBusinessReady(true);
    });
  }, [hospitalId]);

  async function submitDomain(event) {
    event.preventDefault();
    const clean = sanitizeDomain(domain);
    if (!isValidDomain(clean)) return toast.error("সঠিক domain লিখুন, যেমন hospital.example.com");
    setDomainLoading(true);
    try {
      const response = await fetch("/api/add-custom-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` },
        body: JSON.stringify({ hospitalId, domain: clean }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Domain যোগ করা যায়নি");
      setDns(body.dns);
      toast.success("Domain যোগ হয়েছে। DNS record সেট করুন।");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDomainLoading(false);
    }
  }

  async function saveGoogleBusiness(event) {
    event.preventDefault();
    const clean = googleBusinessUrl.trim();
    if (clean && !validWebUrl(clean)) return toast.error("সঠিক Google Business Profile URL দিন।");
    if (!supabase) return toast.error("Supabase কনফিগার করা নেই");
    setBusinessLoading(true);
    const { error } = await supabase.from("hospitals").update({ google_business_url: clean || null }).eq("id", hospitalId);
    setBusinessLoading(false);
    error ? toast.error(error.message) : toast.success("Google Business Profile লিংক সেভ হয়েছে।");
  }

  return (
    <div>
      <p className="caption font-semibold text-primary-600">Configuration</p>
      <h1 className="mt-1 text-3xl">Settings</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary-700"><Globe2 /></span>
            <div><h2 className="text-xl">Custom domain</h2><p className="text-sm text-primary-500">নিজস্ব domain-এ হাসপাতালের website চালান।</p></div>
          </div>
          <form onSubmit={submitDomain} className="mt-6">
            <Field label="Domain" required hint="Protocol ছাড়া লিখুন">
              <Input required placeholder="hospital.example.com" value={domain} onChange={(event) => setDomain(event.target.value)} />
            </Field>
            <Button className="mt-4" type="submit" loading={domainLoading}>Domain যোগ করুন</Button>
          </form>
          {dns && <div className="mt-5 rounded-xl bg-primary-50 p-4 text-sm"><strong>DNS record</strong><p className="mt-2">Type: <code>{dns.type}</code></p><p>Name: <code>{dns.name}</code></p><p>Value: <code>{dns.value}</code></p></div>}
        </Card>

        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary-700"><Star /></span>
            <div><h2 className="text-xl">Google Business Profile</h2><p className="text-sm text-primary-500">রোগীদের Google review দেওয়ার সরাসরি লিংক দিন।</p></div>
          </div>
          {!businessReady ? <Skeleton className="mt-6 h-28" /> : (
            <form onSubmit={saveGoogleBusiness} className="mt-6">
              <Field label="Google Business Profile লিংক" hint="Google Business Profile-এর review বা profile URL দিন।">
                <Input type="url" placeholder="https://g.page/r/.../review" value={googleBusinessUrl} onChange={(event) => setGoogleBusinessUrl(event.target.value)} />
              </Field>
              <Button className="mt-4" type="submit" loading={businessLoading}><Save className="size-4" /> সেভ করুন</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
