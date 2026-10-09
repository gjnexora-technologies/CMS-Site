import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PagesListPage } from './pages/PagesListPage';
import { PageBuilderPage } from './pages/PageBuilderPage';
import { MediaLibraryPage } from './pages/MediaLibraryPage';
import { NavigationPage } from './pages/NavigationPage';
import { WebsiteSettingsPage } from './pages/WebsiteSettingsPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { isSupabaseConfigured, supabase } from './lib/supabase';

function ProtectedAdmin() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      setReady(true);
      return;
    }

    let alive = true;
    const check = async () => {
      if (!alive) return;
      const { data: { session } } = await client.auth.getSession();
      if (!alive) return;
      setAllowed(Boolean(session && sessionStorage.getItem('apg-admin-code-verified') === 'true'));
      setReady(true);
    };
    void check();
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return <div className="min-h-screen bg-slate-50" />;
  if (!allowed) return <Navigate to="/login" replace state={{ from: location }} />;

  return (
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
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/*" element={<ProtectedAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
