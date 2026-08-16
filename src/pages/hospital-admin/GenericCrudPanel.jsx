import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Badge, Button, Card, Checkbox, ConfirmDialog, EmptyState, Field, Input, Modal, Select, Skeleton, Textarea, useToast } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { createTenantRow, deleteTenantRow, listTenantRows, updateTenantRow, uploadHospitalAsset } from "../../lib/api/tenantCrud.js";

const blankFor = (fields) => Object.fromEntries(fields.map((field) => [field.key, field.bilingual ? { bn: "", en: "" } : field.type === "checkbox" ? true : ""]));
const labelOf = (row, key) => { const value = row[key]; return typeof value === "object" ? value?.bn || value?.en : value; };

export default function GenericCrudPanel({ title, description, emptyTitle = "এখনো কোনো তথ্য যোগ করা হয়নি", emptyDescription = "নিচের বাটনে ক্লিক করে প্রথম তথ্যটি যোগ করুন।", table, fields, primaryKey = "name", orderBy = "created_at" }) {
  const { hospitalId } = useAuth();
  const toast = useToast();
  const initial = useMemo(() => blankFor(fields), [fields]);
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  async function load() { const { data, error } = await listTenantRows(table, hospitalId, { orderBy }); if (error) toast.error(error.message); setRows(data || []); }
  useEffect(() => { if (hospitalId) load(); }, [hospitalId, table]);
  const openNew = () => { setEditing("new"); setForm(initial); };
  const openEdit = (row) => { setEditing(row); setForm(Object.fromEntries(fields.map((field) => [field.key, row[field.key] ?? initial[field.key]]))); };
  const set = (key, value, lang) => setForm((current) => ({ ...current, [key]: lang ? { ...(current[key] || {}), [lang]: value } : value }));
  async function save(event) {
    event.preventDefault();
    const requiredMissing = fields.some((field) => field.required && (field.bilingual ? !form[field.key]?.bn?.trim() : !String(form[field.key] ?? "").trim()));
    if (requiredMissing) { toast.error("আবশ্যক তথ্য পূরণ করুন।"); return; }
    setSaving(true);
    const payload = Object.fromEntries(fields.map((field) => [field.key, field.type === "number" && form[field.key] !== "" ? Number(form[field.key]) : form[field.key]]));
    const result = editing === "new" ? await createTenantRow(table, hospitalId, payload) : await updateTenantRow(table, hospitalId, editing.id, payload);
    setSaving(false);
    if (result.error) toast.error(result.error.message); else { toast.success("সফলভাবে সংরক্ষিত হয়েছে।"); setEditing(null); load(); }
  }
  async function remove() { const result = await deleteTenantRow(table, hospitalId, deleting.id); if (result.error) toast.error(result.error.message); else { toast.success("মুছে ফেলা হয়েছে।"); setDeleting(null); load(); } }
  async function upload(field, file) { const result = await uploadHospitalAsset(hospitalId, table, file); if (result.error) toast.error(result.error.message); else set(field.key, result.url); }
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="caption font-semibold text-primary-600">ম্যানেজমেন্ট</p><h1 className="mt-1 text-3xl">{title}</h1>{description && <p className="mt-2 text-primary-500">{description}</p>}</div><Button onClick={openNew}><Plus className="size-4" /> নতুন যোগ করুন</Button></div><Card className="mt-6 overflow-hidden">{rows === null ? <div className="space-y-3 p-5"><Skeleton /><Skeleton /><Skeleton /></div> : rows.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} action={<Button onClick={openNew}>প্রথমটি যোগ করুন</Button>} /> : <div className="divide-y divide-primary-100">{rows.map((row) => <div key={row.id} className="flex flex-wrap items-center gap-4 p-4"><div className="min-w-0 flex-1">{row.image || row.photo ? <img src={row.image || row.photo} alt="" loading="lazy" className="mr-3 inline-block size-12 rounded-lg object-cover" /> : null}<strong>{labelOf(row, primaryKey) || row.name || row.id}</strong>{row.is_active != null && <Badge className="ml-2" variant={row.is_active ? "success" : "neutral"}>{row.is_active ? "Active" : "Hidden"}</Badge>}<p className="mt-1 truncate text-sm text-primary-500">{labelOf(row, fields.find((field) => field.key !== primaryKey)?.key) || ""}</p></div><Button size="sm" variant="ghost" aria-label="এডিট" onClick={() => openEdit(row)}><Pencil className="size-4" /></Button><Button size="sm" variant="danger" aria-label="মুছুন" onClick={() => setDeleting(row)}><Trash2 className="size-4" /></Button></div>)}</div>}</Card><Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === "new" ? `${title}: নতুন` : `${title}: এডিট`} footer={<><Button variant="secondary" onClick={() => setEditing(null)}>বাতিল</Button><Button loading={saving} onClick={() => document.getElementById(`form-${table}`)?.requestSubmit()}>সেভ করুন</Button></>}><form id={`form-${table}`} onSubmit={save} className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field.key} className={field.wide || field.bilingual ? "sm:col-span-2" : ""}>{field.bilingual ? <div className="grid gap-3 sm:grid-cols-2"><Field label={`${field.label} (বাংলা)`} required={field.required}><Input required={field.required} value={form[field.key]?.bn || ""} onChange={(e) => set(field.key, e.target.value, "bn")} /></Field><Field label={`${field.label} (English)`}><Input value={form[field.key]?.en || ""} onChange={(e) => set(field.key, e.target.value, "en")} /></Field></div> : field.type === "textarea" ? <Field label={field.label} required={field.required}><Textarea required={field.required} value={form[field.key] || ""} onChange={(e) => set(field.key, e.target.value)} /></Field> : field.type === "select" ? <Field label={field.label} required={field.required}><Select required={field.required} value={form[field.key] || ""} onChange={(e) => set(field.key, e.target.value)}><option value="">নির্বাচন করুন</option>{field.options.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</Select></Field> : field.type === "checkbox" ? <Checkbox label={field.label} checked={Boolean(form[field.key])} onChange={(e) => set(field.key, e.target.checked)} /> : field.type === "image" ? <Field label={field.label}><Input value={form[field.key] || ""} onChange={(e) => set(field.key, e.target.value)} placeholder="Image URL" /><label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary-700"><Upload className="size-4" /> ছবি আপলোড<input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(field, e.target.files[0])} /></label></Field> : <Field label={field.label} required={field.required}><Input type={field.type || "text"} required={field.required} value={form[field.key] ?? ""} onChange={(e) => set(field.key, e.target.value)} /></Field>}</div>)}</form></Modal><ConfirmDialog open={Boolean(deleting)} title="তথ্য মুছবেন?" message="এই কাজটি ফিরিয়ে আনা যাবে না।" danger onCancel={() => setDeleting(null)} onConfirm={remove} /></div>;
}
