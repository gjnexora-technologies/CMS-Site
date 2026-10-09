import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { PageSection } from '../../types';

interface GallerySectionProps {
  section: PageSection;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ section }) => {
  const { content } = section;
  const images = content.images || [];

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const categories = ['All', ...new Set(images.map((img: any) => img.category).filter(Boolean))];

  const filtered =
    activeCategory === 'All'
      ? images
      : images.filter((img: any) => img.category === activeCategory);

  return (
    <section className="py-16 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {content.badge && (
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-4">
              {content.badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            {content.heading || 'Media Gallery'}
          </h2>
          {content.description && (
            <p className="text-slate-600 text-base sm:text-lg">
              {content.description}
            </p>
          )}

          {/* FILTER BUTTONS */}
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat: any) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MASONRY/GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item: any, idx: number) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={item.url}
                alt={item.title || `Gallery item ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-1">
                  {item.category}
                </span>
                <h4 className="text-base font-bold flex items-center justify-between">
                  <span>{item.title}</span>
                  <ZoomIn className="w-4 h-4 text-white/80" />
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            {selectedImage.title && (
              <p className="mt-4 text-white text-base font-medium text-center">
                {selectedImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
