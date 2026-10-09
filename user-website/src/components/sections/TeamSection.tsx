import React from 'react';
import { PageSection } from '../../types';
import { LinkedinIcon, TwitterIcon } from '../common/SocialIcons';

interface TeamSectionProps {
  section: PageSection;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ section }) => {
  const { content } = section;
  const members = content.members || [];

  return (
    <section id="team" className="py-16 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {content.badge && (
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-4">
              {content.badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            {content.heading || 'Executive Leadership'}
          </h2>
          {content.description && (
            <p className="text-slate-600 text-base sm:text-lg">
              {content.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member: any, idx: number) => (
            <div
              key={idx}
              className="group bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:shadow-xl transition-all duration-300 text-center flex flex-col justify-between"
            >
              <div>
                <div className="relative w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img
                    src={
                      member.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                    }
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-3">
                  {member.role}
                </p>
                {member.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                )}
              </div>

              {/* SOCIAL ICONS */}
              <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-200/60">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white transition-colors"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
                {member.twitter && (
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-white transition-colors"
                    aria-label={`${member.name} Twitter`}
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
