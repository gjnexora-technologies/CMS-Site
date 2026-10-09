import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { NavigationItem, Page } from '../types';

export const NavigationPage: React.FC = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    url: '/',
    target: '_self' as '_self' | '_blank',
    is_visible: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedNav, fetchedPages] = await Promise.all([
        api.getNavigation(),
        api.getPages(),
      ]);
      setItems(fetchedNav);
      setPages(fetchedPages);
    } catch (e) {
      console.error('Error loading navigation:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = api.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      label: '',
      url: '/',
      target: '_self',
      is_visible: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item: NavigationItem) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      label: item.label,
      url: item.url,
      target: item.target,
      is_visible: item.is_visible,
    });
    setShowModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.url) return;

    let updatedList = [...items];
    if (modalMode === 'create') {
      const newItem: NavigationItem = {
        id: 'nav-' + Date.now(),
        label: formData.label,
        url: formData.url,
        target: formData.target,
        sort_order: items.length,
        is_visible: formData.is_visible,
      };
      updatedList.push(newItem);
    } else if (editingId) {
      updatedList = updatedList.map((item) =>
        item.id === editingId
          ? {
              ...item,
              label: formData.label,
              url: formData.url,
              target: formData.target,
              is_visible: formData.is_visible,
            }
          : item
      );
    }

    await api.saveNavigation(updatedList);
    setItems(updatedList);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this menu item?')) {
      const filtered = items.filter((i) => i.id !== id);
      await api.saveNavigation(filtered);
      setItems(filtered);
    }
  };

  const handleToggleVisibility = async (item: NavigationItem) => {
    const updated = items.map((i) =>
      i.id === item.id ? { ...i, is_visible: !i.is_visible } : i
    );
    await api.saveNavigation(updated);
    setItems(updated);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIndex, 0, moved);

    await api.saveNavigation(copy);
    setItems(copy);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Navigation Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure the public navigation bar. Changes appear immediately on the User Website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* NAVIGATION ITEMS LIST */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Active Navbar Links ({items.length})</span>
          <span>Order & Actions</span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No navigation items. Click "Add Menu Item" above to add links.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                  !item.is_visible
                    ? 'opacity-50 bg-slate-50'
                    : 'hover:bg-slate-100/40 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* REORDER BUTTONS */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === items.length - 1}
                      className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {item.label}
                      </span>
                      {item.target === '_blank' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-300">
                          External Tab
                        </span>
                      )}
                      {!item.is_visible && (
                        <span className="text-xs text-amber-700 font-semibold">
                          (Hidden)
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500 block mt-0.5">
                      Destination: {item.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title={item.is_visible ? 'Hide link' : 'Show link'}
                  >
                    {item.is_visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-amber-700" />
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Edit link"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-500/10 transition-colors"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === 'create' ? 'Add Navigation Item' : 'Edit Menu Item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Menu Label *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Services"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Link To Existing Page
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData({
                        ...formData,
                        url: e.target.value === 'home' ? '/' : `/${e.target.value}`,
                      });
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 mb-2"
                >
                  <option value="">-- Choose from existing pages --</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.is_home ? 'home' : p.slug}>
                      {p.title} (/{p.slug})
                    </option>
                  ))}
                </select>

                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Or Custom URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/services or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Open In
                  </label>
                  <select
                    value={formData.target}
                    onChange={(e: any) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-900"
                  >
                    <option value="_self">Same Tab (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="vis_check"
                    checked={formData.is_visible}
                    onChange={(e) =>
                      setFormData({ ...formData, is_visible: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-100 border-slate-300"
                  />
                  <label htmlFor="vis_check" className="text-xs font-medium text-slate-700">
                    Visible in Navbar
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md"
                >
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
