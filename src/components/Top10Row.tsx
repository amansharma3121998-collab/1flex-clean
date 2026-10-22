import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Check } from 'lucide-react';
import { MediaItem } from '../types/media';
import { tmdb } from '../services/tmdb';
import { useModal } from '../context/ModalContext';
import { useList } from '../context/ListContext';

interface Top10RowProps {
  title: string;
  items: MediaItem[];
  mediaType: 'movie' | 'tv';
  onPlay: (item: MediaItem) => void;
}

export const Top10Row: React.FC<Top10RowProps> = ({ title, items, mediaType, onPlay }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { openMovieModal, openTVModal } = useModal();
  const { isInList, addToList, removeFromList } = useList();

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const top10List = items.slice(0, 10);
  if (top10List.length === 0) return null;

  return (
    <div className="relative px-4 sm:px-6 lg:px-8 my-8 group/row">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded tracking-wider uppercase">
            Top 10
          </span>
        </h2>
      </div>

      {/* Scroll Chevrons */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-32 bg-black/70 hover:bg-black/90 text-white items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity rounded-r-md backdrop-blur-sm"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-32 bg-black/70 hover:bg-black/90 text-white items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity rounded-l-md backdrop-blur-sm"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Row items container */}
      <div
        ref={containerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x"
      >
        {top10List.map((item, index) => {
          const rank = index + 1;
          const inList = isInList(item.id);
          const itemTitle = item.title || item.name || 'Title';

          return (
            <div
              key={item.id}
              onClick={() => (mediaType === 'movie' ? openMovieModal(item) : openTVModal(item))}
              className="relative flex-shrink-0 flex items-center cursor-pointer group snap-start transition-transform duration-300 hover:scale-105"
            >
              {/* Massive stylized outline number */}
              <div className="relative select-none pointer-events-none -mr-4 sm:-mr-6 z-0">
                <span
                  className="font-bebas text-[110px] sm:text-[140px] md:text-[160px] leading-none font-black text-zinc-900 tracking-tighter"
                  style={{
                    WebkitTextStroke: '3px #52525b',
                    textShadow: '0 8px 16px rgba(0,0,0,0.9)',
                  }}
                >
                  {rank}
                </span>
              </div>

              {/* Poster Card */}
              <div className="relative z-10 w-28 sm:w-36 md:w-44 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 border border-zinc-800 shadow-xl group-hover:border-zinc-500 transition-all">
                <img
                  src={tmdb.getImageUrl(item.poster_path, 'w500')}
                  alt={itemTitle}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <p className="text-xs font-bold text-white line-clamp-2 mb-2">{itemTitle}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(item);
                      }}
                      className="p-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-lg"
                      title="Play"
                    >
                      <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        inList ? removeFromList(item.id) : addToList(item);
                      }}
                      className="p-2 rounded-full bg-zinc-800/90 text-white hover:bg-zinc-700 transition-all border border-zinc-600"
                      title={inList ? 'Remove from My List' : 'Add to My List'}
                    >
                      {inList ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
