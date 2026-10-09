import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Plus,
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Copy,
  ExternalLink,
  X,
  Check,
  Filter,
  FileText,
  Sparkles,
  Link2,
} from 'lucide-react';
import { api } from '../services/api';
import { MediaItem } from '../types';

export const MediaLibraryPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail / Edit / Inspect Modal
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Add External Media Modal
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [urlForm, setUrlForm] = useState({
    name: '',
    url: '',
    type: 'image' as 'image' | 'video',
    alt_text: '',
    caption: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await api.getMedia();
      setMediaList(data);
    } catch (e) {
      console.error('Error loading media:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
    const unsub = api.subscribe(() => {
      loadMedia();
    });
    return unsub;
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      for (let i = 0; i < files.length; i++) {
        await api.uploadMedia(files[i]);
      }
      loadMedia();
    } catch (err: any) {
      alert('Error uploading media: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlForm.name || !urlForm.url) return;
    try {
      await api.addMediaUrl({
        name: urlForm.name,
        url: urlForm.url,
        type: urlForm.type,
        size: 0,
        format: urlForm.type === 'video' ? 'video/url' : 'image/url',
        alt_text: urlForm.alt_text || urlForm.name,
        caption: urlForm.caption || '',
      });
      setShowAddUrlModal(false);
      setUrlForm({ name: '', url: '', type: 'image', alt_text: '', caption: '' });
      loadMedia();
    } catch (err: any) {
      alert('Error adding media URL: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this media asset?')) {
      await api.deleteMedia(id);
      if (selectedMedia?.id === id) setSelectedMedia(null);
      loadMedia();
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) return;
    try {
      const updated = await api.updateMedia(selectedMedia.id, {
        name: selectedMedia.name,
        alt_text: selectedMedia.alt_text,
        caption: selectedMedia.caption,
        url: selectedMedia.url,
      });
      setSelectedMedia(updated);
      loadMedia();
    } catch (err: any) {
      alert('Error updating media: ' + err.message);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.alt_text && m.alt_text.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' ? true : m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Centralized Media Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload, replace, and organize images & videos. Replacing assets here dynamically propagates everywhere on the User Website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
          </button>

          <button
            onClick={() => setShowAddUrlModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 transition-all"
          >
            <Link2 className="w-4 h-4 text-blue-700" />
            <span>Add via URL</span>
          </button>
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
            placeholder="Search media by name or alt text..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-300/80 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'image', 'video'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterType === ft
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {ft === 'all' ? 'All Media' : ft + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* MEDIA GRID */}
      {filteredMedia.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200 border-dashed space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No media found</h3>
          <p className="text-xs text-slate-500">
            Upload images, video clips, or paste image URLs to populate the media library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-500 overflow-hidden shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-slate-50 overflow-hidden">
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-500">
                    <VideoIcon className="w-10 h-10 text-blue-700" />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white">
                  {item.type}
                </span>
              </div>

              <div className="p-3">
                <h4 className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{item.format || item.type}</span>
                  {item.size > 0 && (
                    <span>{(item.size / 1024).toFixed(0)} KB</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECT / EDIT MEDIA MODAL */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Asset Details</h2>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="rounded-2xl overflow-hidden max-h-72 bg-slate-50 flex items-center justify-center border border-slate-200">
              {selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-h-72 w-full object-contain"
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="max-h-72 w-full object-contain"
                />
              )}
            </div>

            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  value={selectedMedia.name}
                  onChange={(e) =>
                    setSelectedMedia({ ...selectedMedia, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Public URL / Replace Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedMedia.url}
                    onChange={(e) =>
                      setSelectedMedia({ ...selectedMedia, url: e.target.value })
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(selectedMedia.url, selectedMedia.id)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-blue-700 flex items-center gap-1 border border-slate-300"
                  >
                    {copiedId === selectedMedia.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.alt_text || ''}
                    onChange={(e) =>
                      setSelectedMedia({ ...selectedMedia, alt_text: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.caption || ''}
                    onChange={(e) =>
                      setSelectedMedia({ ...selectedMedia, caption: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-500/10 border border-rose-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Media</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMedia(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD VIA URL MODAL */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Add External Media URL</h2>
              <button
                onClick={() => setShowAddUrlModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  value={urlForm.name}
                  onChange={(e) => setUrlForm({ ...urlForm, name: e.target.value })}
                  placeholder="e.g. Classroom or school event"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Media Type
                </label>
                <select
                  value={urlForm.type}
                  onChange={(e: any) => setUrlForm({ ...urlForm, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="image">Image (Unsplash, Cloudinary, CDN)</option>
                  <option value="video">Video (YouTube, Vimeo, MP4 direct)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Direct URL *
                </label>
                <input
                  type="url"
                  required
                  value={urlForm.url}
                  onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={urlForm.alt_text}
                  onChange={(e) => setUrlForm({ ...urlForm, alt_text: e.target.value })}
                  placeholder="Descriptive caption for screen readers & SEO"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUrlModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md"
                >
                  Add to Media Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
