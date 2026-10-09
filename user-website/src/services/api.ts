import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SiteSettings,
  Page,
  PageSection,
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
};

let realtimeSubscriptionId = 0;

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('apg_school_cms_realtime_sync')
  : null;

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

export const api = {
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

  async getPublishedPages(): Promise<Page[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true });
      if (!error && data) return data as Page[];
    }
    const all = getLocalItem<Page[]>(STORAGE_KEYS.PAGES, INITIAL_PAGES);
    return all
      .filter((p) => p.status === 'published')
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async getPageBySlug(slug: string, previewMode: boolean = false): Promise<Page | null> {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('pages').select('*').eq('slug', cleanSlug);
      if (!previewMode) {
        query = query.eq('status', 'published');
      }
      const { data, error } = await query.single();
      if (!error && data) return data as Page;
    }

    const all = getLocalItem<Page[]>(STORAGE_KEYS.PAGES, INITIAL_PAGES);
    const found = all.find((p) => p.slug.replace(/^\/+|\/+$/g, '') === cleanSlug);
    if (!found) return null;
    if (!previewMode && found.status !== 'published') return null;
    return found;
  },

  async getPageSections(pageId: string, previewMode: boolean = false): Promise<PageSection[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('sort_order', { ascending: true });
      if (!previewMode) {
        query = query.eq('is_visible', true);
      }
      const { data, error } = await query;
      if (!error && data) return data as PageSection[];
    }

    const all = getLocalItem<PageSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    return all
      .filter((s) => s.page_id === pageId && (previewMode || s.is_visible))
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async getNavigation(): Promise<NavigationItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });
      if (!error && data) return data as NavigationItem[];
    }
    const items = getLocalItem<NavigationItem[]>(STORAGE_KEYS.NAVIGATION, INITIAL_NAVIGATION);
    return items
      .filter((i) => i.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order);
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

    const current = getLocalItem<ContactSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    const updated = [newSub, ...current];
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'FORM_SUBMITTED', payload: newSub });
    }

    return newSub;
  },

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

    let supabaseChannel: any = null;
    if (isSupabaseConfigured && supabase) {
      supabaseChannel = supabase
        .channel(`user-website-realtime-${++realtimeSubscriptionId}`)
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
