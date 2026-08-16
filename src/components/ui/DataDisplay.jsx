import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Inbox, Menu, X } from "lucide-react";

export function Table({ columns, data = [], pageSize = 10, rowKey = "id", emptyText = "কোনো তথ্য নেই" }) {
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), "bn", { numeric: true }) * (sort.direction === "asc" ? 1 : -1));
  }, [data, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pages);
  const rows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const toggleSort = (key) => {
    setSort((current) => current?.key === key ? { key, direction: current.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" });
    setPage(1);
  };
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface-muted text-primary-600"><tr>{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold">{column.sortable ? <button className="inline-flex items-center gap-1" onClick={() => toggleSort(column.key)}>{column.label}<ChevronsUpDown className="size-3.5" /></button> : column.label}</th>)}</tr></thead>
          <tbody>{rows.length ? rows.map((row, index) => <tr key={row[rowKey] ?? index} className="border-t border-primary-100 hover:bg-primary-50/60">{columns.map((column) => <td key={column.key} className="px-4 py-3 text-primary-700">{column.render ? column.render(row, index) : row[column.key] ?? "—"}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-primary-500">{emptyText}</td></tr>}</tbody>
        </table>
      </div>
      {pages > 1 && <div className="flex items-center justify-end gap-2 border-t border-primary-100 px-4 py-3"><span className="mr-2 text-sm text-primary-500">{safePage} / {pages}</span><button aria-label="আগের পাতা" disabled={safePage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="grid size-9 place-items-center rounded-lg border border-primary-200 disabled:opacity-40"><ChevronLeft className="size-4" /></button><button aria-label="পরের পাতা" disabled={safePage === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="grid size-9 place-items-center rounded-lg border border-primary-200 disabled:opacity-40"><ChevronRight className="size-4" /></button></div>}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-primary-50 p-1">{tabs.map((tab) => <button key={tab.value} role="tab" aria-selected={value === tab.value} onClick={() => onChange(tab.value)} className={`min-h-10 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition ${value === tab.value ? "bg-white text-primary-900 shadow-xs" : "text-primary-600 hover:text-primary-900"}`}>{tab.label}</button>)}</div>;
}

export function SidebarNavItem({ icon: Icon, label, badge, active, onClick }) {
  return <button onClick={onClick} aria-current={active ? "page" : undefined} className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${active ? "bg-accent text-primary-900" : "text-primary-100 hover:bg-white/10 hover:text-white"}`}>{Icon && <Icon className="size-4.5 shrink-0" />}<span className="flex-1">{label}</span>{badge != null && badge !== 0 && <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-primary-900 text-white" : "bg-danger text-white"}`}>{badge}</span>}</button>;
}

export function SidebarLayout({ brand, sidebar, children }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-surface-subtle lg:grid lg:grid-cols-[17rem_1fr]"><button onClick={() => setOpen(true)} aria-label="মেনু খুলুন" className="fixed left-4 top-3 z-30 grid size-11 place-items-center rounded-lg bg-primary-900 text-white shadow-md lg:hidden"><Menu /></button>{open && <button aria-label="মেনু বন্ধ করুন" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-primary-900/45 lg:hidden" />}<aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-primary-900 p-4 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><div className="mb-6 flex min-h-12 items-center justify-between border-b border-white/10 pb-4"><strong>{brand}</strong><button onClick={() => setOpen(false)} aria-label="মেনু বন্ধ করুন" className="grid size-10 place-items-center lg:hidden"><X /></button></div><nav onClick={() => setOpen(false)} className="space-y-1">{sidebar}</nav></aside><main className="min-w-0 px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:py-8">{children}</main></div>;
}

export function EmptyState({ title = "এখনো কোনো তথ্য নেই", description, action, icon: Icon = Inbox }) {
  return <div className="px-5 py-15 text-center"><span className="mx-auto grid size-20 place-items-center rounded-2xl bg-primary-50 text-primary-400 shadow-xs"><Icon className="size-10" /></span><h3 className="mt-5 text-xl">{title}</h3>{description && <p className="mx-auto mt-2 max-w-md text-sm text-primary-500">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}

export function Skeleton({ className = "h-5 w-full" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-primary-100 ${className}`} />;
}
