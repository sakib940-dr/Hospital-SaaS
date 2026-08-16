import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import Button from "./Button.jsx";

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKeyDown = (event) => event.key === "Escape" && onCloseRef.current?.();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-primary-900/55 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`w-full ${widths[size]} rounded-2xl bg-white shadow-lg`}>
        <header className="flex items-center justify-between gap-4 border-b border-primary-100 px-5 py-4">
          <h3 id={titleId} className="text-xl">{title}</h3>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="grid size-10 place-items-center rounded-lg text-primary-500 hover:bg-primary-50"><X className="size-5" /></button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-3 border-t border-primary-100 px-5 py-4">{footer}</footer>}
      </section>
    </div>
  );
}

export function ConfirmDialog({ open, title = "নিশ্চিত করুন", message, children, confirmLabel = "নিশ্চিত", cancelLabel = "বাতিল", danger = false, loading = false, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={<><Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button><Button variant={danger ? "danger" : "primary"} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}
    >
      {message && <p className="text-primary-600">{message}</p>}
      {children}
    </Modal>
  );
}
