import React, { useState } from 'react';
import { Download, Search, Copy, Check, HardDrive, ArrowUp, ArrowDown, Shield } from 'lucide-react';

interface TorrentItem {
  id: string;
  name: string;
  size: string;
  seeders: number;
  leechers: number;
  category: 'Movies' | 'TV Shows' | 'Anime' | 'Games';
  date: string;
  magnet: string;
  quality: string;
}

const SAMPLE_TORRENTS: TorrentItem[] = [
  {
    id: 't-1',
    name: 'Deadpool & Wolverine (2024) [2160p] [4K] [HDR] [Dual-Audio]',
    size: '14.2 GB',
    seeders: 6420,
    leechers: 512,
    category: 'Movies',
    date: '2024-10-18',
    quality: '4K HDR',
    magnet: 'magnet:?xt=urn:btih:3b8c6e7a2b9d1f5e8a7c4d9e0b2a5f7c8d9e0a1b&dn=Deadpool.and.Wolverine.2024',
  },
  {
    id: 't-2',
    name: 'Dune: Part Two (2024) [1080p] [BluRay] [x265] [10bit]',
    size: '3.80 GB',
    seeders: 4910,
    leechers: 280,
    category: 'Movies',
    date: '2024-09-22',
    quality: '1080p BluRay',
    magnet: 'magnet:?xt=urn:btih:8f2a1b9c7d4e5f6a0b1c2d3e4f5a6b7c8d9e0f1a&dn=Dune.Part.Two.2024',
  },
  {
    id: 't-3',
    name: 'House of the Dragon Season 2 Complete [1080p] [WEBRip]',
    size: '18.5 GB',
    seeders: 3890,
    leechers: 410,
    category: 'TV Shows',
    date: '2024-08-14',
    quality: '1080p Web',
    magnet: 'magnet:?xt=urn:btih:5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b&dn=House.of.the.Dragon.S02',
  },
  {
    id: 't-4',
    name: 'Shogun (2024) Season 1 Complete [2160p] [4K] [HDR] [E-Sub]',
    size: '26.4 GB',
    seeders: 2750,
    leechers: 195,
    category: 'TV Shows',
    date: '2024-06-10',
    quality: '4K HDR',
    magnet: 'magnet:?xt=urn:btih:7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d&dn=Shogun.S01.4K',
  },
  {
    id: 't-5',
    name: 'Attack on Titan Final Season Complete [1080p] [Dual-Audio]',
    size: '12.0 GB',
    seeders: 2100,
    leechers: 130,
    category: 'Anime',
    date: '2024-04-15',
    quality: '1080p Dual',
    magnet: 'magnet:?xt=urn:btih:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b&dn=Attack.on.Titan.Final',
  },
  {
    id: 't-6',
    name: 'Cyberpunk 2077: Phantom Liberty [v2.12] [Direct Play]',
    size: '72.0 GB',
    seeders: 1840,
    leechers: 360,
    category: 'Games',
    date: '2024-05-02',
    quality: 'PC Repack',
    magnet: 'magnet:?xt=urn:btih:2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c&dn=Cyberpunk.2077.PL',
  },
];

const CATEGORIES = ['All', 'Movies', 'TV Shows', 'Anime', 'Games'];

export const TorrentsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTorrents = SAMPLE_TORRENTS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase().trim());
    return matchesCat && matchesQuery;
  });

  const copyMagnet = (id: string, magnet: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(magnet);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Download className="w-5 h-5 text-red-500" />
            <span className="text-xs uppercase font-bold tracking-wider text-red-500">
              MoviesBox Magnet Index
            </span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-5xl tracking-wider text-white">
            TORRENTS EXPLORER
          </h1>
          <p className="text-sm text-zinc-400">
            Browse verified peer-to-peer magnet links with high-speed seeders and instant copy.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-zinc-900 border border-zinc-800 p-3 sm:p-4 rounded-xl">
          <div className="flex-1 relative flex items-center bg-black/60 border border-zinc-700/80 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search verified torrents by title, year, or resolution..."
              className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Torrents Table / List */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800 shadow-xl">
          {filteredTorrents.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No torrents found matching "{query}".
            </div>
          ) : (
            filteredTorrents.map((t) => (
              <div
                key={t.id}
                className="p-4 sm:p-5 hover:bg-zinc-850 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {t.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-400">
                      {t.quality}
                    </span>
                    <span className="text-xs text-zinc-500">{t.date}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white truncate hover:text-red-500 transition-colors">
                    {t.name}
                  </h3>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t.size}</span>
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>{t.seeders.toLocaleString()} Seeds</span>
                    </span>
                    <span className="text-red-400 flex items-center gap-1">
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>{t.leechers} Leeches</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyMagnet(t.id, t.magnet)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                      copiedId === t.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    {copiedId === t.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Magnet Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Magnet</span>
                      </>
                    )}
                  </button>

                  <a
                    href={t.magnet}
                    className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors"
                    title="Open in Torrent Client"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
