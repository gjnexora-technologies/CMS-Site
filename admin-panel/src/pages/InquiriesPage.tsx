import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Mail,
  CheckCircle,
  Clock,
  Trash2,
  ExternalLink,
  Search,
  MessageSquare,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { ContactSubmission } from '../types';

export const InquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<ContactSubmission | null>(null);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await api.getContactSubmissions();
      setInquiries(data);
    } catch (e) {
      console.error('Error loading inquiries:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
    const unsub = api.subscribe(() => {
      loadInquiries();
    });
    return unsub;
  }, []);

  const handleUpdateStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    await api.updateContactSubmissionStatus(id, status);
    loadInquiries();
    if (selectedSub?.id === id) {
      setSelectedSub({ ...selectedSub, status });
    }
  };

  const filtered = inquiries.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      sub.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? true : sub.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Contact Form Inquiries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Incoming inquiries and project proposals submitted via the User Website.
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-300/80 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'new', 'read', 'replied'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold">Sender Details</th>
                <th className="py-4 px-6 font-semibold">Subject / Message</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Submitted</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No matching inquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className="hover:bg-slate-100/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{sub.name}</div>
                      <span className="text-xs text-blue-700">{sub.email}</span>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">
                        {sub.subject || 'Website Inquiry'}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {sub.message}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          sub.status === 'new'
                            ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
                            : sub.status === 'replied'
                            ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <a
                        href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(
                          sub.subject || 'Website Inquiry'
                        )}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Inquiry Details</h2>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Sender
                </span>
                <div className="text-base font-bold text-slate-900">
                  {selectedSub.name}
                </div>
                <a
                  href={`mailto:${selectedSub.email}`}
                  className="text-sm text-blue-700 hover:underline"
                >
                  {selectedSub.email}
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Subject
                </span>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedSub.subject || 'Website Inquiry'}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Message
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedSub.message}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-2">
                  Update Status
                </span>
                <div className="flex items-center gap-2">
                  {(['new', 'read', 'replied'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedSub.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        selectedSub.status === st
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <a
                href={`mailto:${selectedSub.email}?subject=Re: ${encodeURIComponent(
                  selectedSub.subject || 'Website Inquiry'
                )}`}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Mail Client to Reply</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
