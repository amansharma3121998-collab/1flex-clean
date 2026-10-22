import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DetailModal } from './components/DetailModal';
import { StreamPlayer } from './components/StreamPlayer';
import { WhoIsWatchingModal } from './components/WhoIsWatchingModal';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { TVShowsPage } from './pages/TVShowsPage';
import { LiveTVPage } from './pages/LiveTVPage';
import { GamesPage } from './pages/GamesPage';
import { SportsPage } from './pages/SportsPage';
import { TorrentsPage } from './pages/TorrentsPage';
import { MyListPage } from './pages/MyListPage';
import { SearchPage } from './pages/SearchPage';
import { useAuth } from './context/AuthContext';
import { MediaItem } from './types/media';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [playingItem, setPlayingItem] = useState<{
    item: MediaItem;
    season: number;
    episode: number;
  } | null>(null);

  const { showProfileSelector, setShowProfileSelector } = useAuth();

  // Listen to popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      // If we popped out of play
      if (!path.startsWith('/play')) {
        setPlayingItem(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlay = (item: MediaItem, season = 1, episode = 1) => {
    const isTV = item.media_type === 'tv' || !!item.name || !item.title;
    const playUrl = isTV
      ? `/play?id=${item.id}&season=${season}&episode=${episode}&type=tv`
      : `/play?id=${item.id}&type=movie`;
    window.history.pushState({}, '', playUrl);
    setPlayingItem({ item, season, episode });
  };

  const handleBackFromPlayer = () => {
    setPlayingItem(null);
    window.history.back();
  };

  const handleSelectEpisode = (season: number, episode: number) => {
    if (playingItem) {
      setPlayingItem({
        item: playingItem.item,
        season,
        episode,
      });
      const playUrl = `/play?id=${playingItem.item.id}&season=${season}&episode=${episode}&type=tv`;
      window.history.replaceState({}, '', playUrl);
    }
  };

  // Render player if active
  if (playingItem) {
    return (
      <StreamPlayer
        item={playingItem.item}
        season={playingItem.season}
        episode={playingItem.episode}
        onBack={handleBackFromPlayer}
        onSelectEpisode={handleSelectEpisode}
      />
    );
  }

  // Parse search query parameter if on /search
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPath === '/' && <HomePage onPlay={handlePlay} />}
        {currentPath === '/movies' && <MoviesPage onPlay={handlePlay} />}
        {currentPath === '/tv-shows' && <TVShowsPage onPlay={handlePlay} />}
        {currentPath === '/live-tv' && <LiveTVPage />}
        {currentPath === '/games' && <GamesPage />}
        {currentPath === '/sports' && <SportsPage />}
        {currentPath === '/torrent' && <TorrentsPage />}
        {currentPath === '/my-list' && <MyListPage onPlay={handlePlay} onNavigate={navigate} />}
        {currentPath.startsWith('/search') && (
          <SearchPage initialQuery={searchQuery} onPlay={handlePlay} />
        )}
      </main>

      {/* Detail Modal for Movies and TV Shows */}
      <DetailModal onPlay={handlePlay} />

      {/* Profile Selector Modal */}
      <WhoIsWatchingModal
        isOpen={showProfileSelector}
        onClose={() => setShowProfileSelector(false)}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};
export default App;
