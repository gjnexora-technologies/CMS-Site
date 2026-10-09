-- ==============================================================================
-- NEXORA CMS DATABASE SCHEMA
-- Single Source of Truth for Admin Panel & Dynamic User Website
-- Compatible with Supabase PostgreSQL, Row Level Security, and Storage
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  general JSONB NOT NULL DEFAULT '{
    "site_name": "Nexora Innovations",
    "site_title": "Nexora Innovations | Next-Gen Digital Solutions",
    "site_description": "We engineer transformative digital experiences, cloud architecture, and intelligent software for forward-thinking enterprises.",
    "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    "favicon_url": "data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 24 24'' fill=''%232563eb''%3E%3Cpolygon points=''12 2 2 7 12 12 22 7 12 2''/%3E%3Cpolyline points=''2 17 12 22 22 17''/%3E%3Cpolyline points=''2 12 12 17 22 12''/%3E%3C/svg%3E",
    "website_url": "https://nexora.example.com",
    "contact_email": "hello@nexora.example.com",
    "phone_number": "+1 (555) 234-5678",
    "address": "742 Innovation Blvd, Suite 400, San Francisco, CA 94107"
  }'::jsonb,
  branding JSONB NOT NULL DEFAULT '{
    "primary_color": "#2563eb",
    "secondary_color": "#4f46e5",
    "accent_color": "#06b6d4",
    "font_family": "Plus Jakarta Sans",
    "border_radius": "lg",
    "dark_mode_enabled": false
  }'::jsonb,
  seo JSONB NOT NULL DEFAULT '{
    "site_title": "Nexora Innovations | Next-Gen Digital Solutions",
    "meta_description": "Transformative software, cloud systems, and AI-driven platforms crafted for modern scaling enterprises.",
    "keywords": "web development, modern cms, cloud solutions, ui/ux design, react, supabase",
    "og_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    "social_sharing_title": "Nexora - Engineering the Future of Digital Experiences",
    "social_sharing_description": "Explore our portfolio, cloud services, and bespoke engineering capabilities."
  }'::jsonb,
  social_media JSONB NOT NULL DEFAULT '{
    "facebook": "https://facebook.com/nexora",
    "instagram": "https://instagram.com/nexora",
    "youtube": "https://youtube.com/@nexora",
    "linkedin": "https://linkedin.com/company/nexora",
    "twitter": "https://twitter.com/nexora",
    "whatsapp": "+15552345678"
  }'::jsonb,
  header JSONB NOT NULL DEFAULT '{
    "layout": "standard",
    "is_sticky": true,
    "show_cta": true,
    "cta_text": "Schedule Consultation",
    "cta_link": "/contact",
    "bg_style": "glass"
  }'::jsonb,
  footer JSONB NOT NULL DEFAULT '{
    "show_newsletter": true,
    "newsletter_title": "Subscribe to Architectural Briefings",
    "newsletter_desc": "Get curated engineering notes, framework updates, and industry insights straight to your inbox.",
    "copyright_text": "© 2026 Nexora Innovations Inc. All rights reserved.",
    "show_social": true,
    "legal_links": [
      {"label": "Privacy Policy", "url": "/privacy"},
      {"label": "Terms of Service", "url": "/terms"},
      {"label": "Security Disclosure", "url": "/security"}
    ]
  }'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PAGES TABLE
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  is_home BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  seo JSONB DEFAULT '{
    "title": "",
    "description": "",
    "keywords": "",
    "og_image": "",
    "no_index": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PAGE SECTIONS TABLE
CREATE TABLE IF NOT EXISTS page_sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{
    "background_style": "default",
    "padding_y": "normal",
    "alignment": "center",
    "container_width": "default"
  }'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Draft page snapshots stay separate from the live records above until published.
CREATE TABLE IF NOT EXISTS page_drafts (
  page_id TEXT PRIMARY KEY REFERENCES pages(id) ON DELETE CASCADE,
  page_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. NAVIGATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS navigation_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '_self',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  parent_id TEXT REFERENCES navigation_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MEDIA LIBRARY TABLE
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  size INTEGER DEFAULT 0,
  format TEXT,
  alt_text TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CONTACT FORM SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_sort_order ON page_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_navigation_items_sort ON navigation_items(sort_order);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view published pages" ON pages;
DROP POLICY IF EXISTS "Public can view visible sections of published pages" ON page_sections;
DROP POLICY IF EXISTS "Public can view navigation items" ON navigation_items;
DROP POLICY IF EXISTS "Public can view media" ON media;
DROP POLICY IF EXISTS "Public can submit contact forms" ON contact_submissions;
DROP POLICY IF EXISTS "Full access for all on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Full access for all on pages" ON pages;
DROP POLICY IF EXISTS "Full access for all on page_sections" ON page_sections;
DROP POLICY IF EXISTS "Full access for all on page_drafts" ON page_drafts;
DROP POLICY IF EXISTS "Full access for all on navigation_items" ON navigation_items;
DROP POLICY IF EXISTS "Full access for all on media" ON media;
DROP POLICY IF EXISTS "Full access for all on contact_submissions" ON contact_submissions;

-- Full CRUD permissions for frontend applications (allowing both anon key and authenticated users)
CREATE POLICY "Full access for all on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for all on pages" ON pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for all on page_sections" ON page_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for all on page_drafts" ON page_drafts FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON page_drafts TO anon, authenticated;
CREATE POLICY "Full access for all on navigation_items" ON navigation_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for all on media" ON media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for all on contact_submissions" ON contact_submissions FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.publish_page_draft(p_page_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  draft public.page_drafts%ROWTYPE;
BEGIN
  SELECT * INTO draft
  FROM public.page_drafts
  WHERE page_id = p_page_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No draft found for page %', p_page_id;
  END IF;

  UPDATE public.pages
  SET title = COALESCE(draft.page_data->>'title', title),
      slug = COALESCE(draft.page_data->>'slug', slug),
      status = 'published',
      is_home = COALESCE((draft.page_data->>'is_home')::BOOLEAN, is_home),
      sort_order = COALESCE((draft.page_data->>'sort_order')::INTEGER, sort_order),
      seo = COALESCE(draft.page_data->'seo', seo),
      updated_at = NOW(),
      published_at = NOW()
  WHERE id = p_page_id;

  DELETE FROM public.page_sections WHERE page_id = p_page_id;

  INSERT INTO public.page_sections (
    id, page_id, section_type, content, settings, sort_order,
    is_visible, created_at, updated_at
  )
  SELECT section->>'id', p_page_id, section->>'section_type',
         COALESCE(section->'content', '{}'::jsonb),
         COALESCE(section->'settings', '{}'::jsonb),
         COALESCE((section->>'sort_order')::INTEGER, 0),
         COALESCE((section->>'is_visible')::BOOLEAN, true),
         COALESCE((section->>'created_at')::TIMESTAMPTZ, NOW()), NOW()
  FROM jsonb_array_elements(draft.sections) AS section;

  DELETE FROM public.page_drafts WHERE page_id = p_page_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.publish_page_draft(TEXT) TO anon, authenticated;

-- 10. STORAGE BUCKET FOR MEDIA (Optional Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access for Media Bucket" ON storage.objects;
CREATE POLICY "Public Access for Media Bucket" ON storage.objects
FOR ALL USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

-- 11. INITIAL SEED DATA
INSERT INTO site_settings (id, general, branding, seo, social_media, header, footer)
VALUES (
  'default',
  '{
    "site_name": "Nexora Innovations",
    "site_title": "Nexora Innovations | Next-Gen Digital Solutions",
    "site_description": "We engineer transformative digital experiences, cloud architecture, and intelligent software for forward-thinking enterprises.",
    "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    "favicon_url": "data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 24 24'' fill=''%232563eb''%3E%3Cpolygon points=''12 2 2 7 12 12 22 7 12 2''/%3E%3Cpolyline points=''2 17 12 22 22 17''/%3E%3Cpolyline points=''2 12 12 17 22 12''/%3E%3C/svg%3E",
    "website_url": "https://nexora.example.com",
    "contact_email": "hello@nexora.example.com",
    "phone_number": "+1 (555) 234-5678",
    "address": "742 Innovation Blvd, Suite 400, San Francisco, CA 94107"
  }'::jsonb,
  '{
    "primary_color": "#2563eb",
    "secondary_color": "#4f46e5",
    "accent_color": "#06b6d4",
    "font_family": "Plus Jakarta Sans",
    "border_radius": "lg",
    "dark_mode_enabled": false
  }'::jsonb,
  '{
    "site_title": "Nexora Innovations | Next-Gen Digital Solutions",
    "meta_description": "Transformative software, cloud systems, and AI-driven platforms crafted for modern scaling enterprises.",
    "keywords": "web development, modern cms, cloud solutions, ui/ux design, react, supabase",
    "og_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    "social_sharing_title": "Nexora - Engineering the Future of Digital Experiences",
    "social_sharing_description": "Explore our portfolio, cloud services, and bespoke engineering capabilities.",
    "canonical_url": "https://nexora.example.com"
  }'::jsonb,
  '{
    "facebook": "https://facebook.com/nexora",
    "instagram": "https://instagram.com/nexora",
    "youtube": "https://youtube.com/@nexora",
    "linkedin": "https://linkedin.com/company/nexora",
    "twitter": "https://twitter.com/nexora",
    "whatsapp": "+15552345678"
  }'::jsonb,
  '{
    "layout": "standard",
    "is_sticky": true,
    "show_cta": true,
    "cta_text": "Schedule Consultation",
    "cta_link": "/contact",
    "bg_style": "glass"
  }'::jsonb,
  '{
    "show_newsletter": true,
    "newsletter_title": "Subscribe to Architectural Briefings",
    "newsletter_desc": "Get curated engineering notes, framework updates, and industry insights straight to your inbox.",
    "copyright_text": "© 2026 Nexora Innovations Inc. All rights reserved.",
    "show_social": true,
    "legal_links": [
      {"label": "Privacy Policy", "url": "/privacy"},
      {"label": "Terms of Service", "url": "/terms"},
      {"label": "Security Disclosure", "url": "/security"}
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- SEED PAGES
INSERT INTO pages (id, title, slug, status, is_home, sort_order) VALUES
('page-home', 'Home', '', 'published', true, 0),
('page-about', 'About Us', 'about', 'published', false, 1),
('page-services', 'Services', 'services', 'published', false, 2),
('page-projects', 'Projects', 'projects', 'published', false, 3),
('page-pricing', 'Pricing', 'pricing', 'published', false, 4),
('page-contact', 'Contact', 'contact', 'published', false, 5)
ON CONFLICT (id) DO NOTHING;

-- SEED STARTER PAGE SECTIONS
-- Seed only pages with no sections. Re-running this schema will not add starter
-- content to pages that already contain user-managed sections.
INSERT INTO page_sections (id, page_id, section_type, content, settings, sort_order, is_visible)
SELECT seed.id, seed.page_id, seed.section_type, seed.content, seed.settings, seed.sort_order, true
FROM (VALUES
  ('sec-home-hero', 'page-home', 'hero',
   $$ {"badge":"Next-Gen Digital Platform","heading":"Architecting Tomorrow’s Digital Infrastructure","description":"Empower your enterprise with lightning-fast cloud platforms, intelligent software, and bespoke web solutions engineered for maximum scalability.","primary_btn_text":"Explore Solutions","primary_btn_link":"/services","secondary_btn_text":"View Case Studies","secondary_btn_link":"/projects","image_url":"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80","stats":[{"label":"Uptime Reliability","value":"99.99%"},{"label":"Active End Users","value":"4.8M+"},{"label":"Mean Latency Drop","value":"62%"}]} $$::jsonb,
   $$ {"background_style":"gradient","padding_y":"spacious","alignment":"center"} $$::jsonb, 0),
  ('sec-home-bento', 'page-home', 'bento_grid',
   $$ {"badge":"Core Architecture","heading":"Engineered for Uncompromising Speed & Reliability","description":"Every component is benchmarked against strict latency targets and high-availability operational standards.","items":[{"title":"Autonomous Cloud Scaling","desc":"Dynamic cluster auto-scaling with cold-start mitigation and global edge caching.","icon":"Zap","badge":"Cloud Native"},{"title":"Zero-Trust Security Mesh","desc":"Hardware-backed secret isolation, automated penetration scanning, and RBAC governance.","icon":"Shield","badge":"Enterprise"},{"title":"Unified Data Orchestration","desc":"Harmonize transactional SQL and real-time vector embeddings with zero data duplication.","icon":"Database","badge":"Real-time"},{"title":"Intelligent Observability","desc":"Full-stack distributed tracing and proactive anomaly alerts before customers notice.","icon":"Activity","badge":"Metrics"}]} $$::jsonb,
   $$ {"background_style":"default","padding_y":"normal","alignment":"center"} $$::jsonb, 1),
  ('sec-home-about', 'page-home', 'about',
   $$ {"badge":"Craftsmanship & Standards","heading":"Transforming Intricate Visions into Intuitive Digital Realities","description":"For over a decade, Nexora has partnered with visionary founders and leading enterprises to turn challenging technical obstacles into competitive advantages.","image_url":"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80","points":["SOC2 Type II and ISO 27001 verified engineering workflows","Continuous integration pipelines with sub-second feedback loops","Senior multidisciplinary product strategists & systems architects","Transparent code ownership with full documentation from Day 1"],"cta_text":"Learn More About Us","cta_link":"/about"} $$::jsonb,
   $$ {"background_style":"muted","padding_y":"spacious","alignment":"left"} $$::jsonb, 2),
  ('sec-home-services', 'page-home', 'services',
   $$ {"badge":"Our Capabilities","heading":"Full-Spectrum Digital Engineering Solutions","description":"From foundation cloud primitives to responsive web apps, explore our full spectrum of specialized capabilities.","items":[{"title":"Modern Web & SaaS Systems","desc":"High-performance React web applications crafted with responsive styling and accessible design systems.","icon":"Globe"},{"title":"Cloud & DevOps Infrastructure","desc":"Kubernetes orchestration, Terraform automation, and resilient multi-region disaster recovery.","icon":"Cloud"},{"title":"AI & Machine Learning Integration","desc":"Production-ready LLM pipelines, autonomous agent workflows, and vector search systems.","icon":"Sparkles"},{"title":"Ultra-Low-Latency APIs","desc":"Microservices architectures with gRPC, GraphQL, and event-driven messaging.","icon":"Server"}]} $$::jsonb,
   $$ {"background_style":"default","padding_y":"spacious","alignment":"center"} $$::jsonb, 3),
  ('sec-home-projects', 'page-home', 'projects',
   $$ {"badge":"Case Studies","heading":"Mission-Critical Platforms In Action","description":"Real-world impact delivered to high-growth tech ventures and enterprise innovators.","items":[{"title":"Aether Financial Engine","category":"FinTech","desc":"High-throughput algorithmic transaction dashboard streaming live market data.","image_url":"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80","metric":"$2.4B Daily Volume","link":"/projects"},{"title":"OmniHealth Portal","category":"HealthTech","desc":"Secure medical records suite and encrypted virtual consultations.","image_url":"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80","metric":"1.2M Active Patients","link":"/projects"}]} $$::jsonb,
   $$ {"background_style":"muted","padding_y":"normal","alignment":"center"} $$::jsonb, 4),
  ('sec-home-testimonials', 'page-home', 'testimonials',
   $$ {"badge":"Client Endorsements","heading":"Trusted by Forward-Looking Industry Leaders","description":"Hear directly from tech founders and corporate executives who scaled with Nexora.","items":[{"quote":"Nexora revamped our entire digital stack within 4 months. Our platform throughput increased five-fold while infrastructure costs dropped by 40%.","name":"Elena Rostova","role":"Chief Technology Officer, Aether Capital","avatar_url":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80","rating":5},{"quote":"The architectural precision and attention to visual detail they brought was extraordinary. Our user engagement scores are at an all-time high.","name":"Marcus Chen","role":"VP of Product, OmniHealth","avatar_url":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80","rating":5}]} $$::jsonb,
   $$ {"background_style":"default","padding_y":"spacious","alignment":"center"} $$::jsonb, 5),
  ('sec-home-cta', 'page-home', 'cta',
   $$ {"heading":"Ready to Accelerate Your Enterprise Roadmap?","description":"Collaborate with our elite engineering studio to build resilient, elegant, and future-ready digital platforms.","primary_btn_text":"Start a Project","primary_btn_link":"/contact","secondary_btn_text":"Explore Pricing Plans","secondary_btn_link":"/pricing"} $$::jsonb,
   $$ {"background_style":"brand","padding_y":"spacious","alignment":"center"} $$::jsonb, 6),
  ('sec-about-hero', 'page-about', 'hero',
   $$ {"badge":"Our Mission & Story","heading":"Pioneering Digital Craftsmanship at Scale","description":"We believe exceptional software is born at the intersection of rigorous systems engineering and human-centered design elegance.","primary_btn_text":"Meet The Team","primary_btn_link":"#team","secondary_btn_text":"Our Capabilities","secondary_btn_link":"/services","image_url":"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"} $$::jsonb,
   $$ {"background_style":"gradient","padding_y":"normal","alignment":"center"} $$::jsonb, 0),
  ('sec-about-rich', 'page-about', 'rich_text',
   $$ {"title":"Our Principles of Engineering","content":"<h3>Radical Transparency</h3><p>We work in the open. Our clients receive direct repository commits, unvarnished sprint retrospectives, and automated test coverage dashboards.</p><h3>Design as a Structural Attribute</h3><p>Design shapes system performance, API clarity, user comprehension, and sustainable long-term value.</p><h3>Resilience Over Hype</h3><p>We build on battle-tested foundations and adopt innovations when they provide clear operational leverage.</p>"} $$::jsonb,
   $$ {"background_style":"default","padding_y":"normal","alignment":"left"} $$::jsonb, 1),
  ('sec-about-team', 'page-about', 'team',
   $$ {"badge":"Executive Leadership","heading":"The Minds Behind Nexora Innovations","description":"Seasoned systems architects, designers, and engineering leaders committed to your success.","members":[{"name":"Alexander Wright","role":"Chief Executive Officer","bio":"16+ years scaling distributed systems and web platforms.","avatar_url":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80","linkedin":"https://linkedin.com","twitter":"https://twitter.com"},{"name":"Dr. Priya Shenoy","role":"Chief Technology Officer","bio":"Leading authority in distributed systems and vector search.","avatar_url":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80","linkedin":"https://linkedin.com","twitter":"https://twitter.com"}]} $$::jsonb,
   $$ {"background_style":"muted","padding_y":"spacious","alignment":"center"} $$::jsonb, 2),
  ('sec-services-hero', 'page-services', 'hero',
   $$ {"badge":"Comprehensive Services","heading":"Architected for High Throughput & Rapid Velocity","description":"Discover how our modular engineering teams accelerate roadmaps, untangle legacy bottlenecks, and bring ambitious digital products to market.","primary_btn_text":"Discuss Your Project","primary_btn_link":"/contact","secondary_btn_text":"View Projects","secondary_btn_link":"/projects"} $$::jsonb,
   $$ {"background_style":"gradient","padding_y":"normal","alignment":"center"} $$::jsonb, 0),
  ('sec-services-grid', 'page-services', 'services',
   $$ {"badge":"What We Do","heading":"Engineering Services","description":"Specialist teams for your most ambitious digital initiatives.","items":[{"title":"Product & Web Engineering","desc":"Accessible, high-performance web applications and SaaS platforms.","icon":"Globe"},{"title":"Cloud Infrastructure & Kubernetes","desc":"Declarative infrastructure, automated deployment, and multi-region resilience.","icon":"Cloud"},{"title":"AI Model Deployment & RAG","desc":"Retrieval-augmented generation, vector search, and guarded inference.","icon":"Sparkles"},{"title":"Database & High-Scale Caching","desc":"PostgreSQL optimization, distributed caching, and real-time pipelines.","icon":"Database"}]} $$::jsonb,
   $$ {"background_style":"default","padding_y":"spacious","alignment":"center"} $$::jsonb, 1),
  ('sec-services-faq', 'page-services', 'faq',
   $$ {"badge":"Questions & Answers","heading":"Frequently Asked Questions","description":"Everything you need to know about partnering with our engineering team.","items":[{"question":"How quickly can your engineering team onboard?","answer":"Typically within 5 to 7 business days, beginning with an architectural alignment workshop."},{"question":"Do we own the intellectual property and source code?","answer":"Yes. All code, configuration, design assets, and documentation created during the engagement belong to your organization."},{"question":"Can you work alongside our existing engineers?","answer":"Absolutely. Our engineers can integrate into your sprint rituals, reviews, and communication channels."}]} $$::jsonb,
   $$ {"background_style":"muted","padding_y":"spacious","alignment":"center"} $$::jsonb, 2),
  ('sec-projects-hero', 'page-projects', 'hero',
   $$ {"badge":"Portfolio Showcase","heading":"Proven Digital Impact Across Modern Industries","description":"Explore the high-scale platforms, SaaS portals, and innovative systems engineered by our team.","primary_btn_text":"Discuss a Project","primary_btn_link":"/contact","secondary_btn_text":"View Services","secondary_btn_link":"/services"} $$::jsonb,
   $$ {"background_style":"gradient","padding_y":"normal","alignment":"center"} $$::jsonb, 0),
  ('sec-projects-gallery', 'page-projects', 'gallery',
   $$ {"badge":"Visual Gallery","heading":"Architectural Snapshots & Interface Highlights","description":"A glimpse into the user interfaces and design systems crafted for our global clients.","images":[{"url":"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80","title":"Financial Dashboard & Real-Time Metrics","category":"FinTech"},{"url":"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80","title":"SaaS Analytics Workspace","category":"Enterprise SaaS"},{"url":"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80","title":"Telemedicine Console","category":"Healthcare"}]} $$::jsonb,
   $$ {"background_style":"default","padding_y":"spacious","alignment":"center"} $$::jsonb, 1),
  ('sec-pricing-hero', 'page-pricing', 'hero',
   $$ {"badge":"Flexible Engagement","heading":"Transparent Engineering Investment Tiers","description":"Predictable pricing models designed for agile startups and high-growth enterprise scale.","primary_btn_text":"Request Custom Proposal","primary_btn_link":"/contact","secondary_btn_text":"Read FAQ","secondary_btn_link":"/services"} $$::jsonb,
   $$ {"background_style":"gradient","padding_y":"normal","alignment":"center"} $$::jsonb, 0),
  ('sec-pricing-plans', 'page-pricing', 'pricing',
   $$ {"badge":"Plans","heading":"Choose Your Collaboration Model","description":"From tactical sprint augmentations to dedicated venture squads.","plans":[{"name":"Sprint Acceleration","price":"$6,500","period":"per sprint","desc":"Ideal for targeted feature rollouts, technical audits, or MVPs.","features":["2 dedicated senior engineers","Sprint planning and grooming","Daily sync and code reviews","CI/CD pipeline setup"],"cta_text":"Book Sprint Team","cta_link":"/contact","is_popular":false},{"name":"Dedicated Product Squad","price":"$16,000","period":"per month","desc":"End-to-end product delivery for scaling teams.","features":["Dedicated engineering specialists","Product architect and delivery lead","SOC2 and HIPAA governance","Priority incident response"],"cta_text":"Engage Dedicated Squad","cta_link":"/contact","is_popular":true}]} $$::jsonb,
   $$ {"background_style":"default","padding_y":"spacious","alignment":"center"} $$::jsonb, 1),
  ('sec-contact-hero', 'page-contact', 'hero',
   $$ {"badge":"Let's Build Together","heading":"Start Your Next Digital Transformation","description":"Tell us about the challenge you’re solving. Our engineering team will get back to you shortly.","primary_btn_text":"Send an Inquiry","primary_btn_link":"#contact-form"} $$::jsonb,
   $$ {"background_style":"gradient","padding_y":"normal","alignment":"center"} $$::jsonb, 0),
  ('sec-contact-form', 'page-contact', 'contact_form',
   $$ {"badge":"Get in Touch","heading":"Talk to Our Team","description":"Share a few details and we’ll connect you with the right specialist.","success_message":"Thank you. Your message has been received."} $$::jsonb,
   $$ {"background_style":"default","padding_y":"spacious","alignment":"center"} $$::jsonb, 1)
) AS seed(id, page_id, section_type, content, settings, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM page_sections existing WHERE existing.page_id = seed.page_id
);

-- SEED NAVIGATION
INSERT INTO navigation_items (id, label, url, target, sort_order, is_visible) VALUES
('nav-home', 'Home', '/', '_self', 0, true),
('nav-about', 'About', '/about', '_self', 1, true),
('nav-services', 'Services', '/services', '_self', 2, true),
('nav-projects', 'Projects', '/projects', '_self', 3, true),
('nav-pricing', 'Pricing', '/pricing', '_self', 4, true),
('nav-contact', 'Contact', '/contact', '_self', 5, true)
ON CONFLICT (id) DO NOTHING;
