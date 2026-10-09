import React from 'react';
import { PageSection } from '../../types';

interface TwoColumnSectionProps {
  section: PageSection;
}

export const TwoColumnSection: React.FC<TwoColumnSectionProps> = ({ section }) => {
  const { content } = section;

  return (
    <section className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {content.col1_heading || 'Left Column'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.col1_text || ''}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {content.col2_heading || 'Right Column'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.col2_text || ''}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
