import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageSection } from '../../types';
import { api } from '../../services/api';

interface ContactSectionProps {
  section: PageSection;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ section }) => {
  const { content } = section;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.submitContactForm(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="form" className="pt-8 pb-16 md:pt-10 md:pb-20 bg-white relative">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {content.badge && (
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-4">
              {content.badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            {content.heading || 'Get In Touch'}
          </h2>
          {content.description && (
            <p className="text-slate-600 text-base sm:text-lg">
              {content.description}
            </p>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* CONTACT INFO SIDEBAR */}
          <div className="min-w-0 xl:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 xl:p-10 shadow-xl space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-3">
                {content.contact_heading || 'Direct Inquiries'}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {content.contact_description || 'Contact the school office with your questions or to learn about admissions.'}
              </p>
            </div>

            <div className="space-y-6">
              {content.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      {content.email_label || 'Email'}
                    </span>
                    <a
                      href={`mailto:${content.email}`}
                      className="text-sm sm:text-base font-semibold text-white hover:text-emerald-400 transition-colors"
                    >
                      {content.email}
                    </a>
                  </div>
                </div>
              )}

              {content.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      {content.phone_label || 'Phone'}
                    </span>
                    <a
                      href={`tel:${content.phone}`}
                      className="text-sm sm:text-base font-semibold text-white hover:text-emerald-400 transition-colors"
                    >
                      {content.phone}
                    </a>
                  </div>
                </div>
              )}

              {content.address && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      {content.address_label || 'School'}
                    </span>
                    <span className="text-sm sm:text-base text-slate-300">
                      {content.address}
                    </span>
                  </div>
                </div>
              )}

              {content.hours && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      {content.hours_label || 'Availability'}
                    </span>
                    <span className="text-sm sm:text-base text-slate-300">
                      {content.hours}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="min-w-0 xl:col-span-7 bg-white rounded-3xl p-6 sm:p-8 xl:p-10 border border-slate-200/90 shadow-lg">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Enquiry Sent!
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Thank you for contacting us. The school team will review your message.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {content.name_label || 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={content.name_placeholder || 'Jane Doe'}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-900 placeholder-slate-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {content.email_field_label || 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={content.email_placeholder || 'jane@company.com'}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-900 placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {content.subject_label || 'Subject'}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder={content.subject_placeholder || 'Admissions question or general enquiry'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-900 placeholder-slate-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {content.message_label || 'Your Message'} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={content.message_placeholder || 'How can our school help you?'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-900 placeholder-slate-400 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending...' : (content.submit_text || 'Send Enquiry')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
