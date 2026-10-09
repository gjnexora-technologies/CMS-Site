import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';
import { api } from '../services/api';
import { Page } from '../types';

const getDraftSummaryText = (page: Page) => {
  const summary = page.draft_summary;
  if (!summary) return 'Draft changes saved';
  const parts = [
    ...(summary.added.length ? [`Added: ${summary.added.join(', ')}`] : []),
    ...(summary.edited.length ? [`Edited: ${summary.edited.join(', ')}`] : []),
    ...(summary.removed.length ? [`Removed: ${summary.removed.join(', ')}`] : []),
    ...(summary.pageDetails.length ? [`Page details: ${summary.pageDetails.join(', ')}`] : []),
  ];
  return parts.length ? parts.join(' · ') : 'Draft changes saved';
};

export const PagesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [loading, setLoading] = useState(true);

  // Create / Edit Page Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    is_home: false,
    seoTitle: '',
    seoDesc: '',
    seoKeywords: '',
    seoOgImage: '',
    noIndex: false,
  });

  // Preview Modal State
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await api.getPages();
      setPages(data);
    } catch (e) {
      console.error('Error loading pages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
    const unsub = api.subscribe(() => {
      loadPages();
    });
    return unsub;
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPageId(null);
    setFormData({
      title: '',
      slug: '',
      is_home: false,
      seoTitle: '',
      seoDesc: '',
      seoKeywords: '',
      seoOgImage: '',
      noIndex: false,
    });
    setShowModal(true);
  };

  const openEditModal = (page: Page) => {
    setModalMode('edit');
    setSelectedPageId(page.id);
    setFormData({
      title: page.title,
      slug: page.slug,
      is_home: page.is_home,
      seoTitle: page.seo?.title || '',
      seoDesc: page.seo?.description || '',
      seoKeywords: page.seo?.keywords || '',
      seoOgImage: page.seo?.og_image || '',
      noIndex: Boolean(page.seo?.no_index),
    });
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    const updated: any = { title: val };
    if (modalMode === 'create' && !formData.is_home) {
      updated.slug = val.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    }
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pagePayload = {
        title: formData.title,
        slug: formData.is_home ? '' : formData.slug,
        is_home: formData.is_home,
        seo: {
          title: formData.seoTitle,
          description: formData.seoDesc,
          keywords: formData.seoKeywords,
          og_image: formData.seoOgImage,
          no_index: formData.noIndex,
        },
      };

      if (modalMode === 'create') {
        const created = await api.createPage({ ...pagePayload, status: 'draft' });
        setShowModal(false);
        navigate(`/builder/${created.id}`);
      } else if (selectedPageId) {
        await api.updatePage(selectedPageId, pagePayload);
        setShowModal(false);
        loadPages();
      }
    } catch (err: any) {
      alert('Error saving page: ' + err.message);
    }
  };

  const handleTogglePublish = async (page: Page) => {
    if (page.status === 'published') {
      await api.updatePage(page.id, { status: 'draft' });
    } else {
      await api.publishPage(page.id);
    }
    loadPages();
  };

  const handleDuplicate = async (id: string) => {
    await api.duplicatePage(id);
    loadPages();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      await api.deletePage(id);
      loadPages();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;

    const copy = [...pages];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIndex, 0, moved);

    const orderedIds = copy.map((p) => p.id);
    await api.reorderPages(orderedIds);
    loadPages();
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(search.toLowerCase()) ||
      page.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, reorder, edit content sections, and publish pages for the User Website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages by title or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-300/80 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'published', 'draft'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* PAGES TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold w-12 text-center">#</th>
                <th className="py-4 px-6 font-semibold">Page Details</th>
                <th className="py-4 px-6 font-semibold">URL Path</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Last Updated</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No matching pages found. Click "Create New Page" to start.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page, index) => (
                  <tr
                    key={page.id}
                    className="hover:bg-slate-100/40 transition-colors group"
                  >
                    {/* REORDER BUTTONS */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === filteredPages.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* TITLE */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/20">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{page.title}</span>
                            {page.is_home && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-700 border border-blue-500/30">
                                Default Home
                              </span>
                            )}
                          </div>
                          {page.seo?.title && (
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              SEO: {page.seo.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SLUG */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-mono text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-300/50">
                        {page.slug ? `/${page.slug}` : '/ (root)'}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-start gap-1.5">
                        <button
                          onClick={() => handleTogglePublish(page)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
                          page.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-700 border border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                          title={page.status === 'published' ? 'Click to unpublish this page' : 'Click to publish this page'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                            page.status === 'published'
                              ? 'bg-emerald-400'
                              : 'bg-amber-400'
                            }`}
                          />
                          <span className="capitalize">{page.status}</span>
                        </button>
                        {page.has_draft && (
                          <span className="max-w-[220px] text-[10px] font-semibold leading-4 text-amber-800">
                            {getDraftSummaryText(page)}
                          </span>
                        )}
                        {page.status === 'draft' && (
                          <span className="text-[10px] font-semibold leading-4 text-amber-800">
                            Private draft · not published
                          </span>
                        )}
                      </div>
                    </td>

                    {/* UPDATED AT */}
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* VISUAL BUILDER */}
                        <Link
                          to={`/builder/${page.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Builder</span>
                        </Link>

                        {/* PREVIEW */}
                        <button
                          onClick={() => setPreviewPage(page)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Preview Page"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* SETTINGS / EDIT SEO */}
                        <button
                          onClick={() => openEditModal(page)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Page & SEO Settings"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* DUPLICATE */}
                        <button
                          onClick={() => handleDuplicate(page.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Duplicate Page"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* DELETE */}
                        {!page.is_home ? (
                          <button
                            onClick={() => handleDelete(page.id, page.title)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-500/10 transition-colors"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="w-7 h-7 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PAGE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {modalMode === 'create' ? 'Create New Page' : 'Page & SEO Settings'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Careers, Portfolio, Insights"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {!formData.is_home && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    URL Slug *
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-100 border border-slate-300 overflow-hidden text-sm">
                    <span className="px-3.5 py-2.5 text-slate-500 font-mono text-xs border-r border-slate-300 bg-slate-100">
                      /
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
                        })
                      }
                      placeholder="careers"
                      className="w-full px-3 py-2.5 bg-transparent text-slate-900 focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_home_check"
                    checked={formData.is_home}
                    onChange={(e) =>
                      setFormData({ ...formData, is_home: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-100 border-slate-300 focus:ring-0"
                  />
                  <label htmlFor="is_home_check" className="text-xs font-medium text-slate-700">
                    Set as Default Homepage (/)
                  </label>
              </div>

              {/* SEO SETTINGS COLLAPSIBLE / BOX */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                  Per-Page SEO Metadata
                </span>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Page Title | Website Name"
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seoDesc}
                    onChange={(e) =>
                      setFormData({ ...formData, seoDesc: e.target.value })
                    }
                    placeholder="Brief description for search engine result snippets..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      setFormData({ ...formData, seoKeywords: e.target.value })
                    }
                    placeholder="comma, separated, keywords"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md"
                >
                  {modalMode === 'create' ? 'Create & Open Builder' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESPONSIVE PREVIEW MODAL */}
      {previewPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-fadeIn">
          {/* TOP CONTROLS */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900">
                Live Preview: {previewPage.title}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                /{previewPage.slug}
              </span>
            </div>

            {/* DEVICE TOGGLE */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  previewDevice === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  previewDevice === 'tablet'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Tablet className="w-4 h-4" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  previewDevice === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`http://localhost:5174/${previewPage.slug}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:text-slate-900 flex items-center gap-1"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setPreviewPage(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* FRAME CONTAINER */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div
              className={`h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border-4 border-slate-200 ${
                previewDevice === 'desktop'
                  ? 'w-full'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              }`}
            >
              <iframe
                src={`http://localhost:5174/${previewPage.slug}?preview=true`}
                title="Page Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
