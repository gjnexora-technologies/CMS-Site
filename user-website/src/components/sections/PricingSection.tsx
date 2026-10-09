import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { PageSection } from '../../types';

interface PricingSectionProps {
  section: PageSection;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ section }) => {
  const { content } = section;
  const plans = content.plans || [];

  return (
    <section id="pricing" className="py-16 md:py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {content.badge && (
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-4">
              {content.badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            {content.heading || 'Transparent Pricing Plans'}
          </h2>
          {content.description && (
            <p className="text-slate-600 text-base sm:text-lg">
              {content.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan: any, idx: number) => {
            const isPopular = Boolean(plan.is_popular);

            return (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-slate-900 text-white shadow-2xl border-2 border-emerald-500 scale-105 z-10'
                    : 'bg-white text-slate-900 shadow-md border border-slate-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p
                    className={`text-sm mb-6 ${
                      isPopular ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {plan.desc}
                  </p>

                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={`text-sm font-medium ${
                          isPopular ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        /{plan.period}
                      </span>
                    )}
                  </div>

                  {/* FEATURES */}
                  <ul className="space-y-3.5 mb-8">
                    {plan.features?.map((f: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm">
                        <Check
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isPopular ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                        />
                        <span
                          className={isPopular ? 'text-slate-200' : 'text-slate-700'}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={plan.cta_link || '/contact'}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-center transition-all duration-200 block shadow-md ${
                    isPopular
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {plan.cta_text || 'Get Started'}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
