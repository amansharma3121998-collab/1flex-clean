import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Calendar,
  Clock,
  Star,
  Film,
  Tv,
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useList } from '../context/ListContext';
import { tmdb } from '../services/tmdb';
import { Episode, MediaDetails, MediaItem, Season } from '../types/media';

interface DetailModalProps {
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ onPlay }) => {
  const { modalState, closeModal, openMovieModal, openTVModal } = useModal();
  const { isInList, addToList, removeFromList, ratings, rateMedia } = useList();

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<number>(modalState.season || 1);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);

  const { isOpen, type, item } = modalState;

  useEffect(() => {
    if (!isOpen || !item) {
      setDetails(null);
      setSeasonData(null);
      return;
    }

    let isMounted = true;
    const fetchFullDetails = async () => {
      try {
        setIsLoading(true);
        const data =
          type === 'tv' || item.media_type === 'tv' || !item.title
            ? await tmdb.getTVShowDetails(item.id)
            : await tmdb.getMovieDetails(item.id);

        if (isMounted) {
          setDetails(data);
          const initialSeason = modalState.season || 1;
          setSelectedSeason(initialSeason);
        }
      } catch (err) {
        console.error('Failed to load media details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFullDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, item, type, modalState.season]);

  // Load Season Episodes when season changes for TV shows
  useEffect(() => {
    if (!details || (type !== 'tv' && details.media_type !== 'tv' && !details.name)) return;

    let isMounted = true;
    const fetchSeason = async () => {
      try {
        setIsLoadingSeason(true);
        const season = await tmdb.getTVSeasonDetails(details.id, selectedSeason);
        if (isMounted) {
          setSeasonData(season);
        }
      } catch (err) {
        console.error('Failed to load season details:', err);
      } finally {
        if (isMounted) setIsLoadingSeason(false);
      }
    };

    fetchSeason();
    return () => {
      isMounted = false;
    };
  }, [details, selectedSeason, type]);

  if (!isOpen || !item) return null;

  const isTV = type === 'tv' || item.media_type === 'tv' || !item.title;
  const title = details?.title || details?.name || item.title || item.name || 'Untitled';
  const inList = isInList(item.id);
  const userRating = ratings[item.id];
  const ageRating = details ? tmdb.getAgeRating(details) : 'PG-13';
  const logo = details ? tmdb.getEnglishLogo(details.images) : null;
  const releaseYear = details?.release_date
    ? new Date(details.release_date).getFullYear()
    : details?.first_air_date
    ? new Date(details.first_air_date).getFullYear()
    : null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-start pt-10 sm:pt-16 pb-12 px-2 sm:px-4 animate-fade-in"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-4xl bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all shadow-lg"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop Hero Section */}
        <div className="relative aspect-video sm:h-[420px] w-full bg-zinc-950 overflow-hidden">
          <img
            src={tmdb.getBackdropUrl(
              details?.backdrop_path || item.backdrop_path || item.poster_path,
              'original'
            )}
            alt={title}
            className="w-full h-full object-cover filter brightness-90"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 via-transparent to-transparent"></div>

          {/* Banner Details */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end space-y-3 z-10">
            {logo ? (
              <img
                src={tmdb.getLogoUrl(logo, 'w500')}
                alt={title}
                className="max-h-20 sm:max-h-28 max-w-[260px] sm:max-w-[360px] object-contain drop-shadow-lg"
              />
            ) : (
              <h2 className="font-bebas text-3xl sm:text-5xl font-black tracking-wide text-white drop-shadow-md">
                {title}
              </h2>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  closeModal();
                  onPlay(item, selectedSeason, 1);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-white text-black font-bold hover:bg-zinc-200 active:scale-95 transition-all shadow-lg text-sm sm:text-base"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Play</span>
              </button>

              <button
                onClick={() => (inList ? removeFromList(item.id) : addToList(item))}
                className="p-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-600 transition-all"
                title={inList ? 'Remove from My List' : 'Add to My List'}
              >
                {inList ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
              </button>

              <button
                onClick={() => rateMedia(item.id, userRating === 'like' ? null : 'like')}
                className={`p-2.5 rounded-full border transition-all ${
                  userRating === 'like'
                    ? 'bg-red-600/20 border-red-500 text-red-500'
                    : 'bg-zinc-800/90 border-zinc-600 text-white hover:bg-zinc-700'
                }`}
                title="Rate Up"
              >
                <ThumbsUp className="w-5 h-5" />
              </button>

              <button
                onClick={() => rateMedia(item.id, userRating === 'dislike' ? null : 'dislike')}
                className={`p-2.5 rounded-full border transition-all ${
                  userRating === 'dislike'
                    ? 'bg-zinc-700 border-zinc-500 text-zinc-300'
                    : 'bg-zinc-800/90 border-zinc-600 text-white hover:bg-zinc-700'
                }`}
                title="Not for me"
              >
                <ThumbsDown className="w-5 h-5" />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-600 transition-all ml-auto"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Metadata Row & Synopsis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 font-medium">
                {details?.vote_average ? (
                  <span className="text-emerald-400 font-bold text-base">
                    {Math.round(details.vote_average * 10)}% Match
                  </span>
                ) : null}
                {releaseYear && <span>{releaseYear}</span>}
                <span className="px-2 py-0.5 border border-zinc-600 rounded text-xs uppercase bg-black/40">
                  {ageRating}
                </span>
                <span>
                  {isTV
                    ? `${details?.number_of_seasons || 1} Season${
                        (details?.number_of_seasons || 1) > 1 ? 's' : ''
                      }`
                    : `${Math.floor((details?.runtime || 110) / 60)}h ${
                        (details?.runtime || 110) % 60
                      }m`}
                </span>
                <span className="px-2 py-0.5 border border-red-500/80 text-red-400 rounded text-xs font-bold uppercase tracking-wider bg-red-950/30">
                  HD • 4K
                </span>
              </div>

              {details?.tagline && (
                <p className="text-sm italic text-zinc-400 border-l-2 border-red-600 pl-3">
                  "{details.tagline}"
                </p>
              )}

              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed">
                {details?.overview || item.overview || 'No overview available for this title.'}
              </p>
            </div>

            {/* Crew / Cast Sidebar */}
            <div className="space-y-3 text-xs sm:text-sm text-zinc-400 border-t md:border-t-0 md:border-l border-zinc-800 md:pl-6 pt-4 md:pt-0">
              {details?.credits?.cast && details.credits.cast.length > 0 && (
                <div>
                  <span className="text-zinc-500 font-semibold block mb-1 uppercase tracking-wider text-[11px]">
                    Cast:
                  </span>
                  <p className="text-zinc-200">
                    {details.credits.cast
                      .slice(0, 5)
                      .map((c) => c.name)
                      .join(', ')}
                  </p>
                </div>
              )}

              {details?.genres && details.genres.length > 0 && (
                <div>
                  <span className="text-zinc-500 font-semibold block mb-1 uppercase tracking-wider text-[11px]">
                    Genres:
                  </span>
                  <p className="text-zinc-200">{details.genres.map((g) => g.name).join(', ')}</p>
                </div>
              )}

              <div>
                <span className="text-zinc-500 font-semibold block mb-1 uppercase tracking-wider text-[11px]">
                  Audio & Subtitles:
                </span>
                <p className="text-zinc-200">English, Spanish, French, German, Japanese [Original]</p>
              </div>
            </div>
          </div>

          {/* TV Show Seasons & Episode Selector */}
          {isTV && details?.seasons && details.seasons.length > 0 && (
            <div className="border-t border-zinc-800 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white tracking-wide">Episodes</h3>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
                >
                  {details.seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name || `Season ${s.season_number}`} ({s.episode_count} Episodes)
                      </option>
                    ))}
                </select>
              </div>

              {isLoadingSeason ? (
                <div className="py-12 text-center text-zinc-500 animate-pulse">
                  Loading season episodes...
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 divide-y divide-zinc-800/60">
                  {(seasonData?.episodes || []).map((ep: Episode) => (
                    <div
                      key={ep.id}
                      onClick={() => {
                        closeModal();
                        onPlay(item, selectedSeason, ep.episode_number);
                      }}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-800/70 transition-colors cursor-pointer group"
                    >
                      <span className="text-lg font-bold text-zinc-500 group-hover:text-white w-6 flex-shrink-0 text-center pt-2">
                        {ep.episode_number}
                      </span>

                      <div className="relative w-28 sm:w-36 aspect-video rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                        <img
                          src={tmdb.getImageUrl(ep.still_path || item.backdrop_path, 'w300')}
                          alt={ep.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent flex items-center justify-center">
                          <Play className="w-5 h-5 fill-white text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-red-500 transition-colors">
                            {ep.name || `Episode ${ep.episode_number}`}
                          </h4>
                          {ep.runtime && (
                            <span className="text-xs text-zinc-400 flex-shrink-0">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 mt-1">
                          {ep.overview || 'Stream this episode in full HD on MoviesBox.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cast Cards Horizontal Carousel */}
          {details?.credits?.cast && details.credits.cast.length > 0 && (
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-bold text-white mb-3">Top Cast</h3>
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
                {details.credits.cast.slice(0, 10).map((cast) => (
                  <div key={cast.id} className="flex-shrink-0 w-24 text-center">
                    <img
                      src={
                        cast.profile_path
                          ? tmdb.getImageUrl(cast.profile_path, 'w185')
                          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={cast.name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-zinc-700 bg-zinc-800 mb-1.5"
                    />
                    <p className="text-xs font-semibold text-white truncate">{cast.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{cast.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Like This (Similar Titles) */}
          {details?.similar?.results && details.similar.results.length > 0 && (
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">More Like This</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {details.similar.results.slice(0, 8).map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => {
                      if (isTV) openTVModal(sim);
                      else openMovieModal(sim);
                    }}
                    className="bg-zinc-800 rounded-lg overflow-hidden group cursor-pointer hover:border hover:border-zinc-500 transition-all shadow"
                  >
                    <div className="aspect-[2/3] relative bg-zinc-900">
                      <img
                        src={tmdb.getImageUrl(sim.poster_path, 'w300')}
                        alt={sim.title || sim.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-white truncate">
                        {sim.title || sim.name}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                        <span className="text-emerald-400 font-bold">
                          {sim.vote_average ? `${Math.round(sim.vote_average * 10)}%` : 'New'}
                        </span>
                        <span>
                          {sim.release_date
                            ? new Date(sim.release_date).getFullYear()
                            : sim.first_air_date
                            ? new Date(sim.first_air_date).getFullYear()
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
