import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageSection } from '../../types';

interface CtaSectionProps {
  section: PageSection;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ section }) => {
  const { content, settings } = section;

  return (
    <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white">
      {/* Decorative patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          {content.heading || 'Ready to Accelerate Your Roadmap?'}
        </h2>
        {content.description && (
          <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto font-normal leading-relaxed">
            {content.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {content.primary_btn_text && (
            <Link
              to={content.primary_btn_link || '/contact'}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              <span>{content.primary_btn_text}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {content.secondary_btn_text && (
            <Link
              to={content.secondary_btn_link || '/pricing'}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base bg-emerald-700/60 hover:bg-emerald-700/90 text-white border border-white/20 transition-all active:scale-95"
            >
              <span>{content.secondary_btn_text}</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
