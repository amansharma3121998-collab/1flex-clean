import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Server,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  Tv,
  Film,
  Sparkles,
  AlertCircle,
  ListOrdered,
} from 'lucide-react';
import { MediaDetails, MediaItem, Season } from '../types/media';
import { tmdb } from '../services/tmdb';
import { useList } from '../context/ListContext';

interface StreamPlayerProps {
  item: MediaItem;
  season?: number;
  episode?: number;
  onBack: () => void;
  onSelectEpisode: (season: number, episode: number) => void;
}

interface StreamServer {
  id: string;
  name: string;
  getUrl: (id: number, isTV: boolean, season: number, episode: number) => string;
}

const SERVERS: StreamServer[] = [
  {
    id: 'vidlink',
    name: 'Server 1 (VidLink - HD)',
    getUrl: (id, isTV, season, episode) =>
      isTV
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}`
        : `https://vidlink.pro/movie/${id}`,
  },
  {
    id: 'vidsrc_to',
    name: 'Server 2 (VidSrc Pro)',
    getUrl: (id, isTV, season, episode) =>
      isTV
        ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: 'vidsrc_xyz',
    name: 'Server 3 (VidSrc XYZ)',
    getUrl: (id, isTV, season, episode) =>
      isTV
        ? `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.xyz/embed/movie/${id}`,
  },
  {
    id: 'autoembed',
    name: 'Server 4 (AutoEmbed CC)',
    getUrl: (id, isTV, season, episode) =>
      isTV
        ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${id}`,
  },
  {
    id: 'smashy',
    name: 'Server 5 (SmashyStream)',
    getUrl: (id, isTV, season, episode) =>
      isTV
        ? `https://player.smashystream.com/tv/${id}?s=${season}&e=${episode}`
        : `https://player.smashystream.com/movie/${id}`,
  },
  {
    id: '2embed',
    name: 'Server 6 (2Embed)',
    getUrl: (id, isTV, season, episode) =>
      isTV
        ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${id}`,
  },
];

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  item,
  season = 1,
  episode = 1,
  onBack,
  onSelectEpisode,
}) => {
  const [activeServer, setActiveServer] = useState<string>('vidlink');
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { saveProgress } = useList();

  const isTV = item.media_type === 'tv' || !!item.name || !item.title;
  const currentTitle = details?.title || details?.name || item.title || item.name || 'Now Playing';

  // Fetch full details and season data for navigation
  useEffect(() => {
    let isMounted = true;
    const fetchInfo = async () => {
      try {
        const data = isTV
          ? await tmdb.getTVShowDetails(item.id)
          : await tmdb.getMovieDetails(item.id);

        if (isMounted) {
          setDetails(data);
          if (isTV) {
            const sData = await tmdb.getTVSeasonDetails(item.id, season);
            if (isMounted) setSeasonData(sData);
          }
        }
      } catch (err) {
        console.error('Failed to load player details:', err);
      }
    };

    fetchInfo();
    return () => {
      isMounted = false;
    };
  }, [item.id, isTV, season]);

  // Update continue watching progress
  useEffect(() => {
    saveProgress({
      id: item.id,
      title: currentTitle,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      media_type: isTV ? 'tv' : 'movie',
      progress: 35,
      season: isTV ? season : undefined,
      episode: isTV ? episode : undefined,
      updatedAt: Date.now(),
    });
  }, [item.id, currentTitle, isTV, season, episode]);

  const selectedServer = SERVERS.find((s) => s.id === activeServer) || SERVERS[0];
  const streamUrl = selectedServer.getUrl(item.id, isTV, season, episode);

  const totalEpisodesInSeason = seasonData?.episodes?.length || 10;
  const hasPrevEpisode = isTV && episode > 1;
  const hasNextEpisode = isTV && episode < totalEpisodesInSeason;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-screen select-none overflow-hidden">
      {/* Top Player Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bebas text-lg tracking-wider text-red-600 hidden sm:inline">
              MOVIESBOX STREAM
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {currentTitle}
            </h1>
            {isTV && (
              <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-600/40 text-xs font-bold uppercase">
                S{season} : E{episode}
              </span>
            )}
          </div>
        </div>

        {/* Server & Controls right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Server Switcher */}
          <div className="flex items-center gap-1.5">
            <Server className="w-4 h-4 text-zinc-400 hidden sm:block" />
            <select
              value={activeServer}
              onChange={(e) => setActiveServer(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              {SERVERS.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name}
                </option>
              ))}
            </select>
          </div>

          {/* Episode Drawer Toggle for TV shows */}
          {isTV && (
            <button
              onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Frame & Episode Drawer */}
      <div className="relative flex-1 bg-black flex overflow-hidden">
        {/* Responsive Video iFrame */}
        <div className="flex-1 w-full h-full relative bg-black">
          <iframe
            src={streamUrl}
            title={currentTitle}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        </div>

        {/* TV Show Episode Drawer */}
        {isTV && showEpisodeDrawer && (
          <div className="w-80 sm:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col z-20 animate-slide-left">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Season {season} Episodes</h3>
                <p className="text-xs text-zinc-400">{seasonData?.episodes?.length || 0} Available</p>
              </div>
              <button
                onClick={() => setShowEpisodeDrawer(false)}
                className="text-xs text-zinc-400 hover:text-white p-1"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-2 space-y-1">
              {(seasonData?.episodes || []).map((ep) => {
                const isCurrent = ep.episode_number === episode;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      onSelectEpisode(season, ep.episode_number);
                      setShowEpisodeDrawer(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-red-600/20 border border-red-600/40 text-white'
                        : 'hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <span className="font-bold text-sm w-5 text-center text-zinc-500">
                      {ep.episode_number}
                    </span>
                    <div className="w-16 h-10 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                      <img
                        src={tmdb.getImageUrl(ep.still_path || item.backdrop_path, 'w185')}
                        alt={ep.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-white">
                        {ep.name || `Episode ${ep.episode_number}`}
                      </p>
                      <p className="text-[11px] text-zinc-500">{ep.runtime || 45}m</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stream Bar with Next/Prev Episode & Server Hint */}
      <div className="px-4 py-2 bg-zinc-950/95 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2 z-30">
        <div className="flex items-center gap-3">
          {isTV && (
            <>
              <button
                disabled={!hasPrevEpisode}
                onClick={() => onSelectEpisode(season, episode - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-200 font-medium transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Prev Episode</span>
              </button>

              <button
                disabled={!hasNextEpisode}
                onClick={() => onSelectEpisode(season, episode + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold transition-colors"
              >
                <span>Next Episode</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-zinc-500">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>If video fails to load, try switching to another server above.</span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="font-semibold text-zinc-300">MoviesBox Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
};
