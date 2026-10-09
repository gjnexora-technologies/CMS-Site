import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PageSection } from '../../types';

interface HeroSectionProps {
  section: PageSection;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ section }) => {
  const { content, settings } = section;

  const bgStyle = settings?.background_style || 'gradient';
  const paddingY = settings?.padding_y || 'normal';
  const alignment = settings?.alignment || 'center';

  const pyClasses = {
    compact: 'py-12 md:py-16',
    normal: 'py-16 md:py-20',
    spacious: 'py-16 md:py-20',
  }[paddingY];

  let bgClass = 'bg-white';
  if (bgStyle === 'gradient') {
    bgClass = 'bg-gradient-to-b from-emerald-50/60 via-white to-slate-50/50';
  } else if (bgStyle === 'dark') {
    bgClass = 'bg-slate-950 text-white';
  } else if (bgStyle === 'muted') {
    bgClass = 'bg-slate-50';
  } else if (bgStyle === 'brand') {
    bgClass = 'bg-gradient-to-r from-emerald-600 to-green-700 text-white';
  }

  const isDark = bgStyle === 'dark' || bgStyle === 'brand';

  return (
    <section className={`relative overflow-hidden ${bgClass} ${pyClasses}`}>
      {/* Decorative background glow */}
      {bgStyle === 'gradient' && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`flex flex-col ${
            alignment === 'center'
              ? 'items-center text-center max-w-4xl mx-auto'
              : alignment === 'right'
              ? 'items-end text-right ml-auto max-w-3xl'
              : 'items-start text-left max-w-3xl'
          }`}
        >
          {/* BADGE */}
          {content.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{content.badge}</span>
            </div>
          )}

          {/* HEADLINE */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.12] mb-6 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {content.heading || 'Welcome to Our Website'}
          </h1>

          {/* DESCRIPTION */}
          {content.description && (
            <p
              className={`text-lg sm:text-xl font-normal leading-relaxed mb-9 max-w-2xl ${
                isDark ? 'text-slate-200' : 'text-slate-600'
              }`}
            >
              {content.description}
            </p>
          )}

          {/* BUTTONS */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            {content.primary_btn_text && (
              <Link
                to={content.primary_btn_link || '/contact'}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: isDark ? '#ffffff' : 'var(--color-primary, #1e5631)',
                  color: isDark ? '#0f172a' : '#ffffff',
                }}
              >
                <span>{content.primary_btn_text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {content.secondary_btn_text && (
              <Link
                to={content.secondary_btn_link || '/services'}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold border transition-all duration-200 active:scale-95 ${
                  isDark
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{content.secondary_btn_text}</span>
              </Link>
            )}
          </div>

          {/* STATS COUNTERS */}
          {content.stats && content.stats.length > 0 && (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 pb-2 border-t border-slate-200/60 dark:border-slate-800">
              {content.stats.map((stat: any, idx: number) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
                    {stat.value}
                  </div>
                  <div
                    className={`text-xs uppercase tracking-wider font-medium mt-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HERO IMAGE */}
        {content.image_url && (
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 group">
            <img
              src={content.image_url}
              alt={content.heading || 'Hero'}
              className="w-full h-auto max-h-[560px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              loading="eager"
            />
          </div>
        )}
      </div>
    </section>
  );
};
