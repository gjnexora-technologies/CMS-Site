import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Settings,
  Edit,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Check,
  CheckCircle2,
  Globe,
  ExternalLink,
  Layers,
  X,
  Layout,
  FileText,
  Image as ImageIcon,
  Video,
  Zap,
  HelpCircle,
  MessageSquare,
  Users,
  CreditCard,
  Briefcase,
  Monitor,
  Tablet,
  Smartphone,
  Save,
} from 'lucide-react';
import { api } from '../services/api';
import { Page, PageSection, SectionType, MediaItem } from '../types';

const CONTACT_FORM_EDITOR_FIELDS = [
  { key: 'contact_heading', label: 'Contact Card Heading', value: 'Direct Inquiries' },
  { key: 'contact_description', label: 'Contact Card Description', value: 'Contact the school office with your questions or to learn about admissions.', multiline: true },
  { key: 'address', label: 'School Address', value: 'FCI Road, Ganapathy, Coimbatore' },
  { key: 'email', label: 'Contact Email', value: '' },
  { key: 'phone', label: 'Contact Phone', value: '' },
  { key: 'hours', label: 'Office Hours', value: 'Please contact the school for office hours.' },
  { key: 'email_label', label: 'Email Detail Label', value: 'Email' },
  { key: 'phone_label', label: 'Phone Detail Label', value: 'Phone' },
  { key: 'address_label', label: 'Address Detail Label', value: 'School' },
  { key: 'hours_label', label: 'Hours Detail Label', value: 'Availability' },
  { key: 'name_label', label: 'Name Field Label', value: 'Full Name' },
  { key: 'email_field_label', label: 'Email Field Label', value: 'Email Address' },
  { key: 'subject_label', label: 'Subject Field Label', value: 'Subject' },
  { key: 'message_label', label: 'Message Field Label', value: 'Your Message' },
  { key: 'submit_text', label: 'Submit Button Text', value: 'Send Enquiry' },
] as const;

export const PageBuilderPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [publishedPage, setPublishedPage] = useState<Page | null>(null);
  const [publishedSections, setPublishedSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // Add Section Catalog Modal
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  // Edit Section Drawer/Modal
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [editorTab, setEditorTab] = useState<'content' | 'settings'>('content');
  const [showMediaPicker, setShowMediaPicker] = useState<string | null>(null);

  // Responsive Preview Modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const loadData = async () => {
    if (!pageId) return;
    try {
      setLoading(true);
      const [fetchedPage, fetchedSections, fetchedMedia, livePage, liveSections] = await Promise.all([
        api.getPageById(pageId),
        api.getSections(pageId),
        api.getMedia(),
        api.getPublishedPageById(pageId),
        api.getPublishedSections(pageId),
      ]);
      setPage(fetchedPage);
      setSections(fetchedSections);
      setPublishedPage(livePage);
      setPublishedSections(liveSections);
      setMediaList(fetchedMedia);
    } catch (e) {
      console.error('Error loading builder data:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshPage = async () => {
    if (!pageId) return;
    const updatedPage = await api.getPageById(pageId);
    if (updatedPage) setPage(updatedPage);
  };

  const updateEditingContentField = (key: string, value: string) => {
    setEditingSection((current) => current ? {
      ...current,
      content: { ...current.content, [key]: value },
    } : current);
  };

  useEffect(() => {
    loadData();
    const unsub = api.subscribe((event) => {
      if (
        event?.type === 'SECTION_CREATED' ||
        event?.type === 'SECTION_UPDATED' ||
        event?.type === 'SECTION_DELETED' ||
        event?.type === 'SECTIONS_REORDERED'
      ) {
        if (pageId) {
          api.getSections(pageId).then(setSections);
        }
      }
    });
    return unsub;
  }, [pageId]);

  const handlePublish = async () => {
    if (!page) return;
    try {
      setSaving(true);
      if (editingSection) {
        await api.updateSection(editingSection.id, {
          content: editingSection.content,
          settings: editingSection.settings,
        });
        setEditingSection(null);
      }
      const updated = await api.publishPage(page.id);
      setPage(updated);
      const liveSections = await api.getSections(page.id);
      setSections(liveSections);
      setPublishedPage(updated);
      setPublishedSections(liveSections);
      setShowPublishSuccess(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert('Error publishing page: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!page) return;
    try {
      setSaving(true);
      if (editingSection) {
        const updatedSection = await api.updateSection(editingSection.id, {
          content: editingSection.content,
          settings: editingSection.settings,
        });
        setSections((prev) => prev.map((section) =>
          section.id === updatedSection.id ? updatedSection : section
        ));
        setEditingSection(null);
      }
      const updated = await api.savePageDraft(page.id);
      setPage(updated);
    } catch (err: any) {
      alert('Error saving draft: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToPages = async () => {
    if (!page) return;

    try {
      setSaving(true);

      if (editingSection) {
        await api.updateSection(editingSection.id, {
          content: editingSection.content,
          settings: editingSection.settings,
        });
      }
      await api.savePageDraft(page.id);

      navigate('/pages');
    } catch (err: any) {
      alert('Error saving draft: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async (type: SectionType) => {
    if (!pageId) return;

    let defaultContent: any = {};
    if (type === 'hero') {
      defaultContent = {
        badge: 'New Section',
        heading: 'A bright beginning for every learner',
        description: 'Introduce your school and the learning experience you offer.',
        primary_btn_text: 'Discover Our School',
        primary_btn_link: '/about',
      };
    } else if (type === 'bento_grid') {
      defaultContent = {
        badge: 'The APG Experience',
        heading: 'Room to learn. Support to thrive.',
        items: [
          { title: 'Curious minds', desc: 'Encourage questions and a love of learning.', icon: 'Sparkles' },
          { title: 'Character & care', desc: 'Grow respect, responsibility and kindness.', icon: 'Shield' },
        ],
      };
    } else if (type === 'about') {
      defaultContent = {
        badge: 'About Us',
        heading: 'Learning with purpose, growing with confidence',
        description: 'Introduce your school, its community and its approach to learning.',
        points: ['A welcoming school community', 'Learning that builds strong foundations', 'Confidence, respect and responsibility'],
      };
    } else if (type === 'services') {
      defaultContent = {
        badge: 'Learning at APG',
        heading: 'Growing through every stage',
        items: [
          { title: 'Foundational learning', desc: 'Build confidence and essential skills.', icon: 'BookOpen' },
          { title: 'Higher secondary', desc: 'Pursue academic goals and future plans.', icon: 'Layers' },
        ],
      };
    } else if (type === 'pricing') {
      defaultContent = {
        badge: 'Pricing Tiers',
        heading: 'Predictable Pricing for Fast Teams',
        plans: [
          { name: 'Starter', price: '$4,900', period: 'mo', features: ['Core features', 'Slack sync'], cta_text: 'Choose Plan' },
          { name: 'Growth', price: '$9,900', period: 'mo', features: ['Full squad', '24/7 SLA'], is_popular: true, cta_text: 'Choose Plan' },
        ],
      };
    } else if (type === 'faq') {
      defaultContent = {
        badge: 'FAQ',
        heading: 'Frequently Asked Questions',
        items: [
          { question: 'What is the onboarding timeline?', answer: 'We onboard within 5 business days.' },
        ],
      };
    } else if (type === 'contact_form') {
      defaultContent = {
        badge: 'Contact',
        heading: 'Send an enquiry',
        description: 'Share your question and the school team will follow up.',
        address: 'FCI Road, Ganapathy, Coimbatore',
      };
    } else if (type === 'cta') {
      defaultContent = {
        heading: 'Come and get to know APG',
        description: 'Contact our school to learn more about admissions and campus life.',
        primary_btn_text: 'Admissions Enquiry',
        primary_btn_link: '/admissions',
      };
    } else if (type === 'gallery') {
      defaultContent = {
        badge: 'Gallery',
        heading: 'Showcase Highlights',
        images: [
          { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80', title: 'Dashboard', category: 'Tech' },
        ],
      };
    } else if (type === 'video') {
      defaultContent = {
        heading: 'A glimpse of school life',
        video_url: '',
        autoplay: false,
        controls: true,
      };
    } else if (type === 'rich_text') {
      defaultContent = {
        title: 'Section Overview',
        content: '<p>Edit this content with your rich text story...</p>',
      };
    }

    const created = await api.createSection({
      page_id: pageId,
      section_type: type,
      content: defaultContent,
      settings: {
        background_style: 'default',
        padding_y: 'normal',
        alignment: 'center',
      },
    });

    setSections((prev) => [...prev, created]);
    await refreshPage();
    setShowCatalogModal(false);
    setEditingSection(created);
  };

  const handleDuplicateSection = async (id: string) => {
    const dup = await api.duplicateSection(id);
    setSections((prev) => [...prev, dup]);
    await refreshPage();
  };

  const handleDeleteSection = async (id: string) => {
    if (confirm('Delete this section?')) {
      await api.deleteSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      await refreshPage();
      if (editingSection?.id === id) setEditingSection(null);
    }
  };

  const handleToggleVisibility = async (section: PageSection) => {
    const updated = await api.updateSection(section.id, {
      is_visible: !section.is_visible,
    });
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    await refreshPage();
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length || !pageId) return;

    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIndex, 0, moved);

    const orderedIds = copy.map((s) => s.id);
    await api.reorderSections(pageId, orderedIds);
    setSections(copy);
    await refreshPage();
  };

  const handleSaveSectionEdits = async () => {
    if (!editingSection) return;
    try {
      const updated = await api.updateSection(editingSection.id, {
        content: editingSection.content,
        settings: editingSection.settings,
      });
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      await refreshPage();
      setEditingSection(null);
    } catch (e: any) {
      alert('Error updating section: ' + e.message);
    }
  };

  if (loading || !page) {
    return (
      <div className="py-24 text-center text-slate-500">
        Loading Visual Page Builder...
      </div>
    );
  }

  const liveSectionsById = new Map(publishedSections.map((section) => [section.id, section]));
  const draftSectionsById = new Map(sections.map((section) => [section.id, section]));
  const sectionLabel = (section: PageSection) =>
    section.content?.heading || section.content?.title || section.section_type.replace(/_/g, ' ');
  const addedSections = sections.filter((section) => !liveSectionsById.has(section.id));
  const removedSections = publishedSections.filter((section) => !draftSectionsById.has(section.id));
  const changedSections = sections.flatMap((section) => {
    const liveSection = liveSectionsById.get(section.id);
    if (!liveSection) return [];
    const changedFields = [
      ...Object.keys({ ...liveSection.content, ...section.content }).filter((key) =>
        JSON.stringify(liveSection.content?.[key]) !== JSON.stringify(section.content?.[key])
      ),
      ...(JSON.stringify(liveSection.settings) !== JSON.stringify(section.settings) ? ['layout settings'] : []),
      ...(liveSection.is_visible !== section.is_visible ? ['visibility'] : []),
    ];
    return changedFields.length ? [{ section, changedFields }] : [];
  });
  const reorderedSections = sections.filter((section, index) => {
    const liveIndex = publishedSections.findIndex((liveSection) => liveSection.id === section.id);
    return liveIndex >= 0 && liveIndex !== index;
  });
  const changedPageFields = publishedPage ? [
    ...(page.title !== publishedPage.title ? ['page title'] : []),
    ...(page.slug !== publishedPage.slug ? ['URL path'] : []),
    ...(page.is_home !== publishedPage.is_home ? ['homepage setting'] : []),
    ...(JSON.stringify(page.seo) !== JSON.stringify(publishedPage.seo) ? ['SEO details'] : []),
  ] : [];

  const sectionTemplates: Array<{
    type: SectionType;
    label: string;
    desc: string;
    icon: React.FC<any>;
    category: 'Core' | 'Media' | 'Layout' | 'Business';
  }> = [
    { type: 'hero', label: 'Hero Banner', desc: 'Prominent headline, buttons & stats', icon: Sparkles, category: 'Core' },
    { type: 'bento_grid', label: 'Bento Grid', desc: 'Asymmetric feature card matrix', icon: Layout, category: 'Core' },
    { type: 'about', label: 'Image + Text Split', desc: 'Story narrative & bullet points', icon: FileText, category: 'Core' },
    { type: 'services', label: 'Services Grid', desc: 'Cards with icons & descriptions', icon: Zap, category: 'Business' },
    { type: 'projects', label: 'School Highlights', desc: 'Photo cards for campus, activities or achievements', icon: Briefcase, category: 'Business' },
    { type: 'testimonials', label: 'Testimonials', desc: 'Quotes, star ratings & client roles', icon: MessageSquare, category: 'Business' },
    { type: 'team', label: 'Team Members', desc: 'Executive leadership profiles', icon: Users, category: 'Business' },
    { type: 'pricing', label: 'Pricing Plans', desc: 'Tiers with features & popular badge', icon: CreditCard, category: 'Business' },
    { type: 'faq', label: 'FAQ Accordion', desc: 'Collapsible questions & answers', icon: HelpCircle, category: 'Business' },
    { type: 'contact_form', label: 'Contact Form', desc: 'Enquiry form and school contact information', icon: MessageSquare, category: 'Business' },
    { type: 'cta', label: 'Call-To-Action Banner', desc: 'High-converting action bar', icon: Sparkles, category: 'Core' },
    { type: 'gallery', label: 'Media Gallery', desc: 'Filterable photo/video portfolio', icon: ImageIcon, category: 'Media' },
    { type: 'video', label: 'Video Player', desc: 'HTML5, YouTube or Vimeo video', icon: Video, category: 'Media' },
    { type: 'rich_text', label: 'Rich Text / Article', desc: 'Typography & custom HTML', icon: FileText, category: 'Layout' },
    { type: 'two_column', label: 'Two-Column Split', desc: 'Balanced 2-column layout', icon: Layout, category: 'Layout' },
  ];

  return (
    <div className="-mt-2 space-y-8 animate-fadeIn pb-16 sm:-mt-4 lg:-mt-6">
      {showPublishSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/70 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="publish-success-title"
            className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-white p-7 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-700" />
            </div>
            <h2 id="publish-success-title" className="text-lg font-bold text-slate-900">
              Published live
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Website changes applied and site published live.
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setShowPublishSuccess(false)}
              className="mt-6 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* BUILDER TOP BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToPages}
            disabled={saving}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Save changes as draft and return to pages"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {page.title}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    page.status === 'published' && !page.has_draft
                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                }`}
              >
                {page.has_draft ? 'Draft Changes' : page.status}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Path: {page.slug ? `/${page.slug}` : '/ (Home)'}
            </span>
          </div>
        </div>

        {/* BUILDER ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPreview(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-blue-700" />
            <span>Device Preview</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Live</span>
          </button>

          <a
            href={`http://localhost:5174/${page.slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {page.status === 'draft' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-semibold">Private draft — not published</p>
          <p className="mt-1 text-amber-800">This new page is only visible in the admin until you click Publish Live.</p>
        </div>
      )}

      {page.status === 'published' && page.has_draft && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">Draft changes waiting to be published</p>
          <p className="mt-1 text-amber-800">The public site still shows the published version.</p>
          <ul className="mt-3 space-y-1.5 text-amber-900">
            {addedSections.map((section) => (
              <li key={`added-${section.id}`}><span className="font-semibold">Added:</span> {sectionLabel(section)}</li>
            ))}
            {changedSections.map(({ section, changedFields }) => (
              <li key={`changed-${section.id}`}>
                <span className="font-semibold">Edited:</span> {sectionLabel(section)} ({changedFields.join(', ')})
              </li>
            ))}
            {removedSections.map((section) => (
              <li key={`removed-${section.id}`}><span className="font-semibold">Removed:</span> {sectionLabel(section)}</li>
            ))}
            {reorderedSections.length > 0 && (
              <li><span className="font-semibold">Reordered:</span> {reorderedSections.map(sectionLabel).join(', ')}</li>
            )}
            {changedPageFields.length > 0 && (
              <li><span className="font-semibold">Page details changed:</span> {changedPageFields.join(', ')}</li>
            )}
            {addedSections.length === 0 && changedSections.length === 0 && removedSections.length === 0 &&
              reorderedSections.length === 0 && changedPageFields.length === 0 && (
                <li>Draft saved. No section or page detail differences were detected.</li>
              )}
          </ul>
        </div>
      )}

      {/* CANVAS: SECTION STACK */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Page Sections ({sections.length})
          </span>
          <button
            onClick={() => setShowCatalogModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 text-blue-700 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 border-dashed space-y-4">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              This page has no sections yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the button below to add your first section (Hero, Services, Grid, Testimonials, etc.)
            </p>
            <button
              onClick={() => setShowCatalogModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
            >
              Add First Section
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !section.is_visible
                    ? 'border-slate-200/40 opacity-50 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 shadow-md'
                }`}
              >
                {/* SECTION INFO */}
                <div className="flex items-center gap-4">
                  {/* REORDER BUTTONS */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                      title="Move section up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                      title="Move section down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 border border-blue-500/20">
                        {section.section_type.replace('_', ' ')}
                      </span>
                      {!section.is_visible && (
                        <span className="text-[10px] text-amber-700 font-semibold">
                          (Hidden)
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {section.content?.heading ||
                        section.content?.title ||
                        `${section.section_type} section`}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {section.content?.description ||
                        `Background: ${section.settings?.background_style || 'default'} | Padding: ${section.settings?.padding_y || 'normal'}`}
                    </p>
                  </div>
                </div>

                {/* SECTION ACTIONS */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {/* TOGGLE VISIBILITY */}
                  <button
                    onClick={() => handleToggleVisibility(section)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title={section.is_visible ? 'Hide section' : 'Show section'}
                  >
                    {section.is_visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-amber-700" />
                    )}
                  </button>

                  {/* DUPLICATE */}
                  <button
                    onClick={() => handleDuplicateSection(section.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Duplicate section"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* EDIT CONTENT */}
                  <button
                    onClick={() => {
                      setEditingSection(JSON.parse(JSON.stringify(section)));
                      setEditorTab('content');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Content</span>
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-500/10 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM ADD SECTION PROMPT */}
        {sections.length > 0 && (
          <div className="pt-4 text-center">
            <button
              onClick={() => setShowCatalogModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>Add Another Section to {page.title}</span>
            </button>
          </div>
        )}
      </div>

      {/* CATALOG MODAL: ADD SECTION */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Section Catalog</h2>
                <p className="text-xs text-slate-500">
                  Select a reusable section to insert into your page
                </p>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectionTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.type}
                    onClick={() => handleAddSection(template.type)}
                    className="p-4 rounded-2xl bg-slate-100/60 hover:bg-slate-100 border border-slate-300/60 hover:border-blue-500/60 text-left transition-all duration-200 group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          {template.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {template.label}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {template.desc}
                      </p>
                    </div>

                    <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Add Section</span>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION CONTENT & SETTINGS EDITOR DRAWER */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-blue-700">
                    Section Editor
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-500 capitalize">
                    {editingSection.section_type.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {editingSection.content?.heading || 'Edit Section'}
                </h2>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setEditorTab('content')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  editorTab === 'content'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Content Fields
              </button>
              <button
                onClick={() => setEditorTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  editorTab === 'settings'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 bg-slate-100'
                }`}
              >
                Visual Styling & Layout
              </button>
            </div>

            {/* TAB CONTENT: FORM FIELDS */}
            {editorTab === 'content' ? (
              <div className="space-y-4">
                {/* BADGE */}
                {editingSection.content.badge !== undefined && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={editingSection.content.badge || ''}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          content: { ...editingSection.content, badge: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* HEADING */}
                {editingSection.content.heading !== undefined && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      value={editingSection.content.heading || ''}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          content: { ...editingSection.content, heading: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* DESCRIPTION */}
                {editingSection.content.description !== undefined && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={editingSection.content.description || ''}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          content: {
                            ...editingSection.content,
                            description: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                )}

                {editingSection.section_type === 'contact_form' && (
                  <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Contact Details & Form</h3>
                      <p className="mt-1 text-xs text-slate-600">
                        Edit the contact card, school details and form labels shown on the Contact page.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {CONTACT_FORM_EDITOR_FIELDS.map((field) => (
                        <div key={field.key} className={'multiline' in field && field.multiline ? 'sm:col-span-2' : ''}>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            {field.label}
                          </label>
                          {'multiline' in field && field.multiline ? (
                            <textarea
                              rows={2}
                              value={editingSection.content[field.key] ?? field.value}
                              onChange={(e) => updateEditingContentField(field.key, e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editingSection.content[field.key] ?? field.value}
                              onChange={(e) => updateEditingContentField(field.key, e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BUTTONS */}
                {(editingSection.content.primary_btn_text !== undefined ||
                  editingSection.content.secondary_btn_text !== undefined) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={editingSection.content.primary_btn_text || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: {
                              ...editingSection.content,
                              primary_btn_text: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 mb-2"
                      />
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Primary Button Link
                      </label>
                      <input
                        type="text"
                        value={editingSection.content.primary_btn_link || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: {
                              ...editingSection.content,
                              primary_btn_link: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        value={editingSection.content.secondary_btn_text || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: {
                              ...editingSection.content,
                              secondary_btn_text: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 mb-2"
                      />
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Secondary Button Link
                      </label>
                      <input
                        type="text"
                        value={editingSection.content.secondary_btn_link || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: {
                              ...editingSection.content,
                              secondary_btn_link: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* IMAGE URL WITH MEDIA PICKER BUTTON */}
                {editingSection.content.image_url !== undefined && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Featured Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingSection.content.image_url || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: {
                              ...editingSection.content,
                              image_url: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker('image_url')}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-blue-700 flex items-center gap-1.5 border border-slate-300"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Media Library</span>
                      </button>
                    </div>
                    {editingSection.content.image_url && (
                      <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-slate-300">
                        <img
                          src={editingSection.content.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* VIDEO URL */}
                {editingSection.content.video_url !== undefined && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase text-slate-500">
                      Video URL (MP4, YouTube, or Vimeo)
                    </label>
                    <input
                      type="text"
                      value={editingSection.content.video_url || ''}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          content: {
                            ...editingSection.content,
                            video_url: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center gap-4 text-xs text-slate-700">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(editingSection.content.autoplay)}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: {
                                ...editingSection.content,
                                autoplay: e.target.checked,
                              },
                            })
                          }
                        />
                        <span>Autoplay</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(editingSection.content.muted)}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: {
                                ...editingSection.content,
                                muted: e.target.checked,
                              },
                            })
                          }
                        />
                        <span>Muted</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* RICH TEXT HTML */}
                {editingSection.content.content !== undefined && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      HTML Content
                    </label>
                    <textarea
                      rows={6}
                      value={editingSection.content.content || ''}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          content: {
                            ...editingSection.content,
                            content: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: SETTINGS & VISUAL STYLING */
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                    Background Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(
                      [
                        { id: 'default', label: 'Clean White' },
                        { id: 'muted', label: 'Light Slate' },
                        { id: 'dark', label: 'Dark Navy' },
                        { id: 'gradient', label: 'Blue Gradient' },
                        { id: 'brand', label: 'Brand Solid' },
                      ] as const
                    ).map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() =>
                          setEditingSection({
                            ...editingSection,
                            settings: {
                              ...editingSection.settings,
                              background_style: bg.id,
                            },
                          })
                        }
                        className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                          editingSection.settings.background_style === bg.id
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                            : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                    Vertical Padding (Spacing)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['compact', 'normal', 'spacious'] as const).map((pad) => (
                      <button
                        key={pad}
                        type="button"
                        onClick={() =>
                          setEditingSection({
                            ...editingSection,
                            settings: {
                              ...editingSection.settings,
                              padding_y: pad,
                            },
                          })
                        }
                        className={`p-2.5 rounded-xl text-xs font-semibold capitalize border text-center transition-all ${
                          editingSection.settings.padding_y === pad
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                      >
                        {pad}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                    Content Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['left', 'center', 'right'] as const).map((al) => (
                      <button
                        key={al}
                        type="button"
                        onClick={() =>
                          setEditingSection({
                            ...editingSection,
                            settings: {
                              ...editingSection.settings,
                              alignment: al,
                            },
                          })
                        }
                        className={`p-2.5 rounded-xl text-xs font-semibold capitalize border text-center transition-all ${
                          editingSection.settings.alignment === al
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                      >
                        {al}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DRAWER FOOTER */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSectionEdits}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Section Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PICKER MODAL */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select from Media Library</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload an image to the Media Library before adding it here.
                </p>
              </div>
              <button
                onClick={() => setShowMediaPicker(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    if (editingSection) {
                      setEditingSection({
                        ...editingSection,
                        content: {
                          ...editingSection.content,
                          [showMediaPicker]: m.url,
                        },
                      });
                    }
                    setShowMediaPicker(null);
                  }}
                  className="rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 cursor-pointer group aspect-video bg-slate-50 relative"
                >
                  <img
                    src={m.url}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                    Select
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RESPONSIVE DEVICE PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-fadeIn">
          {/* TOP CONTROLS */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900">
                Live Canvas Preview: {page.title}
              </span>
            </div>

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
                href={`http://localhost:5174/${page.slug}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:text-slate-900 flex items-center gap-1"
              >
                <span>New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* FRAME CONTAINER */}
          <div className="flex-1 flex min-w-0 items-center justify-center p-4 overflow-hidden">
            <div
              className={`h-full min-w-0 max-w-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border-4 border-slate-200 ${
                previewDevice === 'desktop'
                  ? 'w-full'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              }`}
            >
              <iframe
                src={`http://localhost:5174/${page.slug}?preview=true`}
                title="Page Preview"
                className="w-full min-w-0 h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
