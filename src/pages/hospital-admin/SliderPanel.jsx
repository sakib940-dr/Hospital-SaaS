import GenericCrudPanel from "./GenericCrudPanel.jsx";

const fields = [
  { key: "caption", label: "ব্যানার শিরোনাম", bilingual: true, required: true, placeholderBn: "উদাহরণ: বিশ্বস্ত চিকিৎসা, আন্তরিক সেবা", placeholderEn: "Example: Trusted care, compassionate service" },
  { key: "image", label: "ব্যানার ছবি", type: "image", required: true, wide: true, hint: "Landscape JPG/PNG/WebP দিন; 1600×700px বা কাছাকাছি মাপ সবচেয়ে ভালো।" },
  { key: "sort_order", label: "দেখানোর ক্রম", type: "number", min: 0, defaultValue: 0, placeholder: "উদাহরণ: 1", hint: "কম সংখ্যা আগে দেখাবে।" },
  { key: "is_active", label: "Visitor website-এ দেখান", type: "checkbox" },
];

export default function SliderPanel() {
  return <GenericCrudPanel title="ব্যানার স্লাইডার" description="Visitor website-এর automatic hero banner ছবি পরিচালনা করুন।" emptyTitle="এখনো কোনো ব্যানার ছবি যোগ করা হয়নি" emptyDescription="প্রথম landscape ছবি যোগ করলে visitor website-এ slider স্বয়ংক্রিয়ভাবে চালু হবে।" table="slider_images" fields={fields} primaryKey="caption" orderBy="sort_order" ascending uploadFolder="slider" />;
}
