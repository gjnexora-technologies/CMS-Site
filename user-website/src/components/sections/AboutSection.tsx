import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { PageSection } from '../../types';

interface AboutSectionProps {
  section: PageSection;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ section }) => {
  const { content, settings } = section;
  const points = content.points || [];

  return (
    <section className="py-16 md:py-20 bg-slate-50/70 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* IMAGE COLUMN */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src={
                  content.image_url ||
                  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80'
                }
                alt={content.heading || 'About Us'}
                className="w-full h-auto object-cover max-h-[520px]"
              />
            </div>
            {/* Floating accent badge */}
            <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                APG
              </div>
              <div className="text-xs font-medium text-slate-700 leading-tight">
                Learning and growing together in Ganapathy
              </div>
            </div>
          </div>

          {/* TEXT COLUMN */}
          <div className="space-y-6">
            {content.badge && (
              <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {content.badge}
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {content.heading || 'Who We Are'}
            </h2>
            {content.description && (
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                {content.description}
              </p>
            )}

            {/* CHECKLIST POINTS */}
            {points.length > 0 && (
              <ul className="space-y-3.5 pt-2">
                {points.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm sm:text-base font-medium">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA BUTTON */}
            {content.cta_text && (
              <div className="pt-4">
                <Link
                  to={content.cta_link || '/about'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95"
                >
                  <span>{content.cta_text}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
