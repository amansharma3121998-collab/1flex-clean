import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { Top10Row } from '../components/Top10Row';
import { MovieRow } from '../components/MovieRow';
import { tmdb } from '../services/tmdb';
import { MediaItem } from '../types/media';

interface HomePageProps {
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onPlay }) => {
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [comedyMovies, setComedyMovies] = useState<MediaItem[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<MediaItem[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<MediaItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        // Step 1: Load core primary lists
        const [trendingRes, popMoviesRes, popTVRes] = await Promise.all([
          tmdb.getTrending('all', 'week'),
          tmdb.getPopularMovies(),
          tmdb.getPopularTVShows(),
        ]);

        if (isMounted) {
          setTrending(trendingRes.results || []);
          setPopularMovies(popMoviesRes.results || []);
          setPopularTV(popTVRes.results || []);
        }

        // Step 2: Stagger secondary lists to prevent burst rate limits
        await new Promise((r) => setTimeout(r, 200));
        const [topMoviesRes, topTVRes] = await Promise.all([
          tmdb.getTopRatedMovies(),
          tmdb.getTopRatedTVShows(),
        ]);

        if (isMounted) {
          setTopRatedMovies(topMoviesRes.results || []);
          setTopRatedTV(topTVRes.results || []);
        }

        // Step 3: Load genre rows
        await new Promise((r) => setTimeout(r, 300));
        const [actionRes, comedyRes, scifiRes, horrorRes] = await Promise.all([
          tmdb.discoverMovies({ with_genres: 28 }), // Action
          tmdb.discoverMovies({ with_genres: 35 }), // Comedy
          tmdb.discoverMovies({ with_genres: 878 }), // Sci-Fi
          tmdb.discoverMovies({ with_genres: 27 }), // Horror
        ]);

        if (isMounted) {
          setActionMovies(actionRes.results || []);
          setComedyMovies(comedyRes.results || []);
          setSciFiMovies(scifiRes.results || []);
          setHorrorMovies(horrorRes.results || []);
        }
      } catch (err) {
        console.warn('Recovered during home page content load:', err);
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-16">
      {/* Hero Billboard */}
      <HeroBanner mediaType="all" onPlay={onPlay} />

      {/* Rows Container */}
      <div className="relative z-20 -mt-12 sm:-mt-20 md:-mt-28 space-y-2">
        {/* Continue Watching Row */}
        <ContinueWatchingRow onPlay={onPlay} />

        {/* Top 10 Movies Today */}
        {popularMovies.length > 0 && (
          <Top10Row
            title="Top 10 Movies Today"
            items={popularMovies}
            mediaType="movie"
            onPlay={onPlay}
          />
        )}

        {/* Trending Now */}
        <MovieRow
          title="Trending Now"
          items={trending}
          onPlay={onPlay}
        />

        {/* Popular Movies */}
        <MovieRow
          title="Popular Movies"
          items={popularMovies}
          mediaType="movie"
          onPlay={onPlay}
        />

        {/* Top 10 TV Shows Today */}
        {popularTV.length > 0 && (
          <Top10Row
            title="Top 10 TV Shows Today"
            items={popularTV}
            mediaType="tv"
            onPlay={onPlay}
          />
        )}

        {/* Popular TV Shows */}
        <MovieRow
          title="Popular TV Shows"
          items={popularTV}
          mediaType="tv"
          onPlay={onPlay}
        />

        {/* Action Blockbusters */}
        {actionMovies.length > 0 && (
          <MovieRow
            title="Action & Adventure Movies"
            items={actionMovies}
            mediaType="movie"
            onPlay={onPlay}
          />
        )}

        {/* Sci-Fi & Fantasy */}
        {sciFiMovies.length > 0 && (
          <MovieRow
            title="Sci-Fi & Cyberpunk Hits"
            items={sciFiMovies}
            mediaType="movie"
            onPlay={onPlay}
          />
        )}

        {/* Top Rated Movies */}
        {topRatedMovies.length > 0 && (
          <MovieRow
            title="Critically Acclaimed Movies"
            items={topRatedMovies}
            mediaType="movie"
            onPlay={onPlay}
          />
        )}

        {/* Comedies */}
        {comedyMovies.length > 0 && (
          <MovieRow
            title="Comedy Movies"
            items={comedyMovies}
            mediaType="movie"
            onPlay={onPlay}
          />
        )}

        {/* Horror & Thriller */}
        {horrorMovies.length > 0 && (
          <MovieRow
            title="Horror & Midnight Chills"
            items={horrorMovies}
            mediaType="movie"
            onPlay={onPlay}
          />
        )}

        {/* Top Rated TV Shows */}
        {topRatedTV.length > 0 && (
          <MovieRow
            title="Award-Winning TV Series"
            items={topRatedTV}
            mediaType="tv"
            onPlay={onPlay}
          />
        )}
      </div>
    </div>
  );
};
