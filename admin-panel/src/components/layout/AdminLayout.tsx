import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  Compass,
  Settings,
  Inbox,
  ExternalLink,
  ChevronRight,
  Database,
  Menu,
  X,
  Bell,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { api } from '../../services/api';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { SiteSettings } from '../../types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const signOut = async () => {
    sessionStorage.removeItem('apg-admin-code-verified');
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Unable to sign out of Supabase Auth:', error);
        showToast('Unable to sign out. Please try again.', 'error');
        return;
      }
    }
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const loadInit = async () => {
      const s = await api.getSiteSettings();
      setSettings(s);
      const subs = await api.getContactSubmissions();
      setInquiryCount(subs.filter((sub) => sub.status === 'new').length);
    };
    loadInit();

    const unsub = api.subscribe((event) => {
      if (event?.type === 'SETTINGS_UPDATED') {
        setSettings(event.payload);
      }
      if (event?.type === 'FORM_SUBMITTED') {
        setInquiryCount((prev) => prev + 1);
        showToast('New contact inquiry received!', 'success');
      }
    });
    return unsub;
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pages', path: '/pages', icon: FileText },
    { name: 'Media Library', path: '/media', icon: Image },
    { name: 'Navigation', path: '/navigation', icon: Compass },
    { name: 'Website Settings', path: '/settings', icon: Settings },
    {
      name: 'Form Inquiries',
      path: '/inquiries',
      icon: Inbox,
      badge: inquiryCount > 0 ? inquiryCount : undefined,
    },
  ];

  const userWebsiteUrl = 'http://localhost:5174';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium border animate-bounce ${
            toast.type === 'success'
              ? 'bg-white border-emerald-500/50 text-emerald-700'
              : 'bg-white border-rose-500/50 text-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                APG School
              </span>
              <span className="text-[10px] text-blue-700 font-medium">
                Website Admin
              </span>
            </div>
          </Link>
        </div>

        {/* STATUS & ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* BACKEND STATUS PILL */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-300/80">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-blue-400 animate-pulse'
              }`}
            />
            <span className="text-slate-700">
              {isSupabaseConfigured ? 'Supabase Postgres' : 'Local Live Sync'}
            </span>
          </div>

          {/* VIEW USER WEBSITE BUTTON */}
          <a
            href={userWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-700 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Sign out of admin panel"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 md:static md:translate-x-0 flex flex-col justify-between ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-0 max-md:-translate-x-full'
          }`}
        >
          <div className="py-6 px-3 space-y-1">
            <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Management
            </div>
            {navLinks.map((link) => {
              const active =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);

              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* BOTTOM SIDEBAR FOOTER */}
          <div className="p-4 border-t border-slate-200 space-y-3">
            <div className="p-3 rounded-xl bg-slate-100/50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-700" />
                <span>Single Source of Truth</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All changes made here dynamically control the User Website.
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN VIEW CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
