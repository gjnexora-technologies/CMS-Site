import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { SiteSettings, Page, PageSection, NavigationItem } from '../types';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { DynamicHead } from '../components/common/DynamicHead';
import { DynamicTheme } from '../components/common/DynamicTheme';
import { DynamicRenderer } from '../components/DynamicRenderer';
import { NotFoundPage } from './NotFoundPage';
import { Loader2, Eye } from 'lucide-react';

export const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Normalize slug: if undefined or empty, it's the home page
  const currentSlug = slug || '';

  const loadData = useCallback(async () => {
    try {
      const [fetchedSettings, fetchedNav] = await Promise.all([
        api.getSiteSettings(),
        api.getNavigation(),
      ]);

      setSettings(fetchedSettings);
      setNavigation(fetchedNav);

      const targetPage = await api.getPageBySlug(currentSlug, isPreview);

      if (!targetPage) {
        setNotFound(true);
        setPage(null);
        setSections([]);
      } else {
        setNotFound(false);
        setPage(targetPage);
        const fetchedSections = await api.getPageSections(targetPage.id, isPreview);
        setSections(fetchedSections);
      }
    } catch (e) {
      console.error('Error loading page data:', e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [currentSlug, isPreview]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  // Subscribe to real-time events from Admin Panel
  useEffect(() => {
    const unsubscribe = api.subscribe(() => {
      // Re-fetch automatically on change
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Loading content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-emerald-600 selection:text-white">
      <DynamicTheme settings={settings} />
      <DynamicHead settings={settings} page={page} />

      {/* PREVIEW BANNER */}
      {isPreview && (
        <div className="bg-amber-500 text-slate-950 font-semibold text-xs py-2 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
          <Eye className="w-4 h-4" />
          <span>
            PREVIEW MODE — Viewing unpublished draft changes. These are not visible on the live public website.
          </span>
        </div>
      )}

      {settings && <Header settings={settings} navigation={navigation} />}

      <div className="flex-1">
        {notFound || !page ? (
          <NotFoundPage />
        ) : (
          <DynamicRenderer sections={sections} />
        )}
      </div>

      {settings && <Footer settings={settings} navigation={navigation} />}
    </div>
  );
};
