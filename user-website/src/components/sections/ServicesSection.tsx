import React from 'react';
import { PageSection } from '../../types';
import {
  Globe,
  Cloud,
  Sparkles,
  Server,
  Layout,
  Lock,
  Zap,
  Code2,
  Terminal,
} from 'lucide-react';

interface ServicesSectionProps {
  section: PageSection;
}

const iconMap: Record<string, React.FC<any>> = {
  Globe,
  Cloud,
  Sparkles,
  Server,
  Layout,
  Lock,
  Zap,
  Code2,
  Terminal,
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({ section }) => {
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
            {content.heading || 'Our Services'}
          </h2>
          {content.description && (
            <p className="text-slate-600 text-base sm:text-lg">
              {content.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item: any, idx: number) => {
            const Icon = iconMap[item.icon] || Globe;
            return (
              <div
                key={idx}
                className="group p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
