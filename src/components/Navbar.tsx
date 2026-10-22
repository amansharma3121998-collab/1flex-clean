import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  X,
  Menu,
  ChevronDown,
  Film,
  Tv,
  Gamepad2,
  Radio,
  Trophy,
  Download,
  Bookmark,
  ExternalLink,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useList } from '../context/ListContext';
import { tmdb } from '../services/tmdb';
import { MediaItem } from '../types/media';
import { useModal } from '../context/ModalContext';
import { MoviesBoxLogo } from './MoviesBoxLogo';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { currentProfile, profiles, selectProfile, setShowProfileSelector } = useAuth();
  const { myList } = useList();
  const { openMovieModal, openTVModal } = useModal();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Click outside listener for search & profile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        if (!searchQuery) setSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await tmdb.searchMulti(searchQuery);
        setSearchResults(res.results.slice(0, 6));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchResults([]);
    }
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/tv-shows', label: 'TV Shows', icon: Tv },
    { path: '/my-list', label: 'My List', icon: Bookmark },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-zinc-950/95 backdrop-blur-md shadow-2xl py-3 border-b border-zinc-800/40'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Brand & Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <MoviesBoxLogo className="w-8 h-8 sm:w-9 sm:h-9" />
              <span className="font-bebas text-2xl sm:text-3xl tracking-wider text-white">
                <span className="text-red-600">MOVIES</span>BOX
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((item) => {
                const isActive = currentPath === item.path;
                if (item.external) {
                  return (
                    <a
                      key={item.label}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <span>{item.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  );
                }
                return (
                  <button
                    key={item.label}
                    onClick={() => onNavigate(item.path)}
                    className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white font-bold bg-white/15 shadow-sm'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, My List, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input / Box */}
            <div ref={searchContainerRef} className="relative">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-black/80 border border-zinc-700/80 rounded-full px-3 py-1.5 sm:w-64 md:w-80 shadow-lg backdrop-blur-md transition-all"
                >
                  <Search className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Titles, people, genres..."
                    className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-zinc-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-zinc-400 hover:text-white ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Live search suggestions dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                  <div className="p-2 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Quick Suggestions</span>
                    <button
                      onClick={handleSearchSubmit}
                      className="text-red-500 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchOpen(false);
                          if (item.media_type === 'tv' || item.name) {
                            openTVModal(item);
                          } else {
                            openMovieModal(item);
                          }
                        }}
                        className="flex items-center gap-3 p-2.5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <img
                          src={tmdb.getImageUrl(item.poster_path || item.backdrop_path, 'w92')}
                          alt={item.title || item.name}
                          className="w-10 h-14 object-cover rounded flex-shrink-0 bg-zinc-800"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {item.title || item.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                            <span className="capitalize text-red-500 font-semibold">
                              {item.media_type === 'tv' ? 'TV Show' : 'Movie'}
                            </span>
                            <span>•</span>
                            <span>
                              {item.release_date
                                ? new Date(item.release_date).getFullYear()
                                : item.first_air_date
                                ? new Date(item.first_air_date).getFullYear()
                                : ''}
                            </span>
                            {item.vote_average ? (
                              <>
                                <span>•</span>
                                <span className="text-amber-400">★ {item.vote_average.toFixed(1)}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* My List Shortcut */}
            <button
              onClick={() => onNavigate('/my-list')}
              className="relative p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:flex items-center"
              title="My List"
            >
              <Bookmark className="w-5 h-5" />
              {myList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {myList.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-72 sm:w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="py-3 space-y-3">
                    <div className="flex gap-3 items-start">
                      <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                      <div>
                        <p className="text-xs text-white font-medium">New Releases Added</p>
                        <p className="text-[11px] text-zinc-400">
                          Trending blockbuster movies and TV series are now streaming in 4K HDR.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                      <div>
                        <p className="text-xs text-white font-medium">Live TV & Sports Streaming</p>
                        <p className="text-[11px] text-zinc-400">
                          Live channels and weekend sport fixtures are now available.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-red-600 transition-all"
              >
                <img
                  src={currentProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={currentProfile?.name || 'Profile'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-zinc-800 border border-zinc-700"
                />
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                  <div className="p-2 border-b border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Switch Profile
                    </p>
                    <div className="mt-2 space-y-1">
                      {profiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            selectProfile(p);
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            currentProfile?.id === p.id
                              ? 'bg-red-600/20 text-white border border-red-600/40'
                              : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="truncate">{p.name}</span>
                          {p.isKid && (
                            <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                              Kids
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowProfileSelector(true);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      Manage Profiles
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('/my-list');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-400" />
                      My List ({myList.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Category Pills Bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-none pt-3 pb-1 -mx-2 px-2">
          {navLinks.map((item) => {
            const isActive = currentPath === item.path;
            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1 hover:bg-zinc-800"
                >
                  <span>{item.label}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              );
            }
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.path)}
                className={`flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold shadow-md'
                    : 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[110px] bottom-0 bg-black/95 backdrop-blur-2xl z-40 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Menu</p>
            <div className="grid grid-cols-2 gap-3">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                if (item.external) {
                  return (
                    <a
                      key={item.label}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-red-600/40"
                    >
                      <Icon className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </a>
                  );
                }
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                      isActive
                        ? 'bg-red-600/20 border-red-600 text-white font-bold'
                        : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={() => {
                  onNavigate('/my-list');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">My List</span>
                </div>
                <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full text-white font-bold">
                  {myList.length}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Logged in as {currentProfile?.name}</span>
            <button
              onClick={() => {
                setShowProfileSelector(true);
                setMobileMenuOpen(false);
              }}
              className="text-red-500 hover:underline"
            >
              Switch Profile
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
