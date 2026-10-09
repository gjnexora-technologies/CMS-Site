import React from 'react';
import { PageSection } from '../types';
import { HeroSection } from './sections/HeroSection';
import { BentoGridSection } from './sections/BentoGridSection';
import { AboutSection } from './sections/AboutSection';
import { ServicesSection } from './sections/ServicesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { TeamSection } from './sections/TeamSection';
import { PricingSection } from './sections/PricingSection';
import { FaqSection } from './sections/FaqSection';
import { ContactSection } from './sections/ContactSection';
import { CtaSection } from './sections/CtaSection';
import { GallerySection } from './sections/GallerySection';
import { VideoSection } from './sections/VideoSection';
import { RichTextSection } from './sections/RichTextSection';
import { TwoColumnSection } from './sections/TwoColumnSection';

interface DynamicRendererProps {
  sections: PageSection[];
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ sections }) => {
  if (!sections || sections.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-400 text-lg">This page does not have any visible sections yet.</p>
      </div>
    );
  }

  return (
    <main className="w-full">
      {sections.map((section) => {
        let Component: React.FC<{ section: PageSection }> | null = null;

        switch (section.section_type) {
          case 'hero':
            Component = HeroSection;
            break;
          case 'bento_grid':
            Component = BentoGridSection;
            break;
          case 'about':
            Component = AboutSection;
            break;
          case 'services':
            Component = ServicesSection;
            break;
          case 'projects':
            Component = ProjectsSection;
            break;
          case 'testimonials':
            Component = TestimonialsSection;
            break;
          case 'team':
            Component = TeamSection;
            break;
          case 'pricing':
            Component = PricingSection;
            break;
          case 'faq':
            Component = FaqSection;
            break;
          case 'contact_form':
            Component = ContactSection;
            break;
          case 'cta':
            Component = CtaSection;
            break;
          case 'gallery':
            Component = GallerySection;
            break;
          case 'video':
            Component = VideoSection;
            break;
          case 'rich_text':
            Component = RichTextSection;
            break;
          case 'two_column':
            Component = TwoColumnSection;
            break;
          default:
            Component = HeroSection;
        }

        return (
          <div key={section.id} id={`section-${section.id}`} className="section-enter">
            <Component section={section} />
          </div>
        );
      })}
    </main>
  );
};
