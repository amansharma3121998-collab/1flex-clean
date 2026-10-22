import React, { useState, useEffect } from 'react';
import { Search, Play, Plus, Check, Filter } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { MediaItem } from '../types/media';
import { useModal } from '../context/ModalContext';
import { useList } from '../context/ListContext';

interface SearchPageProps {
  initialQuery?: string;
  onPlay: (item: MediaItem) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onPlay }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const { openMovieModal, openTVModal } = useModal();
  const { isInList, addToList, removeFromList } = useList();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let isMounted = true;
    const executeSearch = async () => {
      try {
        setIsLoading(true);
        const res = await tmdb.searchMulti(query);
        if (isMounted) {
          setResults(res.results || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timer = setTimeout(executeSearch, 250);
    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [query]);

  const filteredResults = results.filter((item) => {
    if (filter === 'all') return true;
    const isTV = item.media_type === 'tv' || !!item.name || !item.title;
    return filter === 'tv' ? isTV : !isTV;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl">
          <div className="flex-1 relative flex items-center bg-black/70 border border-zinc-700/80 rounded-xl px-4 py-2.5">
            <Search className="w-5 h-5 text-zinc-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by movie title, show name, actor, or genre..."
              className="bg-transparent text-sm sm:text-base text-white focus:outline-none w-full placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {(['all', 'movie', 'tv'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {tab === 'all' ? 'All Results' : tab === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </div>

        {/* Search status header */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
          <span>
            {query.trim()
              ? `Found ${filteredResults.length} results for "${query}"`
              : 'Enter a search term above to explore the catalog'}
          </span>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-zinc-900 rounded-lg animate-pulse border border-zinc-800"
              />
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredResults.map((item) => {
              const isTV = item.media_type === 'tv' || !!item.name || !item.title;
              const title = item.title || item.name || 'Untitled';
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
                  className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer group hover:scale-105 hover:border-zinc-500 hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={tmdb.getImageUrl(item.poster_path || item.backdrop_path, 'w500')}
                    alt={title}
                    className="w-full h-full object-cover"
                  />

                  {/* Rating Badge */}
                  {item.vote_average ? (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-zinc-700 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ★ {item.vote_average.toFixed(1)}
                    </div>
                  ) : null}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <p className="text-xs font-bold text-white line-clamp-2 mb-1">{title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-300 mb-2">
                      {year && <span>{year}</span>}
                      <span className="text-red-400 font-bold uppercase">
                        {isTV ? 'TV' : 'Movie'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(item);
                        }}
                        className="p-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow"
                        title="Play"
                      >
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          inList ? removeFromList(item.id) : addToList(item);
                        }}
                        className="p-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-zinc-600"
                        title={inList ? 'Remove' : 'Add to List'}
                      >
                        {inList ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : query.trim() ? (
          <div className="py-20 text-center text-zinc-500">
            No titles found matching "{query}". Try a different spelling or keyword.
          </div>
        ) : null}
      </div>
    </div>
  );
};
