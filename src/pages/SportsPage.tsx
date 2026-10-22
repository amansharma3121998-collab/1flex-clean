import React, { useState } from 'react';
import { Trophy, Play, Activity, Clock, Calendar, CheckCircle2, Tv } from 'lucide-react';
import { SportsMatch } from '../types/media';

const MATCHES: SportsMatch[] = [
  {
    id: 'm-1',
    sport: 'Football',
    league: 'UEFA Champions League',
    teamHome: {
      name: 'Real Madrid',
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
      score: 2,
    },
    teamAway: {
      name: 'Manchester City',
      logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=120&q=80',
      score: 1,
    },
    time: "74' - 2nd Half",
    status: 'LIVE',
    streamUrl: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=0',
  },
  {
    id: 'm-2',
    sport: 'Football',
    league: 'Premier League',
    teamHome: {
      name: 'Arsenal',
      logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=120&q=80',
      score: 3,
    },
    teamAway: {
      name: 'Chelsea',
      logo: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=120&q=80',
      score: 1,
    },
    time: "FT - Full Time",
    status: 'FINISHED',
  },
  {
    id: 'm-3',
    sport: 'Basketball',
    league: 'NBA Regular Season',
    teamHome: {
      name: 'Golden State Warriors',
      logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=120&q=80',
      score: 98,
    },
    teamAway: {
      name: 'Los Angeles Lakers',
      logo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=120&q=80',
      score: 94,
    },
    time: "Q4 - 3:24",
    status: 'LIVE',
    streamUrl: 'https://www.youtube-nocookie.com/embed/dp8PhLsUcFE?autoplay=1&mute=0',
  },
  {
    id: 'm-4',
    sport: 'Motorsport',
    league: 'Formula 1',
    teamHome: {
      name: 'Monaco Grand Prix',
      logo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=120&q=80',
    },
    teamAway: {
      name: 'Race Day Qualifying',
      logo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=120&q=80',
    },
    time: 'Tomorrow, 14:00 GMT',
    status: 'UPCOMING',
  },
  {
    id: 'm-5',
    sport: 'American Football',
    league: 'NFL Sunday Night',
    teamHome: {
      name: 'Kansas City Chiefs',
      logo: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=120&q=80',
    },
    teamAway: {
      name: 'San Francisco 49ers',
      logo: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=120&q=80',
    },
    time: 'Sunday, 20:15 EST',
    status: 'UPCOMING',
  },
];

const SPORT_FILTERS = ['All Sports', 'Football', 'Basketball', 'Motorsport', 'American Football'];

export const SportsPage: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string>('All Sports');
  const [activeStream, setActiveStream] = useState<SportsMatch | null>(null);

  const filteredMatches =
    selectedSport === 'All Sports'
      ? MATCHES
      : MATCHES.filter((m) => m.sport === selectedSport);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-xs uppercase font-bold tracking-wider text-amber-500">
                MoviesBox Sports Hub
              </span>
            </div>
            <h1 className="font-bebas text-3xl sm:text-5xl tracking-wider text-white">
              LIVE SPORTS & FIXTURES
            </h1>
            <p className="text-sm text-zinc-400">
              Live scores, upcoming tournament fixtures, and high-definition sports broadcasts.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {SPORT_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSport(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSport === s
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Live Stream Simulation / Viewport */}
        {activeStream && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-4 bg-zinc-950 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeStream.league}: {activeStream.teamHome.name} vs {activeStream.teamAway.name}
                </span>
              </div>
              <button
                onClick={() => setActiveStream(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close Stream
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={activeStream.streamUrl}
                title="Live Sports Stream"
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match) => {
            const isLive = match.status === 'LIVE';

            return (
              <div
                key={match.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                {/* League & Status Header */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400 uppercase tracking-wider">{match.league}</span>
                  {isLive ? (
                    <span className="flex items-center gap-1.5 bg-red-600/20 text-red-400 border border-red-600/40 px-2 py-0.5 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span>{match.time}</span>
                    </span>
                  ) : match.status === 'FINISHED' ? (
                    <span className="text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                      {match.time}
                    </span>
                  ) : (
                    <span className="text-amber-400 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded">
                      {match.time}
                    </span>
                  )}
                </div>

                {/* Score / Teams Row */}
                <div className="flex items-center justify-between py-2">
                  {/* Home Team */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={match.teamHome.logo}
                      alt={match.teamHome.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700 bg-zinc-800 flex-shrink-0"
                    />
                    <span className="font-bold text-sm sm:text-base text-white truncate">
                      {match.teamHome.name}
                    </span>
                  </div>

                  {/* Score or VS */}
                  <div className="px-4 text-center">
                    {match.teamHome.score !== undefined ? (
                      <span className="font-bebas text-2xl sm:text-3xl tracking-widest text-white">
                        {match.teamHome.score} - {match.teamAway.score}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-zinc-500 uppercase">VS</span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-end gap-3 flex-1 min-w-0 text-right">
                    <span className="font-bold text-sm sm:text-base text-white truncate">
                      {match.teamAway.name}
                    </span>
                    <img
                      src={match.teamAway.logo}
                      alt={match.teamAway.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700 bg-zinc-800 flex-shrink-0"
                    />
                  </div>
                </div>

                {/* Stream / Action Button */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{match.sport}</span>
                  {isLive ? (
                    <button
                      onClick={() => setActiveStream(match)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Watch Live Stream</span>
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500">
                      {match.status === 'UPCOMING' ? 'Broadcast starts at kickoff' : 'Match Concluded'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
