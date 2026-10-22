import React from 'react';
import { Play, X, Trash2 } from 'lucide-react';
import { useList } from '../context/ListContext';
import { tmdb } from '../services/tmdb';
import { MediaItem } from '../types/media';

interface ContinueWatchingRowProps {
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ onPlay }) => {
  const { continueWatching, removeProgress } = useList();

  if (continueWatching.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <span>Continue Watching</span>
          <span className="text-xs bg-red-600/20 text-red-400 border border-red-600/40 px-2 py-0.5 rounded-full font-semibold">
            {continueWatching.length}
          </span>
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
        {continueWatching.map((item) => {
          const mediaItem: MediaItem = {
            id: item.id,
            title: item.title,
            name: item.title,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            media_type: item.media_type,
          };

          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-60 sm:w-72 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 transition-all shadow-md snap-start"
            >
              <div className="relative aspect-video bg-zinc-800">
                <img
                  src={tmdb.getBackdropUrl(item.backdrop_path || item.poster_path, 'w780')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Play Overlay */}
                <button
                  onClick={() => onPlay(mediaItem, item.season, item.episode)}
                  className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-red-600/90 group-hover:bg-red-600 group-hover:scale-110 flex items-center justify-center text-white shadow-xl transition-all">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </button>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProgress(item.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors"
                  title="Remove from Continue Watching"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Red Progress Bar */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-700">
                  <div
                    className="h-full bg-red-600 transition-all"
                    style={{ width: `${Math.min(100, Math.max(10, item.progress || 45))}%` }}
                  />
                </div>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {item.media_type === 'tv'
                      ? `S${item.season || 1} : E${item.episode || 1}`
                      : 'Movie'}
                  </p>
                </div>

                <button
                  onClick={() => onPlay(mediaItem, item.season, item.episode)}
                  className="px-3 py-1 bg-white/10 hover:bg-white text-xs font-semibold text-white hover:text-black rounded transition-colors flex-shrink-0"
                >
                  Resume
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
