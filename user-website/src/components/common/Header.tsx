import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { SiteSettings, NavigationItem } from '../../types';

interface HeaderProps {
  settings: SiteSettings;
  navigation: NavigationItem[];
}

export const Header: React.FC<HeaderProps> = ({ settings, navigation }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const { header, general } = settings;
  const isSticky = header?.is_sticky ?? true;

  // Background styling based on settings and scroll
  let headerBgClass = 'bg-white/95 border-b border-slate-200/80';
  if (header?.bg_style === 'glass') {
    headerBgClass = scrolled
      ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80'
      : 'bg-white/70 backdrop-blur-sm border-b border-slate-200/40';
  } else if (header?.bg_style === 'transparent' && !scrolled) {
    headerBgClass = 'bg-transparent border-transparent';
  }

  const isCurrent = (url: string) => {
    if (url === '/' && location.pathname === '/') return true;
    if (url !== '/' && location.pathname.startsWith(url)) return true;
    return false;
  };

  return (
    <header
      className={`w-full transition-all duration-300 z-50 ${
        isSticky ? 'sticky top-0' : 'relative'
      } ${headerBgClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            {general.logo_url ? (
              <img
                src={general.logo_url}
                alt={general.site_name}
                className="h-10 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
              {general.site_name || 'APG Matriculation Higher Secondary School'}
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navigation.map((item) => {
              const active = isCurrent(item.url);
              if (item.children && item.children.length > 0) {
                return (
                  <div key={item.id} className="relative group">
                    <button
                      className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'text-emerald-600 font-semibold bg-emerald-50/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </button>
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.url}
                          target={child.target}
                          className="block px-4 py-2.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.url}
                  target={item.target}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-emerald-600 font-semibold bg-emerald-50/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* HEADER CTA BUTTON */}
          <div className="hidden md:flex items-center gap-4">
            {header.show_cta && header.cta_text && (
              <Link
                to={header.cta_link || '/contact'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white shadow-sm hover:shadow-md transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--color-primary, #1e5631)',
                }}
              >
                <span>{header.cta_text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-2xl">
          {navigation.map((item) => (
            <div key={item.id}>
              <Link
                to={item.url}
                target={item.target}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isCurrent(item.url)
                    ? 'text-emerald-600 font-semibold bg-emerald-50'
                    : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
              {item.children?.map((child) => (
                <Link
                  key={child.id}
                  to={child.url}
                  className="block pl-8 pr-4 py-2 text-sm text-slate-500 hover:text-emerald-600"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}

          {header.show_cta && header.cta_text && (
            <div className="pt-4 px-2">
              <Link
                to={header.cta_link || '/contact'}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-base text-white shadow-md text-center"
                style={{
                  backgroundColor: 'var(--color-primary, #1e5631)',
                }}
              >
                <span>{header.cta_text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
