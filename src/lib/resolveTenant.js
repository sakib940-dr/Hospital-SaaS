const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function resolveTenant(location = window.location) {
  const hostname = location.hostname.toLowerCase().replace(/^www\./, "");
  const params = new URLSearchParams(location.search);
  const localOverride = params.get("hospital")?.trim().toLowerCase();
  if (LOCAL_HOSTS.has(hostname) && localOverride) return { mode: "hospital", lookupType: "subdomain", value: localOverride };

  const rootDomain = (import.meta.env?.VITE_ROOT_DOMAIN || "hospitalcloud.com").toLowerCase();
  if (LOCAL_HOSTS.has(hostname)) return { mode: "marketing", lookupType: null, value: null };
  if (hostname === `admin.${rootDomain}` || hostname === `super-admin.${rootDomain}`) return { mode: "super-admin", lookupType: null, value: null };
  if (hostname === rootDomain) return { mode: "marketing", lookupType: null, value: null };
  if (hostname.endsWith(`.${rootDomain}`)) return { mode: "hospital", lookupType: "subdomain", value: hostname.slice(0, -(rootDomain.length + 1)) };
  return { mode: "hospital", lookupType: "custom_domain", value: hostname };
}
