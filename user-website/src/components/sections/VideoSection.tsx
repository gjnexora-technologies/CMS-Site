import React from 'react';
import { PageSection } from '../../types';

interface VideoSectionProps {
  section: PageSection;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ section }) => {
  const { content } = section;

  const videoUrl = content.video_url || '';
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    }
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=${
          content.autoplay ? 1 : 0
        }&mute=${content.muted ? 1 : 0}&loop=${content.loop ? 1 : 0}&controls=${
          content.controls !== false ? 1 : 0
        }`
      : url;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const parts = url.split('/');
    const id = parts[parts.length - 1];
    return `https://player.vimeo.com/video/${id}?autoplay=${
      content.autoplay ? 1 : 0
    }&muted=${content.muted ? 1 : 0}&loop=${content.loop ? 1 : 0}`;
  };

  return (
    <section className="py-16 md:py-20 bg-slate-900 text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {(content.heading || content.badge) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {content.badge && (
              <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 mb-4">
                {content.badge}
              </span>
            )}
            {content.heading && (
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
                {content.heading}
              </h2>
            )}
            {content.description && (
              <p className="text-slate-400 text-base sm:text-lg">
                {content.description}
              </p>
            )}
          </div>
        )}

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video bg-black max-w-4xl mx-auto">
          {isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(videoUrl)}
              title={content.heading || 'Embedded Video'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isVimeo ? (
            <iframe
              src={getVimeoEmbedUrl(videoUrl)}
              title={content.heading || 'Embedded Video'}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              poster={content.thumbnail_url}
              autoPlay={content.autoplay}
              muted={content.muted}
              loop={content.loop}
              controls={content.controls !== false}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
};
