import React, { useState } from 'react';
import { Bookmark, Play, Trash2, Film, Tv, Plus } from 'lucide-react';
import { useList } from '../context/ListContext';
import { useModal } from '../context/ModalContext';
import { tmdb } from '../services/tmdb';
import { MediaItem } from '../types/media';

interface MyListPageProps {
  onPlay: (item: MediaItem) => void;
  onNavigate: (path: string) => void;
}

export const MyListPage: React.FC<MyListPageProps> = ({ onPlay, onNavigate }) => {
  const { myList, removeFromList } = useList();
  const { openMovieModal, openTVModal } = useModal();
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const filteredList = myList.filter((item) => {
    if (filter === 'all') return true;
    const isTV = item.media_type === 'tv' || !!item.name || !item.title;
    return filter === 'tv' ? isTV : !isTV;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bookmark className="w-5 h-5 text-red-500" />
              <span className="text-xs uppercase font-bold tracking-wider text-red-500">
                Saved Watchlist
              </span>
            </div>
            <h1 className="font-bebas text-3xl sm:text-5xl tracking-wider text-white">
              MY LIST ({myList.length})
            </h1>
            <p className="text-sm text-zinc-400">
              Your personalized collection of bookmarked movies and television series.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'movie', 'tv'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  filter === tab
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab === 'all' ? 'All Titles' : tab === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {filteredList.length === 0 ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Your list is currently empty</h3>
            <p className="text-xs text-zinc-400">
              Explore trending blockbuster movies and award-winning series, then click the '+' icon to save them here.
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
            >
              Browse Trending Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredList.map((item) => {
              const isTV = item.media_type === 'tv' || !!item.name || !item.title;
              const title = item.title || item.name || 'Untitled';
              const year = item.release_date
                ? new Date(item.release_date).getFullYear()
                : item.first_air_date
                ? new Date(item.first_air_date).getFullYear()
                : null;

              return (
                <div
                  key={item.id}
                  onClick={() => (isTV ? openTVModal(item) : openMovieModal(item))}
                  className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer group hover:scale-105 hover:border-zinc-500 hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={tmdb.getImageUrl(item.poster_path, 'w500')}
                    alt={title}
                    className="w-full h-full object-cover"
                  />

                  {/* Rating Badge */}
                  {item.vote_average ? (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-zinc-700 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ★ {item.vote_average.toFixed(1)}
                    </div>
                  ) : null}

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromList(item.id);
                    }}
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white border border-zinc-700 transition-colors z-20"
                    title="Remove from My List"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <p className="text-xs font-bold text-white line-clamp-2 mb-1">{title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-300 mb-2">
                      {year && <span>{year}</span>}
                      <span className="text-emerald-400 font-semibold">
                        {Math.round((item.vote_average || 7) * 10)}%
                      </span>
                      <span className="text-red-400 font-bold uppercase">
                        {isTV ? 'TV' : 'Movie'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(item);
                      }}
                      className="w-full py-1.5 rounded bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>Play</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
