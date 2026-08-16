import GenericCrudPanel from "./GenericCrudPanel.jsx";

const fields = [
  { key: "name", label: "নাম", bilingual: true, required: true },
  { key: "spec", label: "বিশেষজ্ঞ", bilingual: true, required: true },
  { key: "degree", label: "ডিগ্রি", bilingual: true },
  { key: "chamber", label: "চেম্বারের সময়", bilingual: true },
  { key: "photo", label: "ডাক্তারের ছবি", type: "image", wide: true },
  { key: "bmdc_number", label: "BMDC নম্বর" },
  { key: "fee", label: "ভিজিট ফি", type: "number" },
  { key: "exp", label: "অভিজ্ঞতা" },
  { key: "is_active", label: "ওয়েবসাইটে দেখান", type: "checkbox" },
];

export default function DoctorsPanel() { return <GenericCrudPanel title="ডাক্তার" description="ডাক্তারদের প্রোফাইল, সময় ও ফি পরিচালনা করুন।" emptyTitle="এখনো কোনো ডাক্তার যোগ করা হয়নি" emptyDescription="নিচের বাটনে ক্লিক করে প্রথম ডাক্তারের প্রোফাইল তৈরি করুন।" table="doctors" fields={fields} />; }
