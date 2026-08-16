import { useState } from "react";
import { Tabs } from "../../components/ui/index.js";
import GenericCrudPanel from "./GenericCrudPanel.jsx";
const fields = [{ key: "name", label: "বিবরণ", bilingual: true, required: true }, { key: "cost", label: "আনুমানিক খরচ", bilingual: true, required: true }];
export default function CostsPanel() { const [tab, setTab] = useState("treatment_costs"); const label = tab === "treatment_costs" ? "চিকিৎসা" : "পরীক্ষা"; return <div><Tabs value={tab} onChange={setTab} tabs={[{ value: "treatment_costs", label: "চিকিৎসা খরচ" }, { value: "investigation_costs", label: "পরীক্ষা খরচ" }]} /><div className="mt-6"><GenericCrudPanel key={tab} title={`${label} খরচ`} emptyTitle={`এখনো কোনো ${label} খরচ যোগ করা হয়নি`} emptyDescription="নিচের বাটনে ক্লিক করে রোগীদের জন্য প্রথম আনুমানিক খরচ যোগ করুন।" table={tab} fields={fields} orderBy="sort_order" /></div></div>; }
