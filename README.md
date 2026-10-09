# Nexora Website Builder & CMS System

A complete **two-application website management system** consisting of:

1. **Admin Panel** (`/admin-panel` - runs on `http://localhost:5173`)
2. **User Website** (`/user-website` - runs on `http://localhost:5174`)

---

## 🌟 Architecture & Single Source of Truth

The **Admin Panel is the single source of truth for the entire User Website**. The User Website has **no hardcoded business content**; everything is retrieved and rendered dynamically from the backend and database.

```text
                ┌───────────────────────────────────┐
                │          ADMIN PANEL              │
                │        (Port: 5173)               │
                │                                   │
                │  Visual Builder | Pages | Media   │
                │  Settings | SEO | Theme | Nav     │
                └─────────────────┬─────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │   SHARED BACKEND & STORAGE        │
                │                                   │
                │  • Supabase PostgreSQL Database   │
                │  • Supabase Storage (media bucket)│
                │  • Real-time WebSocket sync       │
                │  • Zero-Config Offline Fallback   │
                └─────────────────┬─────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │          USER WEBSITE             │
                │        (Port: 5174)               │
                │                                   │
                │  Dynamic Page Renderer            │
                │  Dynamic Head & Favicon Injection │
                │  Dynamic Theme / CSS Tokens       │
                │  Live Revalidation on Publish     │
                └───────────────────────────────────┘
```

---

## 🚀 Quick Start (Running Both Applications)

### 1. Start Admin Panel
```bash
cd admin-panel
npm run dev
# Running at: http://localhost:5173
```

### 2. Start User Website
In a second terminal window:
```bash
cd user-website
npm run dev
# Running at: http://localhost:5174
```

> **Instant Live Sync Out of the Box:**
> You can test editing in the Admin Panel right now! Thanks to the built-in `BroadcastChannel` and unified storage layer, when you change a heading, color, or reorder sections in the Admin Panel, the User Website updates **in real time across windows**!

---

## 🗄️ Supabase PostgreSQL Backend & Migration

The system includes a complete production-grade SQL migration in `supabase/schema.sql`.

### To connect to your Supabase Project:
1. Create a project on [Supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Create a public storage bucket named `media` in **Storage**.
4. Create `.env` in both `/admin-panel` and `/user-website`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For admin sign-in, create the admin account in Supabase Authentication, then add
the `ADMIN_ACCESS_CODE` secret in your Supabase project's Edge Function secrets
and deploy the `admin-login` function. Sign-in requires the account's email and
password through Supabase Auth, followed by the access code. Supabase Auth
handles passwords; this app does not store them as readable text. Keep the
access code private and do not add it to the app's `.env` files or source
control.

The schema seeds starter sections for pages that have no sections. If the pages
list is populated but the public site and page builder have no content, run
`supabase/schema.sql` again in the Supabase SQL Editor. The section seed won't
replace pages that already contain user-managed sections.

---

## 🧩 Visual Section Builder Catalog

The Admin Panel includes a visual drag-and-drop page builder with 15+ section templates:

| Category | Section Types |
| :--- | :--- |
| **Content** | `hero` (Banner with stats & CTA), `rich_text` (HTML/Articles), `about` (Image + Text split), `two_column` |
| **Media** | `gallery` (Filterable lightbox gallery), `video` (HTML5, YouTube, Vimeo embeds with autoplay & controls) |
| **Business** | `services` (Card grid with icons), `projects` (Case studies with metrics), `testimonials` (Quotes & ratings), `team` (Profiles & social links), `pricing` (3-tier plans with popular badge), `faq` (Accordion), `contact_form` (Interactive lead submission), `cta` (Banner) |
| **Layout** | `bento_grid` (Modern asymmetric grid), `two_column` |

---

## 🎨 Website Settings & Theming

The Admin Panel completely controls the public website aesthetics:
- **General**: Site name, title, description, logo, favicon, contact info.
- **Branding**: Primary color, Secondary color, Accent color, Google Fonts (`Plus Jakarta Sans`, `Inter`, `Outfit`, `Playfair Display`, `Roboto`), Corner radius.
- **Dynamic Head**: Favicon and title are dynamically injected into `<head>` based on admin settings.
- **SEO**: Per-page and site-wide meta title, description, keywords, Open Graph image.
- **Social Media**: Facebook, Instagram, LinkedIn, Twitter/X, YouTube, WhatsApp links.
- **Header & Footer**: Sticky navigation, CTA buttons, background styles, newsletter box, copyright text.
