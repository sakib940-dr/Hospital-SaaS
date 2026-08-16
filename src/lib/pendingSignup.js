const PENDING_SIGNUP_KEY = "hospital-cloud-pending-signup";
const ONBOARDING_DRAFT_KEY = "hospital-cloud-onboarding-draft";

function read(key) {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function getPendingSignup() {
  return read(PENDING_SIGNUP_KEY);
}

export function savePendingSignup(value) {
  write(PENDING_SIGNUP_KEY, value);
}

export function clearPendingSignup() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(PENDING_SIGNUP_KEY);
}

export function getOnboardingDraft() {
  return read(ONBOARDING_DRAFT_KEY);
}

export function saveOnboardingDraft(value) {
  write(ONBOARDING_DRAFT_KEY, value);
}

export function clearOnboardingDraft() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
}
