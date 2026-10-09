import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PageSection } from '../../types';

interface ProjectsSectionProps {
  section: PageSection;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ section }) => {
  const { content } = section;
  const items = content.items || [];

  return (
    <section className="py-16 md:py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {content.badge && (
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-4">
              {content.badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            {content.heading || 'School Highlights'}
          </h2>
          {content.description && (
            <p className="text-slate-600 text-base sm:text-lg">
              {content.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((project: any, idx: number) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden aspect-[16/10] bg-slate-100">
                <img
                  src={
                    project.image_url ||
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {project.category && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow">
                    {project.category}
                  </span>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                    <span>{project.title}</span>
                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {project.desc}
                  </p>
                </div>

                {project.metric && (
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Outcome Metric
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {project.metric}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
