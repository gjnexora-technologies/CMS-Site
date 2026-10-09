import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Inbox,
  Sparkles,
  RefreshCw,
  Globe,
  Settings,
} from 'lucide-react';
import { api } from '../services/api';
import { Page, SiteSettings, MediaItem, ContactSubmission } from '../types';

export const DashboardPage: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [fetchedPages, fetchedSettings, fetchedMedia, fetchedInquiries] =
        await Promise.all([
          api.getPages(),
          api.getSiteSettings(),
          api.getMedia(),
          api.getContactSubmissions(),
        ]);
      setPages(fetchedPages);
      setSettings(fetchedSettings);
      setMedia(fetchedMedia);
      setInquiries(fetchedInquiries);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const unsub = api.subscribe(() => {
      loadDashboardData();
    });
    return unsub;
  }, []);

  const totalPages = pages.length;
  const publishedPages = pages.filter((p) => p.status === 'published').length;
  const draftPages = pages.filter((p) => p.status === 'draft').length;
  const mediaCount = media.length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* WELCOME BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Single Source of Truth Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {settings?.general?.site_name || 'APG Matriculation Higher Secondary School'}
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Manage school website pages, content, branding, media and navigation from here.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/pages"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
          </Link>
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 transition-all active:scale-95"
          >
            <span>Open User Site</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* TOTAL PAGES */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Pages
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {totalPages}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Dynamic page endpoints
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center border border-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* PUBLISHED PAGES */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Published Pages
            </span>
            <div className="text-3xl font-extrabold text-emerald-700 mt-1">
              {publishedPages}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Active on public website
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* DRAFT PAGES */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Draft / Unpublished
            </span>
            <div className="text-3xl font-extrabold text-amber-700 mt-1">
              {draftPages}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Hidden from public site
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* MEDIA ASSETS */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Media Assets
            </span>
            <div className="text-3xl font-extrabold text-purple-700 mt-1">
              {mediaCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Images & Video embeds
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center border border-purple-500/20">
            <ImageIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: RECENT PAGES + RECENT INQUIRIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT PAGES (2 COLS) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Managed Pages</h2>
              <p className="text-xs text-slate-500">
                Click any page to launch the visual section builder
              </p>
            </div>
            <Link
              to="/pages"
              className="text-xs font-semibold text-blue-700 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="pb-3 font-semibold">Page Name</th>
                  <th className="pb-3 font-semibold">URL Slug</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pages.slice(0, 6).map((page) => (
                  <tr key={page.id} className="hover:bg-slate-100/30 transition-colors">
                    <td className="py-3.5 font-medium text-slate-900 flex items-center gap-2">
                      <span>{page.title}</span>
                      {page.is_home && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-700 border border-blue-500/30">
                          Home
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-slate-500 text-xs font-mono">
                      /{page.slug}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          page.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            page.status === 'published'
                              ? 'bg-emerald-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span className="capitalize">{page.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        to={`/builder/${page.id}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white transition-colors"
                      >
                        Edit Builder
                      </Link>
                      <a
                        href={`http://localhost:5174/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 inline-flex transition-colors"
                        title="View page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE COLUMN: QUICK CONTROLS & SUBMISSIONS */}
        <div className="space-y-6">
          {/* QUICK SHORTCUTS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Quick Shortcuts
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 hover:bg-slate-100 text-slate-800 hover:text-slate-900 border border-slate-300/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-sm font-medium">
                  <Settings className="w-4 h-4 text-blue-700" />
                  <span>Website Branding & SEO</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                to="/media"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 hover:bg-slate-100 text-slate-800 hover:text-slate-900 border border-slate-300/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-sm font-medium">
                  <ImageIcon className="w-4 h-4 text-purple-700" />
                  <span>Upload & Replace Media</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                to="/navigation"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 hover:bg-slate-100 text-slate-800 hover:text-slate-900 border border-slate-300/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-sm font-medium">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span>Configure Navigation Menu</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
          </div>

          {/* RECENT INQUIRIES */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Contact Inquiries
              </h3>
              <Link
                to="/inquiries"
                className="text-xs font-semibold text-blue-700 hover:text-blue-700"
              >
                View all ({inquiries.length})
              </Link>
            </div>

            {inquiries.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No contact form submissions yet.
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl bg-slate-100/50 border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {sub.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {sub.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
