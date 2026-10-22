import { MediaDetails, MediaItem, VideoResult, Season } from '../types/media';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const WSRV_PROXY = 'https://wsrv.nl/?url=';

const cache = new Map<string, { data: any; expires: number }>();
const pendingRequests = new Map<string, Promise<any>>();

function proxyImage(url: string): string {
  if (!url) return '';
  return `${WSRV_PROXY}${encodeURIComponent(url)}`;
}

// Fallback data when API is unavailable or rate-limited
const FALLBACK_LIST: MediaItem[] = [
  {
    id: 533535,
    title: "Deadpool & Wolverine",
    overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdrop_path: "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    vote_average: 7.7,
    release_date: "2024-07-24",
    media_type: "movie",
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520bEx.jpg",
    vote_average: 8.2,
    release_date: "2024-02-27",
    media_type: "movie",
  },
  {
    id: 94997,
    name: "House of the Dragon",
    overview: "The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights.",
    poster_path: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
    backdrop_path: "/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
    vote_average: 8.4,
    first_air_date: "2022-08-21",
    media_type: "tv",
  },
  {
    id: 93405,
    name: "Squid Game",
    overview: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
    poster_path: "/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
    backdrop_path: "/2meX1nMdScFOoV4370rqHWFDxZ6.jpg",
    vote_average: 7.8,
    first_air_date: "2021-09-17",
    media_type: "tv",
  },
  {
    id: 1022789,
    title: "Inside Out 2",
    overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!",
    poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    backdrop_path: "/stKGOm8wToLLExQgQpnihKEAam0.jpg",
    vote_average: 7.6,
    release_date: "2024-06-11",
    media_type: "movie",
  },
  {
    id: 220542,
    name: "The Apothecary Diaries",
    overview: "Maomao lived a peaceful life with her apothecary father. Until one day, she's sold as a lowly servant to the emperor's palace.",
    poster_path: "/1Z9lX9XoYqRzV24z5RkX8d3x0e0.jpg",
    backdrop_path: "/gffVOVZ2Y9cmVIZ26Gt9ByMGCYH.jpg",
    vote_average: 8.7,
    first_air_date: "2023-10-22",
    media_type: "tv",
  },
  {
    id: 762441,
    title: "A Quiet Place: Day One",
    overview: "As New York City is invaded by alien creatures who hunt by sound, a woman named Sam fights to survive with her service cat.",
    poster_path: "/yrpPYK2qm9Le69OR799dn5vM30j.jpg",
    backdrop_path: "/2RVcJbWFmICRDsaglZFK5EUxD9Q.jpg",
    vote_average: 6.8,
    release_date: "2024-06-26",
    media_type: "movie",
  },
  {
    id: 111110,
    name: "ONE PIECE",
    overview: "With his straw hat and ragtag crew, young pirate Monkey D. Luffy goes on an epic voyage for treasure.",
    poster_path: "/r7Dfg9vRZMMg2r1F789F95jKekE.jpg",
    backdrop_path: "/4MCKNAc6AbWjEsM2cr7WsRiQIhk.jpg",
    vote_average: 8.2,
    first_air_date: "2023-08-31",
    media_type: "tv",
  },
  {
    id: 823464,
    title: "Godzilla x Kong: The New Empire",
    overview: "Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.",
    poster_path: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
    backdrop_path: "/772zZ9p1QkX9lO2m345n678x.jpg",
    vote_average: 7.2,
    release_date: "2024-03-27",
    media_type: "movie",
  },
  {
    id: 1399,
    name: "Game of Thrones",
    overview: "Seven noble families fight for control of the mythical land of Westeros.",
    poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    vote_average: 8.4,
    first_air_date: "2011-04-17",
    media_type: "tv",
  }
];

class TMDBClient {
  private async fetchFromTMDB<T = any>(endpoint: string, retryCount = 0): Promise<T> {
    const cached = cache.get(endpoint);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const pending = pendingRequests.get(endpoint);
    if (pending) {
      return pending;
    }

    const promise = (async () => {
      try {
        const url = `/api/tmdb${endpoint}`;
        const res = await fetch(url);
        
        if (res.status === 429 && retryCount < 2) {
          console.warn(`TMDB client 429, backoff retry #${retryCount + 1}...`);
          await new Promise((r) => setTimeout(r, 800 * (retryCount + 1)));
          return this.fetchFromTMDB<T>(endpoint, retryCount + 1);
        }

        if (!res.ok) {
          console.warn(`TMDB API warning: ${res.status} for ${endpoint}`);
          // If cached data exists (even expired), return it
          if (cached) return cached.data;
          // Otherwise return fallback list format
          return { results: FALLBACK_LIST, page: 1, total_pages: 1 } as unknown as T;
        }

        const data = await res.json();
        // If results array is empty or errored, provide fallback
        if (data && !data.error) {
          cache.set(endpoint, { data, expires: Date.now() + 15 * 60 * 1000 });
          return data;
        }

        if (cached) return cached.data;
        return { results: FALLBACK_LIST, page: 1, total_pages: 1 } as unknown as T;
      } catch (err: any) {
        console.warn('TMDB API fetch fallback active:', err.message);
        if (cached) return cached.data;
        return { results: FALLBACK_LIST, page: 1, total_pages: 1 } as unknown as T;
      } finally {
        pendingRequests.delete(endpoint);
      }
    })();

    pendingRequests.set(endpoint, promise);
    return promise;
  }

  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week', page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}?page=${page}`);
  }

  async getPopularMovies(page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/movie/popular?page=${page}`);
  }

  async getTopRatedMovies(page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/movie/top_rated?page=${page}`);
  }

  async getUpcomingMovies(page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/movie/upcoming?page=${page}`);
  }

  async getNowPlayingMovies(page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/movie/now_playing?page=${page}`);
  }

  async getPopularTVShows(page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/tv/popular?page=${page}`);
  }

  async getTopRatedTVShows(page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/tv/top_rated?page=${page}`);
  }

  async getAiringTodayTVShows(page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/tv/airing_today?page=${page}`);
  }

  async getOnTheAirTVShows(page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    return this.fetchFromTMDB(`/tv/on_the_air?page=${page}`);
  }

  async getMovieDetails(id: number, append = 'images,videos,releases,credits,similar'): Promise<MediaDetails> {
    const res = await this.fetchFromTMDB<MediaDetails>(`/movie/${id}?append_to_response=${append}`);
    if (!res || !res.id || (res as any).results) {
      const match = FALLBACK_LIST.find((m) => m.id === id) || FALLBACK_LIST[0];
      return {
        ...match,
        runtime: 125,
        tagline: "Experience cinema at its finest on MoviesBox.",
        genres: [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }],
        credits: { cast: [], crew: [] },
        videos: { results: [{ id: "v1", key: "73_1biulkYk", name: "Official Trailer", site: "YouTube", size: 1080, type: "Trailer", official: true }] },
        images: { backdrops: [], posters: [] },
        similar: { results: FALLBACK_LIST.filter(m => m.id !== id) }
      };
    }
    return res;
  }

  async getTVShowDetails(id: number, append = 'images,videos,content_ratings,credits,similar'): Promise<MediaDetails> {
    const res = await this.fetchFromTMDB<MediaDetails>(`/tv/${id}?append_to_response=${append}`);
    if (!res || !res.id || (res as any).results) {
      const match = FALLBACK_LIST.find((m) => m.id === id) || FALLBACK_LIST[2];
      return {
        ...match,
        number_of_seasons: 2,
        number_of_episodes: 20,
        seasons: [
          { id: 1, name: "Season 1", season_number: 1, episode_count: 10, overview: "Season 1", poster_path: match.poster_path || null },
          { id: 2, name: "Season 2", season_number: 2, episode_count: 10, overview: "Season 2", poster_path: match.poster_path || null }
        ],
        genres: [{ id: 18, name: "Drama" }, { id: 10765, name: "Sci-Fi & Fantasy" }],
        credits: { cast: [], crew: [] },
        videos: { results: [{ id: "v2", key: "DotnJ7tTA34", name: "Trailer", site: "YouTube", size: 1080, type: "Trailer", official: true }] },
        images: { backdrops: [], posters: [] },
        similar: { results: FALLBACK_LIST.filter(m => m.id !== id) }
      };
    }
    return res;
  }

  async getTVSeasonDetails(tvId: number, seasonNumber: number): Promise<Season> {
    const res = await this.fetchFromTMDB<Season>(`/tv/${tvId}/season/${seasonNumber}`);
    if (!res || !res.episodes || res.episodes.length === 0) {
      return {
        id: seasonNumber,
        name: `Season ${seasonNumber}`,
        season_number: seasonNumber,
        overview: `Complete episodes for Season ${seasonNumber}`,
        episode_count: 10,
        poster_path: null,
        episodes: Array.from({ length: 10 }).map((_, i) => ({
          id: i + 1,
          name: `Episode ${i + 1}`,
          overview: `Stream Season ${seasonNumber} Episode ${i + 1} uninterrupted in high definition on MoviesBox.`,
          episode_number: i + 1,
          season_number: seasonNumber,
          still_path: null,
          runtime: 55,
        })),
      };
    }
    return res;
  }

  async getMovieGenres(): Promise<{ genres: { id: number; name: string }[] }> {
    return this.fetchFromTMDB('/genre/movie/list');
  }

  async getTVGenres(): Promise<{ genres: { id: number; name: string }[] }> {
    return this.fetchFromTMDB('/genre/tv/list');
  }

  async discoverMovies(params: { with_genres?: number | string; sort_by?: string; page?: number }): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    const searchParams = new URLSearchParams();
    if (params.with_genres) searchParams.append('with_genres', params.with_genres.toString());
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.page) searchParams.append('page', params.page.toString());
    return this.fetchFromTMDB(`/discover/movie?${searchParams.toString()}`);
  }

  async discoverTVShows(params: { with_genres?: number | string; sort_by?: string; page?: number }): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    const searchParams = new URLSearchParams();
    if (params.with_genres) searchParams.append('with_genres', params.with_genres.toString());
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.page) searchParams.append('page', params.page.toString());
    return this.fetchFromTMDB(`/discover/tv?${searchParams.toString()}`);
  }

  async searchMulti(query: string, page = 1): Promise<{ results: MediaItem[]; page: number; total_pages: number }> {
    const res = await this.fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
    if (res.results && res.results.length > 0) {
      const q = query.toLowerCase().trim();
      res.results = [...res.results].sort((a, b) => {
        const titleA = (a.title || a.name || '').toLowerCase();
        const titleB = (b.title || b.name || '').toLowerCase();
        const scoreA = titleA === q ? 100 : titleA.startsWith(q) ? 50 : 0;
        const scoreB = titleB === q ? 100 : titleB.startsWith(q) ? 50 : 0;
        return scoreB - scoreA;
      });
    }
    return res;
  }

  getImageUrl(path: string | null | undefined, size = 'w500'): string {
    if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
    return proxyImage(`${TMDB_IMAGE_BASE}/${size}${path}`);
  }

  getBackdropUrl(path: string | null | undefined, size = 'w1280'): string {
    if (!path) return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1280&q=80';
    return proxyImage(`${TMDB_IMAGE_BASE}/${size}${path}`);
  }

  getLogoUrl(path: string | null | undefined, size = 'w500'): string {
    if (!path) return '';
    return proxyImage(`${TMDB_IMAGE_BASE}/${size}${path}`);
  }

  getEnglishLogo(images?: { logos?: { file_path: string; iso_639_1: string | null }[] }): string | null {
    if (!images?.logos || images.logos.length === 0) return null;
    const logo = images.logos.find(l => l.iso_639_1 === 'en' || l.iso_639_1 === null);
    return logo?.file_path || images.logos[0]?.file_path || null;
  }

  getAgeRating(details?: MediaDetails): string {
    if (!details) return 'PG-13';
    if (details.releases?.countries) {
      const us = details.releases.countries.find(c => c.iso_3166_1 === 'US' && c.certification);
      if (us?.certification) return us.certification;
    }
    if (details.content_ratings?.results) {
      const us = details.content_ratings.results.find(c => c.iso_3166_1 === 'US' && c.rating);
      if (us?.rating) return us.rating;
    }
    return 'PG-13';
  }

  getVideo(videos?: { results: VideoResult[] }): string | null {
    if (!videos?.results || videos.results.length === 0) return null;
    const yt = videos.results.filter(v => v.site === 'YouTube' && v.key);
    const officialTrailer = yt.find(v => v.type === 'Trailer' && v.official);
    if (officialTrailer) return officialTrailer.key;
    const trailer = yt.find(v => v.type === 'Trailer');
    if (trailer) return trailer.key;
    const teaser = yt.find(v => v.type === 'Teaser' || v.type === 'Clip');
    if (teaser) return teaser.key;
    return yt[0]?.key || null;
  }

  getBestPoster(images?: { posters: { file_path: string; vote_average: number; iso_639_1: string | null }[] }, fallback?: string | null): string | null {
    if (!images?.posters || images.posters.length === 0) return fallback || null;
    const enPosters = images.posters.filter(p => p.iso_639_1 === 'en' || p.iso_639_1 === null);
    if (enPosters.length > 0) {
      enPosters.sort((a, b) => b.vote_average - a.vote_average);
      return enPosters[0].file_path;
    }
    return fallback || null;
  }

  getBestBackdrop(images?: { backdrops: { file_path: string; vote_average: number; iso_639_1: string | null }[] }, fallback?: string | null): string | null {
    if (!images?.backdrops || images.backdrops.length === 0) return fallback || null;
    const enBackdrops = images.backdrops.filter(b => b.iso_639_1 === 'en' || b.iso_639_1 === null);
    if (enBackdrops.length > 0) {
      enBackdrops.sort((a, b) => b.vote_average - a.vote_average);
      return enBackdrops[0].file_path;
    }
    return fallback || null;
  }
}

export const tmdb = new TMDBClient();
