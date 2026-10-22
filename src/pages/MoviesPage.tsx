import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { tmdb } from '../services/tmdb';
import { MediaItem } from '../types/media';
import { useModal } from '../context/ModalContext';
import { useList } from '../context/ListContext';
import { Play, Plus, Check, Filter } from 'lucide-react';

interface MoviesPageProps {
  onPlay: (item: MediaItem) => void;
}

const GENRES = [
  { id: 'all', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '35', name: 'Comedy' },
  { id: '18', name: 'Drama' },
  { id: '878', name: 'Sci-Fi' },
  { id: '27', name: 'Horror' },
  { id: '53', name: 'Thriller' },
  { id: '16', name: 'Animation' },
  { id: '10749', name: 'Romance' },
  { id: '80', name: 'Crime' },
];

export const MoviesPage: React.FC<MoviesPageProps> = ({ onPlay }) => {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const { openMovieModal } = useModal();
  const { isInList, addToList, removeFromList } = useList();

  useEffect(() => {
    let isMounted = true;
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const res =
          selectedGenre === 'all'
            ? await tmdb.getPopularMovies(1)
            : await tmdb.discoverMovies({
                with_genres: selectedGenre,
                sort_by: sortBy,
                page: 1,
              });

        if (isMounted) {
          setMovies(res.results || []);
          setPage(1);
          setHasMore(res.page < res.total_pages);
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMovies();
    return () => {
      isMounted = false;
    };
  }, [selectedGenre, sortBy]);

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const res =
        selectedGenre === 'all'
          ? await tmdb.getPopularMovies(nextPage)
          : await tmdb.discoverMovies({
              with_genres: selectedGenre,
              sort_by: sortBy,
              page: nextPage,
            });

      setMovies((prev) => [...prev, ...(res.results || [])]);
      setPage(nextPage);
      setHasMore(res.page < res.total_pages);
    } catch (err) {
      console.error('Failed to load more movies:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <HeroBanner mediaType="movie" onPlay={onPlay} />

      <div className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedGenre === g.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Newest Releases</option>
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-zinc-900 rounded-lg animate-pulse border border-zinc-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((item) => {
              const inList = isInList(item.id);
              const year = item.release_date
                ? new Date(item.release_date).getFullYear()
                : null;

              return (
                <div
                  key={item.id}
                  onClick={() => openMovieModal(item)}
                  className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/80 cursor-pointer group hover:scale-105 hover:border-zinc-500 hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={tmdb.getImageUrl(item.poster_path, 'w500')}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Rating Badge */}
                  {item.vote_average ? (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-zinc-700 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ★ {item.vote_average.toFixed(1)}
                    </div>
                  ) : null}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <p className="text-xs font-bold text-white line-clamp-2 mb-1">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-300 mb-2">
                      {year && <span>{year}</span>}
                      <span className="text-emerald-400 font-semibold">
                        {Math.round((item.vote_average || 7) * 10)}%
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
        )}

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="text-center pt-8">
            <button
              onClick={loadMore}
              className="px-8 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold border border-zinc-800 hover:border-zinc-700 transition-all text-sm shadow-lg"
            >
              Load More Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
