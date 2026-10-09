import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { SiteSettings, NavigationItem } from '../../types';
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
} from './SocialIcons';

interface FooterProps {
  settings: SiteSettings;
  navigation: NavigationItem[];
}

export const Footer: React.FC<FooterProps> = ({ settings, navigation }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const { general, footer, social_media } = settings;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-slate-800/80">
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              {general.logo_url && (
                <img
                  src={general.logo_url}
                  alt={general.site_name}
                  className="h-9 w-auto object-contain rounded-md"
                />
              )}
              <span className="text-xl font-bold tracking-tight text-white">
                {general.site_name || 'APG Matriculation Higher Secondary School'}
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {general.site_description ||
                'A welcoming learning community helping every student build knowledge, confidence and character.'}
            </p>

            {/* Social Icons */}
            {footer.show_social && (
              <div className="flex items-center gap-3 pt-2">
                {social_media.facebook && (
                  <a
                    href={social_media.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {social_media.instagram && (
                  <a
                    href={social_media.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {social_media.linkedin && (
                  <a
                    href={social_media.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
                {social_media.twitter && (
                  <a
                    href={social_media.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    aria-label="Twitter / X"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}
                {social_media.youtube && (
                  <a
                    href={social_media.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    aria-label="YouTube"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
                {social_media.whatsapp && (
                  <a
                    href={`https://wa.me/${social_media.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    aria-label="WhatsApp"
                  >
                    <WhatsappIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {navigation.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              School Office
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {general.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{general.address}</span>
                </li>
              )}
              {general.contact_email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`mailto:${general.contact_email}`}
                    className="hover:text-white transition-colors"
                  >
                    {general.contact_email}
                  </a>
                </li>
              )}
              {general.phone_number && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`tel:${general.phone_number}`}
                    className="hover:text-white transition-colors"
                  >
                    {general.phone_number}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* NEWSLETTER */}
          {footer.show_newsletter && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                {footer.newsletter_title || 'Stay Updated'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {footer.newsletter_desc ||
                  'Keep up with school news and community updates.'}
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm py-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter work email"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition-colors"
                      aria-label="Subscribe"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            {footer.copyright_text ||
              `© ${new Date().getFullYear()} ${general.site_name || 'APG Matriculation Higher Secondary School'}. All rights reserved.`}
          </p>
          {footer.legal_links && footer.legal_links.length > 0 && (
            <div className="flex items-center gap-6">
              {footer.legal_links.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.url}
                  className="hover:text-slate-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
