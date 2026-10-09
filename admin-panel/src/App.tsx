import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PagesListPage } from './pages/PagesListPage';
import { PageBuilderPage } from './pages/PageBuilderPage';
import { MediaLibraryPage } from './pages/MediaLibraryPage';
import { NavigationPage } from './pages/NavigationPage';
import { WebsiteSettingsPage } from './pages/WebsiteSettingsPage';
import { InquiriesPage } from './pages/InquiriesPage';

export function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pages" element={<PagesListPage />} />
          <Route path="/builder/:pageId" element={<PageBuilderPage />} />
          <Route path="/media" element={<MediaLibraryPage />} />
          <Route path="/navigation" element={<NavigationPage />} />
          <Route path="/settings" element={<WebsiteSettingsPage />} />
          <Route path="/inquiries" element={<InquiriesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}

export default App;
