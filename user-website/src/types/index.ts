export type PageStatus = 'draft' | 'published' | 'unpublished';

export type SectionType =
  | 'hero'
  | 'services'
  | 'about'
  | 'bento_grid'
  | 'projects'
  | 'testimonials'
  | 'team'
  | 'pricing'
  | 'faq'
  | 'contact_form'
  | 'cta'
  | 'gallery'
  | 'video'
  | 'rich_text'
  | 'two_column';

export interface SiteGeneralSettings {
  site_name: string;
  site_title: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  website_url: string;
  contact_email: string;
  phone_number: string;
  address: string;
}

export interface SiteBrandingSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  border_radius: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  dark_mode_enabled: boolean;
}

export interface SiteSeoSettings {
  site_title: string;
  meta_description: string;
  keywords: string;
  og_image: string;
  social_sharing_title: string;
  social_sharing_description: string;
  canonical_url?: string;
}

export interface SiteSocialMediaSettings {
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
}

export interface SiteHeaderSettings {
  layout: 'standard' | 'centered' | 'minimal';
  is_sticky: boolean;
  show_cta: boolean;
  cta_text: string;
  cta_link: string;
  bg_style: 'glass' | 'solid' | 'transparent';
}

export interface SiteFooterSettings {
  show_newsletter: boolean;
  newsletter_title: string;
  newsletter_desc: string;
  copyright_text: string;
  show_social: boolean;
  legal_links: Array<{ label: string; url: string }>;
}

export interface SiteSettings {
  id: string;
  general: SiteGeneralSettings;
  branding: SiteBrandingSettings;
  seo: SiteSeoSettings;
  social_media: SiteSocialMediaSettings;
  header: SiteHeaderSettings;
  footer: SiteFooterSettings;
  updated_at: string;
}

export interface PageSeo {
  title?: string;
  description?: string;
  keywords?: string;
  og_image?: string;
  no_index?: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  is_home: boolean;
  sort_order: number;
  seo: PageSeo;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface SectionSettings {
  background_style?: 'default' | 'muted' | 'dark' | 'gradient' | 'brand';
  padding_y?: 'compact' | 'normal' | 'spacious';
  alignment?: 'left' | 'center' | 'right';
  container_width?: 'narrow' | 'default' | 'wide' | 'full';
}

export interface PageSection {
  id: string;
  page_id: string;
  section_type: SectionType;
  content: Record<string, any>;
  settings: SectionSettings;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  sort_order: number;
  is_visible: boolean;
  parent_id?: string | null;
  children?: NavigationItem[];
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  format?: string;
  alt_text?: string;
  caption?: string;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}
