import React, { useState } from 'react';
import { Radio, Play, Volume2, Maximize2, Tv, Sparkles, Globe, Eye } from 'lucide-react';
import { LiveChannel } from '../types/media';

const CHANNELS: LiveChannel[] = [
  {
    id: 'ch-sky',
    name: 'Sky News HD',
    category: 'News',
    country: 'United Kingdom',
    logo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=120&q=80',
    currentProgram: 'Sky World News Live & Breaking Analysis',
    description: 'Round-the-clock live international news, current affairs, breaking reports and in-depth business commentary.',
    streamUrl: 'https://www.youtube-nocookie.com/embed/9Auq9mYxFEE?autoplay=1&mute=0',
  },
  {
    id: 'ch-bloomberg',
    name: 'Bloomberg TV',
    category: 'News',
    country: 'United States',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=120&q=80',
    currentProgram: 'Bloomberg Markets: Global Watch & Tech',
    description: 'Premier global business, financial markets, technology, and economic news coverage.',
    streamUrl: 'https://www.youtube-nocookie.com/embed/dp8PhLsUcFE?autoplay=1&mute=0',
  },
  {
    id: 'ch-nasa',
    name: 'NASA TV Live',
    category: 'Documentary',
    country: 'United States',
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&q=80',
    currentProgram: 'International Space Station Live Earth Views',
    description: 'Live astronaut feeds from the ISS, space exploration missions, rocketry launches, and deep cosmos discoveries.',
    streamUrl: 'https://www.youtube-nocookie.com/embed/21X5lGlDOfg?autoplay=1&mute=0',
  },
  {
    id: 'ch-dw',
    name: 'DW News English',
    category: 'News',
    country: 'Germany / Global',
    logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=120&q=80',
    currentProgram: 'Journal: Global Perspectives & Climate',
    description: 'Independent reporting from around the globe, documentary specials, and investigative journalism.',
    streamUrl: 'https://www.youtube-nocookie.com/embed/V9KZGs1MtP4?autoplay=1&mute=0',
  },
  {
    id: 'ch-redbull',
    name: 'Red Bull TV Extreme',
    category: 'Sports',
    country: 'Global',
    logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=120&q=80',
    currentProgram: 'Red Bull Hardline & Extreme Sports Live',
    description: 'High-adrenaline action sports, Formula 1 behind-the-scenes, cliff diving, and extreme world records.',
    streamUrl: 'https://www.youtube-nocookie.com/embed/w_S_1k02Xh4?autoplay=1&mute=0',
  },
  {
    id: 'ch-euronews',
    name: 'Euronews HD',
    category: 'News',
    country: 'Europe',
    logo: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=120&q=80',
    currentProgram: 'No Comment: Europe & World Pulse',
    description: 'All voices, one vision. Unfiltered European and global updates on policy, culture, and science.',
    streamUrl: 'https://www.youtube-nocookie.com/embed/pykdAUWi_44?autoplay=1&mute=0',
  },
  {
    id: 'ch-lofi',
    name: 'Lofi Chill Cinema',
    category: 'Music',
    country: 'Global',
    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
    currentProgram: 'Late Night Synthwave & Ambient Beats',
    description: '24/7 relaxing beats, ambient background anime visuals, and chill synth sessions.',
    streamUrl: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=0',
  },
];

const CATEGORIES = ['All Channels', 'News', 'Sports', 'Documentary', 'Music'];

export const LiveTVPage: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel>(CHANNELS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Channels');

  const filteredChannels =
    selectedCategory === 'All Channels'
      ? CHANNELS
      : CHANNELS.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs uppercase font-bold tracking-wider text-red-500">
                Live Broadcast
              </span>
            </div>
            <h1 className="font-bebas text-3xl sm:text-4xl tracking-wider text-white">
              MOVIESBOX LIVE TV GUIDE
            </h1>
            <p className="text-sm text-zinc-400">
              Free streaming 24/7 television channels worldwide with zero buffering.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live Player Viewport */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={selectedChannel.streamUrl}
              title={selectedChannel.name}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />

            {/* Live Indicator overlay badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>LIVE</span>
            </div>
          </div>

          {/* Player Metadata bar */}
          <div className="p-4 sm:p-6 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800">
            <div className="flex items-start gap-4">
              <img
                src={selectedChannel.logo}
                alt={selectedChannel.name}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700 bg-zinc-800 flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{selectedChannel.name}</h2>
                  <span className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded">
                    {selectedChannel.country}
                  </span>
                </div>
                <p className="text-sm text-red-400 font-semibold mt-0.5">
                  Now: {selectedChannel.currentProgram}
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                  {selectedChannel.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>1080p HD Live Stream</span>
              </span>
            </div>
          </div>
        </div>

        {/* Channels Grid / Guide */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-zinc-300 uppercase tracking-wider">
            Channel Guide ({filteredChannels.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredChannels.map((channel) => {
              const isCurrent = selectedChannel.id === channel.id;
              return (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isCurrent
                      ? 'bg-red-600/15 border-red-500 shadow-lg'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
                  }`}
                >
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-12 h-12 rounded-lg object-cover border border-zinc-700 bg-zinc-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{channel.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-950/80 border border-red-800 px-1.5 py-0.5 rounded uppercase">
                          Watching
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {channel.currentProgram}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {channel.category}
                      </span>
                      <span className="text-[10px] text-zinc-600">•</span>
                      <span className="text-[10px] text-zinc-500">{channel.country}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
