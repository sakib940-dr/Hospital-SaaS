import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);
const styles = {
  success: [CheckCircle2, "border-success/25 bg-success-light text-success-dark"],
  error: [AlertCircle, "border-danger/25 bg-danger-light text-danger-dark"],
  info: [Info, "border-primary-200 bg-white text-primary-800"],
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const toast = useCallback((message, type = "info") => {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    setItems((current) => [...current, { id, message, type }]);
    window.setTimeout(() => remove(id), 4500);
    return id;
  }, [remove]);
  const value = useMemo(() => ({ toast, success: (message) => toast(message, "success"), error: (message) => toast(message, "error"), info: (message) => toast(message, "info") }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {items.map((item) => {
          const [Icon, style] = styles[item.type] || styles.info;
          return <div key={item.id} role={item.type === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border p-4 shadow-md ${style}`}><Icon className="mt-0.5 size-5 shrink-0" /><p className="flex-1 text-sm font-medium">{item.message}</p><button aria-label="নোটিফিকেশন বন্ধ করুন" onClick={() => remove(item.id)}><X className="size-4" /></button></div>;
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
