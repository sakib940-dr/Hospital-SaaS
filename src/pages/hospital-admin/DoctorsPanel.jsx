import GenericCrudPanel from "./GenericCrudPanel.jsx";

const fields = [
  { key: "name", label: "নাম", bilingual: true, required: true, placeholderBn: "উদাহরণ: ডা. মো. রহিম উদ্দিন", placeholderEn: "Example: Dr. Md. Rahim Uddin" },
  { key: "spec", label: "বিশেষজ্ঞ বিভাগ", bilingual: true, required: true, placeholderBn: "উদাহরণ: মেডিসিন বিশেষজ্ঞ", placeholderEn: "Example: Medicine Specialist" },
  { key: "designation", label: "পদবি", bilingual: true, placeholderBn: "উদাহরণ: কনসালট্যান্ট, মেডিসিন", placeholderEn: "Example: Consultant, Medicine" },
  { key: "degree", label: "ডিগ্রি", bilingual: true, placeholderBn: "উদাহরণ: এমবিবিএস, এফসিপিএস", placeholderEn: "Example: MBBS, FCPS" },
  { key: "chamber", label: "ভিজিটিং সময়", bilingual: true, placeholderBn: "উদাহরণ: বিকাল ৫টা – রাত ৮টা", placeholderEn: "Example: 5:00 PM – 8:00 PM", hint: "রোগীরা যে সময় appointment নিতে পারবেন।" },
  { key: "bio", label: "সংক্ষিপ্ত পরিচিতি", bilingual: true, type: "textarea", placeholderBn: "উদাহরণ: দীর্ঘদিন ধরে মেডিসিন বিভাগে রোগী দেখছেন...", placeholderEn: "Example: Experienced consultant in internal medicine..." },
  { key: "photo", label: "ডাক্তারের ছবি", type: "image", wide: true, hint: "Square বা portrait JPG/PNG/WebP ছবি সবচেয়ে ভালো দেখায়।" },
  { key: "bmdc_number", label: "BMDC নম্বর", placeholder: "উদাহরণ: A-12345", hint: "প্রযোজ্য হলে নিবন্ধন নম্বর দিন।" },
  { key: "fee", label: "ভিজিট ফি (৳)", type: "number", min: 0, placeholder: "উদাহরণ: 500" },
  { key: "exp", label: "অভিজ্ঞতা", placeholder: "উদাহরণ: ১২ বছর" },
  { key: "is_active", label: "ওয়েবসাইটে দেখান", type: "checkbox" },
];

export default function DoctorsPanel() { return <GenericCrudPanel title="ডাক্তার" description="ডাক্তারদের প্রোফাইল, সময় ও ফি পরিচালনা করুন।" emptyTitle="এখনো কোনো ডাক্তার যোগ করা হয়নি" emptyDescription="নিচের বাটনে ক্লিক করে প্রথম ডাক্তারের প্রোফাইল তৈরি করুন।" table="doctors" fields={fields} />; }
