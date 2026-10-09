import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Globe,
  Palette,
  Share2,
  Sliders,
  Check,
  Save,
  Database,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { SiteSettings, MediaItem } from '../types';
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
} from '../components/common/SocialIcons';

export const WebsiteSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    'general' | 'branding' | 'seo' | 'social' | 'header_footer' | 'database'
  >('general');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const loadSettings = async () => {
    try {
      const [s, m] = await Promise.all([
        api.getSiteSettings(),
        api.getMedia(),
      ]);
      setSettings(s);
      setMediaList(m);
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      await api.updateSiteSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    const jsonStr = api.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-website-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    if (!importJsonText) return;
    const success = api.importDatabaseJson(importJsonText);
    if (success) {
      alert('Database successfully imported! Reloading settings...');
      loadSettings();
      setImportJsonText('');
    } else {
      alert('Invalid JSON format. Please verify the backup file.');
    }
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all website data to the original demo seed? All custom changes will be restored to defaults.')) {
      await api.resetToDefaultData();
      alert('Data reset successfully! Reloading...');
      loadSettings();
    }
  };

  if (!settings) {
    return <div className="py-24 text-center text-slate-500">Loading website settings...</div>;
  }

  const fontOptions = [
    'Plus Jakarta Sans',
    'Inter',
    'Outfit',
    'Playfair Display',
    'Roboto',
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Website Settings & Branding
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global single source of truth for your identity, themes, SEO metadata, and social accounts.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
            </>
          )}
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-white border border-slate-200">
        {[
          { id: 'general', label: 'General', icon: Globe },
          { id: 'branding', label: 'Branding & Theme', icon: Palette },
          { id: 'seo', label: 'Global SEO', icon: Sparkles },
          { id: 'social', label: 'Social Media', icon: Share2 },
          { id: 'header_footer', label: 'Header & Footer', icon: Sliders },
          { id: 'database', label: 'Database & Backup', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT CONTAINER */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* --- 1. GENERAL TAB --- */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
              General Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Website / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.general.site_name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, site_name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Browser Title Tag *
                </label>
                <input
                  type="text"
                  required
                  value={settings.general.site_title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, site_title: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Website Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.general.site_description}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, site_description: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* LOGO & FAVICON */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              {/* LOGO */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Brand Logo URL
                </label>
                <input
                  type="text"
                  value={settings.general.logo_url}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, logo_url: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500 mb-3"
                />
                {settings.general.logo_url && (
                  <div className="h-14 p-2 bg-white rounded-xl border border-slate-200 inline-flex items-center">
                    <img
                      src={settings.general.logo_url}
                      alt="Logo preview"
                      className="max-h-10 w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* FAVICON */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Browser Favicon URL / SVG
                </label>
                <input
                  type="text"
                  value={settings.general.favicon_url}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, favicon_url: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500 mb-3"
                />
                {settings.general.favicon_url && (
                  <div className="h-14 w-14 p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <img
                      src={settings.general.favicon_url}
                      alt="Favicon preview"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* CONTACT INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.general.contact_email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, contact_email: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={settings.general.phone_number}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, phone_number: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Office / Studio Address
                </label>
                <input
                  type="text"
                  value={settings.general.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, address: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- 2. BRANDING TAB --- */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
              Brand Colors & Typography
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* PRIMARY COLOR */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold uppercase text-slate-500">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.branding.primary_color}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          primary_color: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={settings.branding.primary_color}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          primary_color: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* SECONDARY COLOR */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold uppercase text-slate-500">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.branding.secondary_color}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          secondary_color: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={settings.branding.secondary_color}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          secondary_color: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* ACCENT COLOR */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold uppercase text-slate-500">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.branding.accent_color}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          accent_color: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={settings.branding.accent_color}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          accent_color: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* FONT FAMILY & BORDER RADIUS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Google Font Family
                </label>
                <select
                  value={settings.branding.font_family}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, font_family: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {fontOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Component Corner Radius
                </label>
                <select
                  value={settings.branding.border_radius}
                  onChange={(e: any) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, border_radius: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="sm">Subtle (sm)</option>
                  <option value="md">Rounded (md)</option>
                  <option value="lg">Modern (lg)</option>
                  <option value="xl">Pill Smooth (xl)</option>
                  <option value="full">Full Rounded (full)</option>
                </select>
              </div>
            </div>

            {/* LIVE BRANDING PREVIEW CARD */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-xl space-y-4">
              <span className="text-xs uppercase font-bold text-slate-500 block tracking-wider">
                Live Dynamic Theme Preview
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-2xl font-bold tracking-tight"
                    style={{ fontFamily: settings.branding.font_family }}
                  >
                    {settings.general.site_name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Font: {settings.branding.font_family}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md"
                  style={{
                    backgroundColor: settings.branding.primary_color,
                  }}
                >
                  Primary Action Button
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. SEO TAB --- */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
              Search Engine Optimization (SEO) & Social Sharing
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Site SEO Title
              </label>
              <input
                type="text"
                value={settings.seo.site_title}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, site_title: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.seo.meta_description}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, meta_description: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                value={settings.seo.keywords}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, keywords: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Open Graph Image URL (Facebook, LinkedIn, Twitter share preview)
              </label>
              <input
                type="url"
                value={settings.seo.og_image}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, og_image: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* --- 4. SOCIAL MEDIA TAB --- */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
              Social Media Channels
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Facebook Profile / Page
                </label>
                <div className="flex items-center rounded-xl bg-slate-100 border border-slate-300 px-3 py-1.5">
                  <FacebookIcon className="w-4 h-4 text-slate-500 mr-2.5" />
                  <input
                    type="url"
                    value={settings.social_media.facebook}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          facebook: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Instagram Profile
                </label>
                <div className="flex items-center rounded-xl bg-slate-100 border border-slate-300 px-3 py-1.5">
                  <InstagramIcon className="w-4 h-4 text-slate-500 mr-2.5" />
                  <input
                    type="url"
                    value={settings.social_media.instagram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          instagram: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  LinkedIn Company / Profile
                </label>
                <div className="flex items-center rounded-xl bg-slate-100 border border-slate-300 px-3 py-1.5">
                  <LinkedinIcon className="w-4 h-4 text-slate-500 mr-2.5" />
                  <input
                    type="url"
                    value={settings.social_media.linkedin}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  X / Twitter Handle
                </label>
                <div className="flex items-center rounded-xl bg-slate-100 border border-slate-300 px-3 py-1.5">
                  <TwitterIcon className="w-4 h-4 text-slate-500 mr-2.5" />
                  <input
                    type="url"
                    value={settings.social_media.twitter}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          twitter: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  YouTube Channel
                </label>
                <div className="flex items-center rounded-xl bg-slate-100 border border-slate-300 px-3 py-1.5">
                  <YoutubeIcon className="w-4 h-4 text-slate-500 mr-2.5" />
                  <input
                    type="url"
                    value={settings.social_media.youtube}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          youtube: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  WhatsApp Contact Number
                </label>
                <div className="flex items-center rounded-xl bg-slate-100 border border-slate-300 px-3 py-1.5">
                  <WhatsappIcon className="w-4 h-4 text-slate-500 mr-2.5" />
                  <input
                    type="text"
                    value={settings.social_media.whatsapp}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_media: {
                          ...settings.social_media,
                          whatsapp: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 5. HEADER & FOOTER TAB --- */}
        {activeTab === 'header_footer' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
              Header & Footer Management
            </h2>

            {/* HEADER SETTINGS */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="text-xs uppercase font-bold text-blue-700">
                Navbar Configuration
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Background Styling
                  </label>
                  <select
                    value={settings.header.bg_style}
                    onChange={(e: any) =>
                      setSettings({
                        ...settings,
                        header: { ...settings.header, bg_style: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="glass">Glassmorphism (Frosted)</option>
                    <option value="solid">Solid White</option>
                    <option value="transparent">Transparent Overlay</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="sticky_check"
                    checked={settings.header.is_sticky}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        header: { ...settings.header, is_sticky: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-200"
                  />
                  <label htmlFor="sticky_check" className="text-xs text-slate-700 font-medium">
                    Sticky Top Header
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="cta_check"
                    checked={settings.header.show_cta}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        header: { ...settings.header, show_cta: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-200"
                  />
                  <label htmlFor="cta_check" className="text-xs text-slate-700 font-medium">
                    Show Header CTA Button
                  </label>
                </div>
              </div>

              {settings.header.show_cta && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={settings.header.cta_text}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          header: { ...settings.header, cta_text: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      CTA Button Link
                    </label>
                    <input
                      type="text"
                      value={settings.header.cta_link}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          header: { ...settings.header, cta_link: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER SETTINGS */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="text-xs uppercase font-bold text-blue-700">
                Footer Configuration
              </span>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={settings.footer.copyright_text}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, copyright_text: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Newsletter Title
                  </label>
                  <input
                    type="text"
                    value={settings.footer.newsletter_title}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: {
                          ...settings.footer,
                          newsletter_title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Newsletter Description
                  </label>
                  <input
                    type="text"
                    value={settings.footer.newsletter_desc}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: {
                          ...settings.footer,
                          newsletter_desc: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 6. DATABASE & SYNC TAB --- */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
              Database Architecture & JSON Backups
            </h2>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Export Website Data JSON
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download an offline JSON snapshot of all pages, sections, media, navigation, and settings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Restore or Import Database JSON
              </h3>
              <p className="text-xs text-slate-500">
                Paste JSON data below to restore a previous backup.
              </p>
              <textarea
                rows={3}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste backup JSON here..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500 resize-none"
              />
              <button
                type="button"
                onClick={handleImportJson}
                disabled={!importJsonText}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import JSON Backup</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-rose-700">
                  Reset To Original Demo Data
                </h3>
                <p className="text-xs text-rose-700/80">
                  Resets the site to the polished agency starter pages and sections.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
