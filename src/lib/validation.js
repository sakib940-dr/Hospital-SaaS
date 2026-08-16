export const sanitizeText = (value, maxLength = 500) => String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, maxLength);
export const sanitizeSubdomain = (value) => String(value ?? "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
export const isValidSubdomain = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 63;
export const sanitizePhone = (value) => String(value ?? "").replace(/[^+0-9]/g, "").replace(/(?!^)\+/g, "").slice(0, 16);
export const isValidPhone = (value) => /^\+?[0-9]{10,16}$/.test(value);
export const sanitizeDomain = (value) => String(value ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
export const isValidDomain = (value) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(value);
