export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv' | string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  popularity?: number;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official?: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date?: string;
  vote_average?: number;
  runtime?: number;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date?: string;
  episodes?: Episode[];
}

export interface MediaDetails extends MediaItem {
  tagline?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  status?: string;
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: VideoResult[];
  };
  images?: {
    backdrops: { file_path: string; vote_average: number; iso_639_1: string | null }[];
    posters: { file_path: string; vote_average: number; iso_639_1: string | null }[];
    logos?: { file_path: string; iso_639_1: string | null }[];
  };
  similar?: {
    results: MediaItem[];
  };
  releases?: {
    countries: { iso_3166_1: string; certification: string }[];
  };
  content_ratings?: {
    results: { iso_3166_1: string; rating: string }[];
  };
}

export interface ContinueWatchingItem {
  id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type: 'movie' | 'tv';
  progress: number; // percentage 0 - 100
  currentTime?: number;
  duration?: number;
  season?: number;
  episode?: number;
  updatedAt: number;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKid?: boolean;
}

export interface LiveChannel {
  id: string;
  name: string;
  category: string;
  logo: string;
  streamUrl: string;
  currentProgram: string;
  description: string;
  country: string;
}

export interface SportsMatch {
  id: string;
  sport: string;
  league: string;
  teamHome: { name: string; logo: string; score?: number };
  teamAway: { name: string; logo: string; score?: number };
  time: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  streamUrl?: string;
}

export interface GameItem {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  gameType: '2048' | 'snake' | 'flappy' | 'tictactoe' | 'memory';
}
