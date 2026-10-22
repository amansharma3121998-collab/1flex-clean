import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Check, Info } from 'lucide-react';
import { MediaItem } from '../types/media';
import { tmdb } from '../services/tmdb';
import { useModal } from '../context/ModalContext';
import { useList } from '../context/ListContext';

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  mediaType?: 'movie' | 'tv';
  onPlay: (item: MediaItem) => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, items, mediaType, onPlay }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { openMovieModal, openTVModal } = useModal();
  const { isInList, addToList, removeFromList } = useList();

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -700 : 700;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative px-4 sm:px-6 lg:px-8 my-7 group/row">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">
          {title}
        </h2>
      </div>

      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-36 bg-black/75 hover:bg-black/95 text-white items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity rounded-r-md backdrop-blur-sm border-r border-zinc-700/40"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-36 bg-black/75 hover:bg-black/95 text-white items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity rounded-l-md backdrop-blur-sm border-l border-zinc-700/40"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Items Container */}
      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-none snap-x"
      >
        {items.map((item) => {
          const itemType = mediaType || (item.media_type === 'tv' || item.name ? 'tv' : 'movie');
          const isTV = itemType === 'tv';
          const itemTitle = item.title || item.name || 'Untitled';
          const inList = isInList(item.id);
          const year = item.release_date
            ? new Date(item.release_date).getFullYear()
            : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : null;

          return (
            <div
              key={item.id}
              onClick={() => (isTV ? openTVModal(item) : openMovieModal(item))}
              className="relative flex-shrink-0 w-32 sm:w-40 md:w-48 aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 border border-zinc-800/80 cursor-pointer group snap-start transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl hover:border-zinc-500"
            >
              <img
                src={tmdb.getImageUrl(item.poster_path, 'w500')}
                alt={itemTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
                {item.vote_average && item.vote_average >= 7.5 && (
                  <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shadow">
                    Top
                  </span>
                )}
              </div>

              {/* Hover overlay with action buttons */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 mb-1">
                  {itemTitle}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-zinc-300 mb-2">
                  {item.vote_average ? (
                    <span className="text-emerald-400 font-bold">
                      {Math.round(item.vote_average * 10)}%
                    </span>
                  ) : null}
                  {year && <span>{year}</span>}
                  <span className="text-red-400 uppercase font-semibold">
                    {isTV ? 'TV' : 'Movie'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(item);
                    }}
                    className="p-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow"
                    title="Play"
                  >
                    <Play className="w-3 h-3 fill-black ml-0.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      inList ? removeFromList(item.id) : addToList(item);
                    }}
                    className="p-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-zinc-600"
                    title={inList ? 'Remove from My List' : 'Add to My List'}
                  >
                    {inList ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isTV ? openTVModal(item) : openMovieModal(item);
                    }}
                    className="p-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-zinc-600 ml-auto"
                    title="More details"
                  >
                    <Info className="w-3 h-3 text-zinc-300" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
