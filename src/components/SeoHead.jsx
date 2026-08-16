import { useEffect } from "react";

function ensureMeta(selector, attributes) {
  let node = document.head.querySelector(selector);
  if (!node) { node = document.createElement("meta"); document.head.appendChild(node); }
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
}

export default function SeoHead({ hospital }) {
  useEffect(() => {
    if (!hospital) return;
    const name = hospital.name || hospital.name_bn || "হাসপাতাল";
    const title = hospital.seo_title || `${name} — চিকিৎসা ও অ্যাপয়েন্টমেন্ট`;
    const description = hospital.seo_description || `${name}-এর ডাক্তার, সেবা, যোগাযোগ ও অনলাইন অ্যাপয়েন্টমেন্টের তথ্য দেখুন।`;
    document.title = title;
    ensureMeta('meta[name="description"]', { name: "description", content: description });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: title });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: description });
    let favicon = document.head.querySelector('link[rel="icon"]');
    if (!favicon) { favicon = document.createElement("link"); favicon.rel = "icon"; document.head.appendChild(favicon); }
    favicon.href = hospital.favicon_url || hospital.logo_url || "/favicon.svg";
  }, [hospital]);
  return null;
}
