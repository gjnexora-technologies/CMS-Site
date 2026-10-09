import React from 'react';
import { Star, Quote } from 'lucide-react';
import { PageSection } from '../../types';

interface TestimonialsSectionProps {
  section: PageSection;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ section }) => {
  const { content } = section;
  const items = content.items || [];

  return (
    <section className="py-16 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {content.badge && (
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-4">
              {content.badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            {content.heading || 'Client Endorsements'}
          </h2>
          {content.description && (
            <p className="text-slate-600 text-base sm:text-lg">
              {content.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((t: any, idx: number) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* STARS */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                {/* QUOTE */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              {/* AUTHOR */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-200/60">
                {t.avatar_url && (
                  <img
                    src={t.avatar_url}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
