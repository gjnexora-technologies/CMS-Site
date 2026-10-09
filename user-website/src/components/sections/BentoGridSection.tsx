import React from 'react';
import { PageSection } from '../../types';
import {
  Zap,
  Shield,
  Database,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Cloud,
} from 'lucide-react';

interface BentoGridSectionProps {
  section: PageSection;
}

const iconMap: Record<string, React.FC<any>> = {
  Zap,
  Shield,
  Database,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Cloud,
};

export const BentoGridSection: React.FC<BentoGridSectionProps> = ({ section }) => {
  const { content, settings } = section;
  const items = content.items || [];

  return (
    <section className="py-16 md:py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {content.badge && (
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              {content.badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
            {content.heading || 'Engineered for Performance'}
          </h2>
          {content.description && (
            <p className="text-slate-400 text-base sm:text-lg">
              {content.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any, idx: number) => {
            const IconComponent = iconMap[item.icon] || Zap;
            const isFeatured = idx === 0 || idx === 3;

            return (
              <div
                key={idx}
                className={`group relative p-8 rounded-2xl bg-slate-850 bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between ${
                  isFeatured ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  {item.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-slate-700 text-slate-300 mb-3">
                      {item.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
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
