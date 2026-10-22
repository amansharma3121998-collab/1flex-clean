import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { MediaDetails, MediaItem } from '../types/media';
import { useModal } from '../context/ModalContext';
import { useList } from '../context/ListContext';

interface HeroBannerProps {
  mediaType?: 'all' | 'movie' | 'tv';
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ mediaType = 'all', onPlay }) => {
  const [featured, setFeatured] = useState<MediaDetails | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { openMovieModal, openTVModal } = useModal();
  const { isInList, addToList, removeFromList } = useList();

  useEffect(() => {
    let isMounted = true;
    const fetchHero = async () => {
      try {
        setIsLoading(true);
        const res = await tmdb.getTrending(mediaType === 'all' ? 'all' : mediaType, 'week');
        if (res.results && res.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(8, res.results.length));
          const pick = res.results[randomIndex];
          const isMovie = mediaType === 'movie' || (pick.media_type === 'movie' || !pick.name);

          const details = isMovie
            ? await tmdb.getMovieDetails(pick.id)
            : await tmdb.getTVShowDetails(pick.id);

          if (isMounted) {
            setFeatured(details);
            const key = tmdb.getVideo(details.videos);
            setTrailerKey(key);
            // Delay video autoplay slightly for smooth transition
            if (key) {
              const timer = setTimeout(() => setShowVideo(true), 2500);
              return () => clearTimeout(timer);
            }
          }
        }
      } catch (err) {
        console.warn('Hero banner fallback active:', err);
        if (isMounted) {
          setFeatured({
            id: 533535,
            title: "Deadpool & Wolverine",
            overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
            poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
            backdrop_path: "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
            vote_average: 7.7,
            release_date: "2024-07-24",
            media_type: "movie",
            runtime: 128,
            videos: { results: [{ id: "v1", key: "73_1biulkYk", name: "Trailer", site: "YouTube", size: 1080, type: "Trailer", official: true }] }
          });
          setTrailerKey("73_1biulkYk");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHero();
    return () => {
      isMounted = false;
    };
  }, [mediaType]);

  if (isLoading || !featured) {
    return (
      <div className="relative w-full h-[70vh] sm:h-[80vh] bg-zinc-950 animate-pulse flex items-center px-6 lg:px-16">
        <div className="space-y-4 max-w-xl">
          <div className="h-10 w-64 bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-96 bg-zinc-800/80 rounded"></div>
          <div className="h-4 w-80 bg-zinc-800/80 rounded"></div>
          <div className="flex gap-3 pt-4">
            <div className="h-12 w-32 bg-zinc-800 rounded-md"></div>
            <div className="h-12 w-32 bg-zinc-800 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  const isMovie = featured.media_type === 'movie' || !!featured.title;
  const title = featured.title || featured.name || 'Featured Title';
  const logo = tmdb.getEnglishLogo(featured.images);
  const ageRating = tmdb.getAgeRating(featured);
  const releaseYear = featured.release_date
    ? new Date(featured.release_date).getFullYear()
    : featured.first_air_date
    ? new Date(featured.first_air_date).getFullYear()
    : null;
  const inList = isInList(featured.id);

  return (
    <div className="relative w-full h-[75vh] sm:h-[85vh] lg:h-[90vh] overflow-hidden select-none">
      {/* Background Media */}
      <div className="absolute inset-0">
        {showVideo && trailerKey ? (
          <div className="w-full h-full relative overflow-hidden pointer-events-none scale-125 md:scale-110">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&loop=1&playlist=${trailerKey}`}
              title="Hero Trailer"
              className="w-full h-full object-cover"
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : (
          <img
            src={tmdb.getBackdropUrl(featured.backdrop_path, 'original')}
            alt={title}
            className="w-full h-full object-cover object-center filter brightness-90 transition-opacity duration-1000"
          />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/60 to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Logo or Title */}
          {logo ? (
            <img
              src={tmdb.getLogoUrl(logo, 'w500')}
              alt={title}
              className="max-h-24 sm:max-h-36 max-w-[280px] sm:max-w-[420px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] filter brightness-110"
            />
          ) : (
            <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wide text-white drop-shadow-xl line-clamp-2">
              {title}
            </h1>
          )}

          {/* Badges / Metadata */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-zinc-300">
            {featured.vote_average ? (
              <span className="text-emerald-400 font-bold">
                {Math.round(featured.vote_average * 10)}% Match
              </span>
            ) : null}
            {releaseYear && <span>{releaseYear}</span>}
            <span className="px-1.5 py-0.5 border border-zinc-500 rounded text-[11px] uppercase tracking-wider text-zinc-300 bg-black/40">
              {ageRating}
            </span>
            <span>
              {isMovie
                ? `${Math.floor((featured.runtime || 115) / 60)}h ${(featured.runtime || 115) % 60}m`
                : `${featured.number_of_seasons || 1} Season${
                    (featured.number_of_seasons || 1) > 1 ? 's' : ''
                  }`}
            </span>
            <span className="px-1.5 py-0.5 border border-red-500/80 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950/30">
              Ultra HD 4K
            </span>
          </div>

          {/* Overview text */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow-md">
            {featured.overview ||
              'Experience premium uninterrupted streaming on MoviesBox with cinema-grade high definition video and audio.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(featured, 1, 1)}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-md bg-white text-black font-bold text-sm sm:text-base hover:bg-zinc-200 active:scale-95 transition-all shadow-xl"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Play Now</span>
            </button>

            <button
              onClick={() => (isMovie ? openMovieModal(featured) : openTVModal(featured))}
              className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 rounded-md bg-zinc-800/85 hover:bg-zinc-700 text-white font-semibold text-sm sm:text-base backdrop-blur-md active:scale-95 transition-all border border-zinc-700/60 shadow-xl"
            >
              <Info className="w-5 h-5 text-zinc-300" />
              <span>More Info</span>
            </button>

            <button
              onClick={() => (inList ? removeFromList(featured.id) : addToList(featured))}
              className="p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 transition-colors backdrop-blur-md"
              title={inList ? 'Remove from My List' : 'Add to My List'}
            >
              {inList ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Audio & Replay Controls */}
      <div className="absolute right-4 sm:right-8 bottom-16 sm:bottom-24 z-20 flex items-center gap-3">
        {showVideo && trailerKey && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 backdrop-blur-md transition-all shadow-lg"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-zinc-400" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
        )}
        <div className="bg-zinc-900/80 border border-zinc-700/60 px-3 py-1.5 rounded-l-md text-xs font-bold text-zinc-300 backdrop-blur-md">
          {ageRating}
        </div>
      </div>
    </div>
  );
};
