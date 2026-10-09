import React, { useEffect } from 'react';
import { Page, SiteSettings } from '../../types';

interface DynamicHeadProps {
  settings: SiteSettings | null;
  page: Page | null;
}

export const DynamicHead: React.FC<DynamicHeadProps> = ({ settings, page }) => {
  useEffect(() => {
    if (!settings) return;

    // 1. Dynamic Website / Page Title
    const siteTitle = settings.general?.site_title || settings.general?.site_name || 'APG Matriculation Higher Secondary School';
    if (page) {
      const pageTitle = page.seo?.title || page.title;
      document.title = page.is_home ? siteTitle : `${pageTitle} | ${siteTitle}`;
    } else {
      document.title = siteTitle;
    }

    // 2. Dynamic Favicon
    if (settings.general?.favicon_url) {
      let faviconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.id = 'dynamic-favicon';
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.general.favicon_url;
    }

    // 3. Dynamic Meta Description
    const metaDesc = page?.seo?.description || settings.seo?.meta_description || settings.general?.site_description;
    if (metaDesc) {
      let metaTag = document.querySelector('meta[name="description"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'description');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', metaDesc);
    }

    // 4. Dynamic Open Graph Image & Title
    const ogImage = page?.seo?.og_image || settings.seo?.og_image;
    if (ogImage) {
      let ogImageTag = document.querySelector('meta[property="og:image"]');
      if (!ogImageTag) {
        ogImageTag = document.createElement('meta');
        ogImageTag.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageTag);
      }
      ogImageTag.setAttribute('content', ogImage);
    }
  }, [settings, page]);

  return null;
};
