import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SiteSettings,
  Page,
  PageSection,
  PageDraft,
  NavigationItem,
  MediaItem,
  ContactSubmission,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_PAGES,
  INITIAL_SECTIONS,
  INITIAL_NAVIGATION,
  INITIAL_MEDIA,
} from '../lib/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'apg_school_site_settings',
  PAGES: 'apg_school_pages',
  SECTIONS: 'apg_school_sections',
  NAVIGATION: 'apg_school_navigation',
  MEDIA: 'apg_school_media',
  SUBMISSIONS: 'apg_school_contact_submissions',
  DRAFTS: 'apg_school_page_drafts',
};

let realtimeSubscriptionId = 0;

// Cross-tab and cross-app communication channel
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('apg_school_cms_realtime_sync')
  : null;

function notifyChange(event: string, payload?: any) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: event, payload, timestamp: Date.now() });
  }
}

// Local Storage Helpers
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyChange('DATA_UPDATED', { key });
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Ensure initial seed data exists
export function initializeStorageIfNeeded(): void {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAGES)) {
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(INITIAL_PAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SECTIONS)) {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(INITIAL_SECTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NAVIGATION)) {
    localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(INITIAL_NAVIGATION));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(INITIAL_MEDIA));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DRAFTS)) {
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify([]));
  }
}

async function getPageDraft(pageId: string): Promise<PageDraft | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('page_drafts')
      .select('*')
      .eq('page_id', pageId)
      .maybeSingle();
    if (!error) return (data as PageDraft | null) || null;
    throw error;
  }
  const drafts = getLocalItem<PageDraft[]>(STORAGE_KEYS.DRAFTS, []);
  return drafts.find((draft) => draft.page_id === pageId) || null;
}

async function savePageDraft(draft: PageDraft): Promise<void> {
  const updated = { ...draft, updated_at: new Date().toISOString() };
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('page_drafts').upsert(updated, { onConflict: 'page_id' });
    if (error) throw error;
    return;
  }
  const drafts = getLocalItem<PageDraft[]>(STORAGE_KEYS.DRAFTS, []);
  const index = drafts.findIndex((item) => item.page_id === draft.page_id);
  if (index < 0) drafts.push(updated);
  else drafts[index] = updated;
  setLocalItem(STORAGE_KEYS.DRAFTS, drafts);
}

async function getStoredPage(pageId: string): Promise<Page | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('pages').select('*').eq('id', pageId).maybeSingle();
    if (!error) return (data as Page | null) || null;
    throw error;
  }
  const pages = getLocalItem<Page[]>(STORAGE_KEYS.PAGES, INITIAL_PAGES);
  return pages.find((page) => page.id === pageId) || null;
}

async function getStoredPages(): Promise<Page[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('pages').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []) as Page[];
  }
  return getLocalItem<Page[]>(STORAGE_KEYS.PAGES, INITIAL_PAGES);
}

async function getStoredSections(pageId: string): Promise<PageSection[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true });
    if (!error && data) return data as PageSection[];
    throw error;
  }
  return getLocalItem<PageSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS)
    .filter((section) => section.page_id === pageId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function summarizeDraftSections(draftSections: PageSection[], liveSections: PageSection[]) {
  const liveById = new Map(liveSections.map((section) => [section.id, section]));
  const draftById = new Map(draftSections.map((section) => [section.id, section]));
  const label = (section: PageSection) =>
    section.content?.heading || section.content?.title || section.section_type.replace(/_/g, ' ');
  return {
    added: draftSections.filter((section) => !liveById.has(section.id)).map(label),
    edited: draftSections.flatMap((section) => {
      const live = liveById.get(section.id);
      if (!live) return [];
      const changed = JSON.stringify(live.content) !== JSON.stringify(section.content) ||
        JSON.stringify(live.settings) !== JSON.stringify(section.settings) ||
        live.is_visible !== section.is_visible;
      return changed ? [label(section)] : [];
    }),
    removed: liveSections.filter((section) => !draftById.has(section.id)).map(label),
  };
}

function summarizePageDraft(
  page: Page,
  draftPageData: Partial<Page>,
  draftSections: PageSection[],
  liveSections: PageSection[]
) {
  return {
    ...summarizeDraftSections(draftSections, liveSections),
    pageDetails: [
      ...(draftPageData.title !== page.title ? ['title'] : []),
      ...(draftPageData.slug !== page.slug ? ['URL path'] : []),
      ...(draftPageData.is_home !== page.is_home ? ['homepage setting'] : []),
      ...(JSON.stringify(draftPageData.seo) !== JSON.stringify(page.seo) ? ['SEO'] : []),
    ],
  };
}

async function ensurePageDraft(pageId: string): Promise<PageDraft> {
  const existing = await getPageDraft(pageId);
  if (existing) return existing;
  const page = await getStoredPage(pageId);
  if (!page) throw new Error('Page not found');
  const draft: PageDraft = {
    page_id: pageId,
    page_data: { ...page },
    sections: await getStoredSections(pageId),
    updated_at: new Date().toISOString(),
  };
  await savePageDraft(draft);
  return draft;
}

async function saveStoredSections(pageId: string, sections: PageSection[]): Promise<void> {
  const page = await getStoredPage(pageId);
  if (!page) throw new Error('Page not found');
  const draft = await getPageDraft(pageId);
  if (draft || page.status === 'published') {
    const working = draft || await ensurePageDraft(pageId);
    await savePageDraft({ ...working, sections });
    return;
  }

  if (isSupabaseConfigured && supabase) {
    const { error: deleteError } = await supabase.from('page_sections').delete().eq('page_id', pageId);
    if (deleteError) throw deleteError;
    if (sections.length) {
      const { error } = await supabase.from('page_sections').insert(sections);
      if (error) throw error;
    }
  }
  const all = getLocalItem<PageSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS)
    .filter((section) => section.page_id !== pageId);
  setLocalItem(STORAGE_KEYS.SECTIONS, [...all, ...sections]);
}

async function writePageUpdates(page: Page, updates: Partial<Page>): Promise<Page> {
  const cleanUpdates = { ...updates };
  delete cleanUpdates.has_draft;
  const updatedPage = {
    ...page,
    ...cleanUpdates,
    updated_at: new Date().toISOString(),
    published_at: updates.status === 'published'
      ? (page.published_at || new Date().toISOString())
      : updates.status === 'draft' || updates.status === 'unpublished'
      ? null
      : page.published_at,
  };
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('pages').update(updatedPage).eq('id', page.id);
    if (error) throw error;
  }
  const pages = getLocalItem<Page[]>(STORAGE_KEYS.PAGES, INITIAL_PAGES);
  const index = pages.findIndex((item) => item.id === page.id);
  if (index >= 0) {
    pages[index] = updatedPage;
    setLocalItem(STORAGE_KEYS.PAGES, pages);
  }
  return updatedPage;
}

// Initialize on import
initializeStorageIfNeeded();

export const api = {
  // --- SITE SETTINGS ---
  async getSiteSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (!error && data) return data as SiteSettings;
    }
    return getLocalItem<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const updated: SiteSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('site_settings').upsert(updated);
    }
    setLocalItem(STORAGE_KEYS.SETTINGS, updated);
    notifyChange('SETTINGS_UPDATED', updated);
    return updated;
  },

  // --- PAGES ---
  async getPages(): Promise<Page[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      if (data) {
        const { data: draftRows, error: draftError } = await supabase
          .from('page_drafts')
          .select('page_id, page_data, sections');
        if (draftError) throw draftError;
        const { data: liveSectionRows, error: liveSectionsError } = await supabase
          .from('page_sections')
          .select('*');
        if (liveSectionsError) throw liveSectionsError;
        const draftsById = new Map<string, { page_data: Partial<Page>; sections: PageSection[] }>(
          (draftRows || []).map((draft: any) => [draft.page_id, draft] as const)
        );
        const liveSectionsByPage = new Map<string, PageSection[]>();
        for (const section of (liveSectionRows || []) as PageSection[]) {
          liveSectionsByPage.set(section.page_id, [...(liveSectionsByPage.get(section.page_id) || []), section]);
        }
        return (data as Page[]).map((page) => {
          const draftRecord = draftsById.get(page.id);
          return draftRecord ? {
            ...page,
            ...draftRecord.page_data,
            status: page.status,
            has_draft: true,
            draft_summary: summarizePageDraft(
              page,
              draftRecord.page_data,
              draftRecord.sections as PageSection[],
              liveSectionsByPage.get(page.id) || []
            ),
          } : page;
        });
      }
    }
    const pages = getLocalItem<Page[]>(STORAGE_KEYS.PAGES, INITIAL_PAGES);
    const drafts = getLocalItem<PageDraft[]>(STORAGE_KEYS.DRAFTS, []);
    const draftsById = new Map<string, PageDraft>(
      drafts.map((draft) => [draft.page_id, draft] as const)
    );
    const liveSections = getLocalItem<PageSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    return pages.map((page) => {
      const draftRecord = draftsById.get(page.id);
      return draftRecord ? {
        ...page,
        ...draftRecord.page_data,
        status: page.status,
        has_draft: true,
        draft_summary: summarizePageDraft(
          page,
          draftRecord.page_data,
          draftRecord.sections,
          liveSections.filter((section) => section.page_id === page.id)
        ),
      } : page;
    }).sort((a, b) => a.sort_order - b.sort_order);
  },

  async getPageById(id: string): Promise<Page | null> {
    const page = await getStoredPage(id);
    if (!page) return null;
    const draft = await getPageDraft(id);
    return draft ? { ...page, ...draft.page_data, status: page.status, has_draft: true } : page;
  },

  async getPublishedPageById(id: string): Promise<Page | null> {
    return getStoredPage(id);
  },

  async getPageBySlug(slug: string): Promise<Page | null> {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    const pages = await this.getPages();
    return pages.find((p) => p.slug.replace(/^\/+|\/+$/g, '') === cleanSlug) || null;
  },

  async createPage(pageData: Partial<Page>): Promise<Page> {
    const pages = await getStoredPages();
    const newPage: Page = {
      id: 'page-' + Date.now(),
      title: pageData.title || 'Untitled Page',
      slug: (pageData.slug || 'new-page').toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      status: pageData.status || 'draft',
      is_home: Boolean(pageData.is_home),
      sort_order: pages.length,
      seo: pageData.seo || {
        title: pageData.title || '',
        description: '',
        keywords: '',
        og_image: '',
        no_index: false,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: pageData.status === 'published' ? new Date().toISOString() : null,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('pages').insert(newPage);
    }

    const updatedPages = [...pages, newPage];
    setLocalItem(STORAGE_KEYS.PAGES, updatedPages);
    notifyChange('PAGE_CREATED', newPage);
    return newPage;
  },

  async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    const page = await getStoredPage(id);
    if (!page) throw new Error('Page not found');

    const hasPageDataChanges = Object.keys(updates).some((key) => key !== 'status' && key !== 'published_at');
    if (page.status === 'published' && (hasPageDataChanges || updates.status === 'published' || !updates.status)) {
      const draft = await ensurePageDraft(id);
      const pageUpdates = { ...updates };
      delete pageUpdates.status;
      delete pageUpdates.published_at;
      const updatedDraft = { ...draft, page_data: { ...draft.page_data, ...pageUpdates } };
      await savePageDraft(updatedDraft);
      const workingPage = { ...page, ...updatedDraft.page_data, status: page.status, has_draft: true };
      notifyChange('PAGE_UPDATED', workingPage);
      return workingPage;
    }

    const updatedPage = await writePageUpdates(page, updates);
    notifyChange('PAGE_UPDATED', updatedPage);
    return updatedPage;
  },

  async savePageDraft(id: string): Promise<Page> {
    const page = await getStoredPage(id);
    if (!page) throw new Error('Page not found');
    const draft = await getPageDraft(id);
    if (!draft) return page;
    const saved = { ...page, ...draft.page_data, status: page.status, has_draft: true };
    notifyChange('PAGE_UPDATED', saved);
    return saved;
  },

  async publishPage(id: string): Promise<Page> {
    const page = await getStoredPage(id);
    if (!page) throw new Error('Page not found');
    await ensurePageDraft(id);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.rpc('publish_page_draft', { p_page_id: id });
      if (error) throw error;
    } else {
      const draft = await getPageDraft(id);
      if (!draft) throw new Error('Page draft not found');
      const pages = getLocalItem<Page[]>(STORAGE_KEYS.PAGES, INITIAL_PAGES);
      const pageIndex = pages.findIndex((item) => item.id === id);
      pages[pageIndex] = {
        ...pages[pageIndex], ...draft.page_data, status: 'published',
        published_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setLocalItem(STORAGE_KEYS.PAGES, pages);
      const allSections = getLocalItem<PageSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS)
        .filter((section) => section.page_id !== id);
      setLocalItem(STORAGE_KEYS.SECTIONS, [...allSections, ...draft.sections]);
      const drafts = getLocalItem<PageDraft[]>(STORAGE_KEYS.DRAFTS, []).filter((item) => item.page_id !== id);
      setLocalItem(STORAGE_KEYS.DRAFTS, drafts);
    }

    const published = await getStoredPage(id);
    if (!published) throw new Error('Page not found after publish');
    notifyChange('PAGE_UPDATED', published);
    return published;
  },

  async duplicatePage(id: string): Promise<Page> {
    const original = await this.getPageById(id);
    if (!original) throw new Error('Page not found');

    const sections = await this.getSections(id);
    const newPage = await this.createPage({
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      status: 'draft',
      is_home: false,
      seo: { ...original.seo, title: `${original.title} (Copy)` },
    });

    // Duplicate sections
    for (const sec of sections) {
      await this.createSection({
        page_id: newPage.id,
        section_type: sec.section_type,
        content: JSON.parse(JSON.stringify(sec.content)),
        settings: JSON.parse(JSON.stringify(sec.settings)),
        sort_order: sec.sort_order,
        is_visible: sec.is_visible,
      });
    }

    return newPage;
  },

  async deletePage(id: string): Promise<void> {
    const pages = await this.getPages();
    const filteredPages = pages.filter((p) => p.id !== id);

    const sections = await this.getSections(id);
    const allSections = getLocalItem<PageSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    const filteredSections = allSections.filter((s) => s.page_id !== id);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('pages').delete().eq('id', id);
      await supabase.from('page_sections').delete().eq('page_id', id);
    }

    setLocalItem(STORAGE_KEYS.PAGES, filteredPages);
    setLocalItem(STORAGE_KEYS.SECTIONS, filteredSections);
    const drafts = getLocalItem<PageDraft[]>(STORAGE_KEYS.DRAFTS, []).filter((draft) => draft.page_id !== id);
    setLocalItem(STORAGE_KEYS.DRAFTS, drafts);
    notifyChange('PAGE_DELETED', { id });
  },

  async reorderPages(pageIds: string[]): Promise<void> {
    const pages = await getStoredPages();
    for (const page of pages) {
      const newIndex = pageIds.indexOf(page.id);
      if (newIndex !== -1 && newIndex !== page.sort_order) {
        await this.updatePage(page.id, { sort_order: newIndex });
      }
    }
    const updated = await this.getPages();
    notifyChange('PAGES_REORDERED', updated);
  },

  // --- SECTIONS ---
  async getSections(pageId: string): Promise<PageSection[]> {
    const draft = await getPageDraft(pageId);
    if (draft) return [...draft.sections].sort((a, b) => a.sort_order - b.sort_order);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('sort_order', { ascending: true });
      if (!error && data) return data as PageSection[];
    }
    return getLocalItem<PageSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS)
      .filter((s) => s.page_id === pageId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async getPublishedSections(pageId: string): Promise<PageSection[]> {
    return getStoredSections(pageId);
  },

  async getSectionById(id: string): Promise<PageSection | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: drafts, error: draftsError } = await supabase.from('page_drafts').select('sections');
      if (draftsError) throw draftsError;
      for (const draft of drafts || []) {
        const match = (draft.sections as PageSection[]).find((section) => section.id === id);
        if (match) return match;
      }
      const { data, error } = await supabase.from('page_sections').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return (data as PageSection | null) || null;
    }
    const drafts = getLocalItem<PageDraft[]>(STORAGE_KEYS.DRAFTS, []);
    const draftSection = drafts.flatMap((draft) => draft.sections).find((section) => section.id === id);
    if (draftSection) return draftSection;
    const all = getLocalItem<PageSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    return all.find((section) => section.id === id) || null;
  },

  async createSection(sectionData: Partial<PageSection>): Promise<PageSection> {
    const pageId = sectionData.page_id;
    if (!pageId) throw new Error('page_id is required');

    const existing = await this.getSections(pageId);
    const newSection: PageSection = {
      id: 'sec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      page_id: pageId,
      section_type: sectionData.section_type || 'hero',
      content: sectionData.content || {},
      settings: sectionData.settings || {
        background_style: 'default',
        padding_y: 'normal',
        alignment: 'center',
        container_width: 'default',
      },
      sort_order: existing.length,
      is_visible: sectionData.is_visible !== undefined ? sectionData.is_visible : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveStoredSections(pageId, [...existing, newSection]);
    notifyChange('SECTION_CREATED', newSection);
    return newSection;
  },

  async updateSection(id: string, updates: Partial<PageSection>): Promise<PageSection> {
    const current = await this.getSectionById(id);
    if (!current) throw new Error('Section not found');
    const updatedSection: PageSection = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    const sections = await this.getSections(current.page_id);
    await saveStoredSections(current.page_id, sections.map((section) =>
      section.id === id ? updatedSection : section
    ));
    notifyChange('SECTION_UPDATED', updatedSection);
    return updatedSection;
  },

  async duplicateSection(id: string): Promise<PageSection> {
    const original = await this.getSectionById(id);
    if (!original) throw new Error('Section not found');

    const sections = await this.getSections(original.page_id);
    const newSection = await this.createSection({
      page_id: original.page_id,
      section_type: original.section_type,
      content: JSON.parse(JSON.stringify(original.content)),
      settings: JSON.parse(JSON.stringify(original.settings)),
      sort_order: sections.length,
      is_visible: original.is_visible,
    });
    return newSection;
  },

  async deleteSection(id: string): Promise<void> {
    const section = await this.getSectionById(id);
    if (!section) return;
    const sections = await this.getSections(section.page_id);
    await saveStoredSections(section.page_id, sections.filter((item) => item.id !== id));
    notifyChange('SECTION_DELETED', { id });
  },

  async reorderSections(pageId: string, sectionIds: string[]): Promise<void> {
    const sections = await this.getSections(pageId);
    const updated = sections.map((section) => {
      const newOrder = sectionIds.indexOf(section.id);
      return newOrder !== -1 ? { ...section, sort_order: newOrder } : section;
    });
    await saveStoredSections(pageId, updated);
    notifyChange('SECTIONS_REORDERED', { pageId, sectionIds });
  },

  // --- NAVIGATION ---
  async getNavigation(): Promise<NavigationItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) return data as NavigationItem[];
    }
    const items = getLocalItem<NavigationItem[]>(STORAGE_KEYS.NAVIGATION, INITIAL_NAVIGATION);
    return items.sort((a, b) => a.sort_order - b.sort_order);
  },

  async saveNavigation(items: NavigationItem[]): Promise<NavigationItem[]> {
    const indexed = items.map((item, idx) => ({
      ...item,
      sort_order: idx,
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('navigation_items').upsert(indexed);
    }

    setLocalItem(STORAGE_KEYS.NAVIGATION, indexed);
    notifyChange('NAVIGATION_UPDATED', indexed);
    return indexed;
  },

  // --- MEDIA LIBRARY ---
  async getMedia(): Promise<MediaItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as MediaItem[];
    }
    return getLocalItem<MediaItem[]>(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
  },

  async uploadMedia(
    file: File,
    meta?: { alt_text?: string; caption?: string }
  ): Promise<MediaItem> {
    let url = '';

    // If Supabase Storage is connected, upload to 'media' bucket
    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: publicData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
        url = publicData.publicUrl;
      }
    }

    // Local file fallback using Data URL
    if (!url) {
      url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const isVideo = file.type.startsWith('video/');
    const newMedia: MediaItem = {
      id: 'med-' + Date.now(),
      name: file.name,
      url,
      type: isVideo ? 'video' : 'image',
      size: file.size,
      format: file.type,
      alt_text: meta?.alt_text || file.name,
      caption: meta?.caption || '',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').insert(newMedia);
    }

    const current = await this.getMedia();
    const updated = [newMedia, ...current];
    setLocalItem(STORAGE_KEYS.MEDIA, updated);
    notifyChange('MEDIA_ADDED', newMedia);
    return newMedia;
  },

  async addMediaUrl(item: Omit<MediaItem, 'id' | 'created_at'>): Promise<MediaItem> {
    const newMedia: MediaItem = {
      ...item,
      id: 'med-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').insert(newMedia);
    }

    const current = await this.getMedia();
    const updated = [newMedia, ...current];
    setLocalItem(STORAGE_KEYS.MEDIA, updated);
    notifyChange('MEDIA_ADDED', newMedia);
    return newMedia;
  },

  async deleteMedia(id: string): Promise<void> {
    const current = await this.getMedia();
    const updated = current.filter((m) => m.id !== id);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').delete().eq('id', id);
    }

    setLocalItem(STORAGE_KEYS.MEDIA, updated);
    notifyChange('MEDIA_DELETED', { id });
  },

  async updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    const current = await this.getMedia();
    const index = current.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Media not found');

    const updatedItem = { ...current[index], ...updates };
    current[index] = updatedItem;

    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').update(updatedItem).eq('id', id);
    }

    setLocalItem(STORAGE_KEYS.MEDIA, current);
    notifyChange('MEDIA_UPDATED', updatedItem);
    return updatedItem;
  },

  // --- CONTACT SUBMISSIONS ---
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as ContactSubmission[];
    }
    return getLocalItem<ContactSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  },

  async submitContactForm(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<ContactSubmission> {
    const newSub: ContactSubmission = {
      id: 'sub-' + Date.now(),
      name: data.name,
      email: data.email,
      subject: data.subject || 'Website Inquiry',
      message: data.message,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('contact_submissions').insert(newSub);
    }

    const current = await this.getContactSubmissions();
    const updated = [newSub, ...current];
    setLocalItem(STORAGE_KEYS.SUBMISSIONS, updated);
    notifyChange('FORM_SUBMITTED', newSub);
    return newSub;
  },

  async updateContactSubmissionStatus(
    id: string,
    status: 'new' | 'read' | 'replied'
  ): Promise<void> {
    const current = await this.getContactSubmissions();
    const updated = current.map((s) => (s.id === id ? { ...s, status } : s));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('contact_submissions').update({ status }).eq('id', id);
    }

    setLocalItem(STORAGE_KEYS.SUBMISSIONS, updated);
    notifyChange('SUBMISSION_STATUS_UPDATED', { id, status });
  },

  // --- RESET & BACKUP TOOLS ---
  async resetToDefaultData(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(INITIAL_PAGES));
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(INITIAL_SECTIONS));
    localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(INITIAL_NAVIGATION));
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(INITIAL_MEDIA));
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));

    notifyChange('RESET_ALL_DATA');
  },

  exportDatabaseJson(): string {
    return JSON.stringify(
      {
        site_settings: getLocalItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
        pages: getLocalItem(STORAGE_KEYS.PAGES, INITIAL_PAGES),
        page_sections: getLocalItem(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS),
        page_drafts: getLocalItem(STORAGE_KEYS.DRAFTS, []),
        navigation_items: getLocalItem(STORAGE_KEYS.NAVIGATION, INITIAL_NAVIGATION),
        media: getLocalItem(STORAGE_KEYS.MEDIA, INITIAL_MEDIA),
        contact_submissions: getLocalItem(STORAGE_KEYS.SUBMISSIONS, []),
        exported_at: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importDatabaseJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.site_settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.site_settings));
      if (data.pages) localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(data.pages));
      if (data.page_sections) localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(data.page_sections));
      if (data.page_drafts) localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(data.page_drafts));
      if (data.navigation_items) localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(data.navigation_items));
      if (data.media) localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(data.media));
      if (data.contact_submissions) localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data.contact_submissions));

      notifyChange('DATA_IMPORTED');
      return true;
    } catch (e) {
      console.error('Failed to import database JSON:', e);
      return false;
    }
  },

  // --- REAL-TIME SUBSCRIPTION ---
  subscribe(callback: (event: any) => void): () => void {
    const handleBroadcast = (e: MessageEvent) => {
      callback(e.data);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
        callback({ type: 'STORAGE_EVENT', key: e.key });
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }
    window.addEventListener('storage', handleStorage);

    // If Supabase real-time is available
    let supabaseChannel: any = null;
    if (isSupabaseConfigured && supabase) {
      supabaseChannel = supabase
        .channel(`apg-school-cms-realtime-${++realtimeSubscriptionId}`)
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          callback({ type: 'SUPABASE_REALTIME', payload });
        })
        .subscribe();
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('storage', handleStorage);
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  },
};
