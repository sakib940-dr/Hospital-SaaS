# Hospital SaaS Design System

এই design system Sirajganj Eye Hospital-এর শান্ত, নির্ভরযোগ্য visual language অনুসরণ করে। Forest green মূল brand color, mustard/gold শুধু গুরুত্বপূর্ণ action ও highlight-এর জন্য, এবং off-white surface দীর্ঘসময় ব্যবহারে চোখের আরাম বজায় রাখে। UI ইচ্ছাকৃতভাবে simple: rounded cards, হালকা border, subtle shadow এবং পরিষ্কার hierarchy।

## Color tokens

### Primary

| Token | Hex | ব্যবহার |
|---|---:|---|
| `primary-50` | `#f2f7f5` | Page tint, selected background |
| `primary-100` | `#e4efec` | Soft border, hover background |
| `primary-200` | `#c8ddd8` | Divider, disabled border |
| `primary-300` | `#a0c5bd` | Decorative UI |
| `primary-400` | `#74a69d` | Secondary icon |
| `primary-500` | `#4a615c` | Body-muted text |
| `primary-600` | `#3e524d` | Label, secondary action |
| `primary-700` | `#33443f` | Strong secondary text |
| `primary-800` | `#1a3936` | Hover on dark controls |
| `primary-900` | `#082a28` | Brand, heading, primary button |

### Accent, surfaces and status

| Token | Value | ব্যবহার |
|---|---:|---|
| `accent` / `accent-400` | `#D9A24B` | Primary CTA, active state, highlight |
| `surface` / `surface-raised` | `#ffffff` | Card, modal |
| `surface-subtle` | `#f2f7f5` | Page background |
| `surface-muted` | `#eef2f0` | Alternate section, table header |
| `surface-inverse` | `#082a28` | Hero, footer, dark navigation |
| `success` | `#247a52` | Completed/healthy state |
| `warning` | `#b7791f` | Attention/pending state |
| `danger` | `#c0392b` | Error/destructive state |

Status color-এর `light` ও `dark` variant আছে। শুধু color দিয়ে status বোঝানো যাবে না—icon বা text label সঙ্গে দিন। Accent decorativeভাবে বেশি ব্যবহার না করে মূল action-এ সীমিত রাখুন।

## Typography

Font stack: `Hind Siliguri`, `Noto Sans Bengali`, system sans-serif। একই family বাংলা ও ইংরেজিতে সামঞ্জস্য রাখে। সাধারণ body size `16px`, line-height প্রায় `1.75`।

| Style | Mobile / Desktop | Weight | Tailwind / ব্যবহার |
|---|---|---:|---|
| H1 | `36px / 48px` | 600 | Page/hero title, প্রতি page-এ একটি |
| H2 | `30px / 36px` | 600 | Major section heading |
| H3 | `24px` | 600 | Card group বা subsection |
| H4 | `20px` | 600 | Card title |
| H5 | `18px` | 600 | Compact panel title |
| H6 | `16px` | 600 | Small group heading |
| Body | `16px` | 400 | Default paragraph and UI copy |
| Caption | `14px` | 400–600 | Metadata, helper text; `.caption` |

Heading-এ sentence case ব্যবহার করুন। দীর্ঘ বাংলা copy-তে narrow container এবং relaxed line-height রাখুন। Muted text-এর জন্য অন্তত `primary-500`; আরও হালকা shade body copy-তে ব্যবহার করবেন না।

## Spacing

Base grid `4px`। Tailwind-এর default spacing scale রাখা হয়েছে, সঙ্গে প্রয়োজনীয় intermediate/layout token যোগ হয়েছে।

| Token | Value | সাধারণ ব্যবহার |
|---|---:|---|
| `1` | `4px` | Icon micro-gap |
| `2` | `8px` | Inline gap |
| `3` | `12px` | Compact control gap |
| `4` | `16px` | Default gap/padding |
| `4.5` | `18px` | Dense card padding |
| `5` | `20px` | Card padding |
| `5.5` | `22px` | Comfortable control group |
| `6` | `24px` | Content group |
| `7.5` | `30px` | Panel separation |
| `8` | `32px` | Large card padding |
| `13` | `52px` | Compact section spacing |
| `15` | `60px` | Default section spacing |
| `18` | `72px` | Hero spacing |
| `22` | `88px` | Large desktop section |
| `26` | `104px` | Marketing layout only |
| `30` | `120px` | Maximum display spacing |

একটি component-এর ভেতরে সাধারণত `8/12/16/20/24px` ব্যবহার করুন। `60px+` token শুধু page section-এর vertical rhythm-এর জন্য।

## Radius and shadow

| Token | Value | ব্যবহার |
|---|---:|---|
| `rounded-sm` | `8px` | Badge, compact control |
| `rounded` | `12px` | Input, button |
| `rounded-lg` | `14px` | Large control |
| `rounded-xl` | `16px` | Default card |
| `rounded-2xl` | `20px` | Modal, feature panel |
| `shadow-sm` | subtle | Button, sticky bar |
| `shadow-card` | subtle/medium | Default raised card |
| `shadow-md` | medium | Dropdown, popover |
| `shadow-lg` | strong | Modal only |
| `shadow-focus` | gold ring | Optional programmatic focus treatment |

Cards-এর default: `rounded-xl border border-primary-100 bg-surface-raised p-5 shadow-card`। একই card-এ heavy border ও heavy shadow একসঙ্গে ব্যবহার করবেন না।

## Button variants

| Variant | Tailwind recipe | কখন ব্যবহার করবেন |
|---|---|---|
| Primary | `bg-primary-900 text-white hover:bg-primary-800` | Form submit, main workflow action |
| Accent | `bg-accent text-primary-900 hover:bg-accent-300` | এক page-এর সবচেয়ে গুরুত্বপূর্ণ CTA |
| Secondary | `border border-primary-200 bg-white text-primary-900 hover:bg-primary-50` | Alternative action |
| Ghost | `bg-transparent text-primary-700 hover:bg-primary-50` | Toolbar, low-emphasis action |
| Danger | `bg-danger text-white hover:bg-danger-dark` | Confirmed destructive action only |
| Disabled | `bg-primary-100 text-primary-400 cursor-not-allowed` | Unavailable state; `disabled` attribute আবশ্যক |

সব button-এর baseline: `rounded-lg px-4 py-2.5 font-semibold transition`। Icon-only button minimum `40×40px`, form CTA minimum height `44px`। এক view-তে একটি dominant accent বা primary action রাখুন।

## Accessibility and motion

- সব keyboard-focusable element `focus-visible` gold outline/ring পায়।
- `prefers-reduced-motion: reduce` হলে animation ও smooth scroll কার্যত বন্ধ হয়।
- Body text light surface-এ `primary-500` বা গাঢ়; ছোট text-এ `primary-600` পছন্দনীয়।
- Focus, validation ও status কখনো শুধু color-এর ওপর নির্ভর করবে না।
- Interactive target অন্তত `40×40px`, মূল form control `44px` বা বেশি রাখুন।
