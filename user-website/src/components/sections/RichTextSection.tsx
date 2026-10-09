import React from 'react';
import { PageSection } from '../../types';

interface RichTextSectionProps {
  section: PageSection;
}

export const RichTextSection: React.FC<RichTextSectionProps> = ({ section }) => {
  const { content } = section;

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {content.title && (
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8 border-b pb-4">
            {content.title}
          </h2>
        )}
        <div
          className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: content.content || '' }}
        />
      </div>
    </section>
  );
};
